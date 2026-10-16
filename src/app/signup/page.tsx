import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { SignupForm } from "@/components/auth-forms";
import { SiteHeader } from "@/components/site-header";
import { safeNextPath } from "@/lib/text";

export const metadata = { title: "Create account" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
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
        <h1 className="font-display text-4xl">Create a parent account</h1>
        <p className="mt-2 mb-6 text-muted-foreground">Use your email. You can add a child after this.</p>
        <SignupForm next={next} />
        <p className="mt-6 text-sm">
          Already have an account? <Link href="/login" className="font-bold underline">Sign in</Link>
        </p>
      </main>
    </div>
  );
}
