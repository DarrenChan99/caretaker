import { NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { familyMembers } from "@/lib/db/schema";
import { setCallInvite } from "@/lib/events/bus";

const ELDER_ID = "popo";

// One shared room per elder — this app only ever has one elder, one active call.
function roomName() {
  return `call-${ELDER_ID}`;
}

export async function POST(req: Request) {
  const body = await req.json();
  const familyMemberId = String(body.familyMemberId ?? "");
  const side = body.side === "popo" ? "popo" : "family";
  if (!familyMemberId) {
    return NextResponse.json({ error: "familyMemberId required" }, { status: 400 });
  }

  const { LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET } = process.env;
  if (!LIVEKIT_URL || !LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
    return NextResponse.json({ error: "LiveKit is not configured" }, { status: 500 });
  }

  const [familyMember] = await db
    .select()
    .from(familyMembers)
    .where(eq(familyMembers.id, familyMemberId));
  if (!familyMember) {
    return NextResponse.json({ error: "family member not found" }, { status: 404 });
  }

  const identity = side === "popo" ? "popo" : `family:${familyMemberId}`;
  const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity,
    name: side === "popo" ? "Popo" : familyMember.nameEn,
  });
  at.addGrant({ room: roomName(), roomJoin: true, canPublish: true, canSubscribe: true });

  // The family side placing the call is what starts the ring; the popo side
  // answering clears it (see app/popo/video-call/page.tsx).
  if (side === "family") {
    await setCallInvite(familyMemberId);
  } else {
    await setCallInvite(null);
  }

  return NextResponse.json({ url: LIVEKIT_URL, token: await at.toJwt(), room: roomName() });
}
