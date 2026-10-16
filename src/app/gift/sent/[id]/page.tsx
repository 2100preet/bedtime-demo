import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { appUrl, mailLink, whatsAppLink } from "@/lib/text";
import { BRAND_NAME, formatStoredMoney } from "@/lib/brand";
import { SiteHeader } from "@/components/site-header";
import { CopyButton } from "@/components/copy-button";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function GiftSentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const gift = await prisma.giftPurchase.findUnique({ where: { id } });
  if (!gift) notFound();
  const checkout = gift.checkoutId
    ? await prisma.checkoutSession.findUnique({ where: { id: gift.checkoutId } })
    : null;
  const link = `${appUrl()}/redeem/${gift.redeemCode}`;
  const paid = gift.status === "paid" || gift.status === "redeemed";
  const message = `${gift.buyerName || "Someone"} sent a ${BRAND_NAME} bedtime gift. Open it here: ${link}`;

  return (
    <div className="min-h-full bg-cream">
      <div className="bg-night">
        <SiteHeader dark />
      </div>
      <main className="mx-auto grid max-w-xl gap-4 px-4 py-10">
        <h1 className="font-display text-4xl">{paid ? "The gift is ready to send" : "Finish checkout first"}</h1>
        {paid ? (
          <>
            <p className="text-muted-foreground">
              {formatStoredMoney(gift.amountCents, gift.currency)} · {gift.plan === "year" ? "one year" : "one month"} for {gift.recipientEmail}.
              Share this private redeem link. It is not listed anywhere.
            </p>
            <p className="break-all rounded-2xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/10">{link}</p>
            <div className="flex flex-wrap gap-2">
              <CopyButton value={link} />
              <a className={buttonVariants({ size: "lg", variant: "secondary" })} href={whatsAppLink(message)}>
                WhatsApp
              </a>
              <a className={buttonVariants({ size: "lg", variant: "secondary" })} href={mailLink(`A ${BRAND_NAME} gift`, message)}>
                Email
              </a>
            </div>
          </>
        ) : (
          <p>
            This gift is still unpaid.{" "}
            {checkout?.provider === "mock" ? (
              <Link href={`/checkout/mock/${checkout.id}`} className="font-bold underline">
                Return to checkout
              </Link>
            ) : (
              <Link href="/gift" className="font-bold underline">
                Start again
              </Link>
            )}
          </p>
        )}
      </main>
    </div>
  );
}
