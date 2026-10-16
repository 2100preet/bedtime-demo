import { relationshipBlurb } from "@/lib/catalog";
import { hashString, interestPhrase, wordCount } from "@/lib/text";

export type Occasion = "bedtime" | "birthday";

export type StoryInput = {
  childName: string;
  ageRange: string;
  language: string;
  interests: string[];
  nickname: string;
  narratorName: string;
  narratorRelation: string;
  occasion?: Occasion;
};

type FestivalId = "diwali" | "holi" | "monsoon" | "rakhi" | "sankranti";

const FESTIVALS: FestivalId[] = ["diwali", "holi", "monsoon", "rakhi", "sankranti"];

type Ctx = {
  child: string;
  narrator: string;
  relation: string;
  blurb: string;
  nickname: string;
  interest: string;
  festivalId: FestivalId;
  occasion: Occasion;
  ageRange: string;
};

type Draft = {
  title: string;
  core: string[];
  extras: string[];
  closing: string;
};

const NICKNAMES: Record<string, string> = {
  english: "little one",
  hinglish: "mera baccha",
  hindi: "मेरे बच्चे",
  telugu: "బంగారం",
  kannada: "ಕಂದಾ",
  tenglish: "bangaram",
  kanglish: "kanda",
};

function ageLine(age: string, child: string) {
  if (age === "2-3") return `${child} is still little enough to be carried to the window.`;
  if (age === "6-7") return `${child} is full of careful questions, and still glad to be tucked in.`;
  return `${child} is old enough to ask why, and small enough to be tucked in.`;
}

function fitStory(core: string[], extras: string[], closing: string) {
  const min = 400;
  const max = 500;
  const body = [...core];
  let added = 0;
  const count = () => wordCount([...body, closing].join("\n\n"));

  while (count() < min && added < extras.length) {
    body.push(extras[added]);
    added += 1;
  }

  while (count() > max && added > 0) {
    body.pop();
    added -= 1;
  }

  let guard = 0;
  while (count() > max && guard < 20) {
    guard += 1;
    let idx = 0;
    let longest = 0;
    body.forEach((paragraph, index) => {
      const words = wordCount(paragraph);
      if (words > longest) {
        longest = words;
        idx = index;
      }
    });
    const sentences = body[idx].split(/(?<=[.!?।])\s+/);
    if (sentences.length < 2) break;
    const snapshot = body[idx];
    sentences.pop();
    body[idx] = sentences.join(" ");
    if (count() < min) {
      body[idx] = snapshot;
      break;
    }
  }

  let loop = 0;
  while (count() < min && extras.length > 0 && loop < 6) {
    body.splice(body.length, 0, extras[loop % extras.length]);
    loop += 1;
    if (count() > max) {
      body.pop();
      break;
    }
  }

  return [...body, closing].join("\n\n").trim();
}

type Gloss = {
  look: string;
  exactly: string;
  yes: string;
  lamp: string;
  sweet: string;
  milk: string;
  blanket: string;
  peacock: string;
  rain: string;
  goodnight: string;
  reply: string;
  festival: Record<FestivalId, string>;
  tale: Record<FestivalId, string>;
};

const ENGLISH_TALES: Record<FestivalId, string> = {
  diwali:
    "Long, long ago, Lord Ram came home after a very long journey. Everyone was so happy that they lit little lamps along the path, so he could find his way in the dark. Now every Diwali, families light a diya to say: welcome home, light. Welcome home, love.",
  holi:
    "Holi is the festival of colours. In spring, people toss soft coloured powder called gulaal, pink and green and yellow and blue. Everybody laughs, hugs, and says Holi hai. For one gentle day, everybody is the same rainbow, all friends.",
  monsoon:
    "When lots and lots of rain comes to India, families call it the monsoon. The sky shares its water with the trees, the frogs, and the peacock, who opens blue-green feathers and dances without needing anyone to clap. The drops go tip, tip, tip, like a lullaby.",
  rakhi:
    "Raksha Bandhan is a day for brothers and sisters, and for anyone who promises to look after you. A soft thread is tied on a wrist, sweets are shared, and love is allowed to stretch across any number of miles, even an ocean.",
  sankranti:
    "Around Makar Sankranti and Pongal, the sun begins a new path. Families cook a warm sweet dish, fly paper kites, and look up to say thank you. The kites tug softly, as if they want a closer look at the clouds, then come home again.",
};

function latinDraft(c: Ctx, g: Gloss): Draft {
  const festival = g.festival[c.festivalId];
  const birthday = c.occasion === "birthday";
  const opening = birthday
    ? `It was the morning of ${c.child}'s birthday, and the house already smelled like cardamom and warm milk.`
    : `It was a ${festival} evening, and the house felt soft and golden.`;
  const title = birthday
    ? `${c.child} and ${c.narrator}'s Birthday ${festival}`
    : `${c.child} and ${c.narrator}'s ${festival} Night`;

  const core = [
    `${opening} ${c.child} sat close to ${c.narrator}. ${c.narrator} is ${c.blurb}, and the evening did not need to be loud to be special. ${ageLine(c.ageRange, c.child)} So ${c.narrator} made the big world small and safe: one rug, two calm voices, and a story that refused to hurry.`,
    `"${g.look}, ${c.child}," said ${c.narrator}, holding a tiny clay lamp. "This is a ${g.lamp}. Tonight we let a little flame be brave, so the dark knows it may rest." ${c.child} touched the lamp very gently. It was smooth and round, like a tiny boat. "Why do we light it, ${c.narrator}?" ${g.tale[c.festivalId]} ${c.child} thought of the hallway light that stays on at bedtime. "${g.exactly}," said ${c.narrator}. "Just like that."`,
    `Together they went to the window. Strings of lights twinkled like stars that had agreed to sit on the balconies for a while. In ${c.child}'s mind a rangoli waited on a doorstep, a flower drawn in pink and yellow and blue powder. Even if home in India was many skies away, the colours still knew their names. A frog somewhere said a tiny hello. The ${g.rain} on the memory of the roof went tip, tip, tip.`,
    `${c.child} loves ${c.interest}. ${c.narrator} let that love walk softly into the story: something familiar and kind came close enough to be noticed, blinked a slow hello, and settled down. Nothing jumped. Nothing roared. The favourite thing was only there to keep ${c.child} company until sleep arrived, the way a trusted toy sits at the edge of the bed.`,
    `${c.narrator} brought one small ${g.sweet}, round and golden, and a cup of ${g.milk}. "One sweet for you," ${c.narrator} whispered, "and one crumb for the moon." ${c.child} giggled, and the giggle made the room feel even kinder. Then the house grew quiet. A fan hummed its slow evening song. Far away, the kitchen had already finished its work.`,
  ];

  const extras = [
    `${c.narrator} hummed a little, not a performance, just the tune that lives in a family. The ${g.peacock} in the story folded those famous feathers and tucked a head under a wing. Even grand birds know when a story is trying to end softly. ${c.child} watched the picture fade, and did not mind.`,
    `A firework, very far from this room, turned into a flower in the sky and then politely disappeared. ${c.narrator} said the loud part was over. What remained was the small gold flame, swaying left and right, left and right, until ${c.child}'s eyes felt heavy in the nicest way.`,
    `They spoke the family nickname the way only this house says it. "${c.nickname}," murmured ${c.narrator}, and the word fit like a well-worn shawl. No one else needed to understand it. It was a private gate into the story, and it opened only from the inside.`,
  ];

  const closing = birthday
    ? `${c.narrator} drew the ${g.blanket} up to ${c.child}'s chin and tapped a small heart, once, twice. "Happy birthday, ${c.nickname}. The wish can be quiet. You already have a lap, a lamp, and someone who knows your name." ${c.child} put a hand where the tap had been. It felt warm. "Happy birthday, ${c.narrator}," came the sleepy reply. Outside, the stars lit themselves one by one. "${g.goodnight}, ${c.child}," ${c.narrator} whispered. "${g.reply}," ${c.child} murmured, and floated softly, slowly, sweetly off to sleep.`
    : `Outside, the stars came out one by one, as if the sky was lighting its own lamps. ${c.narrator} drew the ${g.blanket} up to ${c.child}'s chin and tapped a small heart, once, twice. "Wherever you go, ${c.nickname}, you carry this light. Even across the sea." ${c.child} put a hand where the tap had been. It felt warm, like the little ${g.lamp}. "${g.goodnight}, ${c.child}," ${c.narrator} whispered. "${g.reply}, ${c.narrator}," ${c.child} murmured, and floated softly, slowly, sweetly off to sleep.`;

  return { title, core, extras, closing };
}

function english(c: Ctx) {
  return latinDraft(c, {
    look: "Look",
    exactly: "Exactly",
    yes: "Yes",
    lamp: "diya",
    sweet: "laddoo",
    milk: "warm haldi doodh, golden milk with a little honey",
    blanket: "razai, a cosy blanket",
    peacock: "peacock",
    rain: "rain",
    goodnight: "Good night",
    reply: "Good night",
    festival: {
      diwali: "Diwali",
      holi: "Holi",
      monsoon: "monsoon",
      rakhi: "Raksha Bandhan",
      sankranti: "Sankranti",
    },
    tale: ENGLISH_TALES,
  });
}

function hinglish(c: Ctx) {
  return latinDraft(c, {
    look: "Dekho. Look",
    exactly: "Bilkul. Exactly",
    yes: "Haan",
    lamp: "diya",
    sweet: "laddoo",
    milk: "haldi doodh, warm golden milk",
    blanket: "razai, a cosy blanket",
    peacock: "mor, the peacock",
    rain: "baarish",
    goodnight: "Shubh ratri. Good night",
    reply: "Shubh ratri",
    festival: {
      diwali: "Diwali",
      holi: "Holi",
      monsoon: "monsoon",
      rakhi: "Rakhi",
      sankranti: "Sankranti",
    },
    tale: {
      diwali:
        "Long, long ago, Lord Ram came home after a very long journey. Everyone was so khush, so happy, that they lit diyas all along the path, so he could find his way in the dark. Now every Diwali we light a diya to say: welcome home, light. Welcome home, love.",
      holi:
        "Holi is the festival of colours. In spring, everyone throws soft gulaal, coloured powder, pink and green and yellow and blue. Everybody laughs and hugs and says Holi hai. For one day, everybody is the same rainbow, all friends.",
      monsoon:
        "When lots and lots of baarish comes, we call it the monsoon. The sky shares water with the trees, the frogs, and the mor, the peacock, who opens blue-green feathers and dances. The rain goes tip, tip, tip, like a lori on the roof.",
      rakhi:
        `Raksha Bandhan is the day a rakhi thread is tied on a wrist, a soft promise that someone will look after you. Then there are sweets, and ${c.narrator} says the love is big enough to cross the sea between India and wherever this bed is tonight.`,
      sankranti:
        "At Sankranti and Pongal time, families cook a warm sweet and fly kites. The kites tug like they want to greet the sun. We look up and say thank you, then come back to the rug, because the sky can wait until morning.",
    },
  });
}

function tenglish(c: Ctx) {
  return latinDraft(c, {
    look: "Choodu. Look",
    exactly: "Avunu. Exactly",
    yes: "Avunu",
    lamp: "deepam",
    sweet: "laddu",
    milk: "pasupu paalu, warm turmeric milk",
    blanket: "soft kambal",
    peacock: "nemali, the peacock",
    rain: "varsham",
    goodnight: "Shubha ratri. Good night",
    reply: "Shubha ratri",
    festival: {
      diwali: "Deepavali",
      holi: "Holi",
      monsoon: "monsoon",
      rakhi: "Rakhi",
      sankranti: "Sankranti",
    },
    tale: {
      diwali:
        "Long ago, people lit rows of deepalu so a beloved traveller could find the path home. That is Deepavali. A little clay deepam still says the same thing: welcome home, light. Welcome home, love. Avunu, just like a hallway lamp left on.",
      holi:
        "Holi is the festival of colours. Soft gulaal, pink and green and yellow, flies like flower dust. People laugh and say Holi hai. In Telugu homes the sweets are plenty, and nobody has to be the same as anybody else to belong in the circle.",
      monsoon:
        "When the varsham comes and stays, the nemali, the peacock, opens every feather and dances. Frogs sing tarr-tarr. The sky is simply sharing. Tip, tip, tip on the window is not a reason to worry. It is the night keeping time.",
      rakhi:
        `On Rakhi, a thread on the wrist means I am with you, even if the plane ride is long. Sweets follow the promise. ${c.narrator} says love is very good at crossing time zones without losing its sweetness.`,
      sankranti:
        "Sankranti is when the sun takes a new road and kitchens stir a warm pot of sweet pongal. Kites dot the sky. Then everyone comes inside, because even the sun knows the evening is for blankets and small stories.",
    },
  });
}

function kanglish(c: Ctx) {
  return latinDraft(c, {
    look: "Nodu. Look",
    exactly: "Haudu. Exactly",
    yes: "Haudu",
    lamp: "deepa",
    sweet: "laddu",
    milk: "arishina haalu, warm turmeric milk",
    blanket: "soft kambali",
    peacock: "navilu, the peacock",
    rain: "male",
    goodnight: "Shubha ratri. Good night",
    reply: "Shubha ratri",
    festival: {
      diwali: "Deepavali",
      holi: "Holi",
      monsoon: "monsoon",
      rakhi: "Rakhi",
      sankranti: "Sankranti",
    },
    tale: {
      diwali:
        "Long ago, rows of deepagalu showed a traveller the way home. That memory became Deepavali. A small clay deepa still says welcome home, light, welcome home, love. Haudu. It is the same kindness as a lamp left on in the hall.",
      holi:
        "Holi brings colour, soft and silly and sweet. Pink, green, yellow, a little on the nose, mostly in the air. People laugh until they are the same rainbow. Then someone warms the milk, because colour is fun and bedtime is quiet.",
      monsoon:
        "When the male, the rain, settles in, the navilu opens blue-green feathers and dances. The frogs agree. Tip, tip, tip is the roof telling a kanda that the world is being watered, and the bed can stay dry and warm.",
      rakhi:
        `Rakhi is a thread and a promise. Someone ties it, someone shares a laddu, and the promise works even from another country. ${c.narrator} says a wrist can remember a hug for a whole year, gently, without pinching.`,
      sankranti:
        "At Sankranti, kites test the wind and kitchens stir ellu-bella and sweet pongal. The sun is greeted, then the kites come down. Evening is for the kambali and a story that lands more softly than any kite.",
    },
  });
}

const HINDI_BLURB: Record<string, string> = {
  dadi: "पापा की माँ",
  dada: "पापा के पापा",
  nani: "मम्मी की माँ",
  nana: "मम्मी के पापा",
  maushi: "मम्मी की बहन",
  masi: "मम्मी की बहन",
  bua: "पापा की बहन",
  mama: "मम्मी के भाई",
  chachi: "चाचा की पत्नी",
  chacha: "पापा के भाई",
  kaka: "पापा के भाई",
  mummy: "तुम्हारी मम्मी",
  papa: "तुम्हारे पापा",
  sibling: "घर के अपने",
  friend: "परिवार के प्यारे दोस्त",
  custom: "तुमसे बहुत प्यार करने वाले",
};

const TELUGU_BLURB: Record<string, string> = {
  dadi: "నాన్న గారి అమ్మ",
  dada: "నాన్న గారి నాన్న",
  nani: "అమ్మ గారి అమ్మ",
  nana: "అమ్మ గారి నాన్న",
  maushi: "అమ్మ గారి చెల్లెలు",
  masi: "అమ్మ గారి చెల్లెలు",
  bua: "నాన్న గారి చెల్లెలు",
  mama: "అమ్మ గారి అన్న",
  chachi: "చిన్నాన్న గారి భార్య",
  chacha: "నాన్న గారి తమ్ముడు",
  kaka: "నాన్న గారి తమ్ముడు",
  mummy: "నీ అమ్మ",
  papa: "నీ నాన్న",
  sibling: "ఇంట్లోని వారు",
  friend: "ఇంటి స్నేహితులు",
  custom: "నిన్ను చాలా ప్రేమించే వారు",
};

const KANNADA_BLURB: Record<string, string> = {
  dadi: "ಅಪ್ಪನ ಅಮ್ಮ",
  dada: "ಅಪ್ಪನ ಅಪ್ಪ",
  nani: "ಅಮ್ಮನ ಅಮ್ಮ",
  nana: "ಅಮ್ಮನ ಅಪ್ಪ",
  maushi: "ಅಮ್ಮನ ತಂಗಿ",
  masi: "ಅಮ್ಮನ ತಂಗಿ",
  bua: "ಅಪ್ಪನ ತಂಗಿ",
  mama: "ಅಮ್ಮನ ಅಣ್ಣ",
  chachi: "ಚಿಕ್ಕಪ್ಪನ ಪತ್ನಿ",
  chacha: "ಅಪ್ಪನ ತಮ್ಮ",
  kaka: "ಅಪ್ಪನ ತಮ್ಮ",
  mummy: "ನಿನ್ನ ಅಮ್ಮ",
  papa: "ನಿನ್ನ ಅಪ್ಪ",
  sibling: "ಮನೆಯವರು",
  friend: "ಮನೆಯ ಸ್ನೇಹಿತರು",
  custom: "ನಿನ್ನನ್ನು ತುಂಬಾ ಪ್ರೀತಿಸುವವರು",
};

function localBlurb(relation: string, map: Record<string, string>, fallback: string) {
  return map[relation] ?? fallback;
}

function hindi(c: Ctx): Draft {
  const festival: Record<FestivalId, string> = {
    diwali: "दिवाली",
    holi: "होली",
    monsoon: "मानसून",
    rakhi: "रक्षा बंधन",
    sankranti: "संक्रांति",
  };
  const tale: Record<FestivalId, string> = {
    diwali:
      "बहुत पुरानी बात है, राम घर लौटे, और लोगों ने रास्ते में दिए जलाए ताकि अँधेरा भी रास्ता दिखा सके। इसलिए दिवाली पर हम छोटा सा दिया जलाते हैं। उसका मतलब है, घर आओ रोशनी, घर आओ प्यार।",
    holi:
      "होली रंगों का दिन है। गुलाल हल्का होता है, गुलाबी, हरा, पीला, नीला। सब हँसते हैं, गले मिलते हैं, और कहते हैं होली है। एक दिन के लिए सब इंद्रधनुष हो जाते हैं, सब दोस्त।",
    monsoon:
      "जब बहुत बारिश आती है, उसे मानसून कहते हैं। आसमान अपना पानी पेड़ों को, मेंढकों को, और मोर को बाँटता है। मोर पंख खोलता है, पर चिल्लाता नहीं। टिप, टिप, टिप, छत लोरी गाती है।",
    rakhi:
      "रक्षा बंधन पर कलाइयों पर राखी बँधती है। इसका मतलब है, मैं तुम्हारे साथ हूँ। मीठा बाँटा जाता है। प्यार समंदर के उस पार भी पहुँच जाता है, बिना थके।",
    sankranti:
      "संक्रांति और पोंगल के आसपास सूरज नया रास्ता लेता है। घर में गर्म मीठा बनता है, पतंगें उड़ती हैं, और शाम को सब फिर चटाई पर आ जाते हैं। आसमान सुबह तक इंतज़ार कर सकता है।",
  };
  const name = festival[c.festivalId];
  const birthday = c.occasion === "birthday";
  const title = birthday
    ? `${c.child} और ${c.narrator} का जन्मदिन`
    : `${c.child} और ${c.narrator} की ${name} कहानी`;
  const opening = birthday
    ? `आज ${c.child} का जन्मदिन था, और घर में इलायची और गर्म दूध की खुशबू थी।`
    : `आज ${name} की शाम थी, और घर सोने जैसी रोशनी से नरम लग रहा था।`;

  const core = [
    `${opening} ${c.child} के लिए जगह ${c.narrator} की गोद के बिल्कुल करीब थी, सुरक्षित। ${c.narrator} घर के अपने इंसान हैं, ${localBlurb(c.relation, HINDI_BLURB, "प्यार करने वाले")}। कहानी को जल्दी नहीं थी। रात को धीरे चलने दिया गया, जैसे पंखा धीरे धीरे गुनगुनाता है।`,
    `${c.narrator} ने एक छोटा मिट्टी का दिया हथेली पर रखा। "देखो, ${c.child}। यह दिया है। आज इसकी छोटी लौ बहादुर है, ताकि अँधेरा आराम कर सके।" ${c.child} की उँगलियाँ दिए को बहुत हल्के से छू गईं। दिया गोल था, एक छोटी नाव जैसा। "हम इसे क्यों जलाते हैं?" ${tale[c.festivalId]} ${c.child} को गलियारे वाली रोशनी याद आ गई, जो सोते समय जलती रहती है। ${c.narrator} ने कहा, "बिल्कुल वैसे ही।"`,
    `दोनों खिड़की के पास गए। बाहर रोशनी के तार ऐसे टिमटिमा रहे थे जैसे तारे थोड़ी देर छज्जों पर बैठ गए हों। ${c.child} की कल्पना में दरवाज़े पर रंगोली थी, गुलाबी, पीली, नीली। भारत का घर चाहे कितने आसमान दूर हो, रंग अपने नाम नहीं भूलते। कहीं एक मेंढक ने छोटा सा नमस्ते किया। छत की याद में बारिश बोली, टिप, टिप, टिप।`,
    `${c.child} को ${c.interest} बहुत पसंद है। ${c.narrator} ने उस प्यार को कहानी में धीरे से आने दिया। कोई शोर नहीं था, कोई डर नहीं था। जो चीज़ ${c.child} को भाती है, वह पल भर के लिए पास आकर चुपचाप बैठ गई, जैसे बिस्तर के कोने पर कोई जाना पहचाना खिलौना बैठता है, और सोने तक साथ देता है।`,
    `${c.narrator} एक छोटा लड्डू लाए, गोल और सुनहरा, और एक प्याला हल्दी दूध। "एक तुम्हारे लिए," धीमी आवाज़ में कहा, "और एक टुकड़ा चाँद के लिए।" ${c.child} की हँसी निकली, और कमरा और भी दयालु लगने लगा। फिर घर शांत हो गया। रसोई अपना काम खत्म कर चुकी थी। बस पंखे की धीमी आवाज़ बची थी।`,
  ];
  const extras = [
    `${c.narrator} ने कोई बड़ा गाना नहीं गाया, बस वही धुन जो परिवार में रहती है। कहानी का मोर अपने पंख समेट कर सिर छुपा लेता है। बड़े पक्षी भी जानते हैं कि लोरी के समय शांत रहना होता है। ${c.child} को यह बात अच्छी लगी।`,
    `बहुत दूर कहीं एक आतिशबाज़ी आसमान में फूल बनकर विनम्रता से गायब हो गई। ${c.narrator} ने कहा, तेज़ आवाज़ खत्म हो गई। अब बस छोटी सुनहरी लौ बची है, बाएँ, दाएँ, बाएँ, दाएँ। ${c.child} की पलकें मीठी मीठी भारी होने लगीं।`,
    `घर वाला नाम धीरे से लिया गया। "${c.nickname}," ${c.narrator} ने कहा। वह शब्द एक पुरानी शाल जैसा फिट हुआ। उसे दुनिया को समझाने की ज़रूरत नहीं। वह कहानी का निजी दरवाज़ा है।`,
  ];
  const closing = birthday
    ? `${c.narrator} ने रज़ाई ${c.child} की ठुड्डी तक की, और सीने पर धीमे से दो बार हाथ रखा। "जन्मदिन मुबारक, ${c.nickname}। दुआ शांत भी हो सकती है। गोद है, दिया है, और कोई है जो तुम्हारा नाम जानता है।" ${c.child} का हाथ उसी जगह रहा। गर्माहट थी। बाहर तारे एक एक कर जलने लगे। "शुभ रात्रि, ${c.child}।" नींद धीरे, बहुत धीरे, मीठे तरीके से आ गई।`
    : `बाहर तारे एक एक कर आए, जैसे आसमान अपने दिए जला रहा हो। ${c.narrator} ने रज़ाई ${c.child} की ठुड्डी तक की, और सीने पर धीमे से दो बार हाथ रखा। "जहाँ भी जाओ, ${c.nickname}, यह रोशनी साथ रहेगी। समंदर के पार भी।" हाथ को गर्मी लगी, छोटे दिए जैसी। "शुभ रात्रि, ${c.child}।" और ${c.child} धीरे, बहुत धीरे, मीठे सपने की तरफ तैर गए।`;
  return { title, core, extras, closing };
}

function telugu(c: Ctx): Draft {
  const festival: Record<FestivalId, string> = {
    diwali: "దీపావళి",
    holi: "హోళీ",
    monsoon: "వర్షాకాలం",
    rakhi: "రాఖీ",
    sankranti: "సంక్రాంతి",
  };
  const tale: Record<FestivalId, string> = {
    diwali:
      "చాలా కాలం క్రితం ఇంటికి వచ్చే దారిలో చిన్న దీపాలు వెలిగించారు, చీకటికి కూడా దారి తెలిసేలా। అందుకే దీపావళి। చిన్న మట్టి దీపం ఇప్పటికీ అంటుంది: ఇంటికి రా వెలుగు, ఇంటికి రా ప్రేమ।",
    holi:
      "హోళీ రంగుల పండుగ। గులాల్ మెత్తగా ఉంటుంది, గులాబి, ఆకుపచ్చ, పసుపు, నీలం। అందరూ నవ్వుతారు, కౌగిలించుకుంటారు, హోళీ హై అంటారు। ఒక్క రోజు అందరూ ఒకే ఇంద్రధనుస్సు, అందరూ స్నేహితులు।",
    monsoon:
      "చాలా వర్షం వస్తే దాన్ని వర్షాకాలం అంటారు। ఆకాశం నీళ్లను చెట్లకు, కప్పలకు, నెమలికి పంచుతుంది। నెమలి ఈకలు విప్పుతుంది, కానీ అరవదు। టిప్, టిప్, టిప్, కప్పు లాలిపాట పాడుతుంది।",
    rakhi:
      "రాఖీ రోజు మణికట్టుకు దారం కడతారు। అర్థం: నేను నీతో ఉన్నాను। తీపి పంచుకుంటారు। ప్రేమ సముద్రం దాటి కూడా అలసిపోకుండా వస్తుంది।",
    sankranti:
      "సంక్రాంతి వచ్చే సమయంలో సూర్యుడు కొత్త దారి తీసుకుంటాడు। ఇంట్లో వెచ్చని తీపి ఉడుకుతుంది, గాలిపటాలు ఎగురుతాయి, సాయంత్రం అందరూ మళ్లీ చాప దగ్గరికి వస్తారు। ఆకాశం ఉదయం దాకా వేచి ఉండగలదు।",
  };
  const name = festival[c.festivalId];
  const birthday = c.occasion === "birthday";
  const title = birthday
    ? `${c.child} మరియు ${c.narrator} పుట్టినరోజు`
    : `${c.child} మరియు ${c.narrator} యొక్క ${name} కథ`;
  const opening = birthday
    ? `ఈ రోజు ${c.child} పుట్టినరోజు, ఇంట్లో యాలకులు మరియు వెచ్చని పాల సువాసన ఉంది।`
    : `ఈ రోజు ${name} సాయంత్రం, ఇల్లు బంగారు వెలుగులా మెత్తగా ఉంది।`;
  const core = [
    `${opening} ${c.child} ${c.narrator} దగ్గరే ఉన్నారు, ఒడిలో భద్రంగా। ${c.narrator} ఇంటి వారు, ${localBlurb(c.relation, TELUGU_BLURB, "ప్రేమించే వారు")}। కథకు తొందర లేదు। రాత్రి నెమ్మదిగా నడవనిచ్చారు, ఫ్యాన్ మెల్లగా పాడినట్టు।`,
    `${c.narrator} అరచేతిలో ఒక చిన్న మట్టి దీపం పెట్టారు। "చూడు, ${c.child}। ఇది దీపం। ఈ చిన్న మంట ధైర్యంగా ఉంటుంది, చీకటి విశ్రాంతి తీసుకునేలా।" ${c.child} వేళ్లు దీపాన్ని చాలా మెత్తగా తాకాయి। దీపం గుండ్రంగా, చిన్న పడవలా ఉంది। "దీన్ని ఎందుకు వెలిగిస్తాం?" ${tale[c.festivalId]} నిద్రపోయే ముందు వాకిల్లో వెలుగు వదిలేది ${c.child}కి గుర్తొచ్చింది। ${c.narrator} అన్నారు, "అదే లా।"`,
    `ఇద్దరూ కిటికీ దగ్గరికి వెళ్లారు। బయట లైట్ల తీగలు చుక్కల్లా మెరిశాయి, కాసేపు బాల్కనీల మీద కూర్చున్నట్టు। ${c.child} ఊహలో గుమ్మం మీద రంగోలీ ఉంది, గులాబి, పసుపు, నీలం। భారత్ ఇల్లు ఎన్ని ఆకాశాల దూరమైనా రంగులకు పేర్లు మర్చిపోవు। ఎక్కడో కప్ప చిన్న నమస్తే చెప్పింది। కప్పు జ్ఞాపకంలో వాన అంది, టిప్, టిప్, టిప్।`,
    `${c.child}కి ${c.interest} అంటే చాలా ఇష్టం। ${c.narrator} ఆ ప్రేమను కథలో మెల్లగా రానిచ్చారు। శబ్దం లేదు, భయం లేదు। ${c.child}కి నచ్చిన విషయం కాసేపు దగ్గరకు వచ్చి నిశ్శబ్దంగా కూర్చుంది, మంచం అంచున ఉండే పరిచయమైన బొమ్మలా, నిద్ర వచ్చే దాకా తోడుగా।`,
    `${c.narrator} ఒక చిన్న లడ్డూ తెచ్చారు, గుండ్రంగా బంగారంలా, మరియు పసుపు పాల గ్లాసు। "ఒకటి నీకు," మెల్లగా అన్నారు, "ఒక ముక్క చంద్రుడికి।" ${c.child}కి నవ్వు వచ్చింది, గది ఇంకా దయగా అనిపించింది। ఇల్లు నిశ్శబ్దమైంది। వంటగది పని అయిపోయింది। ఫ్యాన్ మెల్లని పాట మాత్రమే మిగిలింది।`,
  ];
  const extras = [
    `${c.narrator} పెద్ద పాట పాడలేదు, ఇంట్లో ఉండే ఆ బాణీ మాత్రమే। కథలోని నెమలి ఈకలు ముడుచుకుని తల దాచుకుంది। పెద్ద పక్షులకు కూడా లాలిపాట సమయం తెలుసు। ${c.child}కి ఇది నచ్చింది।`,
    `చాలా దూరంలో ఒక టపాసు ఆకాశంలో పూలా మారి మర్యాదగా మాయమైంది। ${c.narrator} అన్నారు, పెద్ద శబ్దం అయిపోయింది। ఇప్పుడు చిన్న బంగారు మంట మాత్రమే, ఎడమ, కుడి, ఎడమ, కుడి। ${c.child} కళ్ళు తియ్యగా బరువెక్కాయి।`,
    `ఇంటి ముద్దు పేరు మెల్లగా పిలిచారు। "${c.nickname}," అని ${c.narrator} అన్నారు। ఆ మాట పాత శాలువాలా సరిపోయింది। దాన్ని ప్రపంచానికి వివరించనవసరం లేదు। అది కథ యొక్క సొంత తలుపు।`,
  ];
  const closing = birthday
    ? `${c.narrator} దుప్పటిని ${c.child} గడ్డం దాకా లాగారు, గుండె మీద మెల్లగా రెండుసార్లు చెయ్యి పెట్టారు। "పుట్టినరోజు శుభాకాంక్షలు, ${c.nickname}। కోరిక నిశ్శబ్దంగా ఉండొచ్చు। ఒడి ఉంది, దీపం ఉంది, నీ పేరు తెలిసిన వారు ఉన్నారు।" చెయ్యి అక్కడే ఉంది। వెచ్చదనం ఉంది। బయట చుక్కలు ఒక్కొక్కటిగా వెలిగాయి। "శుభరాత్రి, ${c.child}।" నిద్ర మెల్లగా, చాలా మెల్లగా, తియ్యగా వచ్చేసింది।`
    : `బయట చుక్కలు ఒక్కొక్కటిగా వచ్చాయి, ఆకాశం తన దీపాలు వెలిగించినట్టు। ${c.narrator} దుప్పటిని ${c.child} గడ్డం దాకా లాగారు, గుండె మీద మెల్లగా రెండుసార్లు చెయ్యి పెట్టారు। "ఎక్కడికి వెళ్లినా, ${c.nickname}, ఈ వెలుగు తోడుంటుంది। సముద్రం అవతల కూడా।" చేతికి చిన్న దీపంలా వెచ్చదనం అనిపించింది। "శుభరాత్రి, ${c.child}।" ${c.child} మెల్లగా, చాలా మెల్లగా, తియ్యని కల వైపు తేలిపోయారు।`;
  return { title, core, extras, closing };
}

function kannada(c: Ctx): Draft {
  const festival: Record<FestivalId, string> = {
    diwali: "ದೀಪಾವಳಿ",
    holi: "ಹೋಳಿ",
    monsoon: "ಮುಂಗಾರು",
    rakhi: "ರಾಖಿ",
    sankranti: "ಸಂಕ್ರಾಂತಿ",
  };
  const tale: Record<FestivalId, string> = {
    diwali:
      "ಬಹಳ ಹಿಂದೆ ಮನೆಗೆ ಬರುವ ದಾರಿಯಲ್ಲಿ ಸಣ್ಣ ದೀಪಗಳನ್ನು ಹಚ್ಚಿದರು, ಕತ್ತಲಿಗೂ ದಾರಿ ತಿಳಿಯಲಿ ಅಂತ. ಅದಕ್ಕೆ ದೀಪಾವಳಿ. ಚಿಕ್ಕ ಮಣ್ಣಿನ ದೀಪ ಇಂದಿಗೂ ಹೇಳುತ್ತದೆ: ಮನೆಗೆ ಬಾ ಬೆಳಕು, ಮನೆಗೆ ಬಾ ಪ್ರೀತಿ.",
    holi:
      "ಹೋಳಿ ಬಣ್ಣಗಳ ಹಬ್ಬ. ಗುಲಾಲ್ ಮೃದು, ಗುಲಾಬಿ, ಹಸಿರು, ಹಳದಿ, ನೀಲಿ. ಎಲ್ಲರೂ ನಗುತ್ತಾರೆ, ಅಪ್ಪಿಕೊಳ್ಳುತ್ತಾರೆ, ಹೋಳಿ ಹೈ ಅನ್ನುತ್ತಾರೆ. ಒಂದು ದಿನ ಎಲ್ಲರೂ ಒಂದೇ ಕಾಮನಬಿಲ್ಲು, ಎಲ್ಲರೂ ಸ್ನೇಹಿತರು.",
    monsoon:
      "ಬಹಳ ಮಳೆ ಬಂದರೆ ಅದನ್ನು ಮುಂಗಾರು ಅನ್ನುತ್ತಾರೆ. ಆಕಾಶ ತನ್ನ ನೀರನ್ನು ಮರಗಳಿಗೆ, ಕಪ್ಪೆಗಳಿಗೆ, ನವಿಲಿಗೆ ಹಂಚುತ್ತದೆ. ನವಿಲು ಗರಿ ಬಿಚ್ಚುತ್ತದೆ, ಆದರೆ ಕೂಗುವುದಿಲ್ಲ. ಟಿಪ್, ಟಿಪ್, ಟಿಪ್, ಛಾವಣಿ ಜೋಗುಳ ಹಾಡುತ್ತದೆ.",
    rakhi:
      "ರಾಖಿ ದಿನ ಮಣಿಕಟ್ಟಿಗೆ ದಾರ ಕಟ್ಟುತ್ತಾರೆ. ಅರ್ಥ: ನಾನು ನಿನ್ನ ಜೊತೆ ಇದ್ದೇನೆ. ಸಿಹಿ ಹಂಚುತ್ತಾರೆ. ಪ್ರೀತಿ ಸಮುದ್ರ ದಾಟಿಯೂ ದಣಿಯದೆ ಬರುತ್ತದೆ.",
    sankranti:
      "ಸಂಕ್ರಾಂತಿ ಬಂದಾಗ ಸೂರ್ಯ ಹೊಸ ದಾರಿ ಹಿಡಿಯುತ್ತಾನೆ. ಮನೆಯಲ್ಲಿ ಬೆಚ್ಚನೆಯ ಸಿಹಿ ಬೇಯುತ್ತದೆ, ಗಾಳಿಪಟಗಳು ಹಾರುತ್ತವೆ, ಸಂಜೆ ಎಲ್ಲರೂ ಮತ್ತೆ ಚಾಪೆಯ ಬಳಿ ಬರುತ್ತಾರೆ. ಆಕಾಶ ಬೆಳಿಗ್ಗಿನವರೆಗೆ ಕಾಯಬಲ್ಲದು.",
  };
  const name = festival[c.festivalId];
  const birthday = c.occasion === "birthday";
  const title = birthday
    ? `${c.child} ಮತ್ತು ${c.narrator} ಹುಟ್ಟುಹಬ್ಬ`
    : `${c.child} ಮತ್ತು ${c.narrator} ಅವರ ${name} ಕಥೆ`;
  const opening = birthday
    ? `ಇಂದು ${c.child} ಹುಟ್ಟುಹಬ್ಬ, ಮನೆಯಲ್ಲಿ ಏಲಕ್ಕಿ ಮತ್ತು ಬೆಚ್ಚನೆಯ ಹಾಲಿನ ಪರಿಮಳ ಇತ್ತು.`
    : `ಇಂದು ${name} ಸಂಜೆ, ಮನೆ ಚಿನ್ನದ ಬೆಳಕಿನಂತೆ ಮೃದುವಾಗಿ ಕಾಣುತ್ತಿತ್ತು.`;
  const core = [
    `${opening} ${c.child} ${c.narrator} ಬಳಿಯೇ ಇದ್ದರು, ತೊಡೆಯ ಮೇಲೆ ಸುರಕ್ಷಿತವಾಗಿ. ${c.narrator} ಮನೆಯವರು, ${localBlurb(c.relation, KANNADA_BLURB, "ಪ್ರೀತಿಸುವವರು")}. ಕಥೆಗೆ ಅವಸರವಿರಲಿಲ್ಲ. ರಾತ್ರಿ ನಿಧಾನವಾಗಿ ನಡೆಯಲು ಬಿಟ್ಟರು, ಫ್ಯಾನ್ ಮೆಲ್ಲಗೆ ಹಾಡಿದ ಹಾಗೆ.`,
    `${c.narrator} ಅಂಗೈಯಲ್ಲಿ ಚಿಕ್ಕ ಮಣ್ಣಿನ ದೀಪವನ್ನು ಇಟ್ಟರು. "ನೋಡು, ${c.child}. ಇದು ದೀಪ. ಈ ಚಿಕ್ಕ ಜ್ವಾಲೆ ಧೈರ್ಯವಾಗಿ ಇರುತ್ತದೆ, ಕತ್ತಲು ವಿಶ್ರಾಂತಿ ತೆಗೆದುಕೊಳ್ಳಲಿ ಅಂತ." ${c.child} ಬೆರಳುಗಳು ದೀಪವನ್ನು ತುಂಬಾ ಮೃದುವಾಗಿ ಮುಟ್ಟಿದವು. ದೀಪ ದುಂಡಗೆ, ಚಿಕ್ಕ ದೋಣಿಯಂತೆ ಇತ್ತು. "ಇದನ್ನು ಯಾಕೆ ಹಚ್ಚುತ್ತೇವೆ?" ${tale[c.festivalId]} ಮಲಗುವ ಮುನ್ನ ಅಂಗಳದಲ್ಲಿ ಬೆಳಕು ಬಿಡುವುದು ${c.child}ಗೆ ನೆನಪಾಯಿತು. ${c.narrator} ಹೇಳಿದರು, "ಹೌದು, ಹಾಗೆಯೇ."`,
    `ಇಬ್ಬರೂ ಕಿಟಕಿ ಬಳಿ ಹೋದರು. ಹೊರಗೆ ದೀಪದ ಹಾರಗಳು ನಕ್ಷತ್ರಗಳಂತೆ ಮಿನುಗಿದವು, ಸ್ವಲ್ಪ ಹೊತ್ತು ಬಾಲ್ಕನಿಯ ಮೇಲೆ ಕುಳಿತ ಹಾಗೆ. ${c.child} ಕಲ್ಪನೆಯಲ್ಲಿ ಬಾಗಿಲ ಬಳಿ ರಂಗೋಲಿ ಇತ್ತು, ಗುಲಾಬಿ, ಹಳದಿ, ನೀಲಿ. ಭಾರತದ ಮನೆ ಎಷ್ಟು ಆಕಾಶ ದೂರವಿದ್ದರೂ ಬಣ್ಣಗಳಿಗೆ ಹೆಸರು ಮರೆಯುವುದಿಲ್ಲ. ಎಲ್ಲೋ ಒಂದು ಕಪ್ಪೆ ಚಿಕ್ಕ ನಮಸ್ತೆ ಹೇಳಿತು. ಛಾವಣಿಯ ನೆನಪಿನಲ್ಲಿ ಮಳೆ ಹೇಳಿತು, ಟಿಪ್, ಟಿಪ್, ಟಿಪ್.`,
    `${c.child}ಗೆ ${c.interest} ತುಂಬಾ ಇಷ್ಟ. ${c.narrator} ಆ ಪ್ರೀತಿಯನ್ನು ಕಥೆಯೊಳಗೆ ನಿಧಾನವಾಗಿ ಬರಲು ಬಿಟ್ಟರು. ಶಬ್ದವಿರಲಿಲ್ಲ, ಭಯವಿರಲಿಲ್ಲ. ${c.child}ಗೆ ಇಷ್ಟವಾದ ವಿಷಯ ಕ್ಷಣಕಾಲ ಹತ್ತಿರ ಬಂದು ಸುಮ್ಮನೆ ಕುಳಿತಿತು, ಹಾಸಿಗೆ ಅಂಚಿನ ಪರಿಚಿತ ಆಟಿಕೆಯಂತೆ, ನಿದ್ರೆ ಬರುವವರೆಗೆ ಜೊತೆ ಕೊಟ್ಟಿತು.`,
    `${c.narrator} ಒಂದು ಚಿಕ್ಕ ಲಡ್ಡು ತಂದರು, ದುಂಡಗೆ ಚಿನ್ನದಂತೆ, ಮತ್ತು ಅರಿಶಿನ ಹಾಲಿನ ಲೋಟ. "ಒಂದು ನಿನಗೆ," ಮೆಲ್ಲಗೆ ಹೇಳಿದರು, "ಒಂದು ತುಣುಕು ಚಂದ್ರನಿಗೆ." ${c.child}ಗೆ ನಗು ಬಂತು, ಕೋಣೆ ಇನ್ನಷ್ಟು ದಯೆಯಿಂದ ಕಾಣಿಸಿತು. ಮನೆ ಸುಮ್ಮನಾಯಿತು. ಅಡುಗೆಮನೆ ಕೆಲಸ ಮುಗಿದಿತ್ತು. ಫ್ಯಾನ್ ನ ಮೃದು ಹಾಡು ಮಾತ್ರ ಉಳಿಯಿತು.`,
  ];
  const extras = [
    `${c.narrator} ದೊಡ್ಡ ಹಾಡು ಹಾಡಲಿಲ್ಲ, ಮನೆಯಲ್ಲಿ ಇರುವ ಆ ಧಾಟಿ ಮಾತ್ರ. ಕಥೆಯ ನವಿಲು ಗರಿ ಮಡಚಿ ತಲೆ ಅಡಗಿಸಿಕೊಂಡಿತು. ದೊಡ್ಡ ಹಕ್ಕಿಗಳಿಗೂ ಜೋಗುಳದ ಹೊತ್ತು ಗೊತ್ತು. ${c.child}ಗೆ ಇದು ಇಷ್ಟವಾಯಿತು.`,
    `ತುಂಬಾ ದೂರದಲ್ಲಿ ಒಂದು ಬಾಣಬಿರುಸು ಆಕಾಶದಲ್ಲಿ ಹೂವಾಗಿ ಮರ್ಯಾದೆಯಿಂದ ಮಾಯವಾಯಿತು. ${c.narrator} ಹೇಳಿದರು, ದೊಡ್ಡ ಶಬ್ದ ಮುಗಿಯಿತು. ಈಗ ಚಿಕ್ಕ ಚಿನ್ನದ ಜ್ವಾಲೆ ಮಾತ್ರ, ಎಡ, ಬಲ, ಎಡ, ಬಲ. ${c.child} ಕಣ್ಣುಗಳು ಸಿಹಿಯಾಗಿ ಭಾರವಾದವು.`,
    `ಮನೆಯ ಮುದ್ದಿನ ಹೆಸರನ್ನು ಮೆಲ್ಲಗೆ ಕರೆದರು. "${c.nickname}," ಎಂದು ${c.narrator} ಹೇಳಿದರು. ಆ ಮಾತು ಹಳೇ ಶಾಲಿನಂತೆ ಹೊಂದಿಕೆಯಾಯಿತು. ಅದನ್ನು ಜಗತ್ತಿಗೆ ವಿವರಿಸಬೇಕಿಲ್ಲ. ಅದು ಕಥೆಯ ಖಾಸಗಿ ಬಾಗಿಲು.`,
  ];
  const closing = birthday
    ? `${c.narrator} ಕಂಬಳಿಯನ್ನು ${c.child} ಗದ್ದದವರೆಗೆ ಎಳೆದರು, ಎದೆಯ ಮೇಲೆ ಮೆಲ್ಲಗೆ ಎರಡು ಬಾರಿ ಕೈ ಇಟ್ಟರು. "ಹುಟ್ಟುಹಬ್ಬದ ಶುಭಾಶಯ, ${c.nickname}. ಬಯಕೆ ಸುಮ್ಮನೂ ಇರಬಹುದು. ತೊಡೆ ಇದೆ, ದೀಪ ಇದೆ, ನಿನ್ನ ಹೆಸರು ತಿಳಿದವರು ಇದ್ದಾರೆ." ಕೈ ಅಲ್ಲೇ ಇತ್ತು. ಬೆಚ್ಚಗಿತ್ತು. ಹೊರಗೆ ನಕ್ಷತ್ರಗಳು ಒಂದೊಂದಾಗಿ ಬೆಳಗಿದವು. "ಶುಭ ರಾತ್ರಿ, ${c.child}." ನಿದ್ರೆ ನಿಧಾನವಾಗಿ, ತುಂಬಾ ನಿಧಾನವಾಗಿ, ಸಿಹಿಯಾಗಿ ಬಂದಿತು.`
    : `ಹೊರಗೆ ನಕ್ಷತ್ರಗಳು ಒಂದೊಂದಾಗಿ ಬಂದವು, ಆಕಾಶ ತನ್ನ ದೀಪಗಳನ್ನು ಹಚ್ಚಿದ ಹಾಗೆ. ${c.narrator} ಕಂಬಳಿಯನ್ನು ${c.child} ಗದ್ದದವರೆಗೆ ಎಳೆದರು, ಎದೆಯ ಮೇಲೆ ಮೆಲ್ಲಗೆ ಎರಡು ಬಾರಿ ಕೈ ಇಟ್ಟರು. "ಎಲ್ಲಿಗೆ ಹೋದರೂ, ${c.nickname}, ಈ ಬೆಳಕು ಜೊತೆ ಇರುತ್ತದೆ. ಸಮುದ್ರದಾಚೆಯೂ." ಕೈಗೆ ಚಿಕ್ಕ ದೀಪದಂತೆ ಬೆಚ್ಚಗೆ ಅನಿಸಿತು. "ಶುಭ ರಾತ್ರಿ, ${c.child}." ${c.child} ನಿಧಾನವಾಗಿ, ತುಂಬಾ ನಿಧಾನವಾಗಿ, ಸಿಹಿ ಕನಸಿನ ಕಡೆ ತೇಲಿದರು.`;
  return { title, core, extras, closing };
}

const BUILDERS: Record<string, (c: Ctx) => Draft> = {
  english,
  hinglish,
  tenglish,
  kanglish,
  hindi,
  telugu,
  kannada,
};

export function buildMockStory(input: StoryInput) {
  const child = input.childName.trim();
  const narrator = input.narratorName.trim() || "a loved one";
  const language = BUILDERS[input.language] ? input.language : "english";
  const { phrase } = interestPhrase(input.interests);
  const festivalId = FESTIVALS[hashString(`${child}|${narrator}|${language}`) % FESTIVALS.length];
  const ctx: Ctx = {
    child,
    narrator,
    relation: input.narratorRelation,
    blurb: relationshipBlurb(input.narratorRelation, ""),
    nickname: input.nickname.trim() || NICKNAMES[language] || "little one",
    interest: phrase,
    festivalId,
    occasion: input.occasion ?? "bedtime",
    ageRange: input.ageRange,
  };
  const draft = BUILDERS[language](ctx);
  return {
    title: draft.title,
    body: fitStory(draft.core, draft.extras, draft.closing),
    provider: "mock" as const,
  };
}
