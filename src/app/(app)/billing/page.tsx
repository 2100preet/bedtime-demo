import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { BRAND_NAME } from "@/lib/brand";
import { resolveOffer } from "@/lib/offer";
import { InrNote } from "@/components/inr-note";
import { isSubscriptionActive } from "@/lib/rules";
import { CancelButton, PlanButtons, WeeklyButton } from "@/components/story-actions";

export const metadata = { title: "Plan" };

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string; currency?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const offer = await resolveOffer(params.currency);
  const active = isSubscriptionActive(user.subscription);
  return (
    <div className="mx-auto grid max-w-xl gap-6">
      <h1 className="font-display text-4xl">Plan</h1>
      {params.welcome ? <p className="rounded-2xl bg-lilac px-4 py-3">You&apos;re in. New stories can be written for every child.</p> : null}
      {active && user.subscription ? (
        <div className="rounded-3xl bg-card p-5 ring-1 ring-foreground/10">
          <p className="font-bold">
            {user.subscription.plan} · active
            {user.subscription.isGift ? " · gift" : ""}
          </p>
          <p className="text-sm text-muted-foreground">
            {user.subscription.currentPeriodEnd
              ? `Through ${user.subscription.currentPeriodEnd.toLocaleDateString()}`
              : "Active"}
          </p>
          <div className="mt-4">
            <CancelButton />
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          <p>
            {offer.monthly} a month, first month {offer.introMonthly} if you have not used it.
            Yearly is {offer.yearly} (save {offer.savingsPercent}%).
          </p>
          <InrNote currency={offer.currency} />
          <PlanButtons intro={!user.introPriceUsed} />
        </div>
      )}
      {process.env.NODE_ENV !== "production" ? (
        <div className="rounded-2xl bg-blush p-4">
          <h2 className="font-bold">Weekly job</h2>
          <p className="mb-3 text-sm text-muted-foreground">Writes a story for each subscribed child who is due, and sends birthday reminders.</p>
          <WeeklyButton />
        </div>
      ) : null}
      <p className="text-sm">
        Prefer to gift {BRAND_NAME}? <Link href="/gift" className="font-bold underline">Send a gift</Link> or{" "}
        <Link href="/birthday" className="font-bold underline">make a birthday book</Link>.
      </p>
    </div>
  );
}
