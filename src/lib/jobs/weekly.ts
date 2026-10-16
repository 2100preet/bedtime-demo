import { prisma } from "@/lib/db";
import { createStoryForChild } from "@/lib/stories/create";
import { isStoryDue, isSubscriptionActive } from "@/lib/rules";
import { appUrl } from "@/lib/text";
import { BRAND_NAME } from "@/lib/brand";

export async function deliverDueComics(now = new Date()) {
  const today = now.toISOString().slice(0, 10);
  const due = await prisma.comicOrder.findMany({
    where: { status: "ready", deliveredAt: null, deliverOn: { not: null } },
  });
  let sent = 0;
  for (const order of due) {
    if (!order.deliverOn || order.deliverOn > today) continue;
    await prisma.notification.create({
      data: {
        userId: order.userId,
        channel: "whatsapp",
        to: order.buyerEmail,
        subject: order.title || "Birthday story",
        body: `Today is the day. Share ${order.childFirstName}'s ${BRAND_NAME} book: ${appUrl()}/c/${order.shareToken}`,
      },
    });
    await prisma.comicOrder.update({
      where: { id: order.id },
      data: { deliveredAt: now },
    });
    sent += 1;
  }
  return sent;
}

export async function runWeeklyJob(now = new Date()) {
  const users = await prisma.user.findMany({ include: { subscription: true, children: true } });
  const report = { stories: 0, skipped: 0, errors: 0, deliveries: 0 };
  for (const user of users) {
    if (!isSubscriptionActive(user.subscription, now)) continue;
    for (const child of user.children) {
      const latest = await prisma.story.findFirst({
        where: { childId: child.id },
        orderBy: { createdAt: "desc" },
      });
      if (!isStoryDue(latest?.createdAt ?? null, now)) {
        report.skipped += 1;
        continue;
      }
      try {
        await createStoryForChild({
          userId: user.id,
          childId: child.id,
          source: "weekly",
        });
        report.stories += 1;
      } catch (error) {
        console.error(error);
        report.errors += 1;
      }
    }
  }
  report.deliveries = await deliverDueComics(now);
  return report;
}
