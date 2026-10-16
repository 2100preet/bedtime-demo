import fs from "node:fs";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { fail, fileResponse } from "@/lib/http";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return fail("Sign in first", 401);
  const { id } = await context.params;
  const story = await prisma.story.findFirst({
    where: { id, child: { userId: user.id } },
  });
  if (!story?.audioPath || !fs.existsSync(story.audioPath)) return fail("No audio yet", 404);
  return fileResponse(story.audioPath);
}
