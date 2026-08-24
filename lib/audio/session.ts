"use client";

/**
 * The only place in the app that touches getUserMedia or unlocks the AudioContext.
 * Nothing else should call these browser APIs directly — that's what keeps only one
 * mic ever live and playback ever unblocked (§1.5).
 *
 * One sanctioned exception: LiveKit's <LiveKitRoom> acquires its own getUserMedia
 * for the family<->popo video call. That's fine because video-call and
 * relay/companion flows are mutually exclusive routes in this app — never mounted
 * in the same tab at once — but startRecognition() below still refuses to start
 * while a LiveKit room is live, so the invariant is enforced in code, not just here.
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

/**
 * Both sides may always speak. This was `whoseTurn === side` (walkie-talkie
 * turn-taking), but the baton is a single DB row that strands on whichever side
 * spoke last — a stuck value disables one side forever, and "idle" disables both.
 * ponytail: restore the `whoseTurn === side` check to go back to turn-taking.
 */
export function canSpeak(_side: Exclude<Turn, "idle">, _whoseTurn: Turn): boolean {
  return true;
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
let liveKitRoomActive = false;

/** Called by the video-call page on room join/leave — see the module comment above. */
export function setLiveKitRoomActive(active: boolean) {
  liveKitRoomActive = active;
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
  if (liveKitRoomActive) {
    opts.onError("A video call is active — speech recognition is unavailable until it ends.");
    return null;
  }

  const Ctor = getRecognitionCtor();
  if (!Ctor) {
    opts.onError("Speech recognition unavailable in this browser — use the typed fallback.");
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

  activeRecognition = recognition;
  recognition.start();
  return { stop: () => recognition.stop() };
}
