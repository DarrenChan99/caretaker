/**
 * The only thing that knows whether relay delivery is "message" or "voice" mode.
 * The family header toggle sets the mode; everything else calls deliver() the same way.
 *
 * Both modes store the row and flip the turn identically — that already happened
 * before deliver() runs. The only thing "voice" changes is client-side: Popo's page
 * (app/popo/chat/page.tsx) reads the message's persisted `mode` and, for "voice",
 * auto-plays via Vapi the moment it arrives instead of waiting for her tap on
 * "Answer" — a real Vapi call can only be started from a browser tab (hers), never
 * from this server route, so there is nothing left for deliver() itself to do.
 */
export type DeliveryMode = "message" | "voice";

interface DeliverResult {
  ok: boolean;
}

export async function deliver(): Promise<DeliverResult> {
  return { ok: true };
}
