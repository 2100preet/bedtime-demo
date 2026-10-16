"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function GenerateButton({
  childId,
  narratorId,
  blockedReason,
}: {
  childId: string;
  narratorId?: string;
  blockedReason?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  if (blockedReason) {
    return (
      <div className="grid gap-3 rounded-2xl bg-blush p-4">
        <p>{blockedReason}</p>
        <Link href="/billing" className={buttonVariants({ size: "xl" })}>
          See plans
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      <Button
        size="xl"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          setError("");
          const response = await fetch("/api/stories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ childId, narratorId }),
          });
          const data = await response.json().catch(() => ({}));
          setPending(false);
          if (!response.ok) {
            setError(data.error || "Could not write the story");
            return;
          }
          router.push(`/library/${data.id}`);
          router.refresh();
        }}
      >
        {pending ? "Writing tonight's story…" : "Write tonight's story"}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

export function DeleteVoiceButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <Dialog>
      <DialogTrigger className={buttonVariants({ variant: "destructive", size: "lg" })}>
        Delete voice
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this voice?</DialogTitle>
          <DialogDescription>
            The recording and voice model are removed. Stories already made keep their audio.
          </DialogDescription>
        </DialogHeader>
        <Button
          variant="destructive"
          disabled={pending}
          onClick={async () => {
            setPending(true);
            await fetch(`/api/narrators/${id}`, { method: "DELETE" });
            router.refresh();
          }}
        >
          {pending ? "Deleting…" : "Delete voice"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export function WeeklyButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <div className="grid gap-2">
      <Button
        variant="secondary"
        className="h-11"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          const response = await fetch("/api/cron/weekly", { method: "POST" });
          const data = await response.json().catch(() => ({}));
          setPending(false);
          setMessage(response.ok ? `Wrote ${data.stories} story, skipped ${data.skipped}.` : data.error);
          router.refresh();
        }}
      >
        {pending ? "Running…" : "Run weekly story job"}
      </Button>
      {message ? <p className="text-sm">{message}</p> : null}
    </div>
  );
}

export function PlanButtons({ intro }: { intro: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState("");

  async function go(plan: "monthly" | "yearly") {
    setPending(plan);
    const response = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setPending("");
      return;
    }
    router.push(data.url);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Button size="xl" disabled={Boolean(pending)} onClick={() => go("monthly")}>
        {pending === "monthly" ? "Opening checkout…" : intro ? "Start first month" : "Monthly"}
      </Button>
      <Button size="xl" variant="secondary" disabled={Boolean(pending)} onClick={() => go("yearly")}>
        {pending === "yearly" ? "Opening checkout…" : "Yearly"}
      </Button>
    </div>
  );
}

export function CancelButton() {
  const router = useRouter();
  return (
    <Button
      variant="outline"
      className="h-11"
      onClick={async () => {
        await fetch("/api/billing/cancel", { method: "POST" });
        router.refresh();
      }}
    >
      Cancel subscription
    </Button>
  );
}
