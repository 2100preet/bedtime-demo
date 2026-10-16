import Link from "next/link";
import { BRAND_NAME } from "@/lib/brand";
import { resolveOffer } from "@/lib/offer";
import { SiteHeader } from "@/components/site-header";
import { InrNote } from "@/components/inr-note";
import { WaitlistForm } from "@/components/waitlist-form";
import { buttonVariants } from "@/components/ui/button";

const steps = [
  {
    n: "1",
    title: "A first name is enough",
    body: "Age range, language, a favourite thing, and the nickname the family already uses. Nothing else about the child.",
  },
  {
    n: "2",
    title: "Someone they love records a minute",
    body: "Send a WhatsApp link to Dadi, Nani, Maushi, Bua, Mama, Chachi, a parent, a sibling, or anyone you name. They read a short script and give consent.",
  },
  {
    n: "3",
    title: "A story every week",
    body: "A gentle audio story lands in your library, ready for lights-off bedtime, with a link you can pass around the family.",
  },
  {
    n: "4",
    title: "Or one birthday book",
    body: "A one-time comic, no subscription required, with your child as the cartoon hero and a voice reading it aloud.",
  },
];

const faqs = [
  {
    q: "What do you collect about my child?",
    a: "Only a first name, an age range, a language, optional interests, and optional family nicknames. No photos on the story profile, no last name, no birthday on that profile, no location. Parents create the account. Children never do.",
  },
  {
    q: "Who can be the narrator?",
    a: "Anyone who agrees to it. Grandparents, maushi, bua, mama, chachi, parents, siblings, family friends, or a relationship you type yourself. Their voice is used only for your family's stories and can be deleted.",
  },
  {
    q: "How does voice consent work?",
    a: "The person records their own voice and checks a consent statement before anything is saved. The voice is not sold or used to train public models. Deleting it removes the recording and the voice model.",
  },
  {
    q: "Which languages?",
    a: "Hindi, Telugu, Kannada, and English, plus mixed storytelling: Hinglish, Tenglish, and Kanglish. Festivals, food, and family words stay culturally Indian.",
  },
  {
    q: "Is this screen time?",
    a: "Stories are audio-first, made for lights-off bedtime. The birthday book has pictures you can look at together, then listen to with the lights down.",
  },
  {
    q: "Ages?",
    a: "Made for ages 2–7.",
  },
  {
    q: "What about the photos on a birthday book?",
    a: "A parent or guardian checks a consent box. Photos are used only to inspire a stylized cartoon, deleted after the book is drawn, never used for training, and never placed in a public gallery.",
  },
];

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ currency?: string }>;
}) {
  const params = await searchParams;
  const offer = await resolveOffer(params.currency);
  return (
    <div className="bg-cream text-foreground">
      <header className="bg-gradient-to-b from-night via-dusk to-clay text-cream">
        <SiteHeader dark />
        <div className="mx-auto max-w-3xl px-4 pb-16 pt-8 text-center">
          <h1 className="font-display text-4xl leading-tight sm:text-6xl">
            Bedtime stories starring your child, told in the voice of someone who loves them.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-cream/90">
            {BRAND_NAME} writes gentle stories in Hindi, Telugu, Kannada, and English — Diwali diyas, monsoon peacocks, Holi colours, and the nicknames only your family uses. A new one every week, narrated by a grandparent, maushi, bua, mama, chachi, or anyone you invite.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="#join" className={buttonVariants({ size: "xl" })}>
              First month {offer.introMonthly}
            </Link>
            <Link href="/birthday" className={buttonVariants({ size: "xl", variant: "secondary" })}>
              Birthday book {offer.birthday}
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="mb-8 text-center font-display text-4xl">How it works</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {steps.map((step) => (
            <article key={step.n} className="rounded-3xl bg-card p-6 shadow-sm ring-1 ring-foreground/10">
              <p className="font-display text-3xl text-dusk">{step.n}</p>
              <h3 className="mt-2 font-display text-2xl">{step.title}</h3>
              <p className="mt-2 text-muted-foreground">{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="mb-6 text-center font-display text-4xl">The tone of a story</h2>
          <div className="rounded-3xl bg-blush p-6 text-lg leading-8 sm:p-8">
            <p>
              “Dekho, Aarav,” she said. <em>Look.</em> “This is a <em>diya</em>. Tonight we light lots and lots of diyas, so the whole world feels bright and happy.”
            </p>
            <p className="mt-4">
              Then Dadi lit the diya. The flame was small and gold, and it danced a little. “Ssh,” said Dadi. “The flame is sleepy too.”
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              From a sample about Diwali. The same warmth works for Nani, Maushi, Mama, or a family friend, in the language you choose.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="text-center font-display text-4xl">Simple pricing</h2>
        <div className="mb-8 mt-2">
          <InrNote currency={offer.currency} />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-3xl bg-card p-6 text-center ring-1 ring-foreground/10">
            <h3 className="font-display text-2xl">Monthly</h3>
            <p className="mt-2 font-display text-4xl text-dusk">
              {offer.monthly}
              <span className="text-lg">/mo</span>
            </p>
            <p className="mt-3 inline-block rounded-full bg-marigold px-3 py-1 text-sm font-bold text-night">
              First month {offer.introMonthly}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">A weekly story in a loved one&apos;s voice. Cancel anytime.</p>
          </article>
          <article className="rounded-3xl bg-card p-6 text-center ring-4 ring-marigold">
            <h3 className="font-display text-2xl">Yearly</h3>
            <p className="mt-2 font-display text-4xl text-dusk">
              {offer.yearly}
              <span className="text-lg">/yr</span>
            </p>
            <p className="mt-3 inline-block rounded-full bg-marigold px-3 py-1 text-sm font-bold text-night">
              Save {offer.savingsPercent}%
            </p>
            <p className="mt-3 text-sm text-muted-foreground">Everything monthly, kept for the whole year of bedtimes.</p>
          </article>
          <article className="rounded-3xl bg-lilac p-6 text-center">
            <h3 className="font-display text-2xl">Birthday book</h3>
            <p className="mt-2 font-display text-4xl text-dusk">{offer.birthday}</p>
            <p className="mt-3 inline-block rounded-full bg-card px-3 py-1 text-sm font-bold">One time · no subscription</p>
            <p className="mt-3 text-sm text-muted-foreground">
              An 8–12 panel comic and an audio narration. Gift it across the miles.
            </p>
            <Link href="/birthday" className={`${buttonVariants({ size: "lg" })} mt-4`}>
              Make a birthday book
            </Link>
          </article>
        </div>
      </section>

      <section className="bg-lilac py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-display text-4xl">Gift it across the family</h2>
          <p className="mt-4 text-lg">
            Grandparents in India can gift a year of stories to children in the US, UK, Canada, the Gulf, or Australia, and record from their own phone. A birthday, Diwali, or Raksha Bandhan gift that still sounds like home.
          </p>
          <Link href="/gift" className={`${buttonVariants({ size: "xl" })} mt-6`}>
            Gift a subscription
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16">
        <h2 className="mb-6 text-center font-display text-4xl">Questions</h2>
        <div className="grid gap-3">
          {faqs.map((item) => (
            <details key={item.q} className="rounded-2xl bg-card px-4 py-3 ring-1 ring-foreground/10">
              <summary className="cursor-pointer font-bold">{item.q}</summary>
              <p className="mt-2 text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section id="join" className="bg-night py-16 text-cream">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-display text-4xl">Be one of the first families</h2>
          <p className="mt-3 mb-6 text-cream/80">Join the waitlist and lock the first month at {offer.introMonthly}.</p>
          <div className="text-night">
            <WaitlistForm />
          </div>
        </div>
      </section>

      <footer className="px-4 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} {BRAND_NAME} · Made for families near and far · <Link href="/privacy">Privacy</Link>
      </footer>
    </div>
  );
}
