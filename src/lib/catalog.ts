export const AGE_RANGES = [
  { id: "2-3", label: "2–3 years" },
  { id: "4-5", label: "4–5 years" },
  { id: "6-7", label: "6–7 years" },
] as const;

export type AgeRangeId = (typeof AGE_RANGES)[number]["id"];

export const LANGUAGES = [
  { id: "english", label: "English", speech: "en-IN", espeak: "en-gb" },
  { id: "hindi", label: "Hindi", speech: "hi-IN", espeak: "hi" },
  { id: "telugu", label: "Telugu", speech: "te-IN", espeak: "te" },
  { id: "kannada", label: "Kannada", speech: "kn-IN", espeak: "kn" },
  { id: "hinglish", label: "Hinglish (Hindi + English)", speech: "en-IN", espeak: "en-gb" },
  { id: "tenglish", label: "Tenglish (Telugu + English)", speech: "te-IN", espeak: "en-gb" },
  { id: "kanglish", label: "Kanglish (Kannada + English)", speech: "kn-IN", espeak: "en-gb" },
] as const;

export type LanguageId = (typeof LANGUAGES)[number]["id"];

export const RELATIONSHIPS = [
  { id: "dadi", label: "Dadi — paternal grandmother", short: "Dadi" },
  { id: "dada", label: "Dada — paternal grandfather", short: "Dada" },
  { id: "nani", label: "Nani — maternal grandmother", short: "Nani" },
  { id: "nana", label: "Nana — maternal grandfather", short: "Nana" },
  { id: "maushi", label: "Maushi — mother's sister", short: "Maushi" },
  { id: "masi", label: "Masi — mother's sister", short: "Masi" },
  { id: "bua", label: "Bua — father's sister", short: "Bua" },
  { id: "mama", label: "Mama — mother's brother", short: "Mama" },
  { id: "chachi", label: "Chachi — father's brother's wife", short: "Chachi" },
  { id: "chacha", label: "Chacha — father's brother", short: "Chacha" },
  { id: "kaka", label: "Kaka — father's brother", short: "Kaka" },
  { id: "mummy", label: "Mummy / Mom", short: "Mummy" },
  { id: "papa", label: "Papa / Dad", short: "Papa" },
  { id: "sibling", label: "Sibling", short: "Sibling" },
  { id: "friend", label: "Family friend", short: "Family friend" },
  { id: "custom", label: "Someone else", short: "Loved one" },
] as const;

export type RelationshipId = (typeof RELATIONSHIPS)[number]["id"];

export const WAITLIST_INTERESTS = [
  { id: "parent", label: "I'm a parent" },
  { id: "gift", label: "I'm gifting a subscription" },
  { id: "birthday", label: "I want a birthday comic" },
] as const;

const BLURBS: Record<string, string> = {
  dadi: "Papa's mummy",
  dada: "Papa's papa",
  nani: "Mummy's mummy",
  nana: "Mummy's papa",
  maushi: "Mummy's sister",
  masi: "Mummy's sister",
  bua: "Papa's sister",
  mama: "Mummy's brother",
  chachi: "Papa's brother's wife",
  chacha: "Papa's brother",
  kaka: "Papa's brother",
  mummy: "your mummy",
  papa: "your papa",
  sibling: "family, and a wonderful storyteller",
  friend: "a family friend who loves you",
  custom: "someone who loves you very much",
};

export function relationshipShort(id: string, customLabel = "") {
  if (id === "custom") return customLabel.trim() || "Loved one";
  return RELATIONSHIPS.find((item) => item.id === id)?.short ?? (customLabel.trim() || "Loved one");
}

export function relationshipBlurb(id: string, customLabel = "") {
  if (id === "custom" && customLabel.trim()) return customLabel.trim();
  return BLURBS[id] ?? "someone who loves you very much";
}

export function languageById(id: string) {
  return LANGUAGES.find((item) => item.id === id) ?? LANGUAGES[0];
}

export function isLanguageId(id: string): id is LanguageId {
  return LANGUAGES.some((item) => item.id === id);
}

export function isAgeRange(id: string): id is AgeRangeId {
  return AGE_RANGES.some((item) => item.id === id);
}

export function isRelationship(id: string): id is RelationshipId {
  return RELATIONSHIPS.some((item) => item.id === id);
}
