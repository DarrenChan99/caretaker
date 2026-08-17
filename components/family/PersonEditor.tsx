"use client";

import { useState } from "react";
import Image from "next/image";
import { Volume2, Plus } from "lucide-react";
import { updatePerson, addMemory } from "@/app/family/people/[id]/actions";
import { playTts } from "@/lib/relay/playTts";

interface Person {
  id: string;
  nameEn: string;
  nameZh: string;
  relationshipEn: string;
  relationshipZh: string;
  photoPath: string;
  introZh: string;
}

interface Memory {
  id: string;
  titleZh: string;
  bodyZh: string;
  year: number | null;
}

export function PersonEditor({ person, memories }: { person: Person; memories: Memory[] }) {
  const [introZh, setIntroZh] = useState(person.introZh);
  const [previewing, setPreviewing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showAddMemory, setShowAddMemory] = useState(false);

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
        <div className="flex flex-col justify-center gap-1">
          <p className="zh text-[32px] text-[var(--ink)]">{person.nameZh}</p>
          <p className="font-[family-name:var(--font-mono)] text-[12px] uppercase tracking-[0.06em] text-[var(--ink-soft)]">
            {person.nameEn} · {person.relationshipEn}
          </p>
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
