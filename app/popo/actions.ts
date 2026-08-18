"use server";

import { and, eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { gameScores, medications, medEvents } from "@/lib/db/schema";

const ELDER_ID = "popo";

/**
 * Keeps one row per game: the best score she has ever reached. The games themselves
 * only ever report a new personal best, but the check stays here anyway — a stale
 * iframe replaying an old best must never overwrite a higher one.
 */
export async function recordGameScore(gameId: string, gameTitleZh: string, score: number) {
  if (!Number.isFinite(score) || score <= 0) return;

  const [existing] = await db
    .select()
    .from(gameScores)
    .where(and(eq(gameScores.elderId, ELDER_ID), eq(gameScores.gameId, gameId)))
    .limit(1);

  if (!existing) {
    await db.insert(gameScores).values({ elderId: ELDER_ID, gameId, gameTitleZh, score });
  } else if (score > existing.score) {
    await db
      .update(gameScores)
      .set({ score, gameTitleZh, achievedAt: new Date() })
      .where(eq(gameScores.id, existing.id));
  } else {
    return; // nothing new to show
  }

  revalidatePath("/popo/games");
}

/**
 * Her "食咗喇" on the reminder popup. Logged against the active medication so the
 * family view's Medication card flips to confirmed — same row the family button writes,
 * different source, so you can tell who answered.
 */
export async function confirmMedFromReminder() {
  const [med] = await db
    .select()
    .from(medications)
    .where(and(eq(medications.elderId, ELDER_ID), eq(medications.active, true)))
    .orderBy(desc(medications.scheduledTime))
    .limit(1);

  if (!med) return; // nothing scheduled — the popup is still a valid nudge to drink water
  await db.insert(medEvents).values({ medicationId: med.id, confirmed: true, source: "reminder" });
  revalidatePath("/family");
}
