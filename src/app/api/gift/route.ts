import { getCurrentUser } from "@/lib/auth";
import { startCheckout } from "@/lib/checkout";
import { prisma } from "@/lib/db";
import { BRAND_NAME, formatMoney } from "@/lib/brand";
import { resolveOffer } from "@/lib/offer";
import { emailField, firstZodError } from "@/lib/validators";
import { newToken } from "@/lib/text";
import { fail, ok } from "@/lib/http";
import { z } from "zod";

const schema = z.object({
  buyerName: z.string().trim().max(80).optional().default(""),
  buyerEmail: emailField,
  recipientName: z.string().trim().max(80).optional().default(""),
  recipientEmail: emailField,
  plan: z.enum(["month", "year"]),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(firstZodError(parsed.error));
  const user = await getCurrentUser();
  const offer = await resolveOffer();
  const amount = parsed.data.plan === "year" ? offer.book.yearlyMinor : offer.book.monthlyMinor;
  const gift = await prisma.giftPurchase.create({
    data: {
      buyerUserId: user?.id,
      buyerEmail: parsed.data.buyerEmail,
      buyerName: parsed.data.buyerName,
      recipientEmail: parsed.data.recipientEmail,
      recipientName: parsed.data.recipientName,
      plan: parsed.data.plan,
      amountCents: amount,
      currency: offer.currency,
      redeemCode: newToken(12),
    },
  });
  const checkout = await startCheckout({
    userId: user?.id,
    email: parsed.data.buyerEmail,
    kind: "gift",
    amountMinor: amount,
    currency: offer.currency,
    description: `${BRAND_NAME} gift · ${parsed.data.plan === "year" ? "one year" : "one month"} · ${formatMoney(amount, offer.currency)}`,
    payload: { giftId: gift.id },
    returnPath: `/gift/sent/${gift.id}`,
  });
  await prisma.giftPurchase.update({
    where: { id: gift.id },
    data: { checkoutId: checkout.id },
  });
  return ok({ ...checkout, giftId: gift.id });
}
