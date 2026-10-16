import { prisma } from "@/lib/db";
import { checkPassword, setSession } from "@/lib/auth";
import { emailField, firstZodError } from "@/lib/validators";
import { fail, ok } from "@/lib/http";
import { z } from "zod";

const schema = z.object({
  email: emailField,
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(firstZodError(parsed.error));
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user?.passwordHash) return fail("No password on this email yet. Use a magic link.");
  const match = await checkPassword(parsed.data.password, user.passwordHash);
  if (!match) return fail("That email and password do not match.");
  await setSession(user.id);
  return ok({ ok: true });
}
