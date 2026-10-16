import Stripe from "stripe";
import { prisma } from "@/lib/db";
import { fulfillCheckout } from "@/lib/checkout";
import { fail, ok } from "@/lib/http";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!secret || !key) return fail("Stripe is not configured", 400);
  const stripe = new Stripe(key);
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) return fail("Missing signature", 400);
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch {
    return fail("Invalid signature", 400);
  }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const checkoutId = session.metadata?.checkoutId;
    if (checkoutId) {
      await prisma.checkoutSession.update({
        where: { id: checkoutId },
        data: { stripeSessionId: session.id },
      }).catch(() => undefined);
      await fulfillCheckout(checkoutId);
    }
  }
  return ok({ received: true });
}
