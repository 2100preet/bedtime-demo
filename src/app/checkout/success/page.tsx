import { redirect } from "next/navigation";
import Stripe from "stripe";
import { prisma } from "@/lib/db";
import { fulfillCheckout } from "@/lib/checkout";
import { SiteHeader } from "@/components/site-header";

export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string; session_id?: string }>;
}) {
  const params = await searchParams;
  if (!params.checkout) redirect("/");
  const session = await prisma.checkoutSession.findUnique({ where: { id: params.checkout } });
  if (!session) redirect("/");

  if (session.status !== "paid" && params.session_id && process.env.STRIPE_SECRET_KEY) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const remote = await stripe.checkout.sessions.retrieve(params.session_id);
    if (remote.payment_status === "paid" || remote.status === "complete") {
      await fulfillCheckout(session.id);
    }
  }

  const fresh = await prisma.checkoutSession.findUnique({ where: { id: session.id } });
  if (fresh?.status === "paid") redirect(fresh.returnPath || "/home");

  return (
    <div className="min-h-full bg-cream">
      <div className="bg-night">
        <SiteHeader dark />
      </div>
      <main className="mx-auto max-w-xl px-4 py-16">
        <h1 className="font-display text-4xl">Payment is not confirmed yet</h1>
        <p className="mt-3 text-muted-foreground">
          Stripe has not marked this checkout as paid. You can return and try again.
        </p>
      </main>
    </div>
  );
}
