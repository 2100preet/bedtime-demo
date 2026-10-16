import type { Metadata } from "next";
import { Fraunces, Nunito, Noto_Sans_Devanagari, Noto_Sans_Kannada, Noto_Sans_Telugu } from "next/font/google";
import { BRAND_NAME } from "@/lib/brand";
import { resolveOffer } from "@/lib/offer";
import { PracticeBanner } from "@/components/practice-banner";
import { InrNote } from "@/components/inr-note";
import { TimezoneCurrency } from "@/components/timezone-currency";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-sans",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

const devanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "600", "700"],
  variable: "--font-deva",
});

const telugu = Noto_Sans_Telugu({
  subsets: ["telugu"],
  weight: ["400", "600", "700"],
  variable: "--font-telugu",
});

const kannada = Noto_Sans_Kannada({
  subsets: ["kannada"],
  weight: ["400", "600", "700"],
  variable: "--font-kannada",
});

export const metadata: Metadata = {
  title: {
    default: `${BRAND_NAME} — bedtime stories in a loved one's voice`,
    template: `%s · ${BRAND_NAME}`,
  },
  description:
    "Personalized bedtime stories in Hindi, Telugu, Kannada, and English, narrated in the voice of a grandparent, aunt, uncle, or anyone who loves your child.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const offer = await resolveOffer();
  return (
    <html
      lang="en"
      className={`${nunito.variable} ${fraunces.variable} ${devanagari.variable} ${telugu.variable} ${kannada.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PracticeBanner />
        <div className="bg-cream">
          <InrNote currency={offer.currency} />
        </div>
        <TimezoneCurrency enabled={offer.source === "default"} />
        {children}
      </body>
    </html>
  );
}
