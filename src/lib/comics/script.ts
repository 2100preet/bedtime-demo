import { buildMockStory, type StoryInput } from "@/lib/stories/mock-story";
import { hashString } from "@/lib/text";

export type CharacterSheet = {
  skin: string;
  hair: string;
  shirt: string;
  cheek: string;
  shawl: string;
  imagePath?: string;
  variant?: number;
  likeness?: "photo" | "sample";
};

const SKINS = ["#f6e2c8", "#f3d2b5", "#e0ac7a", "#c68642", "#8d5524"];
const HAIRS = ["#2b2118", "#5c3317", "#1a1a1a", "#6b3a2a", "#3f2e22"];
const SHIRTS = ["#f59e0b", "#7c3aed", "#0f766e", "#be123c", "#1d4ed8"];
const SHAWLS = ["#c4b5fd", "#fdba74", "#99f6e4", "#fecdd3", "#fde68a"];

const BACKGROUNDS = [
  "morning",
  "window",
  "festival",
  "interest",
  "kitchen",
  "rain",
  "lamp",
  "stars",
  "bed",
  "night",
] as const;

const POSES = ["stand", "point", "look", "hug", "sit", "dance", "lamp", "yawn", "tuck", "sleep"] as const;

export type ComicBackground = (typeof BACKGROUNDS)[number];
export type ComicPose = (typeof POSES)[number];

export type ComicPanel = {
  index: number;
  caption: string;
  background: ComicBackground;
  pose: ComicPose;
};

export function characterFromSeed(seed: string): CharacterSheet {
  const n = hashString(seed || "story");
  return {
    skin: SKINS[n % SKINS.length],
    hair: HAIRS[Math.floor(n / 3) % HAIRS.length],
    shirt: SHIRTS[Math.floor(n / 9) % SHIRTS.length],
    cheek: "#e8a598",
    shawl: SHAWLS[Math.floor(n / 27) % SHAWLS.length],
  };
}

export function toPanels(narration: string): ComicPanel[] {
  const sentences = narration
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?।])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  const size = Math.max(1, Math.ceil(sentences.length / 10));
  return Array.from({ length: 10 }, (_, index) => {
    const chunk = sentences.slice(index * size, (index + 1) * size);
    const caption = chunk[0] || sentences[sentences.length - 1] || "";
    return {
      index: index + 1,
      caption,
      background: BACKGROUNDS[index],
      pose: POSES[index],
    };
  });
}

export function buildComicScript(input: StoryInput) {
  const story = buildMockStory({ ...input, occasion: "birthday" });
  const character = characterFromSeed(
    `${input.childName}|${input.interests.join(",")}|${input.narratorName}`,
  );
  return {
    title: story.title,
    narration: story.body,
    character,
    panels: toPanels(story.body),
  };
}
