import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { relayMessages } from "@/lib/db/schema";
import { translate } from "@/lib/llm/translate";
import { deliver, type DeliveryMode } from "@/lib/relay/deliver";
import { publish, setTurn } from "@/lib/events/bus";

const ELDER_ID = "popo";

export async function POST(req: Request) {
  const body = await req.json();
  const textEn = String(body.textEn ?? "").trim();
  const mode: DeliveryMode = body.mode === "voice" ? "voice" : "message";
  if (!textEn) return NextResponse.json({ error: "textEn required" }, { status: 400 });

  const textZh = await translate(textEn, "en-zh");

  const [row] = await db
    .insert(relayMessages)
    .values({ elderId: ELDER_ID, senderNameEn: "Ken", textEn, textZh })
    .returning();

  publish({ type: "message", messageId: row.id });
  setTurn("popo");

  const delivery = await deliver(textZh, mode);

  return NextResponse.json({ ...row, delivery });
}
