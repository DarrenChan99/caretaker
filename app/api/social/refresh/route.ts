import { NextResponse } from "next/server";
import { ApifyClient } from "apify-client";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { familyMembers } from "@/lib/db/schema";
import { complete } from "@/lib/llm/client";
import { translate } from "@/lib/llm/translate";
import { SOCIAL_POST_SUMMARY_PROMPT } from "@/lib/llm/prompts";
import { SOCIAL_SOURCE } from "@/lib/apify/sources";
import fixture from "@/lib/apify/fixtures/social.json";

function shortTitle(bodyZh: string) {
  return bodyZh.length > 8 ? `${bodyZh.slice(0, 8)}…` : bodyZh;
}

async function fixtureDraft(reason: string) {
  console.warn(`social refresh falling back to committed fixture: ${reason}`);
  return NextResponse.json({ ...fixture, fromFixture: true, reason });
}

export async function POST(req: Request) {
  const body = await req.json();
  const familyMemberId = String(body.familyMemberId ?? "");
  if (!familyMemberId) {
    return NextResponse.json({ error: "familyMemberId required" }, { status: 400 });
  }

  const [person] = await db.select().from(familyMembers).where(eq(familyMembers.id, familyMemberId));
  if (!person?.socialHandle) {
    return NextResponse.json({ error: "no socialHandle set for this person" }, { status: 400 });
  }

  const token = process.env.APIFY_TOKEN;
  if (!token) {
    console.warn("TODO: missing env var APIFY_TOKEN — social refresh stubbed");
    return fixtureDraft("APIFY_TOKEN not configured");
  }

  try {
    const client = new ApifyClient({ token });
    const run = await client.actor(SOCIAL_SOURCE.actorId).call({
      startUrls: [{ url: person.socialHandle }],
    });
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    const rawText = String((items[0] as Record<string, unknown> | undefined)?.text ?? "").slice(0, 800);
    if (!rawText) return fixtureDraft("no post text found on the page");

    const bodyZh = await complete(SOCIAL_POST_SUMMARY_PROMPT, rawText);
    if (!bodyZh) return fixtureDraft("summary generation failed");

    const bodyEn = await translate(bodyZh, "zh-en");
    return NextResponse.json({ titleZh: shortTitle(bodyZh), bodyZh, bodyEn });
  } catch (err) {
    return fixtureDraft(err instanceof Error ? err.message : "apify run failed");
  }
}
