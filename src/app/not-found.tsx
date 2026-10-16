import Link from "next/link";
import { BRAND_NAME } from "@/lib/brand";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-lg px-4 py-20">
      <p className="text-sm font-bold uppercase tracking-wide text-clay">{BRAND_NAME}</p>
      <h1 className="mt-2 font-display text-4xl">That page has gone to sleep</h1>
      <p className="mt-3 text-muted-foreground">The link may be old, or the story was removed.</p>
      <Link href="/" className="mt-6 inline-block font-bold underline">
        Back to the front door
      </Link>
    </main>
  );
}
