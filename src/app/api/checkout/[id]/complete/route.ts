import { prisma } from "@/lib/db";
import { fulfillCheckout } from "@/lib/checkout";
import { fail, ok } from "@/lib/http";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await prisma.checkoutSession.findUnique({ where: { id } });
  if (!session) return fail("Checkout not found", 404);
  if (session.provider !== "mock") return fail("Finish this payment with Stripe", 400);
  await fulfillCheckout(session.id);
  return ok({ returnPath: session.returnPath });
}
