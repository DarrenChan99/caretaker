import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { relayMessages } from "@/lib/db/schema";
import { translate } from "@/lib/llm/translate";
import { setTurn } from "@/lib/events/bus";

const ELDER_ID = "popo";

export async function POST(req: Request) {
  const body = await req.json();
  const textZh = String(body.textZh ?? "").trim();
  if (!textZh) return NextResponse.json({ error: "textZh required" }, { status: 400 });

  const textEn = await translate(textZh, "zh-en");

  const [row] = await db
    .insert(relayMessages)
    .values({ elderId: ELDER_ID, senderNameEn: "Popo", textEn, textZh })
    .returning();

  await setTurn("family");

  return NextResponse.json(row);
}
