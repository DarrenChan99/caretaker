"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, Home, Volume2 } from "lucide-react";
import { canSpeak, startRecognition } from "@/lib/audio/session";
import { useRelayStream } from "@/lib/relay/useRelayStream";
import { playTts } from "@/lib/relay/playTts";
import { zhHK } from "@/lib/i18n/zh-HK";
import type { RelayMessage } from "@/lib/relay/useRelayStream";

type Stage = "loading" | "ringing" | "playing" | "reply-prompt" | "listening" | "sent" | "empty";

export default function PopoRelayPage() {
  const router = useRouter();
  const { whoseTurn } = useRelayStream();
  const [stage, setStage] = useState<Stage>("loading");
  const [message, setMessage] = useState<RelayMessage | null>(null);
  const [typed, setTyped] = useState("");
  const [interim, setInterim] = useState("");

  useEffect(() => {
    fetch("/api/relay/latest")
      .then((r) => r.json())
      .then((row: RelayMessage | null) => {
        setMessage(row);
        setStage(row ? "ringing" : "empty");
      });
  }, []);

  async function answer() {
    if (!message) return;
    setStage("playing");
    await playTts(message.textZh);
    await fetch("/api/relay/played", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: message.id }),
    });
    setStage("reply-prompt");
  }

  function startReply() {
    setStage("listening");
    setInterim("");
    if (!canSpeak("popo", whoseTurn)) {
      // Turn already moved on (e.g. reconnect race) — typed fallback still works.
      return;
    }
    startRecognition({
      lang: "zh-HK",
      onInterim: setInterim,
      onFinal: (text) => sendReply(text),
      onError: () => {
        // calm, silent fallback to the typed input already on screen
      },
    });
  }

  async function sendReply(textZh: string) {
    if (!textZh.trim()) return;
    await fetch("/api/relay/receive", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ textZh }),
    });
    setStage("sent");
  }

  if (stage === "loading") return null;

  if (stage === "empty") {
    return (
      <Screen>
        <p className="text-center font-[family-name:var(--font-zh-sans)] text-[calc(32px*var(--scale))] font-bold">
          {zhHK.noNewsToday}
        </p>
        <HomeButton router={router} />
      </Screen>
    );
  }

  if (stage === "ringing") {
    return (
      <Screen>
        <p className="font-[family-name:var(--font-zh-sans)] text-[calc(32px*var(--scale))] font-bold text-[var(--ink)]">
          {zhHK.incomingCallTitle}
        </p>
        <button
          onClick={answer}
          className="flex min-h-[max(72px,calc(44px*var(--scale)))] w-[calc(200px*var(--scale))] flex-col items-center justify-center gap-2 rounded-full bg-[var(--sage)] text-white"
          style={{ height: "calc(200px * var(--scale))" }}
        >
          <Phone size={64} />
          <span className="font-[family-name:var(--font-zh-sans)] text-[calc(32px*var(--scale))] font-medium">
            {zhHK.answer}
          </span>
        </button>
      </Screen>
    );
  }

  if (stage === "playing") {
    return (
      <Screen>
        <p className="max-w-[18ch] text-center font-[family-name:var(--font-zh-sans)] text-[calc(32px*var(--scale))] leading-[1.7] font-bold text-[var(--ink)]">
          {message?.textZh}
        </p>
      </Screen>
    );
  }

  if (stage === "reply-prompt" || stage === "listening") {
    return (
      <Screen>
        <p className="max-w-[18ch] text-center font-[family-name:var(--font-zh-sans)] text-[calc(28px*var(--scale))] leading-[1.7] text-[var(--ink)]">
          {message?.textZh}
        </p>

        {stage === "listening" && interim && (
          <p className="font-[family-name:var(--font-zh-sans)] text-[calc(24px*var(--scale))] text-[var(--sage-deep)]">
            {interim}
          </p>
        )}

        {stage === "reply-prompt" ? (
          <button
            onClick={startReply}
            className="min-h-[max(72px,calc(44px*var(--scale)))] rounded-[16px] border-2 border-[var(--sage)] bg-[var(--paper)] px-[calc(32px*var(--scale))] py-[calc(16px*var(--scale))] font-[family-name:var(--font-zh-sans)] text-[calc(36px*var(--scale))] font-medium text-[var(--sage-deep)]"
          >
            {zhHK.iWantToSpeak}
          </button>
        ) : (
          <p className="font-[family-name:var(--font-zh-sans)] text-[calc(24px*var(--scale))] text-[var(--sage-deep)]">
            {zhHK.listening}
          </p>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendReply(typed);
          }}
          className="flex w-full gap-2 px-4"
        >
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="Type a reply"
            className="min-h-[max(72px,calc(44px*var(--scale)))] flex-1 rounded-[12px] border-2 border-[var(--sage)] bg-[var(--paper)] px-4 font-[family-name:var(--font-zh-sans)] text-[calc(22px*var(--scale))] text-[var(--ink)]"
          />
          <button
            type="submit"
            className="min-h-[max(72px,calc(44px*var(--scale)))] rounded-[12px] bg-[var(--sage)] px-6 font-[family-name:var(--font-zh-sans)] text-[calc(20px*var(--scale))] text-white"
          >
Send
          </button>
        </form>
      </Screen>
    );
  }

  // sent
  return (
    <Screen>
      <Volume2 size={64} className="text-[var(--sage)]" />
      <p className="font-[family-name:var(--font-zh-sans)] text-[calc(28px*var(--scale))] font-medium text-[var(--ink)]">
Sent to family
      </p>
      <HomeButton router={router} />
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

function HomeButton({ router }: { router: ReturnType<typeof useRouter> }) {
  return (
    <button
      onClick={() => router.push("/popo")}
      className="flex min-h-[max(72px,calc(44px*var(--scale)))] items-center gap-2 rounded-[16px] border-2 border-[var(--sage)] bg-[var(--paper)] px-6 font-[family-name:var(--font-zh-sans)] text-[calc(24px*var(--scale))] text-[var(--sage-deep)]"
    >
      <Home size={32} />
      {zhHK.backHome}
    </button>
  );
}
