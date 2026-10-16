import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { isSubscriptionActive, storyGenerationAccess } from "@/lib/rules";
import { relationshipShort } from "@/lib/catalog";
import { appUrl, whatsAppLink } from "@/lib/text";
import { BRAND_NAME } from "@/lib/brand";
import { ChildForm } from "@/components/child-form";
import { CopyButton } from "@/components/copy-button";
import { DeleteVoiceButton, GenerateButton } from "@/components/story-actions";
import { buttonVariants } from "@/components/ui/button";

export const metadata = { title: "Child" };

export default async function ChildPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ invite?: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const query = await searchParams;
  const child = await prisma.child.findFirst({
    where: { id, userId: user.id },
    include: {
      narrators: { orderBy: { createdAt: "desc" } },
      stories: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!child) notFound();
  const access = storyGenerationAccess({
    existingStories: child.stories.length,
    subscriptionActive: isSubscriptionActive(user.subscription),
  });
  const readyNarrator = child.narrators.find((narrator) => narrator.status === "ready");
  const freshInvite = query.invite
    ? child.narrators.find((narrator) => narrator.inviteToken === query.invite)
    : null;

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="font-display text-4xl">{child.firstName}</h1>
        <p className="mt-2 text-muted-foreground">Ages {child.ageRange} · {child.language}</p>
      </div>
      {freshInvite ? (
        <InviteCard
          name={freshInvite.displayName}
          childName={child.firstName}
          token={freshInvite.inviteToken}
        />
      ) : null}
      <GenerateButton
        childId={child.id}
        narratorId={readyNarrator?.id}
        blockedReason={access.allowed ? undefined : access.reason}
      />
      <section className="grid gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">Voices</h2>
          <Link href="/narrators/new" className={buttonVariants({ variant: "secondary", size: "lg" })}>
            Invite someone
          </Link>
        </div>
        {child.narrators.filter((narrator) => narrator.status !== "deleted").length === 0 ? (
          <p className="text-muted-foreground">No narrator yet. Stories can still use a preview voice.</p>
        ) : (
          child.narrators
            .filter((narrator) => narrator.status !== "deleted")
            .map((narrator) => {
              const link = `${appUrl()}/invite/${narrator.inviteToken}`;
              return (
                <article key={narrator.id} className="grid gap-2 rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
                  <h3 className="font-bold">
                    {narrator.displayName} · {relationshipShort(narrator.relationship, narrator.customLabel)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {narrator.status === "ready" ? narrator.provider === "mock" ? "Recording saved · preview voice" : "Cloned voice ready" : "Waiting for their recording"}
                  </p>
                  {narrator.audioPath ? <audio controls src={`/api/media/narrators/${narrator.id}`} className="w-full" /> : null}
                  {narrator.status !== "ready" ? (
                    <div className="flex flex-wrap gap-2">
                      <CopyButton value={link} />
                      <a className={buttonVariants({ size: "lg" })} href={whatsAppLink(`${child.firstName} would love a bedtime story in your voice on ${BRAND_NAME}. It takes about a minute: ${link}`)}>
                        WhatsApp
                      </a>
                    </div>
                  ) : (
                    <DeleteVoiceButton id={narrator.id} />
                  )}
                </article>
              );
            })
        )}
      </section>
      <section>
        <h2 className="mb-3 font-display text-2xl">Stories</h2>
        {child.stories.length === 0 ? (
          <p className="text-muted-foreground">The free sample has not been written yet.</p>
        ) : (
          <ul className="grid gap-2">
            {child.stories.map((story) => (
              <li key={story.id}>
                <Link href={`/library/${story.id}`} className="font-bold underline">
                  {story.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="max-w-lg">
        <h2 className="mb-3 font-display text-2xl">Edit profile</h2>
        <ChildForm
          childId={child.id}
          initial={{
            firstName: child.firstName,
            ageRange: child.ageRange,
            language: child.language,
            interests: child.interests,
            nickname: child.nickname,
          }}
        />
      </section>
    </div>
  );
}

function InviteCard({ name, childName, token }: { name: string; childName: string; token: string }) {
  const link = `${appUrl()}/invite/${token}`;
  const message = `I'd love you to be the voice of ${childName}'s bedtime stories on ${BRAND_NAME}. It takes about a minute to read a short script: ${link}`;
  return (
    <div className="grid gap-3 rounded-3xl bg-lilac p-5">
      <h2 className="font-display text-2xl">Send this to {name}</h2>
      <p className="break-all text-sm">{link}</p>
      <div className="flex flex-wrap gap-2">
        <CopyButton value={link} />
        <a className={buttonVariants({ size: "lg" })} href={whatsAppLink(message)}>
          Open WhatsApp
        </a>
      </div>
    </div>
  );
}
