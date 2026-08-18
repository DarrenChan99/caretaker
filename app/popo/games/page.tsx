import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { gameScores } from "@/lib/db/schema";
import { GamesBoard, type ScoreRow } from "@/components/popo/GamesBoard";

export const dynamic = "force-dynamic";

/**
 * The five games run as-is from public/games/index.html (translated to Cantonese by
 * scripts/translate-games.py) inside an iframe — same file, same game logic, so nothing
 * had to be rewritten to get them on her screen. This page owns the leaderboard around it.
 */
export default async function PopoGamesPage() {
  let scores: ScoreRow[] = [];
  try {
    scores = await db
      .select({
        gameId: gameScores.gameId,
        gameTitleZh: gameScores.gameTitleZh,
        score: gameScores.score,
      })
      .from(gameScores)
      .where(eq(gameScores.elderId, "popo"))
      .orderBy(desc(gameScores.score));
  } catch {
    // No DB (or not pushed yet) — the games still play, the board just starts empty.
  }

  return <GamesBoard initialScores={scores} />;
}
