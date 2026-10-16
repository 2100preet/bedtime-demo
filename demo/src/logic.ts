import { formatMoney, priceBook, type CurrencyCode } from "../../src/lib/brand";

export type Currency = CurrencyCode;
export type SampleId = "diwali" | "monsoon" | "hindi" | "birthday";

export type Sample = {
  id: SampleId;
  title: string;
  body: string;
  audio: string;
  voice: string;
};

const DIWALI = `It was Diwali night, and the house was glowing.

{child} sat on the rug beside {narrator}, who smelled like cardamom and warm milk. In {narrator}'s hands was a tiny clay lamp. "Dekho," {narrator} said. Look. "This is a diya. Tonight we light lots and lots of diyas, so the whole world feels bright and happy."

"Why do we light them?" {child} asked.

{narrator} smiled. "Long ago, lamps along the path said welcome home. Now every Diwali we light them to say: welcome home, light. Welcome home, love."

They shared one small laddoo. Then {narrator} lit the diya. The flame was gold and sleepy, swaying left, then right. {narrator} tucked the razai up to {child}'s chin.

"When the lamp goes quiet, the light stays in here," {narrator} whispered, tapping {child}'s heart. "Shubh ratri, little one."

And with the diya glowing, {child} floated softly off to sleep.`;

const MONSOON = `Tip, tip, tip. Rain tapped the window.

{child} pressed a nose to the glass. "{narrator}, baarish!" Rain!

{narrator} sat close, shawl soft as a cloud. "When lots of rain comes, we call it the monsoon. The sky shares its water with the trees, the frogs, and little ones named {child}."

A frog said tarr-tarr. Far away, a peacock opened blue-green feathers and danced without shouting.

{narrator} made warm haldi doodh, golden milk with a little honey. {child} sipped, warm all the way to the toes.

"What comes after the rain?" {child} asked.

"A rainbow," {narrator} said, "and then a quiet bed." The razai came up. The rain kept a slow drum on the roof. "Good night. I am right here."`;

const HINDI = `दिवाली की रात थी, और घर रोशनी से भरा था।

{child} दरी पर {narrator} के पास बैठा था। {narrator} के हाथ में एक छोटा मिट्टी का दिया था। "देखो," {narrator} ने कहा, "आज बहुत सारे दिए जलेंगे, ताकि रास्ता घर तक रोशन रहे।"

उन्होंने एक छोटा लड्डू बाँटा। फिर {narrator} ने दिया जलाया। लौ सोने जैसी थी, और धीरे-धीरे झूम रही थी।

{narrator} ने रज़ाई ठुड्डी तक कर दी। "जब दिया शांत हो जाए, रोशनी तुम्हारे दिल में रहती है। शुभ रात्रि, {child}।"

और छोटे दिए की रोशनी में {child} धीरे-धीरे सो गया, सो गई।`;

const BIRTHDAY = `It was {child}'s birthday, and the evening was in no hurry.

{narrator} opened a window dressed with marigolds. "This story is yours," {narrator} said. "Only yours."

They followed a path of paper stars. A quiet elephant made of cloud waited, then bowed. {child} waved back, very small, very proud.

At the table there was one mango slice and one tiny lamp. {narrator} lit it. "Make a wish that fits in a whisper."

{child} did. The flame nodded, left, then right.

{narrator} tucked the razai close. "The birthday light stays in your heart when the lamp goes quiet. Happy birthday. Good night."`;

export const SAMPLES: Sample[] = [
  {
    id: "diwali",
    title: "{child} and {narrator}'s Diwali Diya",
    body: DIWALI,
    audio: "audio/diwali.wav",
    voice: "Preview voice",
  },
  {
    id: "monsoon",
    title: "{child} and {narrator}'s Rainbow Rain",
    body: MONSOON,
    audio: "audio/monsoon.wav",
    voice: "Preview voice",
  },
  {
    id: "hindi",
    title: "{child} और {narrator} का दिया",
    body: HINDI,
    audio: "audio/hindi.wav",
    voice: "Preview voice",
  },
  {
    id: "birthday",
    title: "{child}'s birthday lamp",
    body: BIRTHDAY,
    audio: "audio/birthday.wav",
    voice: "Preview voice",
  },
];

export function personalize(template: string, child: string, narrator: string) {
  return template.replaceAll("{child}", child).replaceAll("{narrator}", narrator);
}

function hash(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function pickSample(language: string, salt: string): Sample {
  if (language === "birthday") return SAMPLES.find((item) => item.id === "birthday")!;
  if (language === "hindi") return SAMPLES.find((item) => item.id === "hindi")!;
  const pool = SAMPLES.filter((item) => item.id === "diwali" || item.id === "monsoon");
  return pool[hash(salt) % pool.length];
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
