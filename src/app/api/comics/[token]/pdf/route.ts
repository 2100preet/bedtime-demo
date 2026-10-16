import fs from "node:fs";
import path from "node:path";
import { prisma } from "@/lib/db";
import { comicDir } from "@/lib/paths";
import { parseCharacter, parsePanels } from "@/lib/comics/create";
import { writeComicPdf } from "@/lib/comics/pdf";
import { characterFromSeed } from "@/lib/comics/script";
import { fail, fileResponse } from "@/lib/http";

export async function GET(_request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  const order = await prisma.comicOrder.findUnique({ where: { shareToken: token } });
  if (!order || order.status !== "ready" || !order.narration) return fail("The book is not ready", 404);
  let pdfPath = order.pdfPath && fs.existsSync(order.pdfPath) ? order.pdfPath : "";
  if (!pdfPath) {
    pdfPath = path.join(comicDir(), `${order.id}.pdf`);
    const character = parseCharacter(order.characterJson) ?? characterFromSeed(order.childFirstName);
    try {
      await writeComicPdf({
        pdfPath,
        title: order.title || order.childFirstName,
        narration: order.narration,
        character,
        panels: parsePanels(order.panelsJson),
      });
      await prisma.comicOrder.update({ where: { id: order.id }, data: { pdfPath } });
    } catch (error) {
      console.error(error);
      return fail("The PDF could not be printed on this machine", 500);
    }
  }
  return fileResponse(pdfPath, `${order.childFirstName}-birthday.pdf`);
}
