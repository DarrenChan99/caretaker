"use client";

import { DEFAULTS, storageKey } from "@/lib/settings/types";

/**
 * Speaks a line of Cantonese on this device.
 *
 * This used to open a whole Vapi voice call per utterance — ~2-4s of silence before
 * Popo heard anything, and billed per sentence, for text the app already has. Vapi is
 * now reserved for actual conversations (the companion, and the live interpreter);
 * one-shot lines go through the browser.
 *
 * Resolves false (never throws) when nothing can speak, so callers can stay silent
 * rather than break.
 *
 * ponytail: native voices are more robotic than Vapi's zh-HK neural voice, and
 * availability varies by device. If the demo device has no Cantonese voice at all this
 * returns false — check early, and go back to a hosted TTS endpoint (not a full call)
 * if the quality matters more than the latency.
 */
export async function playTts(text: string): Promise<boolean> {
  if (!text.trim()) return false;
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;

  const voice = await pickCantoneseVoice();
  if (!voice) return false;

  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.lang = voice.lang;
    utterance.rate = readVoiceRate();

    let done = false;
    const finish = (ok: boolean) => {
      if (done) return;
      done = true;
      resolve(ok);
    };
    utterance.onend = () => finish(true);
    utterance.onerror = () => finish(false);

    // A queued utterance from a previous screen would otherwise play first.
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  });
}

/** Popo's rate is the one that matters — it is her device doing the speaking. */
function readVoiceRate(): number {
  try {
    const raw = window.localStorage.getItem(storageKey("popo"));
    const rate = raw ? (JSON.parse(raw) as { voiceRate?: number }).voiceRate : undefined;
    return typeof rate === "number" ? rate : DEFAULTS.popo.voiceRate;
  } catch {
    return DEFAULTS.popo.voiceRate;
  }
}

/**
 * Chrome and Safari populate getVoices() asynchronously and return [] on the first
 * call, so a naive lookup silently finds no Cantonese voice on the very first line
 * spoken after a page load — exactly the line Popo is waiting for.
 */
async function pickCantoneseVoice(): Promise<SpeechSynthesisVoice | null> {
  let voices = window.speechSynthesis.getVoices();

  if (voices.length === 0) {
    voices = await new Promise<SpeechSynthesisVoice[]>((resolve) => {
      const timer = setTimeout(() => resolve(window.speechSynthesis.getVoices()), 1000);
      window.speechSynthesis.addEventListener(
        "voiceschanged",
        () => {
          clearTimeout(timer);
          resolve(window.speechSynthesis.getVoices());
        },
        { once: true },
      );
    });
  }

  return pickFrom(voices);
}

/** Exported for scripts/check-tts.ts. */
export function pickFrom(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const byLang = (prefix: string) =>
    voices.find((v) => v.lang.toLowerCase().replace("_", "-").startsWith(prefix));

  // Cantonese proper, then any Chinese voice (Mandarin reading Traditional characters
  // is wrong but intelligible), then nothing — never silently read Chinese as English.
  return byLang("zh-hk") ?? byLang("yue") ?? byLang("zh") ?? null;
}
