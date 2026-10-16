import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
import path from "node:path";
import { languageById } from "@/lib/catalog";

const execFileAsync = promisify(execFile);

export function stockVoiceId() {
  return process.env.ELEVENLABS_STOCK_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";
}

export async function cloneVoice(input: { name: string; audioPath: string }) {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) {
    return { voiceId: `mock_${path.basename(input.audioPath)}`, provider: "mock" as const };
  }
  const bytes = fs.readFileSync(input.audioPath);
  const form = new FormData();
  form.set("name", input.name.slice(0, 80));
  form.set(
    "files",
    new Blob([bytes], { type: "application/octet-stream" }),
    path.basename(input.audioPath),
  );
  const response = await fetch("https://api.elevenlabs.io/v1/voices/add", {
    method: "POST",
    headers: { "xi-api-key": key },
    body: form,
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Voice cloning failed (${response.status}): ${detail.slice(0, 180)}`);
  }
  const json = (await response.json()) as { voice_id?: string };
  if (!json.voice_id) throw new Error("Voice cloning did not return a voice id");
  return { voiceId: json.voice_id, provider: "elevenlabs" as const };
}

export async function deleteRemoteVoice(voiceId: string | null, provider: string) {
  if (!voiceId || provider !== "elevenlabs" || voiceId.startsWith("mock_")) return;
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return;
  await fetch(`https://api.elevenlabs.io/v1/voices/${voiceId}`, {
    method: "DELETE",
    headers: { "xi-api-key": key },
  });
}

async function elevenMp3(voiceId: string, text: string, outPath: string) {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return false;
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": key,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text: text.slice(0, 8000),
      model_id: "eleven_multilingual_v2",
    }),
  });
  if (!response.ok) return false;
  const bytes = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(outPath, bytes);
  return true;
}

export async function speakToFile(text: string, language: string, outPath: string) {
  const spoken = text.replace(/\*/g, "").replace(/\s+/g, " ").trim().slice(0, 8000);
  const txtPath = `${outPath}.txt`;
  fs.writeFileSync(txtPath, spoken, "utf8");
  const voice = languageById(language).espeak;
  await execFileAsync("espeak-ng", ["-v", voice, "-s", "118", "-f", txtPath, "-w", outPath]);
  fs.unlinkSync(txtPath);
}

export async function synthesizeSpeech(input: {
  text: string;
  language: string;
  fileBase: string;
  voiceId?: string | null;
}) {
  fs.mkdirSync(path.dirname(input.fileBase), { recursive: true });
  const key = process.env.ELEVENLABS_API_KEY;
  const cloned = Boolean(input.voiceId && !input.voiceId.startsWith("mock_") && key);
  if (key) {
    const voice = cloned ? input.voiceId! : stockVoiceId();
    const mp3 = `${input.fileBase}.mp3`;
    const ok = await elevenMp3(voice, input.text, mp3);
    if (ok) {
      return {
        audioPath: mp3,
        audioMode: "file" as const,
        provider: "elevenlabs",
        voiceLabel: cloned ? "Cloned voice" : "Stock voice",
        usedStock: !cloned,
      };
    }
  }
  try {
    const wav = `${input.fileBase}.wav`;
    await speakToFile(input.text, input.language, wav);
    return {
      audioPath: wav,
      audioMode: "file" as const,
      provider: "mock",
      voiceLabel: "Preview voice",
      usedStock: !input.voiceId,
    };
  } catch {
    return {
      audioPath: null,
      audioMode: "browser" as const,
      provider: "mock",
      voiceLabel: "Preview voice",
      usedStock: true,
    };
  }
}
