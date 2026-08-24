"use client";

import { useEffect, useRef, useState } from "react";
import { Room, Track } from "livekit-client";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import { useVapiInterpreter } from "@/lib/vapi/interpreter";
import { setLiveKitRoomActive } from "@/lib/audio/session";

export interface TranscriptEntry {
  speaker: "family" | "popo";
  lang: "zh" | "en";
  kind: "source" | "translation";
  text: string;
  at: number;
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
  const transcriptRef = useRef<TranscriptEntry[]>([]);
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

  useEffect(() => {
    if (!interpreter.translatedTrack) return;
    void room.localParticipant.publishTrack(interpreter.translatedTrack, { name: "interpreter-audio" });
  }, [interpreter.translatedTrack, room]);

  async function handleConnected() {
    setLiveKitRoomActive(true);
    const micTrack = room.localParticipant.getTrackPublication(Track.Source.Microphone)?.track
      ?.mediaStreamTrack;
    if (!micTrack) return;
    interpreter.start(micTrack.clone(), sourceLang, targetLang, (text, kind) => {
      transcriptRef.current.push({
        speaker: side,
        lang: kind === "source" ? sourceLang : targetLang,
        kind,
        text,
        at: Date.now(),
      });
    });
  }

  async function handleDisconnected() {
    setLiveKitRoomActive(false);
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
    <div className="h-dvh w-full">
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
        <VideoConference />
      </LiveKitRoom>
    </div>
  );
}
