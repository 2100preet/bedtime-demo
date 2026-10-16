import fs from "node:fs";
import path from "node:path";
import { prisma } from "@/lib/db";
import { audioDir, comicDir, photoDir } from "@/lib/paths";
import { buildComicScript, type CharacterSheet, type ComicPanel } from "@/lib/comics/script";
import { writeComicPdf } from "@/lib/comics/pdf";
import { illustratePanels, renderCharacterSheet } from "@/lib/providers/image";
import { synthesizeSpeech } from "@/lib/providers/voice";
import { shouldDeletePhotosAfterGeneration } from "@/lib/rules";
import { splitInterests, appUrl } from "@/lib/text";
import { BRAND_NAME } from "@/lib/brand";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export async function draftCharacter(comicId: string, variant = 0) {
  const order = await prisma.comicOrder.findUnique({ where: { id: comicId } });
  if (!order) throw new Error("Birthday book not found");
  if (order.status === "ready") return order;

  const photos = JSON.parse(order.photoPaths || "[]") as string[];
  const previous = parseCharacter(order.characterJson);
  const script = buildComicScript({
    childName: order.childFirstName,
    ageRange: order.ageRange,
    language: order.language,
    interests: splitInterests(order.interests),
    nickname: order.nickname,
    narratorName: "a loved one",
    narratorRelation: "custom",
    occasion: "birthday",
  });

  await prisma.comicOrder.update({
    where: { id: order.id },
    data: { status: "generating", error: "" },
  });

  try {
    const sheet = await renderCharacterSheet({
      comicId: order.id,
      childName: order.childFirstName,
      photoPath: photos.find((file) => file && fs.existsSync(file)),
      variant,
    });
    return await prisma.comicOrder.update({
      where: { id: order.id },
      data: {
        status: "character_preview",
        characterJson: JSON.stringify({
          ...script.character,
          ...previous,
          imagePath: sheet.imagePath,
          variant,
          likeness: sheet.likeness,
        }),
        error: "",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The character could not be drawn";
    await prisma.comicOrder.update({
      where: { id: order.id },
      data: { status: "error", error: message },
    });
    throw error;
  }
}

export async function generateComic(comicId: string) {
  const order = await prisma.comicOrder.findUnique({
    where: { id: comicId },
    include: { narrators: true },
  });
  if (!order) throw new Error("Birthday book not found");
  if (order.status === "ready" && order.narration) return order;

  await prisma.comicOrder.update({
    where: { id: order.id },
    data: { status: "generating", error: "" },
  });

  try {
    const narrator = order.narrators.find((item) => item.status === "ready" && !item.deletedAt);
    const script = buildComicScript({
      childName: order.childFirstName,
      ageRange: order.ageRange,
      language: order.language,
      interests: splitInterests(order.interests),
      nickname: order.nickname,
      narratorName: narrator?.displayName || "a loved one",
      narratorRelation: narrator?.relationship || "custom",
      occasion: "birthday",
    });

    const photos = JSON.parse(order.photoPaths || "[]") as string[];
    const previous = parseCharacter(order.characterJson);
    const sheet =
      previous?.imagePath && fs.existsSync(previous.imagePath)
        ? previous
        : await (async () => {
            const rendered = await renderCharacterSheet({
              comicId: order.id,
              childName: order.childFirstName,
              photoPath: photos.find((file) => file && fs.existsSync(file)),
              variant: previous?.variant ?? 0,
            });
            return {
              ...script.character,
              imagePath: rendered.imagePath,
              variant: previous?.variant ?? 0,
              likeness: rendered.likeness,
            };
          })();

    const illustrated = await illustratePanels({
      comicId: order.id,
      childName: order.childFirstName,
      referencePath: sheet.imagePath || "",
      panels: script.panels.map((panel) => ({ index: panel.index, caption: panel.caption })),
    });

    const panels: ComicPanel[] = script.panels.map((panel) => ({
      ...panel,
      ...(illustrated.images[panel.index]
        ? { imagePath: illustrated.images[panel.index] }
        : {}),
    })) as ComicPanel[];

    const audio = await synthesizeSpeech({
      text: script.narration,
      language: order.language,
      fileBase: path.join(audioDir("comics"), order.id),
      voiceId: narrator?.voiceId,
    });

    const pdfPath = path.join(comicDir(), `${order.id}.pdf`);
    try {
      await writeComicPdf({
        pdfPath,
        title: script.title,
        narration: script.narration,
        character: script.character,
        panels,
      });
    } catch (error) {
      console.error("PDF render failed", error);
    }

    const deletePhotos = shouldDeletePhotosAfterGeneration(process.env.PHOTO_DELETE_AFTER_GENERATION);
    if (deletePhotos) {
      for (const file of photos) {
        if (file && fs.existsSync(file)) fs.unlinkSync(file);
      }
      const folder = photoDir(order.id);
      if (fs.existsSync(folder)) fs.rmSync(folder, { recursive: true, force: true });
    }

    const due = !order.deliverOn || order.deliverOn <= todayIso();
    const saved = await prisma.comicOrder.update({
      where: { id: order.id },
      data: {
        status: "ready",
        title: script.title,
        narration: script.narration,
        panelsJson: JSON.stringify(panels),
        characterJson: JSON.stringify({ ...script.character, ...sheet }),
        audioPath: audio.audioPath,
        audioMode: audio.audioMode,
        pdfPath: fs.existsSync(pdfPath) ? pdfPath : null,
        voiceLabel: audio.voiceLabel,
        photoPaths: deletePhotos ? "[]" : order.photoPaths,
        photosDeletedAt: deletePhotos ? new Date() : null,
        deliveredAt: due ? new Date() : null,
        error: "",
      },
    });

    if (due) {
      await prisma.notification.create({
        data: {
          userId: order.userId,
          channel: "whatsapp",
          to: order.buyerEmail,
          subject: script.title,
          body: `${BRAND_NAME} birthday book for ${order.childFirstName}: ${appUrl()}/c/${order.shareToken}`,
        },
      });
    }
    return saved;
  } catch (error) {
    const message = error instanceof Error ? error.message : "The book could not be drawn";
    await prisma.comicOrder.update({
      where: { id: order.id },
      data: { status: "error", error: message },
    });
    throw error;
  }
}

export async function renarrateComic(comicId: string, voiceId: string) {
  const order = await prisma.comicOrder.findUnique({ where: { id: comicId } });
  if (!order?.narration) return;
  const audio = await synthesizeSpeech({
    text: order.narration,
    language: order.language,
    fileBase: path.join(audioDir("comics"), `${order.id}-voice`),
    voiceId,
  });
  await prisma.comicOrder.update({
    where: { id: order.id },
    data: {
      audioPath: audio.audioPath,
      audioMode: audio.audioMode,
      voiceLabel: audio.voiceLabel,
    },
  });
}

export function parseCharacter(json: string): CharacterSheet | null {
  try {
    const value = JSON.parse(json) as CharacterSheet;
    if (!value?.shirt) return null;
    return value;
  } catch {
    return null;
  }
}

export function parsePanels(json: string): Array<ComicPanel & { imagePath?: string }> {
  try {
    const value = JSON.parse(json) as Array<ComicPanel & { imagePath?: string }>;
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}
