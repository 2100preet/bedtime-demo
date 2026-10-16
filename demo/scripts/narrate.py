#!/usr/bin/env python3
"""Pre-generate the demo's sample narration with Microsoft Edge neural voices.

Run this locally before committing. GitHub Pages only builds the Vite app;
it does not call this script and does not need edge-tts.

    python3 demo/scripts/narrate.py

Uses a slightly slower rate so the reading stays warm and unhurried.
"""

from __future__ import annotations

import asyncio
import json
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parents[1]
NARRATION = ROOT / "narration"
AUDIO = ROOT / "public" / "audio"
RATE = "-10%"

LANGUAGES = {
    "english": {
        "title": "{child} and {narrator}'s Little Lamp",
        "voice": "en-IN-NeerjaNeural",
        "playerTitle": "Tonight's story",
        "listen": "Listen",
        "sampleChild": "Aarav",
        "sampleNarrator": "Dadi",
    },
    "hindi": {
        "title": "{child} और {narrator} का छोटा दिया",
        "voice": "hi-IN-SwaraNeural",
        "playerTitle": "आज की कहानी",
        "listen": "सुनें",
        "sampleChild": "आरव",
        "sampleNarrator": "दादी",
    },
    "telugu": {
        "title": "{child} మరియు {narrator} చిన్న దీపం",
        "voice": "te-IN-ShrutiNeural",
        "playerTitle": "ఈ రాత్రి కథ",
        "listen": "వినండి",
        "sampleChild": "ఆరవ్",
        "sampleNarrator": "దాది",
    },
    "kannada": {
        "title": "{child} ಮತ್ತು {narrator} ಅವರ ಚಿಕ್ಕ ದೀಪ",
        "voice": "kn-IN-SapnaNeural",
        "playerTitle": "ಇಂದಿನ ಕಥೆ",
        "listen": "ಕೇಳಿ",
        "sampleChild": "ಆರವ್",
        "sampleNarrator": "ದಾದಿ",
    },
    "hinglish": {
        "title": "{child} aur {narrator} ka chhota lamp",
        "voice": "hi-IN-SwaraNeural",
        "playerTitle": "Aaj ki kahani",
        "listen": "Suno",
        "sampleChild": "आरव",
        "sampleNarrator": "दादी",
        "ttsFile": "hinglish.tts.txt",
    },
    "tenglish": {
        "title": "{child} and {narrator} chinna lamp",
        "voice": "te-IN-ShrutiNeural",
        "playerTitle": "Ee raatri katha",
        "listen": "Vinandi",
        "sampleChild": "ఆరవ్",
        "sampleNarrator": "దాది",
        "ttsFile": "tenglish.tts.txt",
    },
    "kanglish": {
        "title": "{child} and {narrator} chikka lamp",
        "voice": "kn-IN-SapnaNeural",
        "playerTitle": "Ivattu kathe",
        "listen": "Keli",
        "sampleChild": "ಆರವ್",
        "sampleNarrator": "ದಾದಿ",
        "ttsFile": "kanglish.tts.txt",
    },
}


def load_stories() -> dict:
    catalog = {}
    for language, meta in LANGUAGES.items():
        body = (NARRATION / f"{language}.txt").read_text(encoding="utf-8").strip()
        words = body.split()
        if not 300 <= len(words) <= 450:
            raise SystemExit(f"{language} is {len(words)} words; expected 300–450")
        tts_name = meta.get("ttsFile")
        tts = (NARRATION / tts_name).read_text(encoding="utf-8").strip() if tts_name else body
        catalog[language] = {
            "title": meta["title"],
            "body": body,
            "tts": tts,
            "voice": meta["voice"],
            "playerTitle": meta["playerTitle"],
            "listen": meta["listen"],
            "sampleChild": meta["sampleChild"],
            "sampleNarrator": meta["sampleNarrator"],
        }
    return catalog


def spoken(story: dict) -> str:
    return (
        story["tts"]
        .replace("{child}", story["sampleChild"])
        .replace("{narrator}", story["sampleNarrator"])
    )


async def synthesize(text: str, voice: str, dest: Path) -> None:
    communicate = edge_tts.Communicate(text, voice, rate=RATE)
    await communicate.save(str(dest))


async def main() -> None:
    catalog = load_stories()
    published = {
        language: {key: value for key, value in story.items() if key != "tts"}
        for language, story in catalog.items()
    }
    (NARRATION / "stories.json").write_text(
        json.dumps(published, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    AUDIO.mkdir(parents=True, exist_ok=True)
    practice = (NARRATION / "practice.txt").read_text(encoding="utf-8").strip()
    jobs = [(spoken(story), story["voice"], AUDIO / f"{language}.mp3") for language, story in catalog.items()]
    jobs.append((practice, "en-IN-NeerjaNeural", AUDIO / "practice.mp3"))
    for text, voice, dest in jobs:
        print(f"speaking {dest.name} with {voice} at {RATE}")
        await synthesize(text, voice, dest)
        print(f"  {dest.stat().st_size} bytes")


if __name__ == "__main__":
    asyncio.run(main())
