import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { BRAND_NAME, formatStoredMoney } from "@/lib/brand";
import { SiteHeader } from "@/components/site-header";
import { RedeemButton } from "@/components/checkout-actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Open a gift", robots: { index: false, follow: false } };

export default async function RedeemPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const gift = await prisma.giftPurchase.findUnique({ where: { redeemCode: code } });
  if (!gift) notFound();
  const user = await getCurrentUser();
  const next = `/redeem/${code}`;

  return (
    <div className="min-h-full bg-cream">
      <div className="bg-night">
        <SiteHeader dark />
      </div>
      <main className="mx-auto grid max-w-xl gap-4 px-4 py-10">
        <p className="text-sm font-bold uppercase tracking-wide text-clay">{BRAND_NAME} gift</p>
        <h1 className="font-display text-4xl">
          {gift.plan === "year" ? "A year of bedtime stories" : "A month of bedtime stories"}
        </h1>
        <p className="text-muted-foreground">
          {formatStoredMoney(gift.amountCents, gift.currency)} from {gift.buyerName || gift.buyerEmail}
          {gift.recipientName ? ` for ${gift.recipientName}` : ""}.
        </p>
        {gift.status === "pending" ? <p>This gift is not paid yet.</p> : null}
        {gift.status === "redeemed" ? <p>This gift has already been opened.</p> : null}
        {gift.status === "paid" && !user ? (
          <p>
            <Link href={`/signup?next=${encodeURIComponent(next)}`} className="font-bold underline">
              Create an account
            </Link>{" "}
            or{" "}
            <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-bold underline">
              sign in
            </Link>{" "}
            to add it.
          </p>
        ) : null}
        {gift.status === "paid" && user ? <RedeemButton code={code} /> : null}
      </main>
    </div>
  );
}
