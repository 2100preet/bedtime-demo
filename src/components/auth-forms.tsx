"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignupForm({ next }: { next: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
      }),
    });
    const data = await response.json().catch(() => ({}));
    setPending(false);
    if (!response.ok) {
      setError(data.error || "Could not create the account");
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Your name</Label>
        <Input id="name" name="name" className="h-11 text-base" placeholder="Asha" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required className="h-11 text-base" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required minLength={8} className="h-11 text-base" />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" size="xl" disabled={pending}>
        {pending ? "Creating…" : "Create account"}
      </Button>
    </form>
  );
}

export function LoginForm({ next = "/home" }: { next?: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [magic, setMagic] = useState("");

  async function password(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
    });
    const data = await response.json().catch(() => ({}));
    setPending(false);
    if (!response.ok) {
      setError(data.error || "Could not sign in");
      return;
    }
    router.push(next);
    router.refresh();
  }

  async function sendLink(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/magic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email") }),
    });
    const data = await response.json().catch(() => ({}));
    setPending(false);
    if (!response.ok) {
      setError(data.error || "Could not make a link");
      return;
    }
    setMagic(data.devLink || "");
  }

  return (
    <div className="grid gap-8">
      <form onSubmit={password} className="grid gap-4">
        <h2 className="font-display text-2xl">Email and password</h2>
        <Input name="email" type="email" required placeholder="Email" className="h-11 text-base" aria-label="Email" />
        <Input name="password" type="password" required placeholder="Password" className="h-11 text-base" aria-label="Password" />
        <Button type="submit" size="xl" disabled={pending}>
          Sign in
        </Button>
      </form>
      <form onSubmit={sendLink} className="grid gap-4">
        <h2 className="font-display text-2xl">Or a magic link</h2>
        <p className="text-sm text-muted-foreground">
          There is no email server in this preview, so the sign-in link appears here. It expires in 30 minutes.
        </p>
        <Input name="email" type="email" required placeholder="Email" className="h-11 text-base" aria-label="Magic link email" />
        <Button type="submit" size="xl" variant="secondary" disabled={pending}>
          Make a sign-in link
        </Button>
        {magic ? (
          <a className="break-all text-sm font-semibold underline" href={magic}>
            Open your sign-in link
          </a>
        ) : null}
      </form>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
