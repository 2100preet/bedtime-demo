import { saveNarratorRecording } from "@/lib/narration/record";
import { fail, ok } from "@/lib/http";

export async function POST(request: Request) {
  const form = await request.formData();
  const token = String(form.get("token") ?? "");
  const consent = form.get("consent") === "true";
  const useSample = form.get("useSample") === "true";
  const file = form.get("audio");
  let audio: Buffer | undefined;
  let mime: string | undefined;
  if (file instanceof File && file.size > 0) {
    if (file.size > 8 * 1024 * 1024) return fail("Keep the recording under about 3 minutes");
    audio = Buffer.from(await file.arrayBuffer());
    mime = file.type;
  }
  try {
    await saveNarratorRecording({ token, consent, audio, mime, useSample });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not save the recording");
  }
  return ok({ ok: true });
}
