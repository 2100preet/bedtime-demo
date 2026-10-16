import type { CurrencyCode } from "@/lib/brand";

export const CURRENCY_COOKIE = "bedtime_currency";
export const TIMEZONE_COOKIE = "bedtime_tz";

const UNKNOWN_COUNTRY = new Set(["XX", "T1", "ZZ"]);

/** Hindi and other languages that, without a country code, still point at India. */
const INDIAN_LANGUAGES = new Set(["hi", "te", "kn", "ta", "mr", "bn", "gu", "pa", "ml", "or", "as"]);

export type CurrencySource = "override" | "cookie" | "country" | "language" | "timezone" | "default";

export function parseCurrencyCode(value: string | null | undefined): CurrencyCode | null {
  const code = value?.trim().toUpperCase();
  if (code === "INR" || code === "USD") return code;
  return null;
}

/** Two-letter country from Vercel or Cloudflare. Unknown sentinels count as missing. */
export function countryCode(value: string | null | undefined): string | null {
  if (!value) return null;
  const code = value.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code) || UNKNOWN_COUNTRY.has(code)) return null;
  return code;
}

export function currencyFromAcceptLanguage(header: string | null | undefined): CurrencyCode | null {
  if (!header) return null;
  const tags = header
    .split(",")
    .map((part) => part.split(";")[0]?.trim().toLowerCase() ?? "")
    .filter((tag) => tag.length > 0);
  for (const tag of tags) {
    if (tag.endsWith("-in")) return "INR";
    const primary = tag.split("-")[0];
    if (INDIAN_LANGUAGES.has(primary)) return "INR";
  }
  return null;
}

export function currencyFromTimezone(timezone: string | null | undefined): CurrencyCode | null {
  if (timezone === "Asia/Kolkata" || timezone === "Asia/Calcutta") return "INR";
  return null;
}

export function selectCurrency(input: {
  override?: string | null;
  cookie?: string | null;
  country?: string | null;
  acceptLanguage?: string | null;
  timezone?: string | null;
}): { currency: CurrencyCode; source: CurrencySource } {
  const override = parseCurrencyCode(input.override);
  if (override) return { currency: override, source: "override" };

  const cookie = parseCurrencyCode(input.cookie);
  if (cookie) return { currency: cookie, source: "cookie" };

  const country = countryCode(input.country);
  if (country) return { currency: country === "IN" ? "INR" : "USD", source: "country" };

  const language = currencyFromAcceptLanguage(input.acceptLanguage);
  if (language) return { currency: language, source: "language" };

  const timezone = currencyFromTimezone(input.timezone);
  if (timezone) return { currency: timezone, source: "timezone" };

  return { currency: "USD", source: "default" };
}
