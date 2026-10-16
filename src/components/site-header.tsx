import Link from "next/link";
import { BRAND_NAME } from "@/lib/brand";
import { getCurrentUser } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";

export async function SiteHeader({ dark = false }: { dark?: boolean }) {
  const user = await getCurrentUser();
  return (
    <div className={dark ? "text-cream" : "text-night"}>
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4">
        <Link href="/" className="font-display text-2xl tracking-tight">
          {BRAND_NAME}
        </Link>
        <nav className="flex items-center gap-2 text-sm font-bold sm:gap-4">
          <Link href="/birthday" className="hidden sm:inline">
            Birthday book
          </Link>
          <Link href="/gift" className="hidden sm:inline">
            Gift
          </Link>
          <Link href={user ? "/home" : "/login"} className={buttonVariants({ size: "lg" })}>
            {user ? "Library" : "Sign in"}
          </Link>
        </nav>
      </div>
    </div>
  );
}
