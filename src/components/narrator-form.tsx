"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LANGUAGES, RELATIONSHIPS } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChoiceSelect } from "@/components/choice-select";

export function NarratorForm({
  childOptions,
}: {
  childOptions: { id: string; firstName: string }[];
}) {
  const router = useRouter();
  const [childId, setChildId] = useState(childOptions[0]?.id ?? "");
  const [relationship, setRelationship] = useState("dadi");
  const [language, setLanguage] = useState("hinglish");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/narrators", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        childId,
        relationship,
        customLabel: form.get("customLabel"),
        displayName: form.get("displayName"),
        language,
      }),
    });
    const data = await response.json().catch(() => ({}));
    setPending(false);
    if (!response.ok) {
      setError(data.error || "Could not create the invite");
      return;
    }
    router.push(`/children/${childId}?invite=${data.token}`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="grid gap-2">
        <Label>For which child?</Label>
        <ChoiceSelect
          value={childId}
          onChange={setChildId}
          options={childOptions.map((child) => ({ id: child.id, label: child.firstName }))}
        />
      </div>
      <div className="grid gap-2">
        <Label>Who are they?</Label>
        <ChoiceSelect
          value={relationship}
          onChange={setRelationship}
          options={RELATIONSHIPS.map((item) => ({ id: item.id, label: item.label }))}
        />
      </div>
      {relationship === "custom" ? (
        <div className="grid gap-2">
          <Label htmlFor="customLabel">Relationship</Label>
          <Input id="customLabel" name="customLabel" className="h-11 text-base" placeholder="Neighbour aunty" />
        </div>
      ) : null}
      <div className="grid gap-2">
        <Label htmlFor="displayName">What the child calls them</Label>
        <Input id="displayName" name="displayName" required className="h-11 text-base" placeholder="Dadi" />
      </div>
      <div className="grid gap-2">
        <Label>Script language</Label>
        <ChoiceSelect
          value={language}
          onChange={setLanguage}
          options={LANGUAGES.map((item) => ({ id: item.id, label: item.label }))}
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" size="xl" disabled={pending || childOptions.length === 0}>
        {pending ? "Creating link…" : "Create WhatsApp link"}
      </Button>
    </form>
  );
}
