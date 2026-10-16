import { describe, expect, it } from "vitest";
import { chargeLabel, chargeMinor, personalize, pickSample, playerLabels } from "../demo/src/logic";

const LANGUAGES = ["english", "hindi", "telugu", "kannada", "hinglish", "tenglish", "kanglish"] as const;

describe("static demo samples", () => {
  it("gives every language its own story, title, and listen label", () => {
    const bodies = new Set<string>();
    for (const language of LANGUAGES) {
      const sample = pickSample(language, "child-1");
      expect(sample.id).toBe(language);
      expect(sample.audio).toBe(`audio/${language}.mp3`);
      const text = personalize(sample.body, "Aarav", "Dadi");
      const words = text.split(/\s+/).filter(Boolean);
      expect(words.length).toBeGreaterThanOrEqual(300);
      expect(words.length).toBeLessThanOrEqual(450);
      expect(text).toContain("Aarav");
      expect(text).toContain("Dadi");
      expect(personalize(sample.title, "Aarav", "Dadi")).toContain("Aarav");
      bodies.add(sample.body);
      expect(playerLabels(language).listen.length).toBeGreaterThan(0);
      expect(playerLabels(language).title.length).toBeGreaterThan(0);
    }
    expect(bodies.size).toBe(LANGUAGES.length);
    expect(playerLabels("hindi").listen).toBe("सुनें");
    expect(playerLabels("telugu").listen).toBe("వినండి");
    expect(playerLabels("kannada").listen).toBe("ಕೇಳಿ");
    expect(playerLabels("english").listen).toBe("Listen");
    expect(playerLabels("hinglish").listen).toBe("Suno");
    expect(playerLabels("tenglish").listen).toBe("Vinandi");
    expect(playerLabels("kanglish").listen).toBe("Keli");
  });

  it("keeps each story in the script of the chosen language", () => {
    expect(pickSample("hindi", "x").body).toMatch(/[\u0900-\u097F]/);
    expect(pickSample("telugu", "x").body).toMatch(/[\u0C00-\u0C7F]/);
    expect(pickSample("kannada", "x").body).toMatch(/[\u0C80-\u0CFF]/);
    expect(pickSample("english", "x").body).not.toMatch(/[\u0900-\u097F\u0C00-\u0C7F\u0C80-\u0CFF]/);
    for (const language of ["hinglish", "tenglish", "kanglish"] as const) {
      expect(pickSample(language, "x").body).not.toMatch(/[\u0900-\u097F\u0C00-\u0C7F\u0C80-\u0CFF]/);
    }
    expect(pickSample("hinglish", "x").body).toMatch(/Raat/);
    expect(pickSample("tenglish", "x").body).toMatch(/nidrapoyaru/);
    expect(pickSample("kanglish", "x").body).toMatch(/nidrege/);
    expect(pickSample("telugu", "x").id).not.toBe(pickSample("english", "x").id);
  });

  it("uses the neural voice for that language", () => {
    expect(pickSample("english", "x").voice).toBe("en-IN-NeerjaNeural");
    expect(pickSample("hindi", "x").voice).toBe("hi-IN-SwaraNeural");
    expect(pickSample("hinglish", "x").voice).toBe("hi-IN-SwaraNeural");
    expect(pickSample("telugu", "x").voice).toBe("te-IN-ShrutiNeural");
    expect(pickSample("tenglish", "x").voice).toBe("te-IN-ShrutiNeural");
    expect(pickSample("kannada", "x").voice).toBe("kn-IN-SapnaNeural");
    expect(pickSample("kanglish", "x").voice).toBe("kn-IN-SapnaNeural");
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
