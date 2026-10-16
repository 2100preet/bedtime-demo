import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { appUrl } from "@/lib/text";
import { parseCharacter, parsePanels } from "@/lib/comics/create";
import { SiteHeader } from "@/components/site-header";
import { ComicView } from "@/components/comic-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Birthday book",
  robots: { index: false, follow: false },
};

export default async function ComicPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const order = await prisma.comicOrder.findUnique({ where: { shareToken: token } });
  if (!order) notFound();
  const character = parseCharacter(order.characterJson);
  const panels = parsePanels(order.panelsJson);

  return (
    <div className="min-h-full bg-cream">
      <div className="bg-night">
        <SiteHeader dark />
      </div>
      {order.status === "ready" && character && panels.length > 0 ? (
        <ComicView
          title={order.title}
          narration={order.narration}
          character={character}
          panels={panels}
          token={order.shareToken}
          audioSrc={order.audioPath ? `/api/comics/${order.shareToken}/audio` : null}
          voiceLabel={order.voiceLabel || "Preview voice"}
          language={order.language}
          photosDeletedAt={order.photosDeletedAt ? order.photosDeletedAt.toISOString() : null}
          shareUrl={`${appUrl()}/c/${order.shareToken}`}
        />
      ) : (
        <main className="mx-auto max-w-xl px-4 py-16">
          <h1 className="font-display text-4xl">This book is still being made</h1>
          <p className="mt-3 text-muted-foreground">
            {order.status === "error"
              ? "The drawing step needs another try from the buyer."
              : "Check back in a little while. This link is private and is not in any gallery."}
          </p>
        </main>
      )}
    </div>
  );
}
