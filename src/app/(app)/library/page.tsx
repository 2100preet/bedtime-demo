import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "Library" };

export default async function LibraryPage() {
  const user = await requireUser();
  const stories = await prisma.story.findMany({
    where: { child: { userId: user.id } },
    orderBy: { createdAt: "desc" },
    include: { child: true },
  });
  return (
    <div>
      <h1 className="font-display text-4xl">Library</h1>
      {stories.length === 0 ? (
        <p className="mt-4 text-muted-foreground">
          Nothing here yet. <Link href="/home" className="font-bold underline">Add a child</Link> and write the free sample.
        </p>
      ) : (
        <ul className="mt-6 grid gap-3">
          {stories.map((story) => (
            <li key={story.id}>
              <Link href={`/library/${story.id}`} className="block rounded-3xl bg-card p-5 ring-1 ring-foreground/10">
                <h2 className="font-display text-2xl">{story.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {story.child.firstName} · {story.language} · {story.isSample ? "Free sample" : story.source} · {story.voiceLabel}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
