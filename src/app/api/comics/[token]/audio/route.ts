import fs from "node:fs";
import { prisma } from "@/lib/db";
import { fail, fileResponse } from "@/lib/http";

export async function GET(_request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  const order = await prisma.comicOrder.findUnique({ where: { shareToken: token } });
  if (!order || order.status !== "ready" || !order.audioPath || !fs.existsSync(order.audioPath)) {
    return fail("Audio is not ready", 404);
  }
  return fileResponse(order.audioPath);
}
