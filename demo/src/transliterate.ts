/** Latin names into Devanagari, Telugu, or Kannada. Unknown spellings stay in Latin. */

type Script = "devanagari" | "telugu" | "kannada";

const VOWELS = ["aa", "ai", "au", "ee", "ii", "oo", "uu", "a", "e", "i", "o", "u"] as const;
type Vowel = (typeof VOWELS)[number];

const CONSONANTS = [
  "ksh",
  "chh",
  "kh",
  "gh",
  "jh",
  "th",
  "dh",
  "ph",
  "bh",
  "sh",
  "ng",
  "ny",
  "ch",
  "k",
  "g",
  "j",
  "t",
  "d",
  "n",
  "p",
  "b",
  "m",
  "y",
  "r",
  "l",
  "v",
  "w",
  "s",
  "h",
  "c",
] as const;
type Consonant = (typeof CONSONANTS)[number];

const SIGNS: Record<Script, { indep: Record<Vowel, string>; matra: Record<Vowel, string>; cons: Record<Consonant, string>; halant: string }> = {
  devanagari: {
    indep: { a: "अ", aa: "आ", i: "इ", ii: "ई", u: "उ", uu: "ऊ", e: "ए", ee: "ई", ai: "ऐ", o: "ओ", oo: "ऊ", au: "औ" },
    matra: { a: "", aa: "ा", i: "ि", ii: "ी", u: "ु", uu: "ू", e: "े", ee: "ी", ai: "ै", o: "ो", oo: "ू", au: "ौ" },
    cons: {
      k: "क", kh: "ख", g: "ग", gh: "घ", ng: "ङ",
      c: "च", ch: "च", chh: "छ", j: "ज", jh: "झ", ny: "ञ",
      t: "त", th: "थ", d: "द", dh: "ध", n: "न",
      p: "प", ph: "फ", b: "ब", bh: "भ", m: "म",
      y: "य", r: "र", l: "ल", v: "व", w: "व",
      sh: "श", s: "स", h: "ह", ksh: "क्ष",
    },
    halant: "्",
  },
  telugu: {
    indep: { a: "అ", aa: "ఆ", i: "ఇ", ii: "ఈ", u: "ఉ", uu: "ఊ", e: "ఎ", ee: "ఈ", ai: "ఐ", o: "ఒ", oo: "ఊ", au: "ఔ" },
    matra: { a: "", aa: "ా", i: "ి", ii: "ీ", u: "ు", uu: "ూ", e: "ె", ee: "ీ", ai: "ై", o: "ో", oo: "ూ", au: "ౌ" },
    cons: {
      k: "క", kh: "ఖ", g: "గ", gh: "ఘ", ng: "ఙ",
      c: "చ", ch: "చ", chh: "ఛ", j: "జ", jh: "ఝ", ny: "ఞ",
      t: "త", th: "థ", d: "ద", dh: "ధ", n: "న",
      p: "ప", ph: "ఫ", b: "బ", bh: "భ", m: "మ",
      y: "య", r: "ర", l: "ల", v: "వ", w: "వ",
      sh: "శ", s: "స", h: "హ", ksh: "క్ష",
    },
    halant: "్",
  },
  kannada: {
    indep: { a: "ಅ", aa: "ಆ", i: "ಇ", ii: "ಈ", u: "ಉ", uu: "ಊ", e: "ಎ", ee: "ಈ", ai: "ಐ", o: "ಒ", oo: "ಊ", au: "ಔ" },
    matra: { a: "", aa: "ಾ", i: "ಿ", ii: "ೀ", u: "ು", uu: "ೂ", e: "ೆ", ee: "ೀ", ai: "ೈ", o: "ೋ", oo: "ೂ", au: "ೌ" },
    cons: {
      k: "ಕ", kh: "ಖ", g: "ಗ", gh: "ಘ", ng: "ಙ",
      c: "ಚ", ch: "ಚ", chh: "ಛ", j: "ಜ", jh: "ಝ", ny: "ಞ",
      t: "ತ", th: "ಥ", d: "ದ", dh: "ಧ", n: "ನ",
      p: "ಪ", ph: "ಫ", b: "ಬ", bh: "ಭ", m: "ಮ",
      y: "ಯ", r: "ರ", l: "ಲ", v: "ವ", w: "ವ",
      sh: "ಶ", s: "ಸ", h: "ಹ", ksh: "ಕ್ಷ",
    },
    halant: "್",
  },
};

function matchStart<T extends string>(options: readonly T[], word: string): T | null {
  const found = options.find((option) => word.startsWith(option));
  return found ?? null;
}

function convertWord(word: string, script: Script): string | null {
  const signs = SIGNS[script];
  let rest = word.toLowerCase();
  let out = "";
  let pending: string | null = null;
  const hold = (base: string) => {
    if (pending) out += pending + signs.halant;
    pending = base;
  };
  while (rest.length > 0) {
    const vowel = matchStart(VOWELS, rest);
    if (vowel) {
      if (pending) {
        out += pending + signs.matra[vowel];
        pending = null;
      } else {
        out += signs.indep[vowel];
      }
      rest = rest.slice(vowel.length);
      continue;
    }
    const consonant = matchStart(CONSONANTS, rest);
    if (consonant) {
      hold(signs.cons[consonant]);
      rest = rest.slice(consonant.length);
      continue;
    }
    return null;
  }
  if (pending) out += pending;
  return out;
}

export function scriptForLanguage(language: string): Script | "latin" {
  if (language === "hindi") return "devanagari";
  if (language === "telugu") return "telugu";
  if (language === "kannada") return "kannada";
  return "latin";
}

/** Transliterate Latin words. Letters already in another script, and failed words, stay as typed. */
export function transliterateName(input: string, language: string): string {
  const script = scriptForLanguage(language);
  if (script === "latin" || !input) return input;
  return input.replace(/[A-Za-z]+/g, (word) => convertWord(word, script) ?? word);
}
