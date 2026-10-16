import { cookies, headers } from "next/headers";
import { priceLabels, type PriceLabels } from "@/lib/brand";
import { CURRENCY_COOKIE, TIMEZONE_COOKIE, selectCurrency, type CurrencySource } from "@/lib/currency";

export type Offer = PriceLabels & { source: CurrencySource };

function countryHeader(headerList: Headers) {
  return headerList.get("x-vercel-ip-country") || headerList.get("cf-ipcountry");
}

/** Visitor currency for this request. Pages pass `?currency=` so the first hit matches the test override. */
export async function resolveOffer(queryOverride?: string | null): Promise<Offer> {
  const headerList = await headers();
  const jar = await cookies();
  const decision = selectCurrency({
    override: queryOverride || headerList.get("x-bedtime-currency"),
    cookie: jar.get(CURRENCY_COOKIE)?.value,
    country: countryHeader(headerList),
    acceptLanguage: headerList.get("accept-language"),
    timezone: jar.get(TIMEZONE_COOKIE)?.value,
  });
  return { ...priceLabels(decision.currency), source: decision.source };
}
