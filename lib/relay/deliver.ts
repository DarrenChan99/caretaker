/**
 * The only thing that knows whether relay delivery is "message" or "voice" mode.
 * The family header toggle sets the mode; everything else calls deliver() the same way.
 */
export type DeliveryMode = "message" | "voice";

interface DeliverResult {
  ok: boolean;
  note?: string;
}

async function deliverMessage(): Promise<DeliverResult> {
  // Text + Azure TTS on tap is the whole job here, and it already happened:
  // the row is in relay_messages and the SSE "message" event was published by the
  // route handler before deliver() was called. Nothing further to push.
  return { ok: true };
}

async function deliverVoice(textZh: string): Promise<DeliverResult> {
  // Phase 2. Opens a Vapi web call on Popo's pane and speaks textZh verbatim.
  // Not implemented in Phase 1 — flip the header toggle back to message mode,
  // which is the default and cannot fail mid-demo.
  console.warn("TODO: voice-mode delivery not implemented yet (Phase 2, Vapi).", textZh);
  return { ok: false, note: "voice mode not yet implemented — use message mode" };
}

export async function deliver(textZh: string, mode: DeliveryMode): Promise<DeliverResult> {
  return mode === "voice" ? deliverVoice(textZh) : deliverMessage();
}
