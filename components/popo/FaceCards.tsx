"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Volume2, Home } from "lucide-react";
import { playTts } from "@/lib/relay/playTts";
import { zhHK } from "@/lib/i18n/zh-HK";

interface Person {
  id: string;
  nameZh: string;
  relationshipZh: string;
  photoPath: string;
  introZh: string;
}

export function FaceCards({ people }: { people: Person[] }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  if (people.length === 0) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-[calc(24px*var(--scale))] px-8 text-center">
        <p className="font-[family-name:var(--font-zh-sans)] text-[calc(28px*var(--scale))] font-bold">
No family info yet
        </p>
        <Link
          href="/popo"
          className="flex min-h-[max(72px,calc(44px*var(--scale)))] items-center gap-2 rounded-[16px] border-2 border-[var(--sage)] px-6 font-[family-name:var(--font-zh-sans)] text-[calc(24px*var(--scale))] text-[var(--sage-deep)]"
        >
          <Home size={32} />
          {zhHK.backHome}
        </Link>
      </div>
    );
  }

  const person = people[index];

  async function play() {
    setPlaying(true);
    await playTts(person.introZh);
    setPlaying(false);
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-[calc(16px*var(--scale))] px-6">
        <div
          className="relative w-full overflow-hidden rounded-[12px]"
          style={{ height: "60vh" }}
        >
          <Image src={person.photoPath} alt={person.nameZh} fill className="object-cover" />
        </div>
        <p className="font-[family-name:var(--font-zh-sans)] text-[calc(56px*var(--scale))] font-bold text-[var(--ink)]">
          {person.nameZh}
        </p>
        <p className="font-[family-name:var(--font-zh-sans)] text-[calc(28px*var(--scale))] text-[var(--ink)]">
          {zhHK.yourRelation(person.relationshipZh)}
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-[var(--hairline)] px-4" style={{ height: "calc(96px * var(--scale))" }}>
        <button
          onClick={() => setIndex((i) => (i - 1 + people.length) % people.length)}
          className="flex h-full items-center px-[calc(16px*var(--scale))] text-[var(--sage-deep)]"
        >
          <ChevronLeft size={48} />
        </button>
        <button
          onClick={play}
          disabled={playing}
          className="flex flex-1 items-center justify-center gap-2 rounded-[16px] bg-[var(--sage)] px-6 text-white disabled:opacity-60"
          style={{ height: "calc(72px * var(--scale))" }}
        >
          <Volume2 size={32} />
          <span className="font-[family-name:var(--font-zh-sans)] text-[calc(24px*var(--scale))] font-medium">
            {zhHK.whoIsThis}
          </span>
        </button>
        <button
          onClick={() => setIndex((i) => (i + 1) % people.length)}
          className="flex h-full items-center px-[calc(16px*var(--scale))] text-[var(--sage-deep)]"
        >
          <ChevronRight size={48} />
        </button>
      </div>
    </div>
  );
}
