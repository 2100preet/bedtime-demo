import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { childSchema, firstZodError } from "@/lib/validators";
import { fail, ok } from "@/lib/http";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return fail("Sign in first", 401);
  const { id } = await context.params;
  const parsed = childSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(firstZodError(parsed.error));
  const child = await prisma.child.findFirst({ where: { id, userId: user.id } });
  if (!child) return fail("Child not found", 404);
  await prisma.child.update({ where: { id }, data: parsed.data });
  return ok({ ok: true });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return fail("Sign in first", 401);
  const { id } = await context.params;
  const child = await prisma.child.findFirst({ where: { id, userId: user.id } });
  if (!child) return fail("Child not found", 404);
  await prisma.child.delete({ where: { id } });
  return ok({ ok: true });
}
