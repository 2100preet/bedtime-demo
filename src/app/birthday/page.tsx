import { BRAND_NAME } from "@/lib/brand";
import { resolveOffer } from "@/lib/offer";
import { getCurrentUser } from "@/lib/auth";
import { BirthdayWizard } from "@/components/birthday-wizard";
import { SiteHeader } from "@/components/site-header";
import { InrNote } from "@/components/inr-note";

export const dynamic = "force-dynamic";
export const metadata = { title: "Birthday book" };

export default async function BirthdayPage({
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
        <p className="text-sm font-bold uppercase tracking-wide text-clay">One-time gift</p>
        <h1 className="font-display text-4xl leading-tight">A birthday comic, just for them</h1>
        <p className="text-muted-foreground">
          {offer.birthday} once. No subscription. After payment, {BRAND_NAME} draws a Pixar-like cartoon
          from the photo so you can approve the likeness, then uses that same face on about ten panels. The link
          is private, and the photos are deleted after the book is made.
        </p>
        <InrNote currency={offer.currency} />
        <BirthdayWizard buyerEmail={user?.email ?? ""} buyerName={user?.name ?? ""} priceLabel={offer.birthday} />
      </main>
    </div>
  );
}
