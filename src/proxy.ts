import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { CURRENCY_COOKIE, parseCurrencyCode } from "@/lib/currency";

export function proxy(request: NextRequest) {
  const override = parseCurrencyCode(request.nextUrl.searchParams.get("currency"));
  const requestHeaders = new Headers(request.headers);
  if (override) requestHeaders.set("x-bedtime-currency", override);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  if (override) {
    response.cookies.set(CURRENCY_COOKIE, override, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
