export const STORY_DUE_MS = 6 * 24 * 60 * 60 * 1000;

export function storyGenerationAccess(input: {
  existingStories: number;
  subscriptionActive: boolean;
}) {
  if (input.subscriptionActive) {
    return { allowed: true as const, isSample: false };
  }
  if (input.existingStories < 1) {
    return { allowed: true as const, isSample: true };
  }
  return {
    allowed: false as const,
    isSample: false,
    reason:
      "The free sample story is already in the library. A subscription unlocks a new story each week.",
  };
}

export function isSubscriptionActive(
  sub: { status: string; currentPeriodEnd: Date | string | null } | null | undefined,
  now = new Date(),
) {
  if (!sub || sub.status !== "active") return false;
  if (!sub.currentPeriodEnd) return true;
  return new Date(sub.currentPeriodEnd).getTime() > now.getTime();
}

export function isStoryDue(lastStoryAt: Date | null, now: Date) {
  if (!lastStoryAt) return true;
  return now.getTime() - lastStoryAt.getTime() >= STORY_DUE_MS;
}

export function shouldDeletePhotosAfterGeneration(flag: string | undefined) {
  return flag !== "false";
}

export function canSubmitRecording(input: { consent: boolean; hasAudio: boolean }) {
  return input.consent && input.hasAudio;
}

export function addMonths(from: Date, months: number) {
  const next = new Date(from.getTime());
  next.setMonth(next.getMonth() + months);
  return next;
}
