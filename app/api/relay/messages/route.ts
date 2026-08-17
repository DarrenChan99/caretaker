import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { relayMessages } from "@/lib/db/schema";

export async function GET() {
  const rows = await db.select().from(relayMessages).orderBy(asc(relayMessages.createdAt));
  return NextResponse.json(rows);
}
