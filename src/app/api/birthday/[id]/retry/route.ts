import { prisma } from "@/lib/db";
import { draftCharacter, generateComic, parseCharacter } from "@/lib/comics/create";
import { getCurrentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const order = await prisma.comicOrder.findUnique({ where: { id }, include: { user: true } });
  if (!order) return fail("Book not found", 404);
  const user = await getCurrentUser();
  const owns = user && order.userId === user.id;
  const checkout = order.checkoutId
    ? await prisma.checkoutSession.findUnique({ where: { id: order.checkoutId } })
    : await prisma.checkoutSession.findFirst({
        where: { kind: "birthday", payload: { contains: order.id }, status: "paid" },
      });
  if (!checkout && !owns) return fail("This book is not paid yet", 402);
  if (checkout && checkout.status !== "paid" && !owns) return fail("This book is not paid yet", 402);
  try {
    const sheet = parseCharacter(order.characterJson);
    if (order.status === "character_preview" || !sheet?.imagePath) await draftCharacter(order.id, sheet?.variant ?? 0);
    else await generateComic(order.id);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not draw the book");
  }
  return ok({ ok: true });
}
