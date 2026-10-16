import { BRAND_NAME } from "@/lib/brand";
import { resolveOffer } from "@/lib/offer";
import { InrNote } from "@/components/inr-note";
import { getCurrentUser } from "@/lib/auth";
import { GiftForm } from "@/components/gift-form";
import { SiteHeader } from "@/components/site-header";

export const dynamic = "force-dynamic";
export const metadata = { title: "Gift a subscription" };

export default async function GiftPage({
  searchParams,
}: {
  searchParams: Promise<{ currency?: string }>;
}) {
  const params = await searchParams;
  const offer = await resolveOffer(params.currency);
  const user = await getCurrentUser();
  return (
    <div className="min-h-full bg-cream">
      <div className="bg-night">
        <SiteHeader dark />
      </div>
      <main className="mx-auto grid max-w-xl gap-4 px-4 py-10">
        <p className="text-sm font-bold uppercase tracking-wide text-clay">Gift</p>
        <h1 className="font-display text-4xl leading-tight">Give a year of bedtime</h1>
        <p className="text-muted-foreground">
          A {BRAND_NAME} gift is a month at {offer.monthly} or a year at {offer.yearly}.
          They redeem it into their own parent account. It is separate from the one-time birthday comic.
        </p>
        <InrNote currency={offer.currency} />
        <GiftForm
          buyerEmail={user?.email ?? ""}
          buyerName={user?.name ?? ""}
          monthLabel={offer.monthly}
          yearLabel={offer.yearly}
        />
      </main>
    </div>
  );
}
