import { describe, expect, it } from "vitest";
import { chargeLabel, chargeMinor, personalize, pickSample, playerLabels, type StoryFacts } from "../demo/src/logic";
import { transliterateName } from "../demo/src/transliterate";

const LANGUAGES = ["english", "hindi", "telugu", "kannada", "hinglish", "tenglish", "kanglish"] as const;

const FACTS: StoryFacts = {
  child: "Chinnu",
  narrator: "Lakshmi",
  relation: "Nani",
  interests: "paper boats",
  age: "4–5",
  language: "english",
};

describe("static demo samples", () => {
  it("fills the entered child, relation, interests, and age into every language", () => {
    const bodies = new Set<string>();
    for (const language of LANGUAGES) {
      const sample = pickSample(language, "child-1");
      const facts = { ...FACTS, language };
      const text = personalize(sample.body, facts);
      const title = personalize(sample.title, facts);
      const words = sample.body.split(/\s+/).filter(Boolean);
      expect(words.length).toBeGreaterThanOrEqual(300);
      expect(words.length).toBeLessThanOrEqual(450);
      expect(text).toContain(transliterateName("Chinnu", language));
      expect(text).toContain(transliterateName("Lakshmi", language));
      expect(text).toContain(transliterateName("Nani", language));
      expect(text).toContain("paper boats");
      expect(text).toContain("4–5");
      expect(title).toContain(transliterateName("Chinnu", language));
      expect(text).not.toMatch(/Aarav|Meera/);
      expect(title).not.toMatch(/Aarav|Meera/);
      expect(sample.body).not.toMatch(/Aarav|Meera/);
      bodies.add(sample.body);
      expect(playerLabels(language).listen.length).toBeGreaterThan(0);
    }
    expect(bodies.size).toBe(LANGUAGES.length);
  });

  it("writes Chinnu in the script of a native-language story", () => {
    expect(transliterateName("Chinnu", "hindi")).toBe("चिन्नु");
    expect(transliterateName("Chinnu", "telugu")).toBe("చిన్ను");
    expect(transliterateName("Chinnu", "kannada")).toBe("ಚಿನ್ನು");
    expect(transliterateName("Chinnu", "english")).toBe("Chinnu");
    expect(transliterateName("Chinnu", "hinglish")).toBe("Chinnu");
    expect(personalize(pickSample("hindi", "x").body, { ...FACTS, language: "hindi" })).not.toContain("Chinnu");
    expect(personalize(pickSample("kannada", "x").body, { ...FACTS, language: "kannada" })).toContain("ಚಿನ್ನು");
    expect(personalize(pickSample("telugu", "x").body, { ...FACTS, language: "telugu" })).toContain("చిన్ను");
  });

  it("keeps each story in the script of the chosen language", () => {
    expect(pickSample("hindi", "x").body).toMatch(/[\u0900-\u097F]/);
    expect(pickSample("telugu", "x").body).toMatch(/[\u0C00-\u0C7F]/);
    expect(pickSample("kannada", "x").body).toMatch(/[\u0C80-\u0CFF]/);
    expect(pickSample("english", "x").body).not.toMatch(/[\u0900-\u097F\u0C00-\u0C7F\u0C80-\u0CFF]/);
    for (const language of ["hinglish", "tenglish", "kanglish"] as const) {
      expect(pickSample(language, "x").body).not.toMatch(/[\u0900-\u097F\u0C00-\u0C7F\u0C80-\u0CFF]/);
    }
  });

  it("prices practice checkout in dollars and rupees", () => {
    expect(chargeMinor("monthly", "USD", true)).toBe(199);
    expect(chargeLabel("monthly", "USD", true)).toBe("$1.99");
    expect(chargeLabel("monthly", "USD", false)).toBe("$4.99");
    expect(chargeLabel("yearly", "INR", false)).toBe("₹2,999");
    expect(chargeMinor("birthday", "INR", false)).toBe(199900);
    expect(chargeLabel("birthday", "INR", false)).toBe("₹1,999");
  });
});
