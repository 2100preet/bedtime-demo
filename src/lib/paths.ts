import fs from "node:fs";
import path from "node:path";

export const dataDir = path.join(process.cwd(), "data");

export function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function audioDir(...parts: string[]) {
  return ensureDir(path.join(dataDir, "audio", ...parts));
}

export function photoDir(comicId: string) {
  return ensureDir(path.join(dataDir, "photos", comicId));
}

export function comicDir() {
  return ensureDir(path.join(dataDir, "comics"));
}
