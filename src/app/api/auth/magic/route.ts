import { prisma } from "@/lib/db";
import { emailField, firstZodError } from "@/lib/validators";
import { fail, ok } from "@/lib/http";
import { appUrl, newToken } from "@/lib/text";
import { z } from "zod";

export async function POST(request: Request) {
  const parsed = z.object({ email: emailField }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(firstZodError(parsed.error));
  const token = newToken();
  await prisma.magicLink.create({
    data: {
      email: parsed.data.email,
      token,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    },
  });
  const url = `${appUrl()}/api/auth/verify?token=${token}`;
  return ok({
    ok: true,
    devLink: url,
  });
}
