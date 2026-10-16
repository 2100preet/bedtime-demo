import { requireUser } from "@/lib/auth";
import { ParentNav } from "@/components/parent-nav";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="min-h-full bg-cream">
      <ParentNav email={user.email} />
      <div className="mx-auto w-full max-w-5xl px-4 py-6 pb-24 md:pb-10">{children}</div>
    </div>
  );
}
