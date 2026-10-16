import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { BRAND_NAME, INR_PRICING, PRICING, formatMoney, priceBook, yearlySavingsPercent } from "@/lib/brand";
import { selectCurrency } from "@/lib/currency";
import { LANGUAGES, RELATIONSHIPS } from "@/lib/catalog";
import { photoConsentStatement, voiceConsentStatement } from "@/lib/privacy";
import {
  canSubmitRecording,
  isStoryDue,
  isSubscriptionActive,
  shouldDeletePhotosAfterGeneration,
  storyGenerationAccess,
  STORY_DUE_MS,
} from "@/lib/rules";
import { wordCount } from "@/lib/text";
import { buildMockStory } from "@/lib/stories/mock-story";
import { buildComicScript, characterFromSeed } from "@/lib/comics/script";
import { characterSheetPrompt, panelPrompt } from "@/lib/comics/prompts";
import { sampleCharacterFile, samplePanelFile } from "@/lib/comics/sample-art";
import { referenceImageModel, resolveImageProvider } from "@/lib/providers/image";

const languages = LANGUAGES.map((item) => item.id);

describe("pricing", () => {
  it("keeps the published prices in one constant", () => {
    expect(PRICING.monthlyCents).toBe(499);
    expect(PRICING.introMonthlyCents).toBe(199);
    expect(PRICING.yearlyCents).toBe(3900);
    expect(PRICING.birthdayGiftCents).toBe(2900);
    expect(INR_PRICING.monthlyRupees).toBe(399);
    expect(INR_PRICING.introMonthlyRupees).toBe(99);
    expect(INR_PRICING.yearlyRupees).toBe(2999);
    expect(INR_PRICING.birthdayGiftRupees).toBe(1999);
    expect(yearlySavingsPercent()).toBe(35);
    expect(yearlySavingsPercent("INR")).toBe(37);
    expect(BRAND_NAME.length).toBeGreaterThan(0);
  });

  it("formats INR with the rupee symbol and Indian grouping", () => {
    const book = priceBook("INR");
    expect(formatMoney(book.monthlyMinor, "INR")).toBe("₹399");
    expect(formatMoney(book.introMonthlyMinor, "INR")).toBe("₹99");
    expect(formatMoney(book.yearlyMinor, "INR")).toBe("₹2,999");
    expect(formatMoney(book.birthdayGiftMinor, "INR")).toBe("₹1,999");
    expect(formatMoney(PRICING.monthlyCents, "USD")).toBe("$4.99");
    expect(book.birthdayGiftMinor).toBe(199900);
  });
});

describe("currency selection", () => {
  it("prefers the test override, then a saved choice, then the country header", () => {
    expect(selectCurrency({ override: "INR", country: "US" })).toEqual({ currency: "INR", source: "override" });
    expect(selectCurrency({ override: "usd", country: "IN" })).toEqual({ currency: "USD", source: "override" });
    expect(selectCurrency({ override: "EUR", country: "IN" })).toEqual({ currency: "INR", source: "country" });
    expect(selectCurrency({ cookie: "USD", country: "IN" })).toEqual({ currency: "USD", source: "cookie" });
    expect(selectCurrency({ country: "in", acceptLanguage: "en-US" })).toEqual({
      currency: "INR",
      source: "country",
    });
    expect(selectCurrency({ country: "US", acceptLanguage: "hi-IN" })).toEqual({
      currency: "USD",
      source: "country",
    });
  });

  it("falls back to Accept-Language, then Asia/Kolkata, then USD", () => {
    expect(selectCurrency({ acceptLanguage: "en-GB,hi;q=0.8" })).toEqual({ currency: "INR", source: "language" });
    expect(selectCurrency({ acceptLanguage: "te-IN,en;q=0.9" })).toEqual({ currency: "INR", source: "language" });
    expect(selectCurrency({ acceptLanguage: "en-US", timezone: "Asia/Kolkata" })).toEqual({
      currency: "INR",
      source: "timezone",
    });
    expect(selectCurrency({ acceptLanguage: "en-US", timezone: "Asia/Calcutta" })).toEqual({
      currency: "INR",
      source: "timezone",
    });
    expect(selectCurrency({ country: "XX", acceptLanguage: "en-IN" })).toEqual({
      currency: "INR",
      source: "language",
    });
    expect(selectCurrency({ acceptLanguage: "en-US", timezone: "America/New_York" })).toEqual({
      currency: "USD",
      source: "default",
    });
  });
});

describe("story access", () => {
  it("allows one free sample, then requires a subscription", () => {
    expect(storyGenerationAccess({ existingStories: 0, subscriptionActive: false })).toEqual({
      allowed: true,
      isSample: true,
    });
    const blocked = storyGenerationAccess({ existingStories: 1, subscriptionActive: false });
    expect(blocked.allowed).toBe(false);
    expect(storyGenerationAccess({ existingStories: 4, subscriptionActive: true }).isSample).toBe(false);
  });

  it("treats an ended period as inactive", () => {
    const past = new Date("2020-01-01");
    expect(isSubscriptionActive({ status: "active", currentPeriodEnd: past }, new Date("2026-01-01"))).toBe(
      false,
    );
    expect(
      isSubscriptionActive({ status: "active", currentPeriodEnd: new Date("2027-01-01") }, new Date("2026-01-01")),
    ).toBe(true);
    expect(isSubscriptionActive({ status: "canceled", currentPeriodEnd: null })).toBe(false);
  });

  it("spaces weekly stories by six days", () => {
    const now = new Date("2026-06-10T00:00:00Z");
    expect(isStoryDue(null, now)).toBe(true);
    expect(isStoryDue(new Date(now.getTime() - STORY_DUE_MS + 1000), now)).toBe(false);
    expect(isStoryDue(new Date(now.getTime() - STORY_DUE_MS), now)).toBe(true);
  });
});

describe("privacy gates", () => {
  it("deletes photos unless the flag is exactly false", () => {
    expect(shouldDeletePhotosAfterGeneration(undefined)).toBe(true);
    expect(shouldDeletePhotosAfterGeneration("true")).toBe(true);
    expect(shouldDeletePhotosAfterGeneration("false")).toBe(false);
  });

  it("requires consent and audio before a recording is stored", () => {
    expect(canSubmitRecording({ consent: false, hasAudio: true })).toBe(false);
    expect(canSubmitRecording({ consent: true, hasAudio: false })).toBe(false);
    expect(canSubmitRecording({ consent: true, hasAudio: true })).toBe(true);
  });

  it("states guardian consent, deletion, and no training", () => {
    const photos = photoConsentStatement();
    expect(photos).toContain(BRAND_NAME);
    expect(photos.toLowerCase()).toContain("parent or legal guardian");
    expect(photos.toLowerCase()).toContain("deleted");
    expect(photos.toLowerCase()).toContain("train");
    expect(voiceConsentStatement().toLowerCase()).toContain("deleted");
  });
});

describe("catalog", () => {
  it("includes the launch languages and free-choice narrators", () => {
    for (const id of ["english", "hindi", "telugu", "kannada", "hinglish", "tenglish", "kanglish"]) {
      expect(languages).toContain(id);
    }
    const relations = RELATIONSHIPS.map((item) => item.id);
    for (const id of ["dadi", "nani", "maushi", "bua", "mama", "chachi", "custom"]) {
      expect(relations).toContain(id);
    }
  });
});

describe("stories and comics", () => {
  it("writes 400–500 words in every launch language", () => {
    for (const language of languages) {
      for (const occasion of ["bedtime", "birthday"] as const) {
        const story = buildMockStory({
          childName: "Aarav",
          ageRange: "4-5",
          language,
          interests: ["elephants", "mangoes"],
          nickname: "raja beta",
          narratorName: "Dadi",
          narratorRelation: "dadi",
          occasion,
        });
        const words = wordCount(story.body);
        expect(words, `${language} ${occasion}`).toBeGreaterThanOrEqual(400);
        expect(words, `${language} ${occasion}`).toBeLessThanOrEqual(500);
        expect(story.body).toContain("Aarav");
      }
    }
  });

  it("keeps a stable cartoon and 8–12 comic panels", () => {
    const input = {
      childName: "Meera",
      ageRange: "2-3",
      language: "english",
      interests: ["rain"],
      nickname: "bangaram",
      narratorName: "Nani",
      narratorRelation: "nani",
    };
    const first = characterFromSeed("Meera|rain|Nani");
    expect(characterFromSeed("Meera|rain|Nani")).toEqual(first);
    expect(first.shirt.startsWith("#")).toBe(true);
    const comic = buildComicScript(input);
    expect(comic.panels.length).toBeGreaterThanOrEqual(8);
    expect(comic.panels.length).toBeLessThanOrEqual(12);
    expect(comic.character).toEqual(first);
    expect(comic.narration).toContain("Meera");
    expect(new Set(comic.panels.map((panel) => panel.pose)).size).toBeGreaterThan(1);
  });

  it("asks a reference model to keep the child's likeness", () => {
    const sheet = characterSheetPrompt("Aarav", 1);
    expect(sheet).toContain("face shape");
    expect(sheet).toContain("skin tone");
    expect(sheet).toContain("hair");
    expect(sheet).toContain("eye shape");
    expect(sheet).toContain("Pixar");
    expect(sheet).toContain("wave");
    const panel = panelPrompt("Aarav", "Dadi lights a tiny lamp");
    expect(panel).toContain("character sheet");
    expect(panel).toContain("same eyes");
    expect(panel).toContain("Dadi lights a tiny lamp");
  });

  it("selects a photo-reference provider and ships a sample page for each panel", () => {
    expect(resolveImageProvider({})).toBe("mock");
    expect(resolveImageProvider({ IMAGE_API_KEY: "sk" })).toBe("openai");
    expect(resolveImageProvider({ IMAGE_API_KEY: "sk", IMAGE_PROVIDER: "replicate" })).toBe("replicate");
    expect(resolveImageProvider({ IMAGE_API_KEY: "sk", IMAGE_API_BASE_URL: "https://fal.run/fal-ai/instantid" })).toBe("fal");
    expect(referenceImageModel({ IMAGE_MODEL: "dall-e-3" })).toBe("gpt-image-1");
    expect(referenceImageModel({ IMAGE_MODEL: "gpt-image-1.5" })).toBe("gpt-image-1.5");
    expect(fs.existsSync(sampleCharacterFile(0))).toBe(true);
    expect(fs.existsSync(sampleCharacterFile(1))).toBe(true);
    for (let index = 1; index <= 10; index += 1) {
      expect(fs.existsSync(samplePanelFile(index)), `panel ${index}`).toBe(true);
    }
  });
});
