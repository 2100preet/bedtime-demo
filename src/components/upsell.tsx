import Link from "next/link";
import { BRAND_NAME } from "@/lib/brand";
import { resolveOffer } from "@/lib/offer";
import { InrNote } from "@/components/inr-note";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export async function Upsell() {
  const offer = await resolveOffer();
  return (
    <Card className="bg-lilac">
      <CardHeader>
        <CardTitle className="font-display text-2xl">A story every week, in this voice</CardTitle>
        <CardDescription>
          The birthday book stays yours. {BRAND_NAME} can also tuck a new story into the library each week.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <p>
          First month {offer.introMonthly}, then {offer.monthly} a month.
          Or {offer.yearly} for the year.
        </p>
        <InrNote currency={offer.currency} />
        <Link href="/billing" className={buttonVariants({ size: "xl" })}>
          Continue bedtime weekly
        </Link>
      </CardContent>
    </Card>
  );
}
