"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WAITLIST_INTERESTS } from "@/lib/catalog";
import { ChoiceSelect } from "@/components/choice-select";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState("parent");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    setMessage("");
    const response = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, interest }),
    });
    const data = await response.json().catch(() => ({}));
    setPending(false);
    if (!response.ok) {
      setError(data.error || "Could not join just now");
      return;
    }
    setMessage("You're on the list. We'll write when a story spot opens.");
    setEmail("");
  }

  return (
    <form onSubmit={submit} className="mx-auto grid max-w-xl gap-3">
      <Input
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Your email"
        aria-label="Email"
        className="h-12 rounded-full px-5 text-base"
      />
      <ChoiceSelect
        value={interest}
        onChange={setInterest}
        options={WAITLIST_INTERESTS.map((item) => ({ id: item.id, label: item.label }))}
      />
      <Button type="submit" size="xl" disabled={pending}>
        {pending ? "Saving…" : "Join the waitlist"}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm">{message}</p> : null}
    </form>
  );
}
