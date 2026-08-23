"use client";

import { useCallback, useRef, useState } from "react";
import Vapi from "@vapi-ai/web";
import { interpreterSystemPrompt } from "@/lib/vapi/interpreterPrompt";

export type TranscriptRole = "source" | "translation";
export type OnTranscript = (text: string, role: TranscriptRole) => void;

/**
 * Runs a Vapi call configured as a silent live interpreter (see interpreterPrompt.ts),
 * fed this side's own mic track directly (via Daily's `audioSource` option, exposed
 * through Vapi's constructor) instead of letting Vapi acquire its own — no second mic
 * permission prompt, and it stays in sync with whatever the LiveKit call is publishing.
 *
 * The assistant's synthesized speech comes back as a MediaStreamTrack (Vapi's underlying
 * Daily call emits it as a remote participant's audio track) which the caller publishes
 * into the LiveKit room so the other participant hears the live translation.
 *
 * ponytail: reuses the dashboard companion assistant's configured voice/transcriber
 * (only the LLM system prompt is overridden) — that voice/transcriber was tuned for the
 * Cantonese companion call, not bilingual interpretation, so translation quality/accent
 * may be rough. Swap in a dedicated interpreter assistant in the Vapi dashboard if this
 * goes beyond a demo.
 */
export function useVapiInterpreter() {
  const clientRef = useRef<Vapi | null>(null);
  const [translatedTrack, setTranslatedTrack] = useState<MediaStreamTrack | null>(null);
  const [active, setActive] = useState(false);

  const start = useCallback(
    (micTrack: MediaStreamTrack, sourceLang: "zh" | "en", targetLang: "zh" | "en", onTranscript?: OnTranscript) => {
      const key = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
      const baseAssistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
      if (!key || !baseAssistantId) return;

      const client = new Vapi(key, undefined, undefined, { audioSource: micTrack });
      clientRef.current = client;
      setActive(true);

      client.on("message", (message: unknown) => {
        if (!onTranscript || typeof message !== "object" || message === null) return;
        const m = message as { type?: string; transcriptType?: string; transcript?: string; role?: string };
        if (m.type === "transcript" && m.transcriptType === "final" && typeof m.transcript === "string") {
          onTranscript(m.transcript, m.role === "assistant" ? "translation" : "source");
        }
      });

      void client
        .start(baseAssistantId, {
          model: {
            provider: "openai",
            model: "gpt-4o-mini",
            messages: [{ role: "system", content: interpreterSystemPrompt(sourceLang, targetLang) }],
          },
          firstMessageMode: "assistant-waits-for-user",
        })
        .then(() => {
          const daily = client.getDailyCallObject();
          daily?.on("track-started", (ev) => {
            if (ev.type === "audio" && ev.participant && !ev.participant.local) {
              setTranslatedTrack(ev.track);
            }
          });
        })
        .catch(() => setActive(false));
    },
    [],
  );

  const stop = useCallback(() => {
    void clientRef.current?.stop();
    clientRef.current = null;
    setTranslatedTrack(null);
    setActive(false);
  }, []);

  return { start, stop, translatedTrack, active };
}
