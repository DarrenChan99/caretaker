"use client";

import { useEffect, useState } from "react";
import { unlockAudio } from "@/lib/audio/session";
import { zhHK } from "@/lib/i18n/zh-HK";

const KEY = "caretaker.popo.entered";

/**
 * Full-screen tap that unlocks the AudioContext at session start (§1.5). Framed as
 * morning setup, not a modal to dismiss — it only appears once per browser session.
 */
export function EntryGate({ children }: { children: React.ReactNode }) {
  const [entered, setEntered] = useState<boolean | null>(null);

  useEffect(() => {
    setEntered(window.sessionStorage.getItem(KEY) === "1");
  }, []);

  if (entered === null) return null;

  if (!entered) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-[calc(32px*var(--scale))] bg-[var(--cream)] px-8 text-center">
        <p className="font-[family-name:var(--font-zh-sans)] text-[calc(28px*var(--scale))] font-medium text-[var(--ink)]">
          {zhHK.entryHint}
        </p>
        <button
          onClick={() => {
            unlockAudio();
            window.sessionStorage.setItem(KEY, "1");
            setEntered(true);
          }}
          className="min-h-[max(72px,calc(44px*var(--scale)))] rounded-[16px] border-2 border-[var(--sage)] bg-[var(--paper)] px-[calc(48px*var(--scale))] font-[family-name:var(--font-zh-sans)] text-[calc(56px*var(--scale))] font-bold text-[var(--sage-deep)]"
        >
          {zhHK.entryTitle}
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
