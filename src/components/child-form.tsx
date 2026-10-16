"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AGE_RANGES, LANGUAGES } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChoiceSelect } from "@/components/choice-select";

export function ChildForm({
  childId,
  initial,
}: {
  childId?: string;
  initial?: {
    firstName: string;
    ageRange: string;
    language: string;
    interests: string;
    nickname: string;
  };
}) {
  const router = useRouter();
  const [ageRange, setAgeRange] = useState(initial?.ageRange ?? "4-5");
  const [language, setLanguage] = useState(initial?.language ?? "hinglish");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch(childId ? `/api/children/${childId}` : "/api/children", {
      method: childId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: form.get("firstName"),
        ageRange,
        language,
        interests: form.get("interests"),
        nickname: form.get("nickname"),
      }),
    });
    const data = await response.json().catch(() => ({}));
    setPending(false);
    if (!response.ok) {
      setError(data.error || "Could not save");
      return;
    }
    router.push(childId ? `/children/${childId}` : `/children/${data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="firstName">First name</Label>
        <Input id="firstName" name="firstName" required defaultValue={initial?.firstName} className="h-11 text-base" placeholder="Aarav" />
      </div>
      <div className="grid gap-2">
        <Label>Age range</Label>
        <ChoiceSelect value={ageRange} onChange={setAgeRange} options={AGE_RANGES.map((item) => ({ id: item.id, label: item.label }))} />
      </div>
      <div className="grid gap-2">
        <Label>Story language</Label>
        <ChoiceSelect value={language} onChange={setLanguage} options={LANGUAGES.map((item) => ({ id: item.id, label: item.label }))} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="interests">Interests</Label>
        <Input id="interests" name="interests" defaultValue={initial?.interests} className="h-11 text-base" placeholder="elephants, mangoes" />
        <p className="text-sm text-muted-foreground">Optional. A few favourite things, separated by commas.</p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="nickname">Family nickname</Label>
        <Input id="nickname" name="nickname" defaultValue={initial?.nickname} className="h-11 text-base" placeholder="raja beta, bangaram, gudiya" />
        <p className="text-sm text-muted-foreground">Optional. Words only this family uses.</p>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" size="xl" disabled={pending}>
        {pending ? "Saving…" : childId ? "Save" : "Add child"}
      </Button>
    </form>
  );
}
