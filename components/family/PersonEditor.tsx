"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Volume2, Plus, PhoneCall, X, Rss } from "lucide-react";
import { updatePerson, addMemory, saveCallMemory, saveDraftMemory } from "@/app/family/people/[id]/actions";
import { playTts } from "@/lib/relay/playTts";
import { summarizeTranscript } from "@/lib/videoCall/transcript";
import type { TranscriptEntry } from "@/components/videoCall/VideoCallRoom";

interface Person {
  id: string;
  nameEn: string;
  nameZh: string;
  relationshipEn: string;
  relationshipZh: string;
  photoPath: string;
  introZh: string;
  socialHandle: string | null;
}

interface SocialDraft {
  titleZh: string;
  bodyZh: string;
  bodyEn: string;
}

interface Memory {
  id: string;
  titleZh: string;
  bodyZh: string;
  year: number | null;
}

interface PendingCall {
  id: string;
  endedAt: Date | null;
  transcriptJson: string | null;
}

export function PersonEditor({
  person,
  memories,
  pendingCalls = [],
}: {
  person: Person;
  memories: Memory[];
  pendingCalls?: PendingCall[];
}) {
  const [introZh, setIntroZh] = useState(person.introZh);
  const [previewing, setPreviewing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showAddMemory, setShowAddMemory] = useState(false);
  // ponytail: client-side-only dismissal — a discarded draft reappears on reload
  // since there's no persisted "discarded" flag (§4/§5 of the plan); add one if
  // that turns out to matter beyond a demo.
  const [dismissedCalls, setDismissedCalls] = useState<string[]>([]);
  const [socialDraft, setSocialDraft] = useState<SocialDraft | null>(null);
  const [checkingPosts, setCheckingPosts] = useState(false);

  async function checkForPosts() {
    setCheckingPosts(true);
    try {
      const res = await fetch("/api/social/refresh", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ familyMemberId: person.id }),
      });
      if (res.ok) setSocialDraft(await res.json());
    } finally {
      setCheckingPosts(false);
    }
  }

  async function preview() {
    setPreviewing(true);
    await playTts(introZh);
    setPreviewing(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-4">
        <div className="relative w-[140px] shrink-0 overflow-hidden rounded-[8px]" style={{ aspectRatio: "4 / 5" }}>
          <Image src={person.photoPath} alt={person.nameZh} fill className="object-cover" />
        </div>
        <div className="flex flex-col justify-center gap-2">
          <p className="zh text-[32px] text-[var(--ink)]">{person.nameZh}</p>
          <p className="font-[family-name:var(--font-mono)] text-[12px] uppercase tracking-[0.06em] text-[var(--ink-soft)]">
            {person.nameEn} · {person.relationshipEn}
          </p>
          <Link
            href={`/family/video-call/${person.id}`}
            className="flex w-fit items-center gap-2 rounded-[8px] bg-[var(--sage)] px-3 py-2 text-[13px] text-white"
          >
            <PhoneCall size={16} />
            Call Popo
          </Link>
        </div>
      </div>

      <form
        action={async (formData) => {
          await updatePerson(person.id, formData);
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }}
        className="flex flex-col gap-3 rounded-[12px] border border-[var(--hairline)] bg-[var(--paper)] p-4 shadow-[var(--shadow-card)]"
      >
        <Field label="English name">
          <input name="nameEn" defaultValue={person.nameEn} className={inputClass} />
        </Field>
        <Field label="Chinese name">
          <input name="nameZh" defaultValue={person.nameZh} className={`${inputClass} zh`} />
        </Field>
        <Field label="Relationship (EN)">
          <input name="relationshipEn" defaultValue={person.relationshipEn} className={inputClass} />
        </Field>
        <Field label="Relationship (ZH)">
          <input name="relationshipZh" defaultValue={person.relationshipZh} className={`${inputClass} zh`} />
        </Field>
        <Field label="Public profile URL (optional)">
          <input
            name="socialHandle"
            defaultValue={person.socialHandle ?? ""}
            placeholder="https://…"
            className={inputClass}
          />
        </Field>

        <label className="text-[12px] font-[family-name:var(--font-mono)] uppercase tracking-[0.06em] text-[var(--ink-soft)]">
          Intro script
        </label>
        <textarea
          name="introZh"
          value={introZh}
          onChange={(e) => setIntroZh(e.target.value)}
          rows={3}
          className={`${inputClass} zh text-[20px]`}
        />

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={preview}
            disabled={previewing}
            className="flex items-center gap-2 rounded-[8px] border border-[var(--sage)] px-3 py-2 text-[13px] text-[var(--sage-deep)] disabled:opacity-50"
          >
            <Volume2 size={16} />
            {previewing ? "Playing…" : "Preview in Cantonese"}
          </button>
          <button type="submit" className="rounded-[8px] bg-[var(--sage)] px-4 py-2 text-[13px] text-white">
            Save
          </button>
          {saved && <span className="text-[13px] text-[var(--sage-deep)]">Saved</span>}
        </div>
      </form>

      {pendingCalls
        .filter((c) => !dismissedCalls.includes(c.id))
        .map((call) => (
          <CallReviewCard
            key={call.id}
            call={call}
            familyMemberId={person.id}
            onDismiss={() => setDismissedCalls((d) => [...d, call.id])}
          />
        ))}

      {person.socialHandle && (
        <div className="flex flex-col gap-3">
          <button
            onClick={checkForPosts}
            disabled={checkingPosts}
            className="flex w-fit items-center gap-2 rounded-[8px] border border-[var(--sage)] px-3 py-2 text-[13px] text-[var(--sage-deep)] disabled:opacity-50"
          >
            <Rss size={16} />
            {checkingPosts ? "Checking…" : "Check for new posts"}
          </button>
          {socialDraft && (
            <SocialDraftCard
              draft={socialDraft}
              familyMemberId={person.id}
              onDismiss={() => setSocialDraft(null)}
            />
          )}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-semibold">Memories</h2>
          <button
            onClick={() => setShowAddMemory((v) => !v)}
            className="flex items-center gap-1 rounded-[8px] border border-[var(--sage)] px-3 py-1.5 text-[13px] text-[var(--sage-deep)]"
          >
            <Plus size={14} /> Add memory
          </button>
        </div>

        {showAddMemory && (
          <form
            action={async (formData) => {
              await addMemory(person.id, formData);
              setShowAddMemory(false);
            }}
            className="flex flex-col gap-2 rounded-[8px] border border-[var(--hairline)] p-3"
          >
            <input name="titleZh" placeholder="Title (ZH)" className={`${inputClass} zh`} />
            <textarea name="bodyZh" placeholder="Body (ZH)" rows={2} className={`${inputClass} zh`} />
            <input name="year" placeholder="Year (optional)" className={inputClass} />
            <button type="submit" className="self-start rounded-[8px] bg-[var(--sage)] px-3 py-1.5 text-[13px] text-white">
              Save memory
            </button>
          </form>
        )}

        {memories.length === 0 && (
          <p className="text-[15px] text-[var(--ink-soft)]">No memories yet.</p>
        )}
        {memories.map((m) => (
          <div key={m.id} className="rounded-[8px] border border-[var(--hairline)] p-3">
            <p className="zh text-[18px] font-semibold">{m.titleZh}</p>
            <p className="zh text-[16px] text-[var(--ink)]">{m.bodyZh}</p>
            {m.year && (
              <p className="mt-1 font-[family-name:var(--font-mono)] text-[11px] text-[var(--ink-soft)]">
                {m.year}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CallReviewCard({
  call,
  familyMemberId,
  onDismiss,
}: {
  call: PendingCall;
  familyMemberId: string;
  onDismiss: () => void;
}) {
  let entries: TranscriptEntry[] = [];
  try {
    entries = call.transcriptJson ? JSON.parse(call.transcriptJson) : [];
  } catch {
    entries = [];
  }
  const { bodyZh, bodyEn } = summarizeTranscript(entries);
  const dateLabel = call.endedAt ? new Date(call.endedAt).toLocaleDateString() : "";

  return (
    <div className="flex flex-col gap-2 rounded-[12px] border border-[var(--sage)] bg-[var(--paper)] p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-[var(--sage-deep)]">From your last call · {dateLabel}</h3>
        <button onClick={onDismiss} className="text-[var(--ink-soft)]">
          <X size={16} />
        </button>
      </div>
      <form
        action={async (formData) => {
          await saveCallMemory(familyMemberId, call.id, formData);
          onDismiss();
        }}
        className="flex flex-col gap-2"
      >
        <input
          name="titleZh"
          placeholder="Title (ZH)"
          defaultValue={`通話記錄 · ${dateLabel}`}
          className={`${inputClass} zh`}
        />
        <textarea name="bodyZh" defaultValue={bodyZh} rows={3} className={`${inputClass} zh`} />
        <textarea name="bodyEn" defaultValue={bodyEn} rows={2} className={inputClass} placeholder="English translation" />
        <button type="submit" className="self-start rounded-[8px] bg-[var(--sage)] px-3 py-1.5 text-[13px] text-white">
          Save as memory
        </button>
      </form>
    </div>
  );
}

function SocialDraftCard({
  draft,
  familyMemberId,
  onDismiss,
}: {
  draft: SocialDraft;
  familyMemberId: string;
  onDismiss: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-[12px] border border-[var(--sage)] bg-[var(--paper)] p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-[var(--sage-deep)]">New post found</h3>
        <button onClick={onDismiss} className="text-[var(--ink-soft)]">
          <X size={16} />
        </button>
      </div>
      <form
        action={async (formData) => {
          await saveDraftMemory(familyMemberId, formData);
          onDismiss();
        }}
        className="flex flex-col gap-2"
      >
        <input name="titleZh" defaultValue={draft.titleZh} className={`${inputClass} zh`} />
        <textarea name="bodyZh" defaultValue={draft.bodyZh} rows={2} className={`${inputClass} zh`} />
        <textarea name="bodyEn" defaultValue={draft.bodyEn} rows={2} className={inputClass} placeholder="English translation" />
        <button type="submit" className="self-start rounded-[8px] bg-[var(--sage)] px-3 py-1.5 text-[13px] text-white">
          Save as memory
        </button>
      </form>
    </div>
  );
}

const inputClass =
  "w-full rounded-[8px] border border-[var(--hairline)] bg-[var(--cream)] px-3 py-2 text-[15px] text-[var(--ink)]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[12px] font-[family-name:var(--font-mono)] uppercase tracking-[0.06em] text-[var(--ink-soft)]">
        {label}
      </span>
      {children}
    </label>
  );
}
