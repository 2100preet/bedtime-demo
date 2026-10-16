import { BRAND_NAME } from "@/lib/brand";
import { SiteHeader } from "@/components/site-header";
import { photoConsentStatement, voiceConsentStatement } from "@/lib/privacy";

export const metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <div className="min-h-full bg-cream">
      <div className="bg-night">
        <SiteHeader dark />
      </div>
      <article className="mx-auto grid max-w-2xl gap-4 px-4 py-10 text-base leading-7">
        <h1 className="font-display text-4xl">Privacy</h1>
        <p>
          {BRAND_NAME} is for parents and gift-givers. Children do not make accounts. A child profile stores a first name, an age range, a language, optional interests, and optional nicknames. We do not ask for a last name, a photo on that profile, a school, or a location.
        </p>
        <h2 className="font-display text-2xl">Voices</h2>
        <p>{voiceConsentStatement()}</p>
        <p>Deleting a voice removes the recording and asks the voice provider to delete the model. Stories already generated keep their audio file.</p>
        <h2 className="font-display text-2xl">Birthday photos</h2>
        <p>{photoConsentStatement()}</p>
        <p>
          Photos are stored only long enough to draw the book, then deleted when photo deletion is on (the default). There is no public gallery. A birthday book opens only with its private link.
        </p>
        <h2 className="font-display text-2xl">Payments</h2>
        <p>Card payments, when enabled, are handled by Stripe. This preview can run a practice checkout that does not charge a card.</p>
      </article>
    </div>
  );
}
