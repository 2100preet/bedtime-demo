import { prisma } from "@/lib/db";
import { hashPassword, setSession } from "@/lib/auth";
import { emailField, firstZodError } from "@/lib/validators";
import { fail, ok } from "@/lib/http";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().max(80).optional().default(""),
  email: emailField,
  password: z.string().min(8, "Use at least 8 characters").max(72),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(firstZodError(parsed.error));
  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return fail("That email already has an account. Try logging in.");
  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name,
      passwordHash: await hashPassword(parsed.data.password),
    },
  });
  await setSession(user.id);
  return ok({ ok: true });
}
