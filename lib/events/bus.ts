import { EventEmitter } from "events";
import type { Turn } from "@/lib/audio/session";

/**
 * In-process pub/sub for the relay SSE stream. One demo machine, one process —
 * module-level state is the whole "backend" here, deliberately (§1.5).
 */
const emitter = new EventEmitter();
emitter.setMaxListeners(0);

export type RelayEvent =
  | { type: "message"; messageId: string }
  | { type: "played"; messageId: string }
  | { type: "turn"; whoseTurn: Turn };

let whoseTurn: Turn = "family";

export function getTurn(): Turn {
  return whoseTurn;
}

export function setTurn(turn: Turn) {
  whoseTurn = turn;
  emitter.emit("event", { type: "turn", whoseTurn: turn } satisfies RelayEvent);
}

export function publish(event: RelayEvent) {
  emitter.emit("event", event);
}

export function subscribe(onEvent: (event: RelayEvent) => void): () => void {
  emitter.on("event", onEvent);
  return () => emitter.off("event", onEvent);
}
