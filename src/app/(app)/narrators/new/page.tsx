import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { NarratorForm } from "@/components/narrator-form";
import Link from "next/link";

export const metadata = { title: "Invite a narrator" };

export default async function NewNarratorPage() {
  const user = await requireUser();
  const children = await prisma.child.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });
  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-display text-4xl">Invite a loved one</h1>
      <p className="mt-2 mb-6 text-muted-foreground">
        They get a link, read a short script, and check a consent box. You can delete the voice later.
      </p>
      {children.length === 0 ? (
        <p>
          Add a child first. <Link href="/children/new" className="font-bold underline">Add a child</Link>
        </p>
      ) : (
        <NarratorForm childOptions={children.map((child) => ({ id: child.id, firstName: child.firstName }))} />
      )}
    </div>
  );
}
