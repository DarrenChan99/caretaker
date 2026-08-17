import { NextResponse } from "next/server";
import { ApifyClient } from "apify-client";
import { db } from "@/lib/db/client";
import { newsItems } from "@/lib/db/schema";
import { complete } from "@/lib/llm/client";
import { NEWS_CALM_FILTER_PROMPT } from "@/lib/llm/prompts";
import { NEWS_SOURCE } from "@/lib/apify/sources";
import fixture from "@/lib/apify/fixtures/news.json";

async function insertFixture(reason: string) {
  console.warn(`news refresh falling back to committed fixture: ${reason}`);
  const [row] = await db
    .insert(newsItems)
    .values({
      source: fixture.source,
      headlineZh: fixture.headlineZh,
      passageZh: fixture.passageZh,
      url: fixture.url,
      approved: false,
    })
    .returning();
  return NextResponse.json({ ...row, fromFixture: true, reason });
}

export async function POST() {
  const token = process.env.APIFY_TOKEN;
  if (!token) {
    console.warn("TODO: missing env var APIFY_TOKEN — news refresh stubbed");
    return insertFixture("APIFY_TOKEN not configured");
  }

  try {
    const client = new ApifyClient({ token });
    const run = await client.actor(NEWS_SOURCE.actorId).call({
      startUrls: [{ url: NEWS_SOURCE.startUrl }],
    });
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    for (const item of items) {
      const headline = String((item as Record<string, unknown>).title ?? "");
      const paragraphs = String((item as Record<string, unknown>).text ?? "").slice(0, 1500);
      if (!headline || !paragraphs) continue;

      const condensed = await complete(NEWS_CALM_FILTER_PROMPT, paragraphs);
      if (!condensed || condensed.trim() === "null") continue;

      const [row] = await db
        .insert(newsItems)
        .values({
          source: NEWS_SOURCE.name,
          headlineZh: headline,
          passageZh: condensed,
          url: String((item as Record<string, unknown>).url ?? NEWS_SOURCE.startUrl),
          approved: false,
        })
        .returning();
      return NextResponse.json(row);
    }

    return insertFixture("no dataset item survived the calm-content filter");
  } catch (err) {
    return insertFixture(err instanceof Error ? err.message : "apify run failed");
  }
}
