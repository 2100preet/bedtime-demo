import fs from "node:fs";
import path from "node:path";
import { BRAND_NAME } from "@/lib/brand";
import { buildMockStory, type StoryInput } from "@/lib/stories/mock-story";
import { wordCount } from "@/lib/text";

function toneNotes() {
  try {
    const dir = path.join(process.cwd(), "content", "samples");
    return fs
      .readdirSync(dir)
      .filter((file) => file.endsWith(".md"))
      .map((file) => fs.readFileSync(path.join(dir, file), "utf8"))
      .join("\n\n");
  } catch {
    return "";
  }
}

function systemPrompt() {
  return `You write bedtime stories for ${BRAND_NAME}. Audience: children aged 2–7 in Indian and diaspora families.
Rules:
- 400 to 500 words.
- Gentle, sensory, sleepy. No villains, monsters, threats, strangers, shame, or violence.
- Use only the child's first name. Do not invent a last name, school, address, birthday, or photo.
- The narrator is a loved one. Explain the relationship simply if it is a grandparent, aunt, or uncle.
- Keep the story culturally Indian: festivals, food, rain, family nicknames, and the feeling of family across distance.
- For English and mixed languages, gloss a few words from the family's language the way the samples do.
- For Hindi, Telugu, or Kannada, write in that language and script.
- End with the child falling asleep and a good-night line.
- Return JSON only: {"title":"...","body":"paragraphs separated by blank lines"}

Tone samples:
${toneNotes()}`;
}

export async function writeStoryText(input: StoryInput) {
  const fallback = () => buildMockStory(input);
  const key = process.env.OPENAI_API_KEY;
  if (!key) return fallback();

  const base = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  try {
    const response = await fetch(`${base.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.8,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt() },
          {
            role: "user",
            content: JSON.stringify({
              childFirstName: input.childName,
              ageRange: input.ageRange,
              language: input.language,
              interests: input.interests,
              nickname: input.nickname,
              narratorName: input.narratorName,
              narratorRelation: input.narratorRelation,
              occasion: input.occasion ?? "bedtime",
              length: "400-500 words",
            }),
          },
        ],
      }),
    });
    if (!response.ok) return fallback();
    const json = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = json.choices?.[0]?.message?.content ?? "";
    const parsed = JSON.parse(raw) as { title?: string; body?: string };
    const body = (parsed.body ?? "").trim();
    const title = (parsed.title ?? "").trim();
    if (!body || !title || wordCount(body) < 250) return fallback();
    return { title, body, provider: "openai" as const };
  } catch {
    return fallback();
  }
}
