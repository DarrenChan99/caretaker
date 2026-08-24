"use client";

import { useCallback, useRef, useState } from "react";
import Vapi from "@vapi-ai/web";
import {
  WAKE_TOOLS,
  interpreterSystemPrompt,
  standbySystemPrompt,
} from "@/lib/vapi/interpreterPrompt";

export type TranscriptRole = "source" | "translation";
export type OnTranscript = (text: string, role: TranscriptRole) => void;

/** Asked for by a person on this side of the call, via the wake phrase. */
export type OnWakeRequest = (wantsTranslation: boolean) => void;

/**
 * Runs a Vapi call configured as a live interpreter (see interpreterPrompt.ts), fed this
 * side's own mic track directly (via Daily's `audioSource` option, exposed through Vapi's
 * constructor) instead of letting Vapi acquire its own — no second mic permission prompt,
 * and it stays in sync with whatever the LiveKit call is publishing.
 *
 * The call opens in STANDBY: muted, on a prompt that forbids speech, listening only for
 * someone asking to be translated. That request arrives as a tool call, which the caller
 * turns back into setActive(true) — for both sides of the call, not just this one. Mode
 * changes are live-call-control messages, so nothing is torn down and the mic is never
 * re-requested.
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
  const langsRef = useRef<{ source: "zh" | "en"; target: "zh" | "en" } | null>(null);
  const [translatedTrack, setTranslatedTrack] = useState<MediaStreamTrack | null>(null);
  const [active, setActive] = useState(false);

  /**
   * Swaps the interpreter between standby and translating. The system message steers the
   * model; the mute control is the belt to that braces — it guarantees silence in standby
   * even if the model ignores its prompt.
   */
  const setTranslating = useCallback((on: boolean) => {
    const client = clientRef.current;
    const langs = langsRef.current;
    if (!client || !langs) return;

    client.send({
      type: "add-message",
      message: {
        role: "system",
        content: on ? interpreterSystemPrompt(langs.source, langs.target) : standbySystemPrompt(),
      },
      triggerResponseEnabled: false,
    });
    client.send({ type: "control", control: on ? "unmute-assistant" : "mute-assistant" });
    setActive(on);
  }, []);

  const start = useCallback(
    (
      micTrack: MediaStreamTrack,
      sourceLang: "zh" | "en",
      targetLang: "zh" | "en",
      onTranscript?: OnTranscript,
      onWakeRequest?: OnWakeRequest,
    ) => {
      const key = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
      const baseAssistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
      if (!key || !baseAssistantId) return;

      const client = new Vapi(key, undefined, undefined, { audioSource: micTrack });
      clientRef.current = client;
      langsRef.current = { source: sourceLang, target: targetLang };

      client.on("message", (message: unknown) => {
        if (typeof message !== "object" || message === null) return;
        const m = message as {
          type?: string;
          transcriptType?: string;
          transcript?: string;
          role?: string;
          toolCallList?: { id?: string; function?: { name?: string } }[];
        };

        if (m.type === "transcript" && m.transcriptType === "final" && typeof m.transcript === "string") {
          onTranscript?.(m.transcript, m.role === "assistant" ? "translation" : "source");
          return;
        }

        // Someone asked to be translated. The model decides this, so it survives a
        // garbled transcript and any phrasing in either language.
        if (m.type === "tool-calls" && Array.isArray(m.toolCallList)) {
          for (const call of m.toolCallList) {
            const name = call.function?.name;
            if (name !== WAKE_TOOLS.start && name !== WAKE_TOOLS.stop) continue;
            onWakeRequest?.(name === WAKE_TOOLS.start);
            // Acknowledge so the model is not left waiting on a result it will never get.
            if (call.id) {
              client.send({
                type: "add-message",
                message: { role: "tool", tool_call_id: call.id, content: "ok" },
                triggerResponseEnabled: false,
              });
            }
          }
        }
      });

      void client
        .start(baseAssistantId, {
          model: {
            provider: "openai",
            model: "gpt-4o-mini",
            messages: [{ role: "system", content: standbySystemPrompt() }],
            tools: [
              wakeTool(WAKE_TOOLS.start, "Start speaking live translation for the call."),
              wakeTool(WAKE_TOOLS.stop, "Stop translating and go back to silence."),
            ],
          },
          // clientMessages is left at the assistant's default, which already includes
          // both "transcript" and "tool-calls" (see the documented default in
          // @vapi-ai/web/dist/api.d.ts). Overriding it here is also impossible without
          // a cast — the generated DTO types the field as one value, not a list.
          firstMessageMode: "assistant-waits-for-user",
        })
        .then(() => {
          // Standby from the first moment: it must hear the room without being heard.
          client.send({ type: "control", control: "mute-assistant" });

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
    langsRef.current = null;
    setTranslatedTrack(null);
    setActive(false);
  }, []);

  return { start, stop, setTranslating, translatedTrack, active };
}

/** A no-argument client-side tool: no server URL, so Vapi forwards the call to us. */
function wakeTool(name: string, description: string) {
  return {
    type: "function" as const,
    function: {
      name,
      description,
      parameters: { type: "object" as const, properties: {} },
    },
  };
}
