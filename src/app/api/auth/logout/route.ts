import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";
import { appUrl } from "@/lib/text";

export async function POST() {
  await clearSession();
  return NextResponse.redirect(new URL("/login", appUrl()), 303);
}
