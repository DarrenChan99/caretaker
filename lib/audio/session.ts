"use client";

/**
 * The only place in the app that touches getUserMedia or unlocks the AudioContext.
 * Nothing else should call these browser APIs directly — that's what keeps only one
 * mic ever live and playback ever unblocked (§1.5).
 *
 * Two sanctioned exceptions, both live voice calls that acquire their own mic:
 * LiveKit's <LiveKitRoom> for the family<->popo video call, and the Vapi companion
 * call on /popo/companion. That's fine because those and the chat/relay flows are
 * mutually exclusive routes — never mounted in the same tab at once — but
 * startRecognition() below still refuses to start while either is live
 * (setVoiceCallActive), so the invariant is enforced in code, not just here.
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

// Both sides may always speak. This was gated on `whoseTurn === side` (walkie-talkie
// turn-taking), but the baton is a single DB row that strands on whichever side spoke
// last — a stuck value disabled one side forever, and "idle" disabled both. The gate
// had already been reduced to `return true`; the last callers were removed with it.
// ponytail: reintroduce a `whoseTurn === side` check at the two mic buttons to go back
// to turn-taking.

type SpeechRecognitionCtor = new () => SpeechRecognition;

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

let activeRecognition: SpeechRecognition | null = null;
let voiceCallActive = false;

/**
 * Called by anything that holds the mic for a live voice call — the LiveKit video
 * call and the Vapi companion call both do — so recognition stays mutually exclusive
 * with them. Callers must clear it on unmount, not just on a clean hangup: a flag
 * left set kills the mic for the rest of the tab's life.
 */
export function setVoiceCallActive(active: boolean) {
  voiceCallActive = active;
}

/**
 * Starts the single allowed recognizer for this tab. Stops any recognizer already
 * running in this tab first — only one instance runs at a time, by construction.
 */
export function startRecognition(opts: {
  lang: "en-US" | "zh-HK";
  onInterim: (text: string) => void;
  onFinal: (text: string) => void;
  onError: (message: string) => void;
  /** Keep listening across pauses; the caller decides when to stop. */
  continuous?: boolean;
  onEnd?: () => void;
}): { stop: () => void } | null {
  // Both failure paths fire onEnd as well as onError: callers unwind their "listening"
  // UI in onEnd, and a start that never happened has to unwind the same way as one that
  // ended, or the screen strands on a listening state with no recognizer behind it.
  if (voiceCallActive) {
    opts.onError("A call is active — speech recognition is unavailable until it ends.");
    opts.onEnd?.();
    return null;
  }

  const Ctor = getRecognitionCtor();
  if (!Ctor) {
    opts.onError("Speech recognition unavailable in this browser — use the typed fallback.");
    opts.onEnd?.();
    return null;
  }

  activeRecognition?.stop();

  const recognition = new Ctor();
  recognition.lang = opts.lang;
  recognition.interimResults = true;
  recognition.continuous = opts.continuous ?? false;

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
      if (!opts.continuous) recognition.stop();
    }
  };

  recognition.onerror = (event) => {
    opts.onError(event.error ?? "recognition error");
  };

  recognition.onend = () => {
    if (activeRecognition === recognition) activeRecognition = null;
    opts.onEnd?.();
  };

  // start() throws (InvalidStateError, or a denied mic on some builds) rather than
  // reporting through onerror — same unwind as the guards above.
  try {
    recognition.start();
  } catch {
    opts.onError("Could not start the microphone — use the typed fallback.");
    opts.onEnd?.();
    return null;
  }

  activeRecognition = recognition;
  return { stop: () => recognition.stop() };
}
