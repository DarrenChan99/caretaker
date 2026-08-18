"use client";

import { useState } from "react";
import { Volume2, Square } from "lucide-react";
import { playTts } from "@/lib/relay/playTts";
import { zhHK } from "@/lib/i18n/zh-HK";

function splitSentences(text: string): string[] {
  return text.split(/(?<=[。！？])/).filter((s) => s.trim());
}

export function NewsReader({ headlineZh, passageZh }: { headlineZh: string; passageZh: string }) {
  const sentences = splitSentences(passageZh);
  const [playing, setPlaying] = useState(false);

  async function read() {
    setPlaying(true);
    await playTts(passageZh);
    setPlaying(false);
  }

  function stop() {
    setPlaying(false);
  }

  return (
    <div className="flex min-h-dvh flex-col px-[calc(24px*var(--scale))] py-[calc(32px*var(--scale))]">
      <h1 className="font-[family-name:var(--font-zh-sans)] text-[calc(44px*var(--scale))] font-bold leading-[1.3] text-[var(--ink)]">
        {headlineZh}
      </h1>

      <p
        className="mt-[calc(24px*var(--scale))] max-w-[18ch] font-[family-name:var(--font-zh-sans)] text-[calc(32px*var(--scale))] leading-[1.8] text-[var(--ink)]"
        style={{ background: playing ? "rgba(79,125,94,0.15)" : "transparent" }}
      >
        {sentences.join("")}
      </p>

      <button
        onClick={playing ? stop : read}
        className="mt-auto flex w-full items-center justify-center gap-3 rounded-[16px] bg-[var(--sage)] text-white"
        style={{ height: "calc(120px * var(--scale))" }}
      >
        {playing ? <Square size={32} /> : <Volume2 size={32} />}
        <span className="font-[family-name:var(--font-zh-sans)] text-[calc(28px*var(--scale))] font-medium">
          {playing ? zhHK.stop : zhHK.readToMe}
        </span>
      </button>
    </div>
  );
}
