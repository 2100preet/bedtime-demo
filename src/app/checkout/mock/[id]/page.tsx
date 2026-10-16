import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatStoredMoney } from "@/lib/brand";
import { InrNote } from "@/components/inr-note";
import { SiteHeader } from "@/components/site-header";
import { MockCheckout } from "@/components/checkout-actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Practice checkout", robots: { index: false, follow: false } };

export default async function MockCheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await prisma.checkoutSession.findUnique({ where: { id } });
  if (!session) notFound();
  if (session.provider !== "mock") {
    redirect(session.status === "paid" ? session.returnPath : "/billing");
  }
  if (session.status === "paid") redirect(session.returnPath);

  return (
    <div className="min-h-full bg-cream">
      <div className="bg-night">
        <SiteHeader dark />
      </div>
      <main className="mx-auto grid max-w-xl gap-4 px-4 py-10">
        <p className="text-sm font-bold uppercase tracking-wide text-clay">Practice checkout</p>
        <h1 className="font-display text-4xl">{formatStoredMoney(session.amountCents, session.currency)}</h1>
        <InrNote currency={session.currency} />
        <p className="text-muted-foreground">{session.description}</p>
        <MockCheckout id={session.id} />
      </main>
    </div>
  );
}
