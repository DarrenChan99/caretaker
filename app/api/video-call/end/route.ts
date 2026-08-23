import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { videoCallSessions } from "@/lib/db/schema";
import { setCallInvite } from "@/lib/events/bus";
import type { TranscriptEntry } from "@/components/videoCall/VideoCallRoom";

const ELDER_ID = "popo";

export async function POST(req: Request) {
  const body = await req.json();
  const familyMemberId = String(body.familyMemberId ?? "");
  const transcript = Array.isArray(body.transcript) ? (body.transcript as TranscriptEntry[]) : [];
  if (!familyMemberId) {
    return NextResponse.json({ error: "familyMemberId required" }, { status: 400 });
  }

  // Safety net — the popo side already clears this on answer, but a call that never
  // got answered (family hung up before popo picked up) would otherwise leave it stuck.
  await setCallInvite(null);

  const [row] = await db
    .insert(videoCallSessions)
    .values({
      elderId: ELDER_ID,
      familyMemberId,
      endedAt: new Date(),
      transcriptJson: JSON.stringify(transcript),
    })
    .returning();

  return NextResponse.json(row);
}
