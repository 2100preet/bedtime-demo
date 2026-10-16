import { getCurrentUser } from "@/lib/auth";
import { createStoryForChild } from "@/lib/stories/create";
import { storyGenerationAccess, isSubscriptionActive } from "@/lib/rules";
import { prisma } from "@/lib/db";
import { fail, ok } from "@/lib/http";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return fail("Sign in first", 401);
  const body = (await request.json().catch(() => null)) as { childId?: string; narratorId?: string } | null;
  if (!body?.childId) return fail("Choose a child");
  const existing = await prisma.story.count({ where: { childId: body.childId, child: { userId: user.id } } });
  const access = storyGenerationAccess({
    existingStories: existing,
    subscriptionActive: isSubscriptionActive(user.subscription),
  });
  if (!access.allowed) return fail(access.reason, 402);
  try {
    const story = await createStoryForChild({
      userId: user.id,
      childId: body.childId,
      narratorId: body.narratorId,
      source: "manual",
    });
    return ok({ id: story.id, isSample: story.isSample });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "The story could not be written", 400);
  }
}
