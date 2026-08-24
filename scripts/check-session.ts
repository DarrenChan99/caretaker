/**
 * Self-check for lib/audio/session.ts's failure contract.
 *
 * The bug this guards: a caller flips its UI to "listening" and only unwinds in
 * onEnd, so every path where startRecognition() cannot start MUST return null and
 * fire both onError and onEnd. Miss one and the screen strands on a dead
 * "Listening…" with no way back (that was app/popo/relay/page.tsx for real).
 *
 * Run: npx tsx scripts/check-session.ts
 */
import assert from "node:assert/strict";

type Calls = { errors: string[]; ends: number };

function stubWindow(withRecognition: boolean, startThrows = false) {
  class FakeRecognition {
    lang = "";
    interimResults = false;
    continuous = false;
    onresult: unknown = null;
    onerror: unknown = null;
    onend: unknown = null;
    start() {
      if (startThrows) throw new Error("InvalidStateError");
    }
    stop() {}
  }
  (globalThis as Record<string, unknown>).window = withRecognition
    ? { SpeechRecognition: FakeRecognition }
    : {};
}

async function run() {
  const { startRecognition, setVoiceCallActive } = await import("../lib/audio/session");

  const spy = (): [Calls, Parameters<typeof startRecognition>[0]] => {
    const calls: Calls = { errors: [], ends: 0 };
    return [
      calls,
      {
        lang: "en-US",
        onInterim: () => {},
        onFinal: () => {},
        onError: (m) => calls.errors.push(m),
        onEnd: () => {
          calls.ends += 1;
        },
      },
    ];
  };

  // 1. No Web Speech API (Firefox).
  stubWindow(false);
  let [calls, opts] = spy();
  assert.equal(startRecognition(opts), null, "no ctor: must return null");
  assert.equal(calls.errors.length, 1, "no ctor: must report an error");
  assert.equal(calls.ends, 1, "no ctor: must fire onEnd so the caller unwinds");

  // 2. A voice call holds the mic.
  stubWindow(true);
  setVoiceCallActive(true);
  [calls, opts] = spy();
  assert.equal(startRecognition(opts), null, "call active: must return null");
  assert.equal(calls.errors.length, 1, "call active: must report an error");
  assert.equal(calls.ends, 1, "call active: must fire onEnd so the caller unwinds");
  setVoiceCallActive(false);

  // 3. start() throws instead of reporting through onerror.
  stubWindow(true, true);
  [calls, opts] = spy();
  assert.equal(startRecognition(opts), null, "start throws: must return null");
  assert.equal(calls.errors.length, 1, "start throws: must report an error");
  assert.equal(calls.ends, 1, "start throws: must fire onEnd so the caller unwinds");

  // 4. The happy path still hands back a stop handle and stays quiet.
  stubWindow(true);
  [calls, opts] = spy();
  const handle = startRecognition(opts);
  assert.ok(handle, "happy path: must return a handle");
  assert.equal(calls.errors.length, 0, "happy path: must not report an error");
  assert.equal(calls.ends, 0, "happy path: must not fire onEnd before it ends");

  console.log("session.ts failure contract: 4/4 ok");
}

void run();
