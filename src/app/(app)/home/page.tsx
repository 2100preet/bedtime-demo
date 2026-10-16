import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { isSubscriptionActive } from "@/lib/rules";
import { buttonVariants } from "@/components/ui/button";
import { resolveOffer } from "@/lib/offer";

export const metadata = { title: "Home" };

export default async function HomeDashboard() {
  const user = await requireUser();
  const children = await prisma.child.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { stories: true } } },
  });
  const stories = await prisma.story.findMany({
    where: { child: { userId: user.id } },
    orderBy: { createdAt: "desc" },
    take: 4,
    include: { child: true },
  });
  const active = isSubscriptionActive(user.subscription);
  const offer = await resolveOffer();

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-display text-4xl">Good evening{user.name ? `, ${user.name}` : ""}</h1>
        <p className="mt-2 text-muted-foreground">
          {active
            ? "Your subscription is active. A new story can arrive each week."
            : `The first story for each child is free. Then ${offer.introMonthly} for the first month.`}
        </p>
      </div>
      {children.length === 0 ? (
        <div className="rounded-3xl bg-card p-6 ring-1 ring-foreground/10">
          <h2 className="font-display text-2xl">Add a child to begin</h2>
          <p className="mt-2 text-muted-foreground">Just a first name, an age range, and a language.</p>
          <Link href="/children/new" className={`${buttonVariants({ size: "xl" })} mt-4`}>
            Add a child
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {children.map((child) => (
            <Link key={child.id} href={`/children/${child.id}`} className="rounded-3xl bg-card p-5 ring-1 ring-foreground/10">
              <h2 className="font-display text-2xl">{child.firstName}</h2>
              <p className="text-sm text-muted-foreground">
                Ages {child.ageRange} · {child.language} · {child._count.stories} {child._count.stories === 1 ? "story" : "stories"}
              </p>
            </Link>
          ))}
        </div>
      )}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-2xl">Recent stories</h2>
          <Link href="/library" className="text-sm font-bold underline">
            Library
          </Link>
        </div>
        {stories.length === 0 ? (
          <p className="text-muted-foreground">No stories yet. Open a child and write the free sample.</p>
        ) : (
          <ul className="grid gap-2">
            {stories.map((story) => (
              <li key={story.id}>
                <Link href={`/library/${story.id}`} className="block rounded-2xl bg-blush px-4 py-3">
                  <span className="font-bold">{story.title}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">For {story.child.firstName}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
