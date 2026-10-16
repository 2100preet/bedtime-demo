"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { TIMEZONE_COOKIE } from "@/lib/currency";

/** When headers do not place the visitor, Asia/Kolkata selects INR and refreshes once. */
export function TimezoneCurrency({ enabled }: { enabled: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return;
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (zone !== "Asia/Kolkata" && zone !== "Asia/Calcutta") return;
    if (document.cookie.split("; ").some((item) => item.startsWith(`${TIMEZONE_COOKIE}=`))) return;
    document.cookie = `${TIMEZONE_COOKIE}=${zone}; Path=/; Max-Age=2592000; SameSite=Lax`;
    router.refresh();
  }, [enabled, router]);

  return null;
}
