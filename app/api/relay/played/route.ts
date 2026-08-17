import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { relayMessages } from "@/lib/db/schema";

export async function POST(req: Request) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await db.update(relayMessages).set({ playedAt: new Date() }).where(eq(relayMessages.id, id));

  return NextResponse.json({ ok: true });
}
