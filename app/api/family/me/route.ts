import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { familyMembers } from "@/lib/db/schema";

/**
 * The family side is single-user for now and relay messages are sent as "Ken"
 * (see /api/relay/send), so "me" is Ken — falling back to whoever is first if the
 * seed differs. Exists so the UI can link to /family/video-call/<id> without
 * hardcoding a UUID that differs between the local SQLite seed and prod Neon.
 */
export async function GET() {
  const [ken] = await db.select().from(familyMembers).where(eq(familyMembers.nameEn, "Ken")).limit(1);
  if (ken) return NextResponse.json(ken);

  const [first] = await db.select().from(familyMembers).limit(1);
  return NextResponse.json(first ?? null);
}
