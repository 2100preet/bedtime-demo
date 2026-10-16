import fs from "node:fs";
import path from "node:path";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { startCheckout } from "@/lib/checkout";
import { photoDir } from "@/lib/paths";
import { childSchema, firstZodError } from "@/lib/validators";
import { emailField } from "@/lib/validators";
import { BRAND_NAME, formatMoney } from "@/lib/brand";
import { resolveOffer } from "@/lib/offer";
import { isRelationship } from "@/lib/catalog";
import { newToken } from "@/lib/text";
import { fail, ok } from "@/lib/http";
import { z } from "zod";

const meta = childSchema.extend({
  buyerName: z.string().trim().max(80).optional().default(""),
  buyerEmail: emailField,
  occasion: z.string().trim().min(1).max(80).default("birthday"),
  birthdayDate: z.string().trim().max(20).optional().default(""),
  deliverOn: z.string().trim().max(20).optional().default(""),
  narratorChoice: z.enum(["stock", "invite"]),
  narratorName: z.string().trim().max(40).optional().default(""),
  relationship: z.string().optional().default("custom"),
  customLabel: z.string().trim().max(40).optional().default(""),
  consent: z.string(),
});

export async function POST(request: Request) {
  const form = await request.formData();
  const raw = Object.fromEntries(
    ["buyerName", "buyerEmail", "firstName", "ageRange", "language", "interests", "nickname", "occasion", "birthdayDate", "deliverOn", "narratorChoice", "narratorName", "relationship", "customLabel", "consent"].map(
      (key) => [key, String(form.get(key) ?? "")],
    ),
  );
  const parsed = meta.safeParse(raw);
  if (!parsed.success) return fail(firstZodError(parsed.error));
  if (parsed.data.consent !== "true") return fail("Parent or guardian consent is required");
  const files = form.getAll("photos").filter((item): item is File => item instanceof File && item.size > 0);
  if (files.length < 1 || files.length > 3) return fail("Add 1 to 3 photos");
  for (const file of files) {
    if (file.size > 5 * 1024 * 1024) return fail("Each photo needs to be under 5 MB");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      return fail("Use JPG, PNG, or WebP photos");
    }
  }
  if (parsed.data.narratorChoice === "invite") {
    if (!parsed.data.narratorName) return fail("Name the person who will record");
    if (!isRelationship(parsed.data.relationship)) return fail("Choose who they are");
    if (parsed.data.relationship === "custom" && !parsed.data.customLabel) {
      return fail("Tell us who they are");
    }
  }

  const user = await getCurrentUser();
  const offer = await resolveOffer();
  const shareToken = newToken();
  const order = await prisma.comicOrder.create({
    data: {
      userId: user?.id,
      buyerEmail: parsed.data.buyerEmail,
      buyerName: parsed.data.buyerName,
      childFirstName: parsed.data.firstName,
      ageRange: parsed.data.ageRange,
      language: parsed.data.language,
      interests: parsed.data.interests,
      nickname: parsed.data.nickname,
      occasion: parsed.data.occasion,
      birthdayDate: parsed.data.birthdayDate || null,
      deliverOn: parsed.data.deliverOn || null,
      narratorChoice: parsed.data.narratorChoice,
      photoConsent: true,
      photoConsentAt: new Date(),
      amountCents: offer.book.birthdayGiftMinor,
      currency: offer.currency,
      shareToken,
      status: "pending_payment",
    },
  });

  const folder = photoDir(order.id);
  const stored: string[] = [];
  for (const [index, file] of files.entries()) {
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const target = path.join(folder, `${index}.${ext}`);
    fs.writeFileSync(target, Buffer.from(await file.arrayBuffer()));
    stored.push(target);
  }
  await prisma.comicOrder.update({
    where: { id: order.id },
    data: { photoPaths: JSON.stringify(stored) },
  });

  if (parsed.data.narratorChoice === "invite") {
    await prisma.narrator.create({
      data: {
        userId: user?.id,
        comicOrderId: order.id,
        relationship: parsed.data.relationship,
        customLabel: parsed.data.customLabel,
        displayName: parsed.data.narratorName,
        language: parsed.data.language,
        inviteToken: newToken(),
      },
    });
  }

  const checkout = await startCheckout({
    userId: user?.id,
    email: parsed.data.buyerEmail,
    kind: "birthday",
    amountMinor: offer.book.birthdayGiftMinor,
    currency: offer.currency,
    description: `${BRAND_NAME} birthday book · ${formatMoney(offer.book.birthdayGiftMinor, offer.currency)}`,
    payload: { comicId: order.id },
    returnPath: `/birthday/orders/${order.id}`,
  });
  await prisma.comicOrder.update({ where: { id: order.id }, data: { checkoutId: checkout.id } });
  return ok(checkout);
}
