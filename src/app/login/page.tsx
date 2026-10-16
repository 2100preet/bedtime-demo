import Link from "next/link";
import { redirect } from "next/navigation";
import { BRAND_NAME } from "@/lib/brand";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "@/components/auth-forms";
import { SiteHeader } from "@/components/site-header";
import { safeNextPath } from "@/lib/text";

export const metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const user = await getCurrentUser();
  const params = await searchParams;
  const next = safeNextPath(params.next);
  if (user) redirect(next);
  return (
    <div className="min-h-full bg-cream">
      <div className="bg-night">
        <SiteHeader dark />
      </div>
      <main className="mx-auto max-w-md px-4 py-10">
        <h1 className="font-display text-4xl">Welcome back</h1>
        <p className="mt-2 mb-6 text-muted-foreground">Parents and gift buyers sign in. Children never do.</p>
        {params.error === "link" ? (
          <p className="mb-4 rounded-xl bg-blush px-3 py-2 text-sm">That sign-in link has expired or was already used.</p>
        ) : null}
        <LoginForm next={next} />
        <p className="mt-6 text-sm">
          New here? <Link href="/signup" className="font-bold underline">Create an account</Link> for {BRAND_NAME}.
        </p>
      </main>
    </div>
  );
}
