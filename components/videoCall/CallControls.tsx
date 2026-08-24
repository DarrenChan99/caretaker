"use client";

import type { LucideIcon } from "lucide-react";

/** Levels the Softer/Louder pair steps through. Index maps to RoomAudioRenderer volume. */
export const VOLUME_STEPS = [0.25, 0.5, 0.75, 1] as const;

/**
 * The shared control shape: a circle on the video surface. Popo's are 96px and
 * labelled, the family's are 44px and unlabelled — same vocabulary, two scales.
 *
 * `off` is deliberately a filled cream disc rather than a dimmed one, so a muted
 * input reads as a solid object you switched, not as something broken.
 */
export function CircleButton({
  icon: Icon,
  label,
  onClick,
  size,
  off = false,
  disabled = false,
  tone = "default",
  pressed,
}: {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  size: "popo" | "family";
  off?: boolean;
  disabled?: boolean;
  tone?: "default" | "destructive";
  pressed?: boolean;
}) {
  const isPopo = size === "popo";
  const px = isPopo ? "calc(66px * var(--scale))" : "44px";
  const iconPx = isPopo ? "calc(30px * var(--scale))" : 20;

  const background = disabled
    ? "rgba(255,255,255,0.07)"
    : tone === "destructive"
      ? "var(--surface-destructive)"
      : off
        ? "var(--cream)"
        : "rgba(255,255,255,0.16)";
  const color = disabled
    ? "rgba(255,255,255,0.3)"
    : off && tone !== "destructive"
      ? "var(--green-900)"
      : "#fff";

  return (
    <span className="flex flex-col items-center gap-[6px]">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        aria-pressed={pressed}
        className="flex shrink-0 items-center justify-center rounded-full border-2 disabled:cursor-not-allowed"
        style={{
          width: px,
          height: px,
          background,
          color,
          borderColor: disabled
            ? "transparent"
            : off || tone === "destructive"
              ? "transparent"
              : "rgba(255,255,255,0.34)",
        }}
      >
        <Icon size={typeof iconPx === "number" ? iconPx : undefined} style={typeof iconPx === "string" ? { width: iconPx, height: iconPx } : undefined} strokeWidth={2.4} />
      </button>
      {/* Popo's controls are never icon-only — she gets the word too. */}
      {isPopo && (
        <span
          className="font-[family-name:var(--font-zh-sans)] font-medium text-white"
          style={{ fontSize: "calc(15px * var(--scale))" }}
        >
          {label}
        </span>
      )}
    </span>
  );
}

/**
 * Four bars, no numbers. The only feedback the volume pair gives — a percentage
 * would be a number to decode, and there is nothing to decode here.
 */
export function VolumeLevel({ level }: { level: number }) {
  return (
    <span
      aria-hidden
      className="flex shrink-0 items-end gap-[4px]"
      style={{ height: "calc(40px * var(--scale))" }}
    >
      {[14, 22, 30, 38].map((h, i) => (
        <span
          key={h}
          className="rounded-[2px]"
          style={{
            width: "calc(7px * var(--scale))",
            height: `calc(${h}px * var(--scale))`,
            background: i <= level ? "var(--green-200)" : "rgba(255,255,255,0.22)",
          }}
        />
      ))}
    </span>
  );
}

/** Ending a call is ordinary, so it takes ink — never red. */
export function EndPill({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[44px] shrink-0 items-center gap-2 rounded-full border px-[18px] text-[14px] font-medium text-white"
      style={{ background: "var(--surface-destructive)", borderColor: "rgba(255,255,255,0.28)" }}
    >
      <Icon size={18} />
      {label}
    </button>
  );
}
