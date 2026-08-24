"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Room, RoomEvent, Track } from "livekit-client";
import { LiveKitRoom } from "@livekit/components-react";
import { useVapiInterpreter } from "@/lib/vapi/interpreter";
import { setVoiceCallActive } from "@/lib/audio/session";
import { CallStage } from "./CallStage";

export interface TranscriptEntry {
  speaker: "family" | "popo";
  lang: "zh" | "en";
  kind: "source" | "translation";
  text: string;
  at: number;
  /** Whether live interpretation was switched on when this was said. */
  translating: boolean;
}

/**
 * Shared LiveKit call + Vapi live-interpreter wiring for both video-call pages.
 * Each side forks its own mic track into a Vapi interpreter call (see
 * lib/vapi/interpreter.ts) and publishes the interpreter's spoken translation
 * back into the room as a second audio track, so the other participant hears
 * a live translation alongside the raw audio.
 */
export function VideoCallRoom({
  side,
  familyMemberId,
  onEnded,
}: {
  side: "family" | "popo";
  familyMemberId: string;
  onEnded: () => void;
}) {
  const [creds, setCreds] = useState<{ url: string; token: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [room] = useState(() => new Room());
  const [translating, setTranslating] = useState(false);
  const transcriptRef = useRef<TranscriptEntry[]>([]);
  // Display only, and deliberately separate from transcriptRef: each side POSTs its
  // own half at hangup, so folding the peer's turns into the ref would have the
  // server store the conversation twice.
  const [turns, setTurns] = useState<TranscriptEntry[]>([]);
  const translatingRef = useRef(false);
  const interpreter = useVapiInterpreter();
  const sourceLang = side === "family" ? "en" : "zh";
  const targetLang = side === "family" ? "zh" : "en";

  useEffect(() => {
    let cancelled = false;
    fetch("/api/livekit/token", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ familyMemberId, side }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        // The route returns {error} on missing LiveKit config; storing that
        // unconditionally used to render <LiveKitRoom token={undefined}> — a
        // blank screen with no clue why.
        if (!data?.token || !data?.url) {
          setError(data?.error ?? "Could not start the call");
          return;
        }
        setCreds(data);
      })
      .catch(() => {
        if (!cancelled) setError("Could not reach the call server");
      });
    return () => {
      cancelled = true;
    };
  }, [familyMemberId, side]);

  // onDisconnected is not guaranteed to run — navigating away mid-call unmounts us
  // first, and the flag is module state, so a missed clear kills speech recognition
  // for the rest of the tab's life.
  useEffect(() => () => setVoiceCallActive(false), []);

  useEffect(() => {
    if (!interpreter.translatedTrack) return;
    void room.localParticipant.publishTrack(interpreter.translatedTrack, { name: "interpreter-audio" });
  }, [interpreter.translatedTrack, room]);

  /**
   * Turning translation on has to happen on BOTH sides at once: each side's interpreter
   * only ever hears its own mic, so one person asking has to switch on the other
   * direction too. `mirror` is false when the request arrived from the peer, which is
   * what stops the two clients bouncing it back and forth forever.
   */
  const applyTranslating = useCallback(
    (on: boolean, mirror: boolean) => {
      translatingRef.current = on;
      setTranslating(on);
      interpreter.setTranslating(on);
      if (!mirror) return;
      void room.localParticipant
        .publishData(new TextEncoder().encode(JSON.stringify({ t: "translate", on })), {
          reliable: true,
        })
        .catch(() => {});
    },
    [interpreter, room],
  );

  useEffect(() => {
    const onData = (payload: Uint8Array) => {
      try {
        const msg = JSON.parse(new TextDecoder().decode(payload)) as {
          t?: string;
          on?: boolean;
          e?: TranscriptEntry;
        };
        if (msg.t === "translate" && typeof msg.on === "boolean") applyTranslating(msg.on, false);
        // Each side's interpreter only ever hears its own mic, so without this the
        // transcript lane would show half a conversation.
        if (msg.t === "transcript" && msg.e) {
          const entry = msg.e;
          setTurns((prev) => [...prev, entry]);
        }
      } catch {
        // Not ours — other features may share the data channel.
      }
    };
    room.on(RoomEvent.DataReceived, onData);
    return () => {
      room.off(RoomEvent.DataReceived, onData);
    };
  }, [room, applyTranslating]);

  async function handleConnected() {
    setVoiceCallActive(true);
    const micTrack = room.localParticipant.getTrackPublication(Track.Source.Microphone)?.track
      ?.mediaStreamTrack;
    if (!micTrack) return;
    interpreter.start(
      micTrack.clone(),
      sourceLang,
      targetLang,
      (text, kind) => {
        const entry: TranscriptEntry = {
          speaker: side,
          lang: kind === "source" ? sourceLang : targetLang,
          kind,
          text,
          at: Date.now(),
          translating: translatingRef.current,
        };
        transcriptRef.current.push(entry);
        setTurns((prev) => [...prev, entry]);
        void room.localParticipant
          .publishData(new TextEncoder().encode(JSON.stringify({ t: "transcript", e: entry })), {
            reliable: true,
          })
          .catch(() => {});
      },
      (wantsTranslation) => applyTranslating(wantsTranslation, true),
    );
  }

  async function handleDisconnected() {
    setVoiceCallActive(false);
    interpreter.stop();
    await fetch("/api/video-call/end", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ familyMemberId, transcript: transcriptRef.current }),
    }).catch(() => {});
    onEnded();
  }

  if (error) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-8 text-center">
        <p className="text-[17px] font-medium text-[var(--ink)]">{error}</p>
        <button
          onClick={onEnded}
          className="min-h-[44px] rounded-[8px] border border-[var(--hairline)] bg-[var(--paper)] px-5 text-[15px] text-[var(--ink)]"
        >
          Back
        </button>
      </div>
    );
  }

  if (!creds) return <p className="p-8 text-center text-[15px] text-[var(--ink-soft)]">Connecting…</p>;

  return (
    <div className="relative h-dvh w-full">
      <LiveKitRoom
        room={room}
        serverUrl={creds.url}
        token={creds.token}
        connect
        audio
        video
        onConnected={handleConnected}
        onDisconnected={handleDisconnected}
        data-lk-theme="default"
        style={{ height: "100%" }}
      >
        <CallStage
          side={side}
          translating={translating}
          onToggleTranslate={() => applyTranslating(!translating, true)}
          turns={turns}
          onEnd={() => void room.disconnect()}
        />
      </LiveKitRoom>
    </div>
  );
}

