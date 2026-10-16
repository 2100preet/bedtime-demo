import fs from "node:fs";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { fail, fileResponse } from "@/lib/http";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return fail("Sign in first", 401);
  const { id } = await context.params;
  const narrator = await prisma.narrator.findFirst({ where: { id, userId: user.id } });
  if (!narrator?.audioPath || !fs.existsSync(narrator.audioPath)) return fail("No recording", 404);
  return fileResponse(narrator.audioPath);
}
