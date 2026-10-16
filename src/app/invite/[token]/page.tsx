import { prisma } from "@/lib/db";
import { recordingScript } from "@/lib/narration/scripts";
import { voiceConsentStatement } from "@/lib/privacy";
import { BRAND_NAME } from "@/lib/brand";
import { relationshipShort } from "@/lib/catalog";
import { SiteHeader } from "@/components/site-header";
import { Recorder } from "@/components/recorder";

export const dynamic = "force-dynamic";
export const metadata = { title: "Record a voice", robots: { index: false, follow: false } };

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const narrator = await prisma.narrator.findUnique({ where: { inviteToken: token } });
  const allowSample = !process.env.ELEVENLABS_API_KEY;

  return (
    <div className="min-h-full bg-cream">
      <div className="bg-night">
        <SiteHeader dark />
      </div>
      <main className="mx-auto grid max-w-xl gap-4 px-4 py-10">
        {!narrator || narrator.status === "deleted" ? (
          <>
            <h1 className="font-display text-4xl">This invite is closed</h1>
            <p className="text-muted-foreground">Ask the family for a fresh link if you still want to record.</p>
          </>
        ) : narrator.status === "ready" ? (
          <>
            <h1 className="font-display text-4xl">We already have your voice</h1>
            <p className="text-muted-foreground">
              Thank you. {BRAND_NAME} uses it only for this family&apos;s stories, and they can delete it.
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-bold uppercase tracking-wide text-clay">
              {relationshipShort(narrator.relationship, narrator.customLabel)}
            </p>
            <h1 className="font-display text-4xl">Read this once, {narrator.displayName}</h1>
            <p className="text-muted-foreground">
              About one to three minutes, in a quiet room. {BRAND_NAME} turns the recording into a private voice for
              this family&apos;s stories. Check the consent line before you send it.
            </p>
            <Recorder
              token={narrator.inviteToken}
              script={recordingScript(narrator.language)}
              consent={voiceConsentStatement()}
              allowSample={allowSample}
            />
          </>
        )}
      </main>
    </div>
  );
}
