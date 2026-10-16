import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { StoryBody } from "@/components/story-body";
import { StoryPlayer } from "@/components/story-player";
import { listenMinutes, wordCount } from "@/lib/text";

export const metadata = { title: "Story" };

export default async function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const story = await prisma.story.findFirst({
    where: { id, child: { userId: user.id } },
    include: { child: true, narrator: true },
  });
  if (!story) notFound();
  const words = wordCount(story.body);
  return (
    <article className="mx-auto max-w-2xl">
      <p className="text-sm font-bold uppercase tracking-wide text-clay">
        For {story.child.firstName}
        {story.narrator ? ` · ${story.narrator.displayName}` : ""} · {story.isSample ? "Free sample" : "Story"}
      </p>
      <h1 className="mt-2 font-display text-4xl leading-tight">{story.title}</h1>
      <p className="mt-2 mb-5 text-sm text-muted-foreground">
        {words} words · about {listenMinutes(words)} min · {story.voiceLabel}
      </p>
      <StoryPlayer
        src={story.audioPath ? `/api/media/stories/${story.id}` : null}
        text={story.body}
        language={story.language}
        voiceLabel={story.voiceLabel}
      />
      <div className="mt-8">
        <StoryBody body={story.body} />
      </div>
    </article>
  );
}
