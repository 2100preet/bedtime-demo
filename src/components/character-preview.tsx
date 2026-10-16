"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function CharacterPreview({
  id,
  childName,
  likeness,
}: {
  id: string;
  childName: string;
  likeness: "photo" | "sample";
}) {
  const router = useRouter();
  const [pending, setPending] = useState<"approve" | "regenerate" | "">("");
  const [error, setError] = useState("");
  const [stamp, setStamp] = useState(0);

  async function act(action: "approve" | "regenerate") {
    setPending(action);
    setError("");
    const response = await fetch(`/api/birthday/${id}/character`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setPending("");
      setError(data.error || "The character could not be updated");
      return;
    }
    if (action === "regenerate") {
      setStamp(Date.now());
      setPending("");
      router.refresh();
      return;
    }
    router.refresh();
  }

  return (
    <section className="grid gap-4 rounded-3xl bg-card p-4 ring-1 ring-foreground/10">
      <div className="grid gap-1">
        <h2 className="font-display text-2xl">Preview your character</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          {likeness === "photo"
            ? `This cartoon is drawn from the photo of ${childName}. The same face shape, skin tone, hair, and eyes are used on every page. Approve it before the rest of the book is drawn.`
            : `This is a sample likeness, because no image key is set. The same face, skin, hair, and eyes stay on every page. With a photo and an image key, this sheet is drawn from ${childName}.`}
        </p>
      </div>
      {/* The route serves the cartoon sheet, never the uploaded photo. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/api/birthday/${id}/character?v=${stamp}`}
        alt={`Cartoon character of ${childName}`}
        className="w-full rounded-2xl bg-cream"
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="flex flex-wrap gap-3">
        <Button type="button" size="xl" disabled={pending !== ""} onClick={() => act("approve")}>
          {pending === "approve" ? "Drawing the book…" : "Use this character"}
        </Button>
        <Button type="button" size="lg" variant="secondary" disabled={pending !== ""} onClick={() => act("regenerate")}>
          {pending === "regenerate" ? "Drawing again…" : "Draw again"}
        </Button>
      </div>
    </section>
  );
}
