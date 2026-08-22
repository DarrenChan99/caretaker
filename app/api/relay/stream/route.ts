import { desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { relayMessages } from "@/lib/db/schema";
import { getTurn } from "@/lib/events/bus";

export const dynamic = "force-dynamic";

const POLL_MS = 1000;

type Snapshot = {
  whoseTurn: Awaited<ReturnType<typeof getTurn>>;
  latestMessageId: string | null;
  latestMessagePlayedAt: number | null;
};

async function snapshot(): Promise<Snapshot> {
  const [whoseTurn, [latest]] = await Promise.all([
    getTurn(),
    db.select().from(relayMessages).orderBy(desc(relayMessages.createdAt)).limit(1),
  ]);
  return {
    whoseTurn,
    latestMessageId: latest?.id ?? null,
    latestMessagePlayedAt: latest?.playedAt ? new Date(latest.playedAt).getTime() : null,
  };
}

function sse(data: unknown) {
  return `data: ${JSON.stringify(data)}\n\n`;
}

/**
 * DB-polled, not in-process pub/sub — send/receive/played can land on a different
 * serverless instance than this stream on Vercel, so there's no shared memory to
 * subscribe to. Polling the DB is the thing every instance actually agrees on.
 */
export async function GET() {
  const encoder = new TextEncoder();
  let cancelled = false;

  const stream = new ReadableStream({
    async start(controller) {
      let last = await snapshot();
      controller.enqueue(encoder.encode(sse({ type: "hello", ...last })));

      while (!cancelled) {
        await new Promise((r) => setTimeout(r, POLL_MS));
        if (cancelled) break;

        let next: Snapshot;
        try {
          next = await snapshot();
        } catch (err) {
          // transient DB hiccup — client's own reconnect/backoff covers a real outage,
          // but log it so a sustained outage is visible in server logs before a demo.
          console.error("relay stream snapshot failed:", err instanceof Error ? err.message : err);
          continue;
        }

        if (
          next.whoseTurn !== last.whoseTurn ||
          next.latestMessageId !== last.latestMessageId ||
          next.latestMessagePlayedAt !== last.latestMessagePlayedAt
        ) {
          last = next;
          try {
            controller.enqueue(encoder.encode(sse({ type: "update", ...next })));
          } catch {
            break; // client disconnected
          }
        }
      }
    },
    cancel() {
      cancelled = true;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
