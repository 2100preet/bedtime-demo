"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChoiceSelect } from "@/components/choice-select";

export function GiftForm({
  buyerEmail,
  buyerName,
  monthLabel,
  yearLabel,
}: {
  buyerEmail: string;
  buyerName: string;
  monthLabel: string;
  yearLabel: string;
}) {
  const router = useRouter();
  const [plan, setPlan] = useState("year");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/gift", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        buyerName: form.get("buyerName"),
        buyerEmail: form.get("buyerEmail"),
        recipientName: form.get("recipientName"),
        recipientEmail: form.get("recipientEmail"),
        plan,
      }),
    });
    const data = await response.json().catch(() => ({}));
    setPending(false);
    if (!response.ok) {
      setError(data.error || "Could not start the gift");
      return;
    }
    router.push(data.url);
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="buyerName">Your name</Label>
        <Input id="buyerName" name="buyerName" defaultValue={buyerName} className="h-11 text-base" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="buyerEmail">Your email</Label>
        <Input id="buyerEmail" name="buyerEmail" type="email" required defaultValue={buyerEmail} className="h-11 text-base" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="recipientName">Their name</Label>
        <Input id="recipientName" name="recipientName" className="h-11 text-base" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="recipientEmail">Their email</Label>
        <Input id="recipientEmail" name="recipientEmail" type="email" required className="h-11 text-base" />
      </div>
      <div className="grid gap-2">
        <Label>Gift</Label>
        <ChoiceSelect
          value={plan}
          onChange={setPlan}
          options={[
            { id: "month", label: `One month · ${monthLabel}` },
            { id: "year", label: `One year · ${yearLabel}` },
          ]}
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" size="xl" disabled={pending}>
        {pending ? "Opening checkout…" : "Continue to checkout"}
      </Button>
    </form>
  );
}
