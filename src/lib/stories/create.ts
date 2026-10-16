import path from "node:path";
import { prisma } from "@/lib/db";
import { audioDir } from "@/lib/paths";
import { writeStoryText } from "@/lib/providers/llm";
import { synthesizeSpeech } from "@/lib/providers/voice";
import { isSubscriptionActive, storyGenerationAccess } from "@/lib/rules";
import { relationshipShort } from "@/lib/catalog";
import { splitInterests, appUrl } from "@/lib/text";

export async function createStoryForChild(input: {
  userId: string;
  childId: string;
  narratorId?: string | null;
  source: "manual" | "weekly";
}) {
  const child = await prisma.child.findFirst({
    where: { id: input.childId, userId: input.userId },
  });
  if (!child) throw new Error("Child not found");

  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    include: { subscription: true },
  });
  const existing = await prisma.story.count({ where: { childId: child.id } });
  const access = storyGenerationAccess({
    existingStories: existing,
    subscriptionActive: isSubscriptionActive(user?.subscription),
  });
  if (!access.allowed) {
    const error = new Error(access.reason);
    throw error;
  }

  const narrator = input.narratorId
    ? await prisma.narrator.findFirst({
        where: {
          id: input.narratorId,
          userId: input.userId,
          status: "ready",
          deletedAt: null,
        },
      })
    : await prisma.narrator.findFirst({
        where: { userId: input.userId, childId: child.id, status: "ready", deletedAt: null },
        orderBy: { createdAt: "desc" },
      });

  const text = await writeStoryText({
    childName: child.firstName,
    ageRange: child.ageRange,
    language: child.language,
    interests: splitInterests(child.interests),
    nickname: child.nickname,
    narratorName: narrator?.displayName || "a loved one",
    narratorRelation: narrator?.relationship || "custom",
    occasion: "bedtime",
  });

  const story = await prisma.story.create({
    data: {
      childId: child.id,
      narratorId: narrator?.id,
      title: text.title,
      body: text.body,
      language: child.language,
      provider: text.provider,
      isSample: access.isSample,
      source: input.source,
      voiceLabel: narrator ? "Preview voice" : "Preview voice",
    },
  });

  const audio = await synthesizeSpeech({
    text: text.body,
    language: child.language,
    fileBase: path.join(audioDir("stories"), story.id),
    voiceId: narrator?.voiceId,
  });

  const saved = await prisma.story.update({
    where: { id: story.id },
    data: {
      audioPath: audio.audioPath,
      audioMode: audio.audioMode,
      voiceLabel: audio.voiceLabel,
    },
  });

  if (input.source === "weekly" && user) {
    const link = `${appUrl()}/library/${saved.id}`;
    await prisma.notification.create({
      data: {
        userId: user.id,
        channel: "whatsapp",
        to: user.email,
        subject: saved.title,
        body: `This week's bedtime story for ${child.firstName} is ready to share: ${link}`,
      },
    });
  }

  return saved;
}

export function narratorDisplay(narrator: { relationship: string; customLabel: string; displayName: string }) {
  return {
    name: narrator.displayName,
    relation: relationshipShort(narrator.relationship, narrator.customLabel),
  };
}
