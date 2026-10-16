import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { narratorSchema, firstZodError } from "@/lib/validators";
import { fail, ok } from "@/lib/http";
import { isRelationship } from "@/lib/catalog";
import { newToken } from "@/lib/text";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return fail("Sign in first", 401);
  const parsed = narratorSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(firstZodError(parsed.error));
  if (!isRelationship(parsed.data.relationship)) return fail("Choose who they are");
  if (parsed.data.childId) {
    const child = await prisma.child.findFirst({
      where: { id: parsed.data.childId, userId: user.id },
    });
    if (!child) return fail("Child not found", 404);
  }
  const narrator = await prisma.narrator.create({
    data: {
      userId: user.id,
      childId: parsed.data.childId,
      relationship: parsed.data.relationship,
      customLabel: parsed.data.customLabel,
      displayName: parsed.data.displayName,
      language: parsed.data.language,
      inviteToken: newToken(),
    },
  });
  return ok({ id: narrator.id, token: narrator.inviteToken });
}
