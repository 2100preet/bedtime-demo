import Link from "next/link";
import { BRAND_NAME } from "@/lib/brand";
import { buttonVariants } from "@/components/ui/button";

const links = [
  { href: "/home", label: "Home" },
  { href: "/library", label: "Library" },
  { href: "/children/new", label: "Child" },
  { href: "/birthday", label: "Birthday" },
  { href: "/billing", label: "Plan" },
];

export function ParentNav({ email }: { email: string }) {
  return (
    <>
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/home" className="font-display text-2xl text-night">
            {BRAND_NAME}
          </Link>
          <nav className="hidden items-center gap-4 text-sm font-bold md:flex">
            {links.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
          <form action="/api/auth/logout" method="post" className="flex items-center gap-3">
            <span className="hidden max-w-40 truncate text-xs text-muted-foreground sm:inline">{email}</span>
            <button className={buttonVariants({ variant: "secondary", size: "lg" })} type="submit">
              Log out
            </button>
          </form>
        </div>
      </header>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] text-center text-xs font-bold backdrop-blur md:hidden">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="px-1 py-3">
            {link.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
