import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { prisma } from "../src/lib/db";
import { hashPassword } from "../src/lib/auth";
import { buildMockStory } from "../src/lib/stories/mock-story";
import { synthesizeSpeech, speakToFile } from "../src/lib/providers/voice";
import { generateComic } from "../src/lib/comics/create";
import { audioDir, photoDir } from "../src/lib/paths";
import { voiceConsentStatement } from "../src/lib/privacy";
import { appUrl } from "../src/lib/text";

const EMAIL = "demo@bedtime.test";
const PASSWORD = "bedtime-demo";
const SHARE = "demo-aarav-birthday";

const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: EMAIL } });
  if (existing) {
    await prisma.comicOrder.deleteMany({ where: { userId: existing.id } });
    await prisma.giftPurchase.deleteMany({
      where: { OR: [{ buyerUserId: existing.id }, { redeemedByUserId: existing.id }] },
    });
    await prisma.checkoutSession.deleteMany({ where: { userId: existing.id } });
    await prisma.notification.deleteMany({ where: { userId: existing.id } });
    await prisma.user.delete({ where: { id: existing.id } });
  }
  await prisma.comicOrder.deleteMany({ where: { shareToken: SHARE } });

  const user = await prisma.user.create({
    data: {
      email: EMAIL,
      name: "Asha",
      passwordHash: await hashPassword(PASSWORD),
    },
  });

  const child = await prisma.child.create({
    data: {
      userId: user.id,
      firstName: "Aarav",
      ageRange: "4-5",
      language: "hinglish",
      interests: "elephants, mangoes",
      nickname: "raja beta",
    },
  });

  const narratorId = `seed-dadi-${user.id.slice(0, 8)}`;
  const samplePath = path.join(audioDir("narrators"), `${narratorId}.wav`);
  await speakToFile(
    "Hello, my little one. I am Dadi, and I will tell you a slow story tonight. Shubh ratri.",
    "hinglish",
    samplePath,
  );

  const narrator = await prisma.narrator.create({
    data: {
      userId: user.id,
      childId: child.id,
      relationship: "dadi",
      displayName: "Dadi",
      inviteToken: `seed-invite-${user.id.slice(0, 10)}`,
      language: "hinglish",
      status: "ready",
      consentGiven: true,
      consentStatement: voiceConsentStatement(),
      consentedAt: new Date(),
      audioPath: samplePath,
      voiceId: `mock_${narratorId}`,
      provider: "mock",
    },
  });

  const storyText = buildMockStory({
    childName: child.firstName,
    ageRange: child.ageRange,
    language: child.language,
    interests: ["elephants", "mangoes"],
    nickname: child.nickname,
    narratorName: "Dadi",
    narratorRelation: "dadi",
    occasion: "bedtime",
  });
  const story = await prisma.story.create({
    data: {
      childId: child.id,
      narratorId: narrator.id,
      title: storyText.title,
      body: storyText.body,
      language: child.language,
      provider: "mock",
      isSample: true,
      source: "sample",
      voiceLabel: "Preview voice",
    },
  });
  const audio = await synthesizeSpeech({
    text: storyText.body,
    language: child.language,
    fileBase: path.join(audioDir("stories"), story.id),
    voiceId: narrator.voiceId,
  });
  await prisma.story.update({
    where: { id: story.id },
    data: { audioPath: audio.audioPath, audioMode: audio.audioMode, voiceLabel: audio.voiceLabel },
  });

  const order = await prisma.comicOrder.create({
    data: {
      userId: user.id,
      buyerEmail: EMAIL,
      buyerName: "Asha",
      childFirstName: "Aarav",
      ageRange: "4-5",
      language: "hinglish",
      interests: "elephants, mangoes",
      nickname: "raja beta",
      occasion: "5th birthday",
      narratorChoice: "stock",
      photoConsent: true,
      photoConsentAt: new Date(),
      amountCents: 2900,
      shareToken: SHARE,
      status: "pending_payment",
    },
  });
  const photo = path.join(photoDir(order.id), "0.png");
  fs.writeFileSync(photo, TINY_PNG);
  await prisma.comicOrder.update({
    where: { id: order.id },
    data: { photoPaths: JSON.stringify([photo]) },
  });
  await generateComic(order.id);

  console.log(`Demo parent: ${EMAIL} / ${PASSWORD}`);
  console.log(`Sample story: ${appUrl()}/library/${story.id}`);
  console.log(`Birthday comic: ${appUrl()}/c/${SHARE}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
