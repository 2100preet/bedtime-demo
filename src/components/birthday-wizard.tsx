"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AGE_RANGES, LANGUAGES, RELATIONSHIPS } from "@/lib/catalog";
import { photoConsentStatement } from "@/lib/privacy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ChoiceSelect } from "@/components/choice-select";

export function BirthdayWizard({
  buyerEmail,
  buyerName,
  priceLabel,
}: {
  buyerEmail: string;
  buyerName: string;
  priceLabel: string;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [step, setStep] = useState(0);
  const [ageRange, setAgeRange] = useState("4-5");
  const [language, setLanguage] = useState("hinglish");
  const [relationship, setRelationship] = useState("nani");
  const [narratorChoice, setNarratorChoice] = useState("stock");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!consent) {
      setError("A parent or guardian needs to consent before the photos are used.");
      return;
    }
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    form.set("ageRange", ageRange);
    form.set("language", language);
    form.set("relationship", relationship);
    form.set("narratorChoice", narratorChoice);
    form.set("consent", consent ? "true" : "");
    const response = await fetch("/api/birthday", { method: "POST", body: form });
    const data = await response.json().catch(() => ({}));
    setPending(false);
    if (!response.ok) {
      setError(data.error || "Could not start the book");
      return;
    }
    router.push(data.url);
  }

  function continueStep() {
    const form = formRef.current;
    if (!form) return;
    const data = new FormData(form);
    if (step === 0) {
      const email = String(data.get("buyerEmail") || "");
      const name = String(data.get("firstName") || "").trim();
      if (!email.includes("@") || name.length < 1) {
        setError("Add your email and the child's first name.");
        return;
      }
    }
    if (step === 1) {
      const files = form.querySelector<HTMLInputElement>("#photos")?.files;
      if (!files || files.length < 1 || files.length > 3) {
        setError("Add 1 to 3 photos of the child.");
        return;
      }
      if (!consent) {
        setError("A parent or guardian needs to consent before the photos are used.");
        return;
      }
    }
    setError("");
    setStep((value) => value + 1);
  }

  return (
    <form ref={formRef} onSubmit={submit} className="grid gap-5">
      <p className="text-sm font-bold text-clay">Step {step + 1} of 3 · {priceLabel} once</p>
      <div className={step === 0 ? "grid gap-4" : "hidden"}>
          <div className="grid gap-2">
            <Label htmlFor="buyerName">Your name</Label>
            <Input id="buyerName" name="buyerName" defaultValue={buyerName} className="h-11 text-base" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="buyerEmail">Your email</Label>
            <Input id="buyerEmail" name="buyerEmail" type="email" required defaultValue={buyerEmail} className="h-11 text-base" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="firstName">Child&apos;s first name</Label>
            <Input id="firstName" name="firstName" required className="h-11 text-base" />
          </div>
          <div className="grid gap-2">
            <Label>Age</Label>
            <ChoiceSelect value={ageRange} onChange={setAgeRange} options={AGE_RANGES.map((item) => ({ id: item.id, label: item.label }))} />
          </div>
          <div className="grid gap-2">
            <Label>Language</Label>
            <ChoiceSelect value={language} onChange={setLanguage} options={LANGUAGES.map((item) => ({ id: item.id, label: item.label }))} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="interests">Interests</Label>
            <Input id="interests" name="interests" className="h-11 text-base" placeholder="mangoes, trains" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="nickname">Nickname</Label>
            <Input id="nickname" name="nickname" className="h-11 text-base" placeholder="bangaram" />
          </div>
      </div>
      <div className={step === 1 ? "grid gap-4" : "hidden"}>
          <div className="grid gap-2">
            <Label htmlFor="occasion">Occasion</Label>
            <Input id="occasion" name="occasion" defaultValue="5th birthday" className="h-11 text-base" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="birthdayDate">Birthday date</Label>
            <Input id="birthdayDate" name="birthdayDate" type="date" className="h-11 text-base" />
            <p className="text-sm text-muted-foreground">Used only if you want a reminder to share the link that day.</p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="deliverOn">Remind me to share on</Label>
            <Input id="deliverOn" name="deliverOn" type="date" className="h-11 text-base" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="photos">1–3 photos</Label>
            <Input id="photos" name="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple className="h-11 text-base" />
          </div>
          <label className="flex items-start gap-3 rounded-2xl bg-lilac p-4">
            <Checkbox checked={consent} onCheckedChange={(checked) => setConsent(Boolean(checked))} className="mt-1 size-5" />
            <span className="text-sm leading-6">{photoConsentStatement()}</span>
          </label>
      </div>
      <div className={step === 2 ? "grid gap-4" : "hidden"}>
          <div className="grid gap-2">
            <Label>Narrator</Label>
            <ChoiceSelect
              value={narratorChoice}
              onChange={setNarratorChoice}
              options={[
                { id: "stock", label: "Warm stock voice" },
                { id: "invite", label: "Invite a loved one to record" },
              ]}
            />
          </div>
          {narratorChoice === "invite" ? (
            <>
              <div className="grid gap-2">
                <Label>Who are they?</Label>
                <ChoiceSelect value={relationship} onChange={setRelationship} options={RELATIONSHIPS.map((item) => ({ id: item.id, label: item.label }))} />
              </div>
              {relationship === "custom" ? (
                <Input name="customLabel" placeholder="Who are they?" className="h-11 text-base" />
              ) : (
                <input type="hidden" name="customLabel" value="" />
              )}
              <div className="grid gap-2">
                <Label htmlFor="narratorName">What the child calls them</Label>
                <Input id="narratorName" name="narratorName" className="h-11 text-base" placeholder="Nani" />
              </div>
            </>
          ) : (
            <>
              <input type="hidden" name="narratorName" value="" />
              <input type="hidden" name="customLabel" value="" />
            </>
          )}
          <p className="text-sm text-muted-foreground">
            After payment you preview the cartoon and can ask for it to be drawn again before the full book is created. If you invite someone, their voice replaces the preview narration when the recording arrives.
          </p>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="flex flex-wrap gap-3">
        {step > 0 ? (
          <Button type="button" variant="secondary" className="h-12" onClick={() => setStep((value) => value - 1)}>
            Back
          </Button>
        ) : null}
        {step < 2 ? (
          <Button type="button" size="xl" onClick={continueStep}>
            Continue
          </Button>
        ) : (
          <Button type="submit" size="xl" disabled={pending}>
            {pending ? "Opening checkout…" : `Pay ${priceLabel}`}
          </Button>
        )}
      </div>
    </form>
  );
}
