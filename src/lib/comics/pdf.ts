import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
import path from "node:path";
import { BRAND_NAME } from "@/lib/brand";
import { comicSvg } from "@/lib/comics/art";
import type { CharacterSheet, ComicPanel } from "@/lib/comics/script";

const execFileAsync = promisify(execFile);

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function comicHtml(input: {
  title: string;
  narration: string;
  character: CharacterSheet;
  panels: Array<ComicPanel & { imagePath?: string }>;
}) {
  const panels = input.panels
    .map((panel) => {
      const art =
        panel.imagePath && fs.existsSync(panel.imagePath)
          ? `<img src="file://${panel.imagePath}" alt="" />`
          : comicSvg({ character: input.character, background: panel.background, pose: panel.pose });
      return `<section class="panel">
        ${art}
        <p><strong>${panel.index}.</strong> ${escapeHtml(panel.caption)}</p>
      </section>`;
    })
    .join("");
  const prose = input.narration
    .split(/\n\n+/)
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("");
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(input.title)}</title>
    <style>
      body{margin:24px;font-family:"Noto Sans","Noto Sans Devanagari","Noto Sans Telugu","Noto Sans Kannada",sans-serif;background:#fffaf2;color:#2b2140;line-height:1.5}
      h1{font-size:28px;margin-bottom:8px}
      .brand{color:#9a3412;letter-spacing:.04em;font-size:13px}
      .panel{break-inside:avoid;page-break-inside:avoid;margin:0 0 18px}
      svg,img{width:100%;height:auto;border-radius:16px}
      p{font-size:16px}
    </style></head><body>
    <div class="brand">${escapeHtml(BRAND_NAME)}</div>
    <h1>${escapeHtml(input.title)}</h1>
    ${panels}
    <h2>Read along</h2>
    ${prose}
    </body></html>`;
}

export async function writeComicPdf(input: {
  pdfPath: string;
  title: string;
  narration: string;
  character: CharacterSheet;
  panels: Array<ComicPanel & { imagePath?: string }>;
}) {
  const htmlPath = input.pdfPath.replace(/\.pdf$/, ".html");
  fs.mkdirSync(path.dirname(input.pdfPath), { recursive: true });
  fs.writeFileSync(htmlPath, comicHtml(input), "utf8");
  const bin = process.env.CHROME_PATH || "google-chrome";
  await execFileAsync(
    bin,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--no-pdf-header-footer",
      `--print-to-pdf=${input.pdfPath}`,
      `file://${htmlPath}`,
    ],
    { timeout: 45000 },
  );
  if (!fs.existsSync(input.pdfPath)) {
    throw new Error("PDF was not created");
  }
  fs.unlinkSync(htmlPath);
}
