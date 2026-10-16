import fs from "node:fs";
import path from "node:path";
import { prisma } from "@/lib/db";
import { audioDir } from "@/lib/paths";
import { cloneVoice, deleteRemoteVoice, speakToFile } from "@/lib/providers/voice";
import { voiceConsentStatement } from "@/lib/privacy";
import { canSubmitRecording } from "@/lib/rules";
import { recordingScript } from "@/lib/narration/scripts";
import { renarrateComic } from "@/lib/comics/create";

function extensionFor(mime: string | undefined) {
  if (!mime) return "webm";
  if (mime.includes("wav")) return "wav";
  if (mime.includes("mpeg") || mime.includes("mp3")) return "mp3";
  if (mime.includes("mp4") || mime.includes("m4a") || mime.includes("aac")) return "m4a";
  if (mime.includes("ogg")) return "ogg";
  return "webm";
}

export async function saveNarratorRecording(input: {
  token: string;
  consent: boolean;
  audio?: Buffer;
  mime?: string;
  useSample?: boolean;
}) {
  const narrator = await prisma.narrator.findUnique({ where: { inviteToken: input.token } });
  if (!narrator || narrator.status === "deleted") {
    throw new Error("This invite is no longer available");
  }
  const hasAudio = Boolean(input.useSample || (input.audio && input.audio.length > 400));
  if (!canSubmitRecording({ consent: input.consent, hasAudio })) {
    throw new Error("A recording and the consent checkbox are both required");
  }
  if (input.useSample && process.env.ELEVENLABS_API_KEY) {
    throw new Error("Practice recordings are only available without a voice key");
  }

  const folder = audioDir("narrators");
  let audioPath: string;
  if (input.useSample) {
    audioPath = path.join(folder, `${narrator.id}-sample.wav`);
    await speakToFile(recordingScript(narrator.language), narrator.language, audioPath);
  } else {
    audioPath = path.join(folder, `${narrator.id}.${extensionFor(input.mime)}`);
    fs.writeFileSync(audioPath, input.audio!);
  }

  const cloned = await cloneVoice({ name: narrator.displayName, audioPath });
  const saved = await prisma.narrator.update({
    where: { id: narrator.id },
    data: {
      status: "ready",
      consentGiven: true,
      consentStatement: voiceConsentStatement(),
      consentedAt: new Date(),
      audioPath,
      voiceId: cloned.voiceId,
      provider: cloned.provider,
      deletedAt: null,
    },
  });

  if (saved.comicOrderId && saved.voiceId) {
    const order = await prisma.comicOrder.findUnique({ where: { id: saved.comicOrderId } });
    if (order?.narration) {
      await renarrateComic(order.id, saved.voiceId);
    }
  }
  return saved;
}

export async function deleteNarratorForUser(userId: string, narratorId: string) {
  const narrator = await prisma.narrator.findFirst({ where: { id: narratorId, userId } });
  if (!narrator) throw new Error("Voice not found");
  await deleteRemoteVoice(narrator.voiceId, narrator.provider);
  if (narrator.audioPath && fs.existsSync(narrator.audioPath)) {
    fs.unlinkSync(narrator.audioPath);
  }
  await prisma.narrator.update({
    where: { id: narrator.id },
    data: {
      status: "deleted",
      deletedAt: new Date(),
      audioPath: null,
      voiceId: null,
    },
  });
}
