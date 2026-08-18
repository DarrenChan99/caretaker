"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Home, Trophy } from "lucide-react";
import { zhHK } from "@/lib/i18n/zh-HK";
import { recordGameScore } from "@/app/popo/actions";

export interface ScoreRow {
  gameId: string;
  gameTitleZh: string;
  score: number;
}

/** Shape posted by the score bridge at the bottom of public/games/index.html. */
interface ScoreMessage {
  type: "caretaker-game-score";
  gameId: string;
  gameTitleZh: string;
  score: number;
}

function isScoreMessage(data: unknown): data is ScoreMessage {
  const m = data as Partial<ScoreMessage>;
  return (
    !!m &&
    m.type === "caretaker-game-score" &&
    typeof m.gameId === "string" &&
    typeof m.gameTitleZh === "string" &&
    typeof m.score === "number"
  );
}

export function GamesBoard({ initialScores }: { initialScores: ScoreRow[] }) {
  const [scores, setScores] = useState<ScoreRow[]>(initialScores);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      // Same-origin only: the iframe is served from this app's own /games.
      if (event.origin !== window.location.origin) return;
      if (!isScoreMessage(event.data)) return;
      const { gameId, gameTitleZh, score } = event.data;

      // Optimistic: the board moves the moment she beats her best, not on the round trip.
      setScores((prev) => {
        const others = prev.filter((row) => row.gameId !== gameId);
        const previous = prev.find((row) => row.gameId === gameId);
        if (previous && previous.score >= score) return prev;
        return [...others, { gameId, gameTitleZh, score }].sort((a, b) => b.score - a.score);
      });
      void recordGameScore(gameId, gameTitleZh, score);
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between gap-[calc(12px*var(--scale))] px-[calc(20px*var(--scale))] py-[calc(16px*var(--scale))]">
        <h1 className="font-[family-name:var(--font-zh-sans)] text-[calc(36px*var(--scale))] font-bold text-[var(--ink)]">
          {zhHK.gamesTitle}
        </h1>
        <Link
          href="/popo"
          className="flex min-h-[max(72px,calc(44px*var(--scale)))] items-center gap-2 rounded-[16px] border-2 border-[var(--sage)] px-[calc(20px*var(--scale))] font-[family-name:var(--font-zh-sans)] text-[calc(24px*var(--scale))] text-[var(--sage-deep)]"
        >
          <Home size={28} />
          {zhHK.backHome}
        </Link>
      </header>

      <section className="px-[calc(20px*var(--scale))]">
        <div className="flex items-center gap-[calc(10px*var(--scale))] pb-[calc(8px*var(--scale))]">
          <Trophy size={32} className="text-[var(--sage-deep)]" />
          <h2 className="font-[family-name:var(--font-zh-sans)] text-[calc(28px*var(--scale))] font-medium text-[var(--ink)]">
            {zhHK.leaderboard}
          </h2>
        </div>

        {scores.length === 0 ? (
          <p className="font-[family-name:var(--font-zh-sans)] text-[calc(24px*var(--scale))] text-[var(--ink)] opacity-70">
            {zhHK.leaderboardEmpty}
          </p>
        ) : (
          <ol className="flex flex-col gap-[calc(8px*var(--scale))]">
            {scores.map((row, i) => (
              <li
                key={row.gameId}
                className="flex items-center gap-[calc(14px*var(--scale))] rounded-[14px] border border-[var(--hairline)] bg-[var(--paper)] px-[calc(16px*var(--scale))] py-[calc(12px*var(--scale))]"
              >
                <span className="font-[family-name:var(--font-zh-sans)] text-[calc(28px*var(--scale))] font-bold text-[var(--sage-deep)]">
                  {i + 1}
                </span>
                <span className="flex-1 font-[family-name:var(--font-zh-sans)] text-[calc(26px*var(--scale))] text-[var(--ink)]">
                  {row.gameTitleZh}
                </span>
                <span className="font-[family-name:var(--font-zh-sans)] text-[calc(26px*var(--scale))] font-bold text-[var(--ink)]">
                  {zhHK.scoreUnit(row.score)}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <iframe
        src="/games/index.html"
        title={zhHK.gamesTitle}
        className="mt-[calc(12px*var(--scale))] w-full flex-1 border-0"
        style={{ minHeight: "70vh" }}
      />
    </div>
  );
}
