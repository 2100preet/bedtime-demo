"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { languageById } from "@/lib/catalog";

export function StoryPlayer({
  src,
  text,
  language,
  voiceLabel,
}: {
  src?: string | null;
  text: string;
  language: string;
  voiceLabel: string;
}) {
  const [speaking, setSpeaking] = useState(false);
  const preview = voiceLabel === "Preview voice";

  function toggleSpeak() {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text.replace(/\*/g, ""));
    utterance.lang = languageById(language).speech;
    utterance.rate = 0.92;
    utterance.onend = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  return (
    <div className="grid gap-3 rounded-2xl bg-night px-4 py-4 text-cream">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-blush">{voiceLabel}</p>
        {preview ? (
          <Button type="button" size="lg" onClick={toggleSpeak}>
            {speaking ? "Stop" : "Play in this browser"}
          </Button>
        ) : null}
      </div>
      {src ? <audio controls src={src} className="w-full" preload="none" /> : null}
      {preview ? (
        <p className="text-xs text-blush/90">
          This is a local preview voice. Add an ElevenLabs key to hear the cloned recording.
        </p>
      ) : null}
    </div>
  );
}
