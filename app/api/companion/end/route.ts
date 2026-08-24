import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { callSessions } from "@/lib/db/schema";

const ELDER_ID = "popo";

/**
 * Persists a finished companion call. This is what closes the loop: loadCompanionVars()
 * reads the newest row back as `lastCallSummary`, so the next call opens on a thread from
 * this one instead of starting from zero, and the family Today page can show it happened.
 */
export async function POST(req: Request) {
  const body = await req.json();
  const transcript = Array.isArray(body.transcript)
    ? (body.transcript as { role?: string; text?: string }[])
    : [];
  if (transcript.length === 0) {
    return NextResponse.json({ error: "empty transcript" }, { status: 400 });
  }

  const [row] = await db
    .insert(callSessions)
    .values({
      elderId: ELDER_ID,
      endedAt: new Date(),
      transcriptJson: JSON.stringify(transcript),
    })
    .returning();

  return NextResponse.json(row);
}
