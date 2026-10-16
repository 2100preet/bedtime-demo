import fs from "node:fs";
import { prisma } from "@/lib/db";
import { parsePanels } from "@/lib/comics/create";
import { fail, fileResponse } from "@/lib/http";

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string; index: string }> },
) {
  const { token, index } = await context.params;
  const order = await prisma.comicOrder.findUnique({ where: { shareToken: token } });
  if (!order) return fail("Not found", 404);
  const panel = parsePanels(order.panelsJson).find((item) => item.index === Number(index));
  if (!panel?.imagePath || !fs.existsSync(panel.imagePath)) return fail("No picture", 404);
  return fileResponse(panel.imagePath);
}
