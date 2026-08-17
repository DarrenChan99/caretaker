import { subscribe, getTurn, type RelayEvent } from "@/lib/events/bus";

export const dynamic = "force-dynamic";

function sse(event: RelayEvent | { type: "hello"; whoseTurn: ReturnType<typeof getTurn> }) {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export async function GET() {
  const encoder = new TextEncoder();
  let unsubscribe: (() => void) | null = null;
  let heartbeat: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(sse({ type: "hello", whoseTurn: getTurn() })));

      unsubscribe = subscribe((event) => {
        controller.enqueue(encoder.encode(sse(event)));
      });

      heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(": ping\n\n"));
      }, 15000);
    },
    cancel() {
      unsubscribe?.();
      if (heartbeat) clearInterval(heartbeat);
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
