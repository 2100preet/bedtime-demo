import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { appUrl, mailLink, whatsAppLink } from "@/lib/text";
import { BRAND_NAME } from "@/lib/brand";
import { relationshipShort } from "@/lib/catalog";
import { SiteHeader } from "@/components/site-header";
import { CopyButton } from "@/components/copy-button";
import { RetryBook } from "@/components/checkout-actions";
import { CharacterPreview } from "@/components/character-preview";
import { parseCharacter } from "@/lib/comics/create";
import { Upsell } from "@/components/upsell";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function BirthdayOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.comicOrder.findUnique({
    where: { id },
    include: { narrators: true },
  });
  if (!order) notFound();
  const checkout = order.checkoutId
    ? await prisma.checkoutSession.findUnique({ where: { id: order.checkoutId } })
    : null;
  const narrator = order.narrators.find((item) => item.status !== "deleted");
  const shareUrl = `${appUrl()}/c/${order.shareToken}`;
  const invite = narrator ? `${appUrl()}/invite/${narrator.inviteToken}` : "";
  const waitingForVoice = narrator && narrator.status !== "ready";
  const character = parseCharacter(order.characterJson);

  return (
    <div className="min-h-full bg-cream">
      <div className="bg-night">
        <SiteHeader dark />
      </div>
      <main className="mx-auto grid max-w-xl gap-5 px-4 py-10">
        <p className="text-sm font-bold uppercase tracking-wide text-clay">Birthday book</p>
        <h1 className="font-display text-4xl">{order.childFirstName}&apos;s book</h1>
        <p className="text-muted-foreground">
          {order.status === "ready"
            ? "The comic is ready. Share the private link when you want them to open it."
            : order.status === "character_preview"
              ? "Payment is in. Approve the cartoon before the rest of the book is drawn."
              : order.status === "error"
                ? "Payment is saved. The drawing step needs another try."
                : order.status === "generating"
                  ? "The pages are being drawn."
                  : checkout?.status === "paid"
                    ? "Payment is in. The character preview will appear here."
                    : "This book is waiting for checkout."}
        </p>

        {order.status !== "ready" && checkout && checkout.status !== "paid" && checkout.provider === "mock" ? (
          <Link href={`/checkout/mock/${checkout.id}`} className={buttonVariants({ size: "xl" })}>
            Finish checkout
          </Link>
        ) : null}

        {order.error ? <p className="rounded-2xl bg-blush px-4 py-3 text-sm">{order.error}</p> : null}
        {order.status === "character_preview" ? (
          <CharacterPreview
            id={order.id}
            childName={order.childFirstName}
            likeness={character?.likeness === "photo" ? "photo" : "sample"}
          />
        ) : null}

        {order.status === "error" ||
        (checkout?.status === "paid" &&
          order.status !== "ready" &&
          order.status !== "generating" &&
          order.status !== "character_preview") ? (
          <RetryBook id={order.id} />
        ) : null}

        {waitingForVoice && narrator ? (
          <section className="grid gap-3 rounded-3xl bg-card p-5 ring-1 ring-foreground/10">
            <h2 className="font-display text-2xl">Ask {narrator.displayName} to record</h2>
            <p className="text-sm text-muted-foreground">
              {relationshipShort(narrator.relationship, narrator.customLabel)} reads a short script in the browser.
              When it arrives, the comic narration switches to that voice. A preview voice is used until then.
            </p>
            <div className="flex flex-wrap gap-2">
              <CopyButton value={invite} label="Copy invite" />
              <a
                className={buttonVariants({ size: "lg", variant: "secondary" })}
                href={whatsAppLink(
                  `${order.childFirstName} would love a birthday story in your voice on ${BRAND_NAME}. About a minute: ${invite}`,
                )}
              >
                WhatsApp
              </a>
            </div>
          </section>
        ) : null}

        {order.status === "ready" ? (
          <section className="grid gap-3 rounded-3xl bg-lilac p-5">
            <h2 className="font-display text-2xl">{order.title}</h2>
            {order.deliverOn && !order.deliveredAt ? (
              <p className="text-sm">
                A reminder to share this is set for {order.deliverOn}. The link already works if you want to open it early.
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Link href={`/c/${order.shareToken}`} className={buttonVariants({ size: "xl" })}>
                Open the comic
              </Link>
              <CopyButton value={shareUrl} />
              <a
                className={buttonVariants({ size: "lg", variant: "secondary" })}
                href={whatsAppLink(`${order.title} — a ${BRAND_NAME} birthday story: ${shareUrl}`)}
              >
                WhatsApp
              </a>
              <a
                className={buttonVariants({ size: "lg", variant: "secondary" })}
                href={mailLink(order.title, `${order.title}\n\n${shareUrl}`)}
              >
                Email
              </a>
            </div>
          </section>
        ) : null}

        <Upsell />
      </main>
    </div>
  );
}
