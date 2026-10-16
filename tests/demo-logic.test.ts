import { describe, expect, it } from "vitest";
import { chargeLabel, chargeMinor, personalize, pickSample } from "../demo/src/logic";

describe("static demo samples", () => {
  it("fills a child's name into the Hindi sample", () => {
    const sample = pickSample("hindi", "any-child");
    expect(sample.id).toBe("hindi");
    expect(personalize(sample.title, "Aarav", "Dadi")).toBe("Aarav और Dadi का दिया");
    expect(personalize(sample.body, "Aarav", "Dadi")).toContain("Aarav");
    expect(sample.audio).toBe("audio/hindi.wav");
  });

  it("uses a birthday sample only for the comic reading", () => {
    expect(pickSample("birthday", "x").id).toBe("birthday");
    expect(["diwali", "monsoon"]).toContain(pickSample("english", "child-1").id);
    expect(["diwali", "monsoon"]).toContain(pickSample("kanglish", "child-2").id);
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
