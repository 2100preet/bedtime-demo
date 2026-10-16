import { getCurrentUser } from "@/lib/auth";
import { startCheckout, subscriptionCopy } from "@/lib/checkout";
import { resolveOffer } from "@/lib/offer";
import { fail, ok } from "@/lib/http";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return fail("Sign in first", 401);
  const body = (await request.json().catch(() => null)) as { plan?: string } | null;
  const plan = body?.plan === "yearly" ? "yearly" : "monthly";
  const intro = plan === "monthly" && !user.introPriceUsed;
  const offer = await resolveOffer();
  const amount =
    plan === "yearly" ? offer.book.yearlyMinor : intro ? offer.book.introMonthlyMinor : offer.book.monthlyMinor;
  const checkout = await startCheckout({
    userId: user.id,
    email: user.email,
    kind: "subscription",
    amountMinor: amount,
    currency: offer.currency,
    description: subscriptionCopy(plan, intro, offer.currency),
    payload: { userId: user.id, plan, intro: intro ? "1" : "" },
    returnPath: "/billing",
  });
  return ok(checkout);
}
