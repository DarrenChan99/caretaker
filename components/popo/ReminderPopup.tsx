"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Droplets, Pill } from "lucide-react";
import { zhHK } from "@/lib/i18n/zh-HK";
import { playTts } from "@/lib/relay/playTts";
import { confirmMedFromReminder } from "@/app/popo/actions";

/**
 * Water + medication nudge. Mounted once in the Popo layout so it draws over every
 * screen she can be on, the games iframe included.
 *
 * Fires once, 30 seconds after this app instance loads, then never again until the
 * page reloads or a new tab opens. The real schedule is medications.scheduledTime —
 * swap this constant for that lookup before this goes near an actual resident.
 */
const REMINDER_DELAY_MS = 30_000;

/** How long her answer stays on screen before the card clears itself. */
const ACK_MS = 2600;

type Phase = "hidden" | "asking" | "thanks" | "later";

export function ReminderPopup() {
  const [phase, setPhase] = useState<Phase>("hidden");
  const ackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Never interrupt an answer she is already looking at.
      setPhase((current) => (current === "hidden" ? "asking" : current));
    }, REMINDER_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Read it out loud — she should not have to be looking at the screen to catch it.
    if (phase === "asking") void playTts(zhHK.reminderQuestion);
  }, [phase]);

  useEffect(() => () => { if (ackTimer.current) clearTimeout(ackTimer.current); }, []);

  const answer = useCallback((taken: boolean) => {
    setPhase(taken ? "thanks" : "later");
    if (taken) void confirmMedFromReminder();
    ackTimer.current = setTimeout(() => setPhase("hidden"), ACK_MS);
  }, []);

  if (phase === "hidden") return null;

  return (
    <div
      role="dialog"
      aria-live="assertive"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-[calc(20px*var(--scale))]"
    >
      <div className="flex w-full max-w-[640px] flex-col items-center gap-[calc(20px*var(--scale))] rounded-[24px] border-2 border-[var(--sage)] bg-[var(--paper)] px-[calc(28px*var(--scale))] py-[calc(32px*var(--scale))] text-center">
        <div className="flex items-center gap-[calc(16px*var(--scale))] text-[var(--sage-deep)]">
          <Droplets size={48} />
          <Pill size={48} />
        </div>

        {phase === "asking" ? (
          <>
            <p className="font-[family-name:var(--font-zh-sans)] text-[calc(24px*var(--scale))] text-[var(--ink)] opacity-70">
              {zhHK.reminderTitle}
            </p>
            <p className="font-[family-name:var(--font-zh-sans)] text-[calc(40px*var(--scale))] font-bold leading-[1.3] text-[var(--ink)]">
              {zhHK.reminderQuestion}
            </p>
            <div className="flex w-full flex-col gap-[calc(16px*var(--scale))]">
              <button
                onClick={() => answer(true)}
                className="min-h-[max(88px,calc(56px*var(--scale)))] rounded-[16px] bg-[var(--sage)] font-[family-name:var(--font-zh-sans)] text-[calc(36px*var(--scale))] font-bold text-white"
              >
                {zhHK.reminderYes}
              </button>
              <button
                onClick={() => answer(false)}
                className="min-h-[max(88px,calc(56px*var(--scale)))] rounded-[16px] border-2 border-[var(--sage)] font-[family-name:var(--font-zh-sans)] text-[calc(36px*var(--scale))] font-medium text-[var(--sage-deep)]"
              >
                {zhHK.reminderNo}
              </button>
            </div>
          </>
        ) : (
          <p className="font-[family-name:var(--font-zh-sans)] text-[calc(40px*var(--scale))] font-bold leading-[1.3] text-[var(--ink)]">
            {phase === "thanks" ? zhHK.reminderThanks : zhHK.reminderLater}
          </p>
        )}
      </div>
    </div>
  );
}
