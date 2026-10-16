import Stripe from "stripe";
import { prisma } from "@/lib/db";
import { BRAND_NAME, formatMoney, priceBook, type CurrencyCode } from "@/lib/brand";
import { addMonths } from "@/lib/rules";
import { appUrl } from "@/lib/text";
import { draftCharacter } from "@/lib/comics/create";

function stripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

async function introCoupon(stripe: Stripe, currency: CurrencyCode) {
  const book = priceBook(currency);
  const id = currency === "INR" ? "lorikins_intro_once_inr" : "lorikins_intro_once";
  try {
    await stripe.coupons.create({
      id,
      amount_off: book.monthlyMinor - book.introMonthlyMinor,
      currency: currency.toLowerCase(),
      duration: "once",
      name: `${BRAND_NAME} first month`,
    });
  } catch {
    // Coupon already exists in this Stripe account.
  }
  return id;
}

/**
 * Practice checkout when Stripe is unset. With STRIPE_SECRET_KEY, Checkout uses
 * the same minor-unit amount in usd or inr. A Razorpay adapter can replace the
 * URL returned here later; pages only render that URL and formatMoney().
 */
export function paymentRail(): "mock" | "stripe" {
  return process.env.STRIPE_SECRET_KEY ? "stripe" : "mock";
}

export async function startCheckout(input: {
  userId?: string | null;
  email: string;
  kind: "subscription" | "gift" | "birthday";
  amountMinor: number;
  currency: CurrencyCode;
  description: string;
  payload: Record<string, unknown>;
  returnPath: string;
}) {
  const row = await prisma.checkoutSession.create({
    data: {
      userId: input.userId || null,
      email: input.email,
      kind: input.kind,
      payload: JSON.stringify(input.payload),
      amountCents: input.amountMinor,
      currency: input.currency,
      description: input.description,
      provider: paymentRail(),
      returnPath: input.returnPath,
    },
  });

  const stripe = stripeClient();
  if (!stripe) {
    return { url: `/checkout/mock/${row.id}`, id: row.id };
  }

  const origin = appUrl();
  const payload = input.payload;
  const plan = String(payload.plan ?? "");
  const recurring = input.kind === "subscription";
  const useIntro = Boolean(payload.intro);
  const book = priceBook(input.currency);
  const discounts = useIntro ? [{ coupon: await introCoupon(stripe, input.currency) }] : undefined;
  const unitAmount =
    input.kind === "subscription" && plan === "yearly"
      ? book.yearlyMinor
      : input.kind === "subscription"
        ? book.monthlyMinor
        : input.amountMinor;

  const session = await stripe.checkout.sessions.create({
    mode: recurring ? "subscription" : "payment",
    customer_email: input.email,
    success_url: `${origin}/checkout/success?checkout=${row.id}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}${input.returnPath}`,
    metadata: { checkoutId: row.id, currency: input.currency },
    discounts,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: input.currency.toLowerCase(),
          unit_amount: unitAmount,
          product_data: { name: input.description },
          ...(recurring
            ? { recurring: { interval: plan === "yearly" ? "year" : "month" } }
            : {}),
        },
      },
    ],
  });

  await prisma.checkoutSession.update({
    where: { id: row.id },
    data: { stripeSessionId: session.id },
  });
  return { url: session.url || `/checkout/success?checkout=${row.id}`, id: row.id };
}

async function activateSubscription(input: {
  userId: string;
  plan: string;
  isGift?: boolean;
  giftedByEmail?: string;
}) {
  const months = input.plan === "yearly" || input.plan === "year" ? 12 : 1;
  const currentPeriodEnd = addMonths(new Date(), months);
  await prisma.subscription.upsert({
    where: { userId: input.userId },
    create: {
      userId: input.userId,
      plan: input.plan,
      status: "active",
      isGift: Boolean(input.isGift),
      giftedByEmail: input.giftedByEmail,
      currentPeriodEnd,
    },
    update: {
      plan: input.plan,
      status: "active",
      isGift: Boolean(input.isGift),
      giftedByEmail: input.giftedByEmail,
      currentPeriodEnd,
    },
  });
  if (input.plan === "monthly") {
    await prisma.user.update({
      where: { id: input.userId },
      data: { introPriceUsed: true },
    });
  }
}

export async function fulfillCheckout(id: string) {
  const session = await prisma.checkoutSession.findUnique({ where: { id } });
  if (!session) throw new Error("Checkout not found");
  if (session.status === "paid") return session;

  const payload = JSON.parse(session.payload || "{}") as Record<string, string>;
  if (session.kind === "subscription") {
    await activateSubscription({ userId: payload.userId, plan: payload.plan });
  } else if (session.kind === "gift") {
    await prisma.giftPurchase.update({
      where: { id: payload.giftId },
      data: { status: "paid", checkoutId: session.id },
    });
  }

  const paid = await prisma.checkoutSession.update({
    where: { id: session.id },
    data: { status: "paid", paidAt: new Date() },
  });

  if (session.kind === "birthday" && payload.comicId) {
    try {
      await draftCharacter(payload.comicId);
    } catch (error) {
      console.error(error);
    }
  }
  return paid;
}

export async function redeemGift(code: string, userId: string) {
  const gift = await prisma.giftPurchase.findUnique({ where: { redeemCode: code } });
  if (!gift || gift.status === "pending") throw new Error("This gift is not ready yet");
  if (gift.status === "redeemed") throw new Error("This gift was already opened");
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Sign in first");
  await activateSubscription({
    userId,
    plan: gift.plan === "year" ? "yearly" : "monthly",
    isGift: true,
    giftedByEmail: gift.buyerEmail,
  });
  await prisma.giftPurchase.update({
    where: { id: gift.id },
    data: { status: "redeemed", redeemedByUserId: userId, redeemedAt: new Date() },
  });
}

export function subscriptionCopy(plan: "monthly" | "yearly", intro: boolean, currency: CurrencyCode) {
  const book = priceBook(currency);
  if (plan === "yearly") {
    return `${BRAND_NAME} yearly · ${formatMoney(book.yearlyMinor, currency)}`;
  }
  if (intro) {
    return `${BRAND_NAME} monthly · first month ${formatMoney(book.introMonthlyMinor, currency)}`;
  }
  return `${BRAND_NAME} monthly · ${formatMoney(book.monthlyMinor, currency)}`;
}
