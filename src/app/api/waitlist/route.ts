import { prisma } from "@/lib/db";
import { emailField } from "@/lib/validators";
import { fail, ok } from "@/lib/http";
import { z } from "zod";

const schema = z.object({
  email: emailField,
  interest: z.enum(["parent", "gift", "birthday"]),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail("Enter an email to join the list");
  await prisma.waitlistEntry.create({ data: parsed.data });
  return ok({ joined: true });
}
