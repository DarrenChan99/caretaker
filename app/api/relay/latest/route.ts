import { NextResponse } from "next/server";
import { desc, ne } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { relayMessages } from "@/lib/db/schema";
import { POPO_SENDER } from "@/lib/relay/senders";

/**
 * The newest message for Popo's screen: anything not sent by her. This used to filter
 * on senderNameEn === "Ken", which made every other family member's message invisible
 * to her.
 */
export async function GET() {
  const [row] = await db
    .select()
    .from(relayMessages)
    .where(ne(relayMessages.senderNameEn, POPO_SENDER))
    .orderBy(desc(relayMessages.createdAt))
    .limit(1);

  return NextResponse.json(row ?? null);
}
