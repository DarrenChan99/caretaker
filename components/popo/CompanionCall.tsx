"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, PhoneOff, Home } from "lucide-react";
import { buildCompanionAssistant } from "@/lib/vapi/companionConfig";
import { setVoiceCallActive } from "@/lib/audio/session";
import { zhHK } from "@/lib/i18n/zh-HK";
import type { CompanionVariables } from "@/lib/vapi/systemPrompt";

type Status = "idle" | "connecting" | "live" | "ended" | "error";

type Turn = { role: string; text: string };

type VapiLike = {
  start: (assistant: Record<string, unknown>) => Promise<unknown>;
  stop: () => void;
  on: (event: string, cb: (payload: unknown) => void) => void;
};

/**
 * The call Popo actually taps: one button, one voice, nothing to read. The prompt
 * pane, the editable fields and the live transcript all stay on /demo/companion —
 * she never needs to see how it is built.
 */
export function CompanionCall({ vars }: { vars: Partial<CompanionVariables> }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const vapiRef = useRef<VapiLike | null>(null);
  const turnsRef = useRef<Turn[]>([]);

  // A companion call holds the mic exactly like a LiveKit room does, so it takes the
  // same lock — and clears it on unmount, not just on a clean hangup.
  useEffect(() => {
    return () => {
      vapiRef.current?.stop();
      setVoiceCallActive(false);
    };
  }, []);

  async function persist() {
    if (turnsRef.current.length === 0) return;
    await fetch("/api/companion/end", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ transcript: turnsRef.current }),
    }).catch(() => {});
    turnsRef.current = [];
  }

  async function startCall() {
    if (!process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY) {
      setStatus("error");
      return;
    }
    setStatus("connecting");
    turnsRef.current = [];
    try {
      const { default: Vapi } = await import("@vapi-ai/web");
      const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY) as unknown as VapiLike;
      vapiRef.current = vapi;

      vapi.on("call-start", () => {
        setVoiceCallActive(true);
        setStatus("live");
      });
      vapi.on("call-end", () => {
        setVoiceCallActive(false);
        setStatus("ended");
        void persist();
      });
      vapi.on("error", () => {
        setVoiceCallActive(false);
        setStatus("error");
      });
      vapi.on("message", (msg) => {
        const m = msg as { type?: string; transcriptType?: string; role?: string; transcript?: string };
        if (m.type !== "transcript" || m.transcriptType !== "final" || !m.transcript) return;
        turnsRef.current.push({ role: m.role ?? "user", text: m.transcript });
      });

      await vapi.start(buildCompanionAssistant(vars));
    } catch {
      setVoiceCallActive(false);
      setStatus("error");
    }
  }

  function endCall() {
    vapiRef.current?.stop();
    setVoiceCallActive(false);
    setStatus("ended");
    void persist();
  }

  if (status === "live" || status === "connecting") {
    return (
      <Screen>
        <p className="font-[family-name:var(--font-zh-sans)] text-[calc(32px*var(--scale))] font-bold text-[var(--ink)]">
          {status === "live" ? zhHK.companionLive : zhHK.companionConnecting}
        </p>
        <button
          onClick={endCall}
          className="flex w-[calc(200px*var(--scale))] flex-col items-center justify-center gap-2 rounded-full bg-[#8a3a3a] text-white"
          style={{ height: "calc(200px * var(--scale))" }}
        >
          <PhoneOff size={64} />
          <span className="font-[family-name:var(--font-zh-sans)] text-[calc(28px*var(--scale))] font-medium">
            {zhHK.hangUp}
          </span>
        </button>
      </Screen>
    );
  }

  return (
    <Screen>
      {status === "error" && (
        <p className="max-w-[18ch] font-[family-name:var(--font-zh-sans)] text-[calc(24px*var(--scale))] leading-[1.7] text-[var(--ink-soft)]">
          {zhHK.companionUnavailable}
        </p>
      )}
      <button
        onClick={startCall}
        className="flex w-[calc(200px*var(--scale))] flex-col items-center justify-center gap-2 rounded-full bg-[var(--sage)] text-white"
        style={{ height: "calc(200px * var(--scale))" }}
      >
        <Heart size={64} />
      </button>
      <p className="max-w-[18ch] font-[family-name:var(--font-zh-sans)] text-[calc(32px*var(--scale))] font-medium text-[var(--ink)]">
        {status === "ended" ? zhHK.companionAgain : zhHK.homeCompanion}
      </p>
      <button
        onClick={() => router.push("/popo")}
        className="flex min-h-[max(72px,calc(44px*var(--scale)))] items-center gap-2 rounded-[16px] border-2 border-[var(--sage)] bg-[var(--paper)] px-6 font-[family-name:var(--font-zh-sans)] text-[calc(24px*var(--scale))] text-[var(--sage-deep)]"
      >
        <Home size={32} />
        {zhHK.backHome}
      </button>
    </Screen>
  );
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-[calc(32px*var(--scale))] bg-[var(--cream)] px-8 text-center">
      {children}
    </div>
  );
}
