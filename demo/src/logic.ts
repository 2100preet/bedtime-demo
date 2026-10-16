import { formatMoney, priceBook, type CurrencyCode } from "../../src/lib/brand";
import stories from "../narration/stories.json";

export type Currency = CurrencyCode;
export type SampleId = keyof typeof stories;

export type Sample = {
  id: SampleId;
  title: string;
  body: string;
  audio: string;
  voice: string;
};

export const SAMPLE_VOICE_NOTE =
  "Sample voice. Your family member's own cloned voice is used in the real app.";

type StoryFile = {
  title: string;
  body: string;
  voice: string;
  playerTitle: string;
  listen: string;
  sampleChild: string;
  sampleNarrator: string;
};

const FILES = stories as Record<SampleId, StoryFile>;

export const SAMPLES: Sample[] = (Object.keys(FILES) as SampleId[]).map((id) => ({
  id,
  title: FILES[id].title,
  body: FILES[id].body,
  audio: `audio/${id}.mp3`,
  voice: FILES[id].voice,
}));

export function playerLabels(language: string) {
  const file = FILES[language as SampleId] ?? FILES.english;
  return { title: file.playerTitle, listen: file.listen };
}

export function personalize(template: string, child: string, narrator: string) {
  return template.replaceAll("{child}", child).replaceAll("{narrator}", narrator);
}

export function pickSample(language: string, _salt: string): Sample {
  return SAMPLES.find((item) => item.id === language) ?? SAMPLES.find((item) => item.id === "english")!;
}

export function chargeMinor(kind: "monthly" | "yearly" | "birthday", currency: Currency, intro: boolean) {
  const book = priceBook(currency);
  if (kind === "birthday") return book.birthdayGiftMinor;
  if (kind === "yearly") return book.yearlyMinor;
  return intro ? book.introMonthlyMinor : book.monthlyMinor;
}

export function chargeLabel(kind: "monthly" | "yearly" | "birthday", currency: Currency, intro: boolean) {
  return formatMoney(chargeMinor(kind, currency, intro), currency);
}

export function assetUrl(file: string) {
  const base = import.meta.env?.BASE_URL ?? "/";
  return `${base}${file.replace(/^\//, "")}`;
}
