import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { relayState } from "@/lib/db/schema";

/**
 * Turn state lives in the DB, not in process memory. On Vercel, send/receive/stream
 * can each land on a different serverless instance with no shared memory — the DB
 * (Neon, centrally hosted) is the only thing all of them actually share. Locally
 * this is just a tiny SQLite table; same code path either way.
 */
export type Turn = "family" | "popo" | "idle";

const ELDER_ID = "popo";

export async function getTurn(): Promise<Turn> {
  const [row] = await db.select().from(relayState).where(eq(relayState.elderId, ELDER_ID));
  return (row?.whoseTurn as Turn) ?? "family";
}

export async function setTurn(turn: Turn): Promise<void> {
  await db
    .insert(relayState)
    .values({ elderId: ELDER_ID, whoseTurn: turn })
    .onConflictDoUpdate({
      target: relayState.elderId,
      set: { whoseTurn: turn, updatedAt: new Date() },
    });
}
