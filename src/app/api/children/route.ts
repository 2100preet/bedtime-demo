import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { childSchema, firstZodError } from "@/lib/validators";
import { fail, ok } from "@/lib/http";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return fail("Sign in first", 401);
  const parsed = childSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(firstZodError(parsed.error));
  const child = await prisma.child.create({
    data: { userId: user.id, ...parsed.data },
  });
  return ok({ id: child.id });
}
