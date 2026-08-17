"use client";

/**
 * The only place in the app that touches getUserMedia or unlocks the AudioContext.
 * Nothing else should call these browser APIs directly — that's what keeps only one
 * mic ever live and playback ever unblocked (§1.5).
 */

let audioCtx: AudioContext | null = null;
let micStream: MediaStream | null = null;

/** Call from a user gesture (entry-gate tap, notification tap) to unlock autoplay/TTS. */
export function unlockAudio(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    void audioCtx.resume();
  }
  return audioCtx;
}

/** Lazily acquires the one shared mic stream (used by volume-reactive UI, Phase 2 Vapi call). */
export async function getSharedMicStream(): Promise<MediaStream> {
  if (micStream) return micStream;
  micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  return micStream;
}

export function releaseMicStream() {
  micStream?.getTracks().forEach((t) => t.stop());
  micStream = null;
}

export type Turn = "family" | "popo" | "idle";

/** A recognizer may only start when the shared turn flag names its side. */
export function canSpeak(side: Exclude<Turn, "idle">, whoseTurn: Turn): boolean {
  return whoseTurn === side;
}

type SpeechRecognitionCtor = new () => SpeechRecognition;

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

let activeRecognition: SpeechRecognition | null = null;

/**
 * Starts the single allowed recognizer for this tab. Stops any recognizer already
 * running in this tab first — only one instance runs at a time, by construction.
 */
export function startRecognition(opts: {
  lang: "en-US" | "zh-HK";
  onInterim: (text: string) => void;
  onFinal: (text: string) => void;
  onError: (message: string) => void;
}): { stop: () => void } | null {
  const Ctor = getRecognitionCtor();
  if (!Ctor) {
    opts.onError("Speech recognition unavailable in this browser — use the typed fallback.");
    return null;
  }

  activeRecognition?.stop();

  const recognition = new Ctor();
  recognition.lang = opts.lang;
  recognition.interimResults = true;
  recognition.continuous = false;

  recognition.onresult = (event) => {
    let interim = "";
    let final = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      if (result.isFinal) final += result[0].transcript;
      else interim += result[0].transcript;
    }
    if (interim) opts.onInterim(interim);
    if (final) {
      opts.onFinal(final);
      recognition.stop();
    }
  };

  recognition.onerror = (event) => {
    opts.onError(event.error ?? "recognition error");
  };

  recognition.onend = () => {
    if (activeRecognition === recognition) activeRecognition = null;
  };

  activeRecognition = recognition;
  recognition.start();
  return { stop: () => recognition.stop() };
}
