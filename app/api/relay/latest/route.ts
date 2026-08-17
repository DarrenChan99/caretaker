import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { relayMessages } from "@/lib/db/schema";

export async function GET() {
  const [row] = await db
    .select()
    .from(relayMessages)
    .where(eq(relayMessages.senderNameEn, "Ken"))
    .orderBy(desc(relayMessages.createdAt))
    .limit(1);

  return NextResponse.json(row ?? null);
}
