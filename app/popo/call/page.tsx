"use client";

import { useState } from "react";
import { Phone } from "lucide-react";
import { zhHK } from "@/lib/i18n/zh-HK";

// Vapi companion wiring is Phase 2 (§11, step 10) — this ships the idle shell only.
export default function PopoCallPage() {
  const [tried, setTried] = useState(false);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-[calc(24px*var(--scale))] px-8 text-center">
      <button
        onClick={() => setTried(true)}
        className="flex flex-col items-center justify-center gap-[calc(12px*var(--scale))] rounded-full bg-[var(--sage)] text-white"
        style={{ width: "calc(200px * var(--scale))", height: "calc(200px * var(--scale))" }}
      >
        <Phone size={64} />
      </button>
      <p className="font-[family-name:var(--font-zh-sans)] text-[calc(32px*var(--scale))] font-medium text-[var(--ink)]">
        {zhHK.chat}
      </p>
      {tried && (
        <p className="max-w-[18ch] font-[family-name:var(--font-zh-sans)] text-[calc(24px*var(--scale))] text-[var(--ink)]">
Chat isn&apos;t available yet, please wait
        </p>
      )}
    </div>
  );
}
