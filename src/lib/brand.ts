/** Working name. Change this constant when the final brand is chosen. */
export const BRAND_NAME = "Lorikins";

export type CurrencyCode = "USD" | "INR";

/** USD amounts are cents, the minor unit Stripe Checkout expects. */
export const PRICING = {
  monthlyCents: 499,
  introMonthlyCents: 199,
  yearlyCents: 3900,
  birthdayGiftCents: 2900,
} as const;

/**
 * India list prices in rupees. Checkout stores paise (rupees × 100),
 * which is the minor unit for a future Stripe INR price or Razorpay order.
 */
export const INR_PRICING = {
  monthlyRupees: 399,
  introMonthlyRupees: 99,
  yearlyRupees: 2999,
  birthdayGiftRupees: 1999,
} as const;

export type PriceBook = {
  currency: CurrencyCode;
  monthlyMinor: number;
  introMonthlyMinor: number;
  yearlyMinor: number;
  birthdayGiftMinor: number;
};

export function priceBook(currency: CurrencyCode): PriceBook {
  if (currency === "INR") {
    return {
      currency,
      monthlyMinor: INR_PRICING.monthlyRupees * 100,
      introMonthlyMinor: INR_PRICING.introMonthlyRupees * 100,
      yearlyMinor: INR_PRICING.yearlyRupees * 100,
      birthdayGiftMinor: INR_PRICING.birthdayGiftRupees * 100,
    };
  }
  return {
    currency: "USD",
    monthlyMinor: PRICING.monthlyCents,
    introMonthlyMinor: PRICING.introMonthlyCents,
    yearlyMinor: PRICING.yearlyCents,
    birthdayGiftMinor: PRICING.birthdayGiftCents,
  };
}

export function formatMoney(minor: number, currency: CurrencyCode) {
  if (currency === "INR") {
    const rupees = minor / 100;
    const whole = Number.isInteger(rupees);
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: whole ? 0 : 2,
      maximumFractionDigits: whole ? 0 : 2,
    }).format(rupees);
  }
  return `$${(minor / 100).toFixed(2)}`;
}

export function formatUsd(cents: number) {
  return formatMoney(cents, "USD");
}

export function formatStoredMoney(minor: number, currency: string | null | undefined) {
  return formatMoney(minor, currency?.toUpperCase() === "INR" ? "INR" : "USD");
}

export function yearlySavingsPercent(currency: CurrencyCode = "USD") {
  const book = priceBook(currency);
  const full = book.monthlyMinor * 12;
  return Math.round((1 - book.yearlyMinor / full) * 100);
}

export type PriceLabels = {
  currency: CurrencyCode;
  monthly: string;
  introMonthly: string;
  yearly: string;
  birthday: string;
  savingsPercent: number;
  book: PriceBook;
};

export function priceLabels(currency: CurrencyCode): PriceLabels {
  const book = priceBook(currency);
  return {
    currency,
    monthly: formatMoney(book.monthlyMinor, currency),
    introMonthly: formatMoney(book.introMonthlyMinor, currency),
    yearly: formatMoney(book.yearlyMinor, currency),
    birthday: formatMoney(book.birthdayGiftMinor, currency),
    savingsPercent: yearlySavingsPercent(currency),
    book,
  };
}
