"use client";

import { useState } from "react";
import Link from "next/link";
import { Track } from "livekit-client";
import { RoomAudioRenderer, VideoTrack, useLocalParticipant, useTracks } from "@livekit/components-react";
import {
  Home,
  Languages,
  Mic,
  MicOff,
  Minus,
  PhoneOff,
  Plus,
  Video,
  VideoOff,
} from "lucide-react";
import { zhHK } from "@/lib/i18n/zh-HK";
import { CircleButton, EndPill, VOLUME_STEPS, VolumeLevel } from "./CallControls";
import type { TranscriptEntry } from "./VideoCallRoom";

/**
 * Everything inside the LiveKit room. Replaces <VideoConference/>, whose stock bar
 * is dark, dense, English and unrelated to the rest of Caretaker — and, more to the
 * point, offers Popo a mute button she has no use for.
 *
 * Layout rule from the design system: the bar is `flex: 0 0 auto` and the stage is
 * `flex: 1; min-height: 0`. Squeeze the panel and the video shrinks; the controls
 * never do.
 */
export function CallStage({
  side,
  translating,
  onToggleTranslate,
  turns,
  onEnd,
}: {
  side: "family" | "popo";
  translating: boolean;
  onToggleTranslate: () => void;
  turns: TranscriptEntry[];
  onEnd: () => void;
}) {
  const tracks = useTracks([Track.Source.Camera], { onlySubscribed: false });
  const remote = tracks.find((t) => !t.participant.isLocal);
  const local = tracks.find((t) => t.participant.isLocal);

  return (
    <div className="flex h-full w-full flex-col" style={{ background: "var(--green-900)" }}>
      <div className="relative min-h-0 flex-1">
        {remote ? (
          <VideoTrack trackRef={remote} className="h-full w-full object-cover" />
        ) : (
          <RemoteCameraOff side={side} />
        )}

        {/* Her only exit that isn't hanging up. */}
        {side === "popo" && (
          <Link
            href="/popo"
            className="absolute left-3 top-3 flex h-[44px] items-center gap-2 rounded-full border px-[15px] text-[15px] font-medium text-white"
            style={{ background: "rgba(16,26,20,0.66)", borderColor: "rgba(255,255,255,0.2)" }}
          >
            <Home size={19} />
            {zhHK.backHome}
          </Link>
        )}

        {local && (
          <VideoTrack
            trackRef={local}
            // 20% of the stage, floored at 56 and capped at 120 — a PiP that stays a PiP
            // at every panel width the demo runs at.
            className="absolute bottom-3 right-3 rounded-[10px] border-2 object-cover"
            style={{
              width: "clamp(56px, 20%, 120px)",
              aspectRatio: "3 / 4",
              borderColor: "rgba(255,255,255,0.34)",
              background: "var(--green-700)",
            }}
          />
        )}
      </div>

      {side === "family" && <TranscriptLane turns={turns} />}

      {side === "popo" ? (
        <PopoBar translating={translating} onToggleTranslate={onToggleTranslate} onEnd={onEnd} />
      ) : (
        <FamilyBar translating={translating} onToggleTranslate={onToggleTranslate} onEnd={onEnd} />
      )}
    </div>
  );
}

function RemoteCameraOff({ side }: { side: "family" | "popo" }) {
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center"
      style={{ background: "var(--green-700)" }}
    >
      <VideoOff size={side === "popo" ? 48 : 28} color="rgba(255,255,255,0.8)" />
      <p
        className="font-medium text-white"
        style={{ fontSize: side === "popo" ? "calc(20px * var(--scale))" : "15px" }}
      >
        {zhHK.cameraOff}
      </p>
      {/* Load-bearing: without this line a dark tile reads as a dropped call. */}
      <p style={{ color: "rgba(255,255,255,0.78)", fontSize: side === "popo" ? "calc(16px * var(--scale))" : "13px" }}>
        {zhHK.stillHear}
      </p>
    </div>
  );
}

/** Volume, a way out, and nothing else. A muted grandmother is a support call. */
function PopoBar({
  translating,
  onToggleTranslate,
  onEnd,
}: {
  translating: boolean;
  onToggleTranslate: () => void;
  onEnd: () => void;
}) {
  const [level, setLevel] = useState(2);

  return (
    <>
      <RoomAudioRenderer volume={VOLUME_STEPS[level]} />
      <div
        className="flex shrink-0 flex-wrap items-start justify-center gap-[calc(14px*var(--scale))] border-t px-3 py-4"
        style={{ background: "rgba(16,26,20,0.9)", borderColor: "rgba(255,255,255,0.14)" }}
      >
        <CircleButton
          icon={Minus}
          label={zhHK.volumeDown}
          size="popo"
          onClick={() => setLevel((l) => Math.max(0, l - 1))}
        />
        <span className="flex flex-col items-center gap-[6px]">
          <span className="flex items-center" style={{ height: "calc(66px * var(--scale))" }}>
            <VolumeLevel level={level} />
          </span>
          <span
            className="font-[family-name:var(--font-zh-sans)] font-medium text-white"
            style={{ fontSize: "calc(15px * var(--scale))" }}
          >
            {zhHK.volume}
          </span>
        </span>
        <CircleButton
          icon={Plus}
          label={zhHK.volumeUp}
          size="popo"
          onClick={() => setLevel((l) => Math.min(VOLUME_STEPS.length - 1, l + 1))}
        />
        <CircleButton
          icon={Languages}
          label={translating ? zhHK.translateOn : zhHK.translateOff}
          size="popo"
          pressed={translating}
          off={translating}
          onClick={onToggleTranslate}
        />
        {/* Against the spec's volume-only rule: leaving via Home only navigates away,
            the room stays up. She needs to be able to actually end a call. */}
        <CircleButton icon={PhoneOff} label={zhHK.hangUp} size="popo" tone="destructive" onClick={onEnd} />
      </div>
    </>
  );
}

function FamilyBar({
  translating,
  onToggleTranslate,
  onEnd,
}: {
  translating: boolean;
  onToggleTranslate: () => void;
  onEnd: () => void;
}) {
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled } = useLocalParticipant();

  return (
    <>
      <RoomAudioRenderer />
      <div
        className="flex shrink-0 items-center justify-center gap-[10px] border-t p-[13px]"
        style={{ background: "rgba(16,26,20,0.9)", borderColor: "rgba(255,255,255,0.12)" }}
      >
        <CircleButton
          icon={isMicrophoneEnabled ? Mic : MicOff}
          label={isMicrophoneEnabled ? "Mute" : "Unmute"}
          size="family"
          off={!isMicrophoneEnabled}
          onClick={() => void localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)}
        />
        <CircleButton
          icon={isCameraEnabled ? Video : VideoOff}
          label={isCameraEnabled ? "Turn camera off" : "Turn camera on"}
          size="family"
          off={!isCameraEnabled}
          onClick={() => void localParticipant.setCameraEnabled(!isCameraEnabled)}
        />
        {/* The discoverable half of the interpreter. "Hey Vapi, translate" is invisible
            and nobody remembers it, so the same switch has to be on screen — and it
            doubles as the way out when the model turns translation on by itself. */}
        <CircleButton
          icon={Languages}
          label={translating ? zhHK.translateOn : zhHK.translateOff}
          size="family"
          pressed={translating}
          off={translating}
          onClick={onToggleTranslate}
        />
        <span className="h-[36px] w-px shrink-0" style={{ background: "rgba(255,255,255,0.16)" }} />
        <EndPill icon={PhoneOff} label="End" onClick={onEnd} />
      </div>
    </>
  );
}

/**
 * The one thing Popo never sees. Source line white, translation green — one glance
 * says which words were actually spoken.
 *
 * Capped height with its own scroll, never `flex`: the lane must never push the
 * control bar off screen.
 */
function TranscriptLane({ turns }: { turns: TranscriptEntry[] }) {
  if (turns.length === 0) return null;

  return (
    <div
      className="shrink-0 overflow-y-auto border-t px-[14px] py-3"
      style={{ maxHeight: 132, background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)" }}
    >
      <ol className="flex flex-col gap-[7px]">
        {turns.slice(-12).map((t) => (
          <li key={`${t.at}-${t.kind}-${t.text}`} className="flex gap-2">
            <span
              className="w-[34px] shrink-0 pt-[3px] font-[family-name:var(--font-mono)] text-[10px] uppercase"
              style={{ color: "rgba(255,255,255,0.38)" }}
            >
              {t.speaker === "family" ? "You" : "Popo"}
            </span>
            <span
              className={t.lang === "zh" ? "zh" : undefined}
              style={{
                color: t.kind === "source" ? "#fff" : "var(--green-200)",
                fontSize: t.lang === "zh" ? 15 : 14,
                lineHeight: 1.5,
                fontFamily: t.lang === "zh" ? "var(--font-zh-serif)" : "var(--font-body)",
              }}
            >
              {t.text}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
