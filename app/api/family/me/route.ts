import { NextResponse } from "next/server";
import { getFamilyMe } from "@/lib/family/me";

/**
 * Exists so the UI can reference /family/video-call/<id> without hardcoding a UUID
 * that differs between the local SQLite seed and prod Neon. The lookup itself lives
 * in lib/family/me.ts, shared with the /family/call page.
 */
export async function GET() {
  return NextResponse.json(await getFamilyMe());
}
