"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function MockCheckout({ id }: { id: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function pay() {
    setPending(true);
    setError("");
    const response = await fetch(`/api/checkout/${id}/complete`, { method: "POST" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setPending(false);
      setError(data.error || "Could not finish this practice payment");
      return;
    }
    router.push(data.returnPath || "/home");
    router.refresh();
  }

  return (
    <div className="grid gap-3">
      <Button type="button" size="xl" disabled={pending} onClick={pay}>
        {pending ? "Finishing… a birthday book can take a minute to draw" : "Complete practice payment"}
      </Button>
      <p className="text-sm text-muted-foreground">No card is charged. This stands in for Stripe until a secret key is set.</p>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

export function RetryBook({ id }: { id: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function retry() {
    setPending(true);
    setError("");
    const response = await fetch(`/api/birthday/${id}/retry`, { method: "POST" });
    const data = await response.json().catch(() => ({}));
    setPending(false);
    if (!response.ok) {
      setError(data.error || "Could not draw the book");
      return;
    }
    router.refresh();
  }

  return (
    <div className="grid gap-2">
      <Button type="button" size="xl" disabled={pending} onClick={retry}>
        {pending ? "Drawing the book…" : "Try drawing again"}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

export function RedeemButton({ code }: { code: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function redeem() {
    setPending(true);
    setError("");
    const response = await fetch("/api/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await response.json().catch(() => ({}));
    setPending(false);
    if (!response.ok) {
      setError(data.error || "Could not open this gift");
      return;
    }
    router.push("/billing?welcome=1");
    router.refresh();
  }

  return (
    <div className="grid gap-2">
      <Button type="button" size="xl" disabled={pending} onClick={redeem}>
        {pending ? "Opening…" : "Add this gift to my account"}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
