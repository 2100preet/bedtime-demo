import type { CharacterSheet, ComicBackground, ComicPose } from "@/lib/comics/script";

const BACKDROP: Record<ComicBackground, { sky: string; ground: string; extra: string }> = {
  morning: { sky: "#ffe8c2", ground: "#f59e0b", extra: "sun" },
  window: { sky: "#312e81", ground: "#1e1b4b", extra: "moon" },
  festival: { sky: "#4c1d95", ground: "#7c3aed", extra: "lights" },
  interest: { sky: "#ecfccb", ground: "#65a30d", extra: "leaf" },
  kitchen: { sky: "#fff7ed", ground: "#fdba74", extra: "sweet" },
  rain: { sky: "#dbeafe", ground: "#64748b", extra: "rain" },
  lamp: { sky: "#431407", ground: "#9a3412", extra: "flame" },
  stars: { sky: "#1e1b4b", ground: "#312e81", extra: "stars" },
  bed: { sky: "#fffaf2", ground: "#e9d5ff", extra: "bed" },
  night: { sky: "#1e1b4b", ground: "#0f172a", extra: "moon" },
};

function extraShapes(kind: string) {
  if (kind === "sun") return `<circle cx="540" cy="70" r="28" fill="#fbbf24"/>`;
  if (kind === "moon") return `<circle cx="530" cy="78" r="26" fill="#fde68a"/><circle cx="542" cy="70" r="20" fill="#312e81"/>`;
  if (kind === "lights") {
    return [80, 160, 240, 320, 400, 480, 560]
      .map((x) => `<circle cx="${x}" cy="48" r="6" fill="#fbbf24"/>`)
      .join("");
  }
  if (kind === "leaf") return `<ellipse cx="90" cy="250" rx="36" ry="16" fill="#15803d" transform="rotate(-20 90 250)"/>`;
  if (kind === "sweet") return `<circle cx="120" cy="250" r="18" fill="#f59e0b"/><circle cx="148" cy="258" r="14" fill="#fbbf24"/>`;
  if (kind === "rain") {
    return [70, 120, 180, 250, 320, 390, 460, 530]
      .map((x, i) => `<line x1="${x}" y1="${40 + (i % 3) * 10}" x2="${x - 8}" y2="${80 + (i % 3) * 10}" stroke="#93c5fd" stroke-width="3"/>`)
      .join("");
  }
  if (kind === "flame") return `<ellipse cx="470" cy="230" rx="10" ry="22" fill="#fbbf24"/>`;
  if (kind === "stars") {
    return [[80, 60], [140, 100], [220, 50], [500, 90], [560, 40]]
      .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.5" fill="#fde68a"/>`)
      .join("");
  }
  if (kind === "bed") return `<rect x="300" y="250" width="250" height="28" rx="10" fill="#ddd6fe"/>`;
  return `<circle cx="90" cy="70" r="8" fill="#fde68a"/>`;
}

function person(x: number, shirt: string, skin: string, hair: string, cheek: string, pose: ComicPose, small: boolean) {
  const s = small ? 0.78 : 1;
  const eyesOpen = pose !== "sleep" && pose !== "tuck";
  const arm = pose === "point" || pose === "lamp" ? 46 : pose === "hug" ? 18 : 30;
  const eyes = eyesOpen
    ? `<circle cx="${x - 10 * s}" cy="${168}" r="${3.2 * s}" fill="#1e1b4b"/><circle cx="${x + 12 * s}" cy="${168}" r="${3.2 * s}" fill="#1e1b4b"/>`
    : `<path d="M${x - 16} 168 q8 6 16 0" fill="none" stroke="#1e1b4b" stroke-width="2"/><path d="M${x + 4} 168 q8 6 16 0" fill="none" stroke="#1e1b4b" stroke-width="2"/>`;
  return `
    <ellipse cx="${x}" cy="300" rx="${34 * s}" ry="10" fill="#000" opacity="0.08"/>
    <path d="M${x - arm} 230 q${arm} 40 ${arm * 1.4} 10" fill="none" stroke="${skin}" stroke-width="${8 * s}" stroke-linecap="round"/>
    <rect x="${x - 28 * s}" y="210" width="${56 * s}" height="${78 * s}" rx="${22 * s}" fill="${shirt}"/>
    <circle cx="${x}" cy="168" r="${32 * s}" fill="${skin}"/>
    <path d="M${x - 30 * s} 160 q${30 * s} ${-46 * s} ${62 * s} 0 q-8 ${-18 * s} ${-30 * s} ${-8 * s} q-20 ${-16 * s} ${-32 * s} 8 z" fill="${hair}"/>
    ${eyes}
    <circle cx="${x - 16 * s}" cy="178" r="${4 * s}" fill="${cheek}" opacity="0.8"/>
    <circle cx="${x + 16 * s}" cy="178" r="${4 * s}" fill="${cheek}" opacity="0.8"/>
    <path d="M${x - 8 * s} 186 q${8 * s} ${7 * s} ${16 * s} 0" fill="none" stroke="#9a3412" stroke-width="2" stroke-linecap="round"/>
  `;
}

export function comicSvg(input: {
  character: CharacterSheet;
  background: ComicBackground;
  pose: ComicPose;
}) {
  const scene = BACKDROP[input.background] ?? BACKDROP.night;
  const { character, pose } = input;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="100%" height="auto" preserveAspectRatio="xMidYMid meet" style="display:block;width:100%;height:auto;max-width:100%" role="img">
    <rect width="640" height="360" fill="${scene.sky}"/>
    <rect y="250" width="640" height="110" fill="${scene.ground}"/>
    ${extraShapes(scene.extra)}
    <g opacity="0.95">${person(210, character.shawl, "#f3d2b5", "#4a3428", character.cheek, "hug", false)}</g>
    ${person(400, character.shirt, character.skin, character.hair, character.cheek, pose, true)}
  </svg>`;
}
