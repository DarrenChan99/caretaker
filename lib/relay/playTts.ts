"use client";

import Vapi from "@vapi-ai/web";

let vapi: Vapi | null = null;

function getClient(): Vapi | null {
  const key = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
  if (!key) return null;
  if (!vapi) vapi = new Vapi(key);
  return vapi;
}

/**
 * Speaks text via a one-shot Vapi call: the assistant says `text` as its first
 * message, then the call is torn down as soon as it finishes speaking.
 * Resolves false (not throws) if Vapi is unavailable.
 */
export async function playTts(text: string): Promise<boolean> {
  const client = getClient();
  const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
  if (!client || !assistantId) return false;

  return new Promise((resolve) => {
    let done = false;
    const finish = (ok: boolean) => {
      if (done) return;
      done = true;
      client.off("speech-end", onSpeechEnd);
      client.off("call-end", onCallEnd);
      client.off("error", onError);
      resolve(ok);
    };
    const onSpeechEnd = () => {
      void client.stop();
      finish(true);
    };
    const onCallEnd = () => finish(true);
    const onError = () => finish(false);

    client.on("speech-end", onSpeechEnd);
    client.on("call-end", onCallEnd);
    client.on("error", onError);

    void client
      .start(assistantId, { firstMessage: text, firstMessageMode: "assistant-speaks-first" })
      .catch(() => finish(false));
  });
}
