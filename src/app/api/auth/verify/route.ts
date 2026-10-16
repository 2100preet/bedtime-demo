import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { setSession } from "@/lib/auth";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const link = await prisma.magicLink.findUnique({ where: { token } });
  if (!link || link.usedAt || link.expiresAt.getTime() < Date.now()) {
    redirect("/login?error=link");
  }
  const user = await prisma.user.upsert({
    where: { email: link.email },
    update: {},
    create: { email: link.email },
  });
  await prisma.magicLink.update({ where: { id: link.id }, data: { usedAt: new Date() } });
  await setSession(user.id);
  redirect("/home");
}
