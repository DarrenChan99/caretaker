"use client";

import { useMemo, useRef, useState } from "react";
import { Phone, PhoneOff, Copy, Check, RotateCcw } from "lucide-react";
import {
  COMPANION_FIRST_MESSAGE,
  COMPANION_SYSTEM_PROMPT,
  VARIABLE_FALLBACKS,
  fillPrompt,
  type CompanionVariables,
} from "@/lib/vapi/systemPrompt";
import { buildCompanionAssistant } from "@/lib/vapi/companionConfig";

/**
 * Demo bench: ask for the per-elder details, substitute them into the companion prompt
 * live, then hand that exact filled text to Vapi. Nothing here is persisted — the whole
 * point is that a stranger at the table can retype the name and hear the difference.
 */

interface Field {
  key: keyof CompanionVariables;
  label: string;
  hint: string;
  placeholder: string;
  lines?: number;
}

const FIELDS: Field[] = [
  {
    key: "preferredName",
    label: "What does she like being called?",
    hint: "What her family actually says out loud — not her legal name.",
    placeholder: "婆婆",
  },
  {
    key: "facilityName",
    label: "Where does she live?",
    hint: "Used when telling her who to call for help.",
    placeholder: "Sunrise Skilled Nursing",
  },
  {
    key: "familyMembers",
    label: "Who's in her family?",
    hint: "Names and relationships. The companion can ask after them by name.",
    placeholder: "阿健（孫仔）、阿May（女兒）",
    lines: 2,
  },
  {
    key: "lastCallSummary",
    label: "Anything from last time?",
    hint: "One thread to pick back up, so the call doesn't start from zero.",
    placeholder: "上次佢講起後生時喺深水埗做裁縫。",
    lines: 2,
  },
  {
    key: "medications",
    label: "Medication to mention?",
    hint: "Mentioned once, gently, then dropped. Leave blank and it never comes up.",
    placeholder: "血壓藥，一粒，早餐後，09:00",
    lines: 2,
  },
];

type CallStatus = "idle" | "connecting" | "live" | "ended" | "error";

type VapiLike = {
  start: (assistant: Record<string, unknown>) => Promise<unknown>;
  stop: () => void;
  on: (event: string, cb: (payload: unknown) => void) => void;
};

export function CompanionSetup({ defaults }: { defaults: Partial<CompanionVariables> }) {
  const [vars, setVars] = useState<Partial<CompanionVariables>>(defaults);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<CallStatus>("idle");
  const [note, setNote] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<{ role: string; text: string }[]>([]);
  const vapiRef = useRef<VapiLike | null>(null);

  const filledPrompt = useMemo(() => fillPrompt(COMPANION_SYSTEM_PROMPT, vars), [vars]);
  const filledGreeting = useMemo(() => fillPrompt(COMPANION_FIRST_MESSAGE, vars), [vars]);
  const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;

  function set(key: keyof CompanionVariables, value: string) {
    setVars((prev) => ({ ...prev, [key]: value }));
  }

  async function copyPrompt() {
    await navigator.clipboard.writeText(filledPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  async function startCall() {
    if (!publicKey) {
      setStatus("error");
      setNote("NEXT_PUBLIC_VAPI_PUBLIC_KEY isn't set — copy the prompt into the Vapi dashboard instead.");
      return;
    }
    setStatus("connecting");
    setNote(null);
    setTranscript([]);
    try {
      const { default: Vapi } = await import("@vapi-ai/web");
      const vapi = new Vapi(publicKey) as unknown as VapiLike;
      vapiRef.current = vapi;

      vapi.on("call-start", () => setStatus("live"));
      vapi.on("call-end", () => setStatus("ended"));
      vapi.on("error", (e) => {
        setStatus("error");
        setNote(e instanceof Error ? e.message : "Vapi returned an error.");
      });
      vapi.on("message", (msg) => {
        const m = msg as { type?: string; transcriptType?: string; role?: string; transcript?: string };
        if (m.type !== "transcript" || m.transcriptType !== "final" || !m.transcript) return;
        setTranscript((prev) => [...prev, { role: m.role ?? "user", text: m.transcript! }]);
      });

      // Same assistant the real call on /popo/companion builds — the text shown on the
      // right of this screen is exactly what the model receives.
      await vapi.start(buildCompanionAssistant(vars));
    } catch (e) {
      setStatus("error");
      setNote(e instanceof Error ? e.message : "Could not start the call.");
    }
  }

  function endCall() {
    vapiRef.current?.stop();
    setStatus("ended");
  }

  const live = status === "live" || status === "connecting";

  return (
    <div className="mx-auto flex min-h-dvh max-w-[1100px] flex-col gap-6 bg-[var(--cream)] px-6 py-8 text-[var(--ink)]">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-[family-name:var(--font-display)] text-[24px] font-semibold">
          Companion call — demo bench
        </h1>
        <span className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.06em] text-[var(--ink-soft)]">
          Fill her in, then call
        </span>
      </header>

      <div className="flex flex-col gap-6 lg:flex-row">
        <form className="flex flex-1 flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
          {FIELDS.map((field) => (
            <label key={field.key} className="flex flex-col gap-1">
              <span className="text-[15px] font-semibold">{field.label}</span>
              <span className="text-[13px] text-[var(--ink-soft)]">{field.hint}</span>
              {field.lines ? (
                <textarea
                  rows={field.lines}
                  value={vars[field.key] ?? ""}
                  placeholder={field.placeholder}
                  onChange={(e) => set(field.key, e.target.value)}
                  className="mt-1 rounded-[10px] border border-[var(--hairline)] bg-[var(--paper)] p-2 text-[15px]"
                />
              ) : (
                <input
                  value={vars[field.key] ?? ""}
                  placeholder={field.placeholder}
                  onChange={(e) => set(field.key, e.target.value)}
                  className="mt-1 rounded-[10px] border border-[var(--hairline)] bg-[var(--paper)] p-2 text-[15px]"
                />
              )}
              {!vars[field.key]?.trim() && (
                <span className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--ink-soft)]">
                  blank → {VARIABLE_FALLBACKS[field.key]}
                </span>
              )}
            </label>
          ))}

          <div className="flex flex-wrap items-center gap-2">
            {live ? (
              <button
                onClick={endCall}
                className="flex items-center gap-2 rounded-[12px] bg-[#8a3a3a] px-4 py-3 text-[15px] font-semibold text-white"
              >
                <PhoneOff size={18} /> Hang up
              </button>
            ) : (
              <button
                onClick={startCall}
                className="flex items-center gap-2 rounded-[12px] bg-[var(--sage)] px-4 py-3 text-[15px] font-semibold text-white"
              >
                <Phone size={18} /> Start the call
              </button>
            )}
            <button
              onClick={() => setVars(defaults)}
              className="flex items-center gap-2 rounded-[12px] border border-[var(--hairline)] px-4 py-3 text-[15px]"
            >
              <RotateCcw size={16} /> Reset to seeded
            </button>
            <StatusPill status={status} />
          </div>

          {note && <p className="text-[13px] text-[#8a3a3a]">{note}</p>}

          {transcript.length > 0 && (
            <div className="flex flex-col gap-1 rounded-[12px] border border-[var(--hairline)] bg-[var(--paper)] p-3">
              {transcript.map((line, i) => (
                <p key={i} className="text-[14px]">
                  <span className="font-[family-name:var(--font-mono)] text-[11px] uppercase text-[var(--ink-soft)]">
                    {line.role === "assistant" ? "阿妹" : "她"}{" "}
                  </span>
                  {line.text}
                </p>
              ))}
            </div>
          )}
        </form>

        <section className="flex flex-1 flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.06em] text-[var(--ink-soft)]">
              System prompt, filled
            </span>
            <button
              onClick={copyPrompt}
              className="flex items-center gap-1 rounded-[10px] border border-[var(--hairline)] px-3 py-1 text-[13px]"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="rounded-[10px] border border-[var(--hairline)] bg-[var(--paper)] p-2 text-[14px]">
            <span className="font-[family-name:var(--font-mono)] text-[11px] uppercase text-[var(--ink-soft)]">
              First words{" "}
            </span>
            {filledGreeting}
          </p>
          <pre className="max-h-[70vh] overflow-auto whitespace-pre-wrap rounded-[12px] border border-[var(--hairline)] bg-[var(--paper)] p-3 font-[family-name:var(--font-mono)] text-[12px] leading-[1.55]">
            {filledPrompt}
          </pre>
        </section>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: CallStatus }) {
  const label: Record<CallStatus, string> = {
    idle: "Not started",
    connecting: "Connecting…",
    live: "Live",
    ended: "Call ended",
    error: "Error",
  };
  return (
    <span className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.06em] text-[var(--ink-soft)]">
      {label[status]}
    </span>
  );
}
