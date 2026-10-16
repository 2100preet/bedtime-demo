import fs from "node:fs";
import path from "node:path";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { draftCharacter, generateComic, parseCharacter } from "@/lib/comics/create";
import { comicDir } from "@/lib/paths";
import { fail, fileResponse, ok } from "@/lib/http";

async function paidOrder(id: string) {
  const order = await prisma.comicOrder.findUnique({ where: { id } });
  if (!order) return { error: fail("Book not found", 404) };
  const user = await getCurrentUser();
  const owns = Boolean(user && order.userId === user.id);
  const checkout = order.checkoutId
    ? await prisma.checkoutSession.findUnique({ where: { id: order.checkoutId } })
    : await prisma.checkoutSession.findFirst({
        where: { kind: "birthday", payload: { contains: order.id }, status: "paid" },
      });
  const paid = checkout?.status === "paid" || owns;
  if (!paid) return { error: fail("This book is not paid yet", 402) };
  return { order };
}

function sheetFile(orderId: string, imagePath: string | undefined) {
  if (!imagePath) return null;
  const root = path.resolve(comicDir(), orderId);
  const resolved = path.resolve(imagePath);
  if (!resolved.startsWith(root + path.sep)) return null;
  if (!fs.existsSync(resolved)) return null;
  return resolved;
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const order = await prisma.comicOrder.findUnique({ where: { id } });
  if (!order) return fail("Book not found", 404);
  const file = sheetFile(order.id, parseCharacter(order.characterJson)?.imagePath);
  if (!file) return fail("No character yet", 404);
  return fileResponse(file);
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const found = await paidOrder(id);
  if (found.error) return found.error;
  const order = found.order;
  if (!order) return fail("Book not found", 404);
  const body = (await request.json().catch(() => ({}))) as { action?: string };
  try {
    if (body.action === "regenerate") {
      const variant = (parseCharacter(order.characterJson)?.variant ?? 0) + 1;
      await draftCharacter(order.id, variant);
      return ok({ ok: true, status: "character_preview" });
    }
    if (body.action === "approve") {
      if (order.status !== "character_preview" && order.status !== "error") {
        return fail("Preview the character before the book is drawn");
      }
      await generateComic(order.id);
      return ok({ ok: true, status: "ready" });
    }
    return fail("Choose approve or regenerate");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "The character could not be updated");
  }
}
