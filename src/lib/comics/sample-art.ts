import path from "node:path";

export function sampleArtDir() {
  return path.join(process.cwd(), "content", "comics", "sample");
}

export function sampleCharacterFile(variant: number) {
  const name = variant % 2 === 0 ? "character-a.jpg" : "character-b.jpg";
  return path.join(sampleArtDir(), name);
}

export function samplePanelFile(index: number) {
  return path.join(sampleArtDir(), `panel-${index}.jpg`);
}
