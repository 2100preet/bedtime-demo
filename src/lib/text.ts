import { randomBytes } from "node:crypto";

export function wordCount(text: string) {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export function hashString(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function newToken(bytes = 24) {
  return randomBytes(bytes).toString("base64url");
}

export function safeNextPath(value: string | null | undefined, fallback = "/home") {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }
  return value;
}

export function splitInterests(value: string) {
  return value
    .split(/[,،]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 8);
}

export function interestPhrase(interests: string[]) {
  const clean = interests.map((item) => item.trim()).filter(Boolean);
  if (clean.length === 0) return { primary: "stars", phrase: "stars and quiet songs" };
  if (clean.length === 1) return { primary: clean[0], phrase: clean[0] };
  return { primary: clean[0], phrase: `${clean[0]} and ${clean[1]}` };
}

export function listenMinutes(words: number) {
  return Math.max(1, Math.round(words / 130));
}

export function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:43123").replace(/\/$/, "");
}

export function whatsAppLink(text: string) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function mailLink(subject: string, body: string) {
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
