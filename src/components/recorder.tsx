"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export function Recorder({
  token,
  script,
  consent,
  allowSample,
}: {
  token: string;
  script: string;
  consent: string;
  allowSample: boolean;
}) {
  const [agreed, setAgreed] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [recording, setRecording] = useState(false);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearInterval(timer.current);
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  async function start() {
    setError("");
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const media = new MediaRecorder(stream);
    const chunks: Blob[] = [];
    media.ondataavailable = (event) => {
      if (event.data.size) chunks.push(event.data);
    };
    media.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
      const next = new Blob(chunks, { type: media.mimeType || "audio/webm" });
      setBlob(next);
      setPreview(URL.createObjectURL(next));
    };
    recorder.current = media;
    media.start();
    setRecording(true);
    setSeconds(0);
    timer.current = window.setInterval(() => {
      setSeconds((value) => {
        if (value >= 179) {
          media.stop();
          setRecording(false);
          if (timer.current) window.clearInterval(timer.current);
          return 180;
        }
        return value + 1;
      });
    }, 1000);
  }

  function stop() {
    recorder.current?.stop();
    setRecording(false);
    if (timer.current) window.clearInterval(timer.current);
  }

  async function submit(useSample: boolean) {
    if (!agreed) {
      setError("Please read and check the consent statement first.");
      return;
    }
    setPending(true);
    setError("");
    const form = new FormData();
    form.set("token", token);
    form.set("consent", "true");
    if (useSample) form.set("useSample", "true");
    else if (blob) form.set("audio", blob, "recording.webm");
    const response = await fetch("/api/narrators/record", { method: "POST", body: form });
    const data = await response.json().catch(() => ({}));
    setPending(false);
    if (!response.ok) {
      setError(data.error || "Could not save the recording");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="rounded-3xl bg-lilac p-6">
        <h2 className="font-display text-3xl">Thank you</h2>
        <p className="mt-2">The recording is saved with your consent. The family can use this voice for their stories, and it can be deleted whenever you ask.</p>
      </div>
    );
  }

  const mins = Math.floor(seconds / 60);
  const secs = String(seconds % 60).padStart(2, "0");

  return (
    <div className="grid gap-5">
      <div className="rounded-3xl bg-blush p-5 text-lg leading-8 whitespace-pre-wrap">{script}</div>
      <label className="flex items-start gap-3 rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
        <Checkbox checked={agreed} onCheckedChange={(checked) => setAgreed(Boolean(checked))} className="mt-1 size-5" />
        <span className="text-sm leading-6">{consent}</span>
      </label>
      <p className="text-sm text-muted-foreground">Aim for 1–3 minutes. The timer stops at 3:00.</p>
      <p className="font-display text-4xl">{mins}:{secs}</p>
      <div className="flex flex-wrap gap-3">
        {!recording ? (
          <Button type="button" size="xl" disabled={!agreed} onClick={() => start().catch(() => setError("This browser could not use the microphone."))}>
            Start recording
          </Button>
        ) : (
          <Button type="button" size="xl" variant="secondary" onClick={stop}>
            Stop
          </Button>
        )}
        <Button type="button" size="xl" disabled={!agreed || !blob || pending} onClick={() => submit(false)}>
          {pending ? "Saving…" : "Send recording"}
        </Button>
      </div>
      {preview ? <audio controls src={preview} className="w-full" /> : null}
      {seconds > 0 && seconds < 20 && blob ? (
        <p className="text-sm text-clay">That was quite short. A minute of reading helps the voice.</p>
      ) : null}
      {allowSample ? (
        <Button type="button" variant="outline" className="h-11" disabled={!agreed || pending} onClick={() => submit(true)}>
          No microphone? Save a practice reading
        </Button>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
