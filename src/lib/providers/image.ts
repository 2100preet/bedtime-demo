import fs from "node:fs";
import path from "node:path";
import { comicDir } from "@/lib/paths";
import { characterSheetPrompt, panelPrompt } from "@/lib/comics/prompts";
import { sampleCharacterFile, samplePanelFile } from "@/lib/comics/sample-art";

export type ImageProviderId = "mock" | "openai" | "replicate" | "fal";

type Env = Record<string, string | undefined>;

export function resolveImageProvider(env: Env = process.env): ImageProviderId {
  if (!env.IMAGE_API_KEY) return "mock";
  const explicit = (env.IMAGE_PROVIDER || "").toLowerCase();
  if (explicit === "openai" || explicit === "replicate" || explicit === "fal") return explicit;
  const base = (env.IMAGE_API_BASE_URL || "").toLowerCase();
  if (base.includes("replicate")) return "replicate";
  if (base.includes("fal.run") || base.includes("fal.ai")) return "fal";
  return "openai";
}

/** dall-e cannot take a reference photo. Likeness uses a gpt-image edit unless IMAGE_MODEL is already one. */
export function referenceImageModel(env: Env = process.env) {
  const model = env.IMAGE_MODEL || "gpt-image-1";
  if (model.startsWith("gpt-image")) return model;
  return "gpt-image-1";
}

function comicFolder(comicId: string) {
  const dir = path.join(comicDir(), comicId);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function copyFile(from: string, to: string) {
  if (!fs.existsSync(from)) throw new Error("The sample picture book is missing a page");
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
  return to;
}

function imageMime(filePath: string) {
  if (filePath.endsWith(".png")) return "image/png";
  if (filePath.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

function dataUrl(filePath: string) {
  const bytes = fs.readFileSync(filePath);
  return `data:${imageMime(filePath)};base64,${bytes.toString("base64")}`;
}

async function writeRemoteImage(url: string, dest: string) {
  const response = await fetch(url, { signal: AbortSignal.timeout(120_000) });
  if (!response.ok) throw new Error("The image model returned a picture that could not be saved");
  const bytes = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(dest, bytes);
}

function firstUrl(output: unknown): string | null {
  if (typeof output === "string" && output.startsWith("http")) return output;
  if (Array.isArray(output)) {
    for (const item of output) {
      const found = firstUrl(item);
      if (found) return found;
    }
  }
  if (output && typeof output === "object") {
    const record = output as { url?: string; image?: unknown; images?: unknown };
    if (typeof record.url === "string") return record.url;
    return firstUrl(record.image) || firstUrl(record.images);
  }
  return null;
}

async function openaiEdit(prompt: string, referencePath: string, dest: string) {
  const key = process.env.IMAGE_API_KEY || "";
  const base = (process.env.IMAGE_API_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const model = referenceImageModel();
  const bytes = fs.readFileSync(referencePath);
  const form = new FormData();
  form.append("model", model);
  form.append("prompt", prompt);
  form.append("size", "1024x1024");
  form.append("n", "1");
  form.append("image", new Blob([new Uint8Array(bytes)], { type: imageMime(referencePath) }), path.basename(referencePath));
  const response = await fetch(`${base}/images/edits`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: form,
    signal: AbortSignal.timeout(180_000),
  });
  if (!response.ok) {
    throw new Error("The image model could not draw from the reference photo");
  }
  const json = (await response.json()) as { data?: { b64_json?: string; url?: string }[] };
  const first = json.data?.[0];
  if (first?.b64_json) {
    fs.writeFileSync(dest, Buffer.from(first.b64_json, "base64"));
    return;
  }
  if (first?.url) {
    await writeRemoteImage(first.url, dest);
    return;
  }
  throw new Error("The image model returned no picture");
}

async function replicatePredict(prompt: string, referencePath: string, dest: string) {
  const key = process.env.IMAGE_API_KEY || "";
  const base = (process.env.IMAGE_API_BASE_URL || "https://api.replicate.com/v1").replace(/\/$/, "");
  const model = process.env.IMAGE_MODEL || "zsxkib/instant-id";
  const face = dataUrl(referencePath);
  const modelName = model.toLowerCase();
  const input = modelName.includes("photomaker")
    ? { prompt, input_image: face, num_steps: 20 }
    : modelName.includes("ip-adapter") || modelName.includes("ip_adapter")
      ? { prompt, image: face }
      : { prompt, image: face, negative_prompt: "photograph, text, watermark, extra fingers" };
  const created = await fetch(model.includes("/") ? `${base}/models/${model}/predictions` : `${base}/predictions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "wait=60",
    },
    body: JSON.stringify(model.includes("/") ? { input } : { version: model, input }),
    signal: AbortSignal.timeout(90_000),
  });
  if (!created.ok) throw new Error("The image model could not draw from the reference photo");
  let json = (await created.json()) as { status?: string; output?: unknown; urls?: { get?: string }; error?: string };
  const pollUrl = json.urls?.get;
  for (let attempt = 0; attempt < 20 && json.status && json.status !== "succeeded" && json.status !== "failed"; attempt += 1) {
    if (!pollUrl) break;
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const polled = await fetch(pollUrl, { headers: { Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(30_000) });
    if (!polled.ok) throw new Error("The image model could not be reached");
    json = (await polled.json()) as typeof json;
  }
  if (json.status === "failed") throw new Error("The image model could not draw from the reference photo");
  const url = firstUrl(json.output);
  if (!url) throw new Error("The image model returned no picture");
  await writeRemoteImage(url, dest);
}

async function falPredict(prompt: string, referencePath: string, dest: string) {
  const key = process.env.IMAGE_API_KEY || "";
  const model = (process.env.IMAGE_MODEL || "").replace(/^\//, "");
  const base = (process.env.IMAGE_API_BASE_URL || "https://fal.run/fal-ai/instantid").replace(/\/$/, "");
  const hostOnly = /^https:\/\/(fal\.run|queue\.fal\.run|fal\.ai)$/.test(base);
  const endpoint = hostOnly && model ? `${base}/${model}` : base;
  const face = dataUrl(referencePath);
  const hint = `${model} ${base}`.toLowerCase();
  const input = hint.includes("photomaker")
    ? { prompt, image_url: face }
    : hint.includes("ip-adapter") || hint.includes("ip_adapter")
      ? { prompt, ip_adapter_image_url: face }
      : { prompt, face_image_url: face };
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Key ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(180_000),
  });
  if (!response.ok) throw new Error("The image model could not draw from the reference photo");
  const json = (await response.json()) as { images?: { url?: string }[]; image?: { url?: string }; url?: string };
  const url = json.images?.[0]?.url || json.image?.url || json.url;
  if (!url) throw new Error("The image model returned no picture");
  await writeRemoteImage(url, dest);
}

async function drawFromReference(prompt: string, referencePath: string, dest: string) {
  const provider = resolveImageProvider();
  if (provider === "replicate") return replicatePredict(prompt, referencePath, dest);
  if (provider === "fal") return falPredict(prompt, referencePath, dest);
  return openaiEdit(prompt, referencePath, dest);
}

export async function renderCharacterSheet(input: {
  comicId: string;
  childName: string;
  photoPath?: string;
  variant: number;
}) {
  const dest = path.join(comicFolder(input.comicId), `character-${input.variant}.jpg`);
  if (resolveImageProvider() === "mock") {
    copyFile(sampleCharacterFile(input.variant), dest);
    return { imagePath: dest, likeness: "sample" as const, provider: "mock" as const };
  }
  if (!input.photoPath || !fs.existsSync(input.photoPath)) {
    throw new Error("A photo of the child is required to draw the character");
  }
  await drawFromReference(characterSheetPrompt(input.childName, input.variant), input.photoPath, dest);
  return { imagePath: dest, likeness: "photo" as const, provider: "image" as const };
}

export async function illustratePanels(input: {
  comicId: string;
  childName: string;
  referencePath: string;
  panels: { index: number; caption: string }[];
}) {
  const dir = comicFolder(input.comicId);
  const images: Record<number, string> = {};
  if (resolveImageProvider() === "mock") {
    for (const panel of input.panels) {
      const dest = path.join(dir, `panel-${panel.index}.jpg`);
      images[panel.index] = copyFile(samplePanelFile(panel.index), dest);
    }
    return { provider: "mock" as const, images };
  }
  if (!fs.existsSync(input.referencePath)) {
    throw new Error("Approve a character sheet before the pages are drawn");
  }
  for (const panel of input.panels) {
    const dest = path.join(dir, `panel-${panel.index}.jpg`);
    await drawFromReference(panelPrompt(input.childName, panel.caption), input.referencePath, dest);
    images[panel.index] = dest;
  }
  return { provider: "image" as const, images };
}
