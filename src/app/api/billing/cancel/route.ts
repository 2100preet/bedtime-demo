import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fail, ok } from "@/lib/http";

export async function POST() {
  const user = await getCurrentUser();
  if (!user?.subscription) return fail("No subscription to cancel", 400);
  await prisma.subscription.update({
    where: { userId: user.id },
    data: { status: "canceled" },
  });
  return ok({ ok: true });
}
