import { comicSvg } from "@/lib/comics/art";
import type { CharacterSheet, ComicPanel } from "@/lib/comics/script";
import { StoryPlayer } from "@/components/story-player";
import { Upsell } from "@/components/upsell";
import { CopyButton } from "@/components/copy-button";
import { mailLink, whatsAppLink } from "@/lib/text";
import { BRAND_NAME } from "@/lib/brand";

export function ComicView({
  title,
  narration,
  character,
  panels,
  token,
  audioSrc,
  voiceLabel,
  language,
  photosDeletedAt,
  shareUrl,
}: {
  title: string;
  narration: string;
  character: CharacterSheet;
  panels: Array<ComicPanel & { imagePath?: string }>;
  token: string;
  audioSrc: string | null;
  voiceLabel: string;
  language: string;
  photosDeletedAt: string | null;
  shareUrl: string;
}) {
  const message = `${title} — a ${BRAND_NAME} birthday story. Listen here: ${shareUrl}`;
  return (
    <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-6 overflow-x-clip px-4 py-6">
      <header className="grid gap-2">
        <p className="text-sm font-bold uppercase tracking-wide text-clay">Birthday book</p>
        <h1 className="font-display text-4xl leading-tight text-night">{title}</h1>
        <p className="text-muted-foreground">
          A private link for your family. It is not listed in any gallery.
        </p>
      </header>
      <StoryPlayer src={audioSrc} text={narration} language={language} voiceLabel={voiceLabel} />
      <div className="flex min-w-0 flex-wrap gap-2">
        <CopyButton value={shareUrl} />
        <a className="inline-flex h-11 items-center rounded-full bg-secondary px-4 text-sm font-bold" href={whatsAppLink(message)}>
          WhatsApp
        </a>
        <a className="inline-flex h-11 items-center rounded-full bg-secondary px-4 text-sm font-bold" href={mailLink(title, message)}>
          Email
        </a>
        <a className="inline-flex h-11 items-center rounded-full bg-night px-4 text-sm font-bold text-cream" href={`/api/comics/${token}/pdf`}>
          Download PDF
        </a>
      </div>
      <ol className="grid min-w-0 gap-5">
        {panels.map((panel) => (
          <li key={panel.index} className="min-w-0 overflow-hidden rounded-3xl bg-card shadow-sm ring-1 ring-foreground/10">
            {panel.imagePath ? (
              // The image route checks the unguessable share token. Photos of the child are never served.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`/api/comics/${token}/panel/${panel.index}`} alt="" className="w-full" />
            ) : (
              <div
                className="[&_svg]:block [&_svg]:h-auto [&_svg]:w-full [&_svg]:max-w-full"
                dangerouslySetInnerHTML={{
                  __html: comicSvg({
                    character,
                    background: panel.background,
                    pose: panel.pose,
                  }),
                }}
              />
            )}
            <p className="px-4 py-4 text-lg leading-7">
              <span className="mr-2 font-bold text-clay">{panel.index}</span>
              {panel.caption}
            </p>
          </li>
        ))}
      </ol>
      {photosDeletedAt ? (
        <p className="rounded-2xl bg-lilac px-4 py-3 text-sm">
          The photos used to inspire this cartoon were deleted on{" "}
          {new Date(photosDeletedAt).toLocaleDateString()}. They are not used for training and are not in any public gallery.
        </p>
      ) : null}
      <Upsell />
    </div>
  );
}
