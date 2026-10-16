"use client";

import { useEffect } from "react";
import { BRAND_NAME } from "@/lib/brand";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto max-w-lg px-4 py-20">
      <p className="text-sm font-bold uppercase tracking-wide text-clay">{BRAND_NAME}</p>
      <h1 className="mt-2 font-display text-4xl">Something went quiet</h1>
      <p className="mt-3 text-muted-foreground">Try that again. If it keeps happening, refresh the page.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 inline-flex h-12 items-center rounded-full bg-primary px-6 font-bold text-primary-foreground"
      >
        Try again
      </button>
    </main>
  );
}
