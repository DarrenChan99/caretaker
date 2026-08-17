"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Radio } from "lucide-react";
import { canSpeak, startRecognition } from "@/lib/audio/session";
import { useRelayStream, type RelayMessage } from "@/lib/relay/useRelayStream";
import { useRelayMode } from "@/lib/relay/useRelayMode";

export default function FamilyRelayPage() {
  const { whoseTurn, status, lastMessageId } = useRelayStream();
  const { mode, setMode } = useRelayMode();
  const [messages, setMessages] = useState<RelayMessage[]>([]);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [sending, setSending] = useState(false);
  const [typed, setTyped] = useState("");
  const stopRef = useRef<{ stop: () => void } | null>(null);

  function refresh() {
    fetch("/api/relay/messages")
      .then((r) => r.json())
      .then(setMessages);
  }

  useEffect(refresh, []);
  useEffect(() => {
    if (lastMessageId) refresh();
  }, [lastMessageId]);

  async function send(textEn: string) {
    if (!textEn.trim()) return;
    setSending(true);
    setInterim("");
    setTyped("");
    await fetch("/api/relay/send", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ textEn, mode }),
    });
    setSending(false);
    refresh();
  }

  function toggleMic() {
    if (listening) {
      stopRef.current?.stop();
      setListening(false);
      return;
    }
    if (!canSpeak("family", whoseTurn)) return;
    setListening(true);
    setInterim("");
    const handle = startRecognition({
      lang: "en-US",
      onInterim: setInterim,
      onFinal: (text) => {
        setListening(false);
        send(text);
      },
      onError: () => setListening(false),
    });
    stopRef.current = handle;
  }

  const disabled = !canSpeak("family", whoseTurn) || sending;

  return (
    <div className="relative flex flex-col gap-6 pb-8">
      <div className="absolute right-0 top-0 flex items-center gap-1.5">
        <span
          className="h-2 w-2 rounded-full"
          style={{ background: status === "connected" ? "var(--sage)" : "var(--amber)" }}
        />
        <span className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.06em] text-[var(--ink-soft)]">
          {status === "connected" ? "Connected" : "Reconnecting"}
        </span>
      </div>

      <div className="flex items-center justify-between pt-8">
        <h1 className="font-[family-name:var(--font-display)] text-[20px] font-semibold">
          Speak to Popo
        </h1>
        <div className="flex items-center gap-2 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.06em]">
          <button
            onClick={() => setMode("message")}
            className={mode === "message" ? "text-[var(--sage-deep)]" : "text-[var(--ink-soft)]"}
          >
            Message
          </button>
          /
          <button
            onClick={() => setMode("voice")}
            className={mode === "voice" ? "text-[var(--sage-deep)]" : "text-[var(--ink-soft)]"}
          >
            Voice
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 rounded-[12px] border border-[var(--hairline)] bg-[var(--paper)] py-6 shadow-[var(--shadow-card)]">
        <button
          onClick={toggleMic}
          disabled={disabled}
          className="flex h-40 w-40 items-center justify-center rounded-full text-white transition-colors disabled:opacity-40"
          style={{ background: listening ? "var(--amber)" : "var(--sage)" }}
        >
          <Mic size={48} />
        </button>
        <p className="max-w-[280px] text-center text-[15px] text-[var(--ink)]">
          {listening
            ? interim || "Listening…"
            : disabled && !sending
              ? "Waiting for Popo's reply…"
              : "Hold to speak. Popo hears you in Cantonese."}
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(typed);
        }}
        className="flex gap-2"
      >
        <input
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          disabled={disabled}
          placeholder="Type instead…"
          className="flex-1 rounded-[8px] border border-[var(--hairline)] bg-[var(--paper)] px-3 py-2 text-[15px] disabled:opacity-40"
        />
        <button
          type="submit"
          disabled={disabled}
          className="rounded-[8px] bg-[var(--sage)] px-4 text-[15px] text-white disabled:opacity-40"
        >
          Send
        </button>
      </form>

      <div className="flex flex-col gap-3">
        {messages.length === 0 && (
          <p className="text-[15px] text-[var(--ink-soft)]">
            No conversations yet. Start one above.
          </p>
        )}
        {messages.map((m) => {
          const fromKen = m.senderNameEn === "Ken";
          return (
            <div
              key={m.id}
              className={`flex flex-col gap-1 rounded-[8px] px-3 py-2 ${fromKen ? "ml-8 self-end bg-[var(--sage)]/8" : "mr-8 self-start bg-[var(--sage)]/8"}`}
            >
              {fromKen ? (
                <>
                  <p className="text-[15px] text-[var(--ink)]">{m.textEn}</p>
                  <p className="zh text-[24px] text-[var(--sage-deep)]">{m.textZh}</p>
                  <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.06em] text-[var(--ink-soft)]">
                    {m.playedAt
                      ? `Played on Popo's screen ${new Date(m.playedAt).toLocaleTimeString()}`
                      : "Sending to Popo"}
                  </p>
                </>
              ) : (
                <>
                  <p className="zh text-[22px] text-[var(--ink)]">{m.textZh}</p>
                  <p className="text-[15px] text-[var(--ink)]/70">{m.textEn}</p>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 rounded-[8px] border border-[var(--hairline)] px-3 py-2 text-[15px] text-[var(--ink-soft)]">
        <Radio size={16} />
        <span>Turn: {whoseTurn}</span>
      </div>
    </div>
  );
}
