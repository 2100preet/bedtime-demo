import { getCurrentUser } from "@/lib/auth";
import { deleteNarratorForUser } from "@/lib/narration/record";
import { fail, ok } from "@/lib/http";

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return fail("Sign in first", 401);
  const { id } = await context.params;
  try {
    await deleteNarratorForUser(user.id, id);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not delete the voice", 400);
  }
  return ok({ ok: true });
}
