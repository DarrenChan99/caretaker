/**
 * Self-check for the voice-picking logic in lib/relay/playTts.ts.
 *
 * The bug this guards: falling back to an English voice reads Traditional Chinese as
 * gibberish out loud on Popo's device. Preferring Cantonese, tolerating any Chinese,
 * and returning null rather than "some voice" is the whole contract.
 *
 * Run: npx tsx scripts/check-tts.ts
 */
import assert from "node:assert/strict";

const voice = (name: string, lang: string) => ({ name, lang }) as SpeechSynthesisVoice;

async function run() {
  (globalThis as Record<string, unknown>).window = {};
  const { pickFrom } = await import("../lib/relay/playTts");

  const cantonese = voice("Sinji", "zh-HK");
  const mandarin = voice("Tingting", "zh-CN");
  const english = voice("Samantha", "en-US");

  assert.equal(pickFrom([english, mandarin, cantonese]), cantonese, "prefers Cantonese");
  assert.equal(pickFrom([english, mandarin]), mandarin, "falls back to any Chinese voice");
  assert.equal(pickFrom([english]), null, "never falls back to English");
  assert.equal(pickFrom([]), null, "no voices at all is null, not a crash");

  // Some platforms report underscores (zh_HK) rather than BCP-47 hyphens.
  const underscored = voice("Sinji", "zh_HK");
  assert.equal(pickFrom([english, underscored]), underscored, "tolerates zh_HK underscore form");

  console.log("playTts voice selection: 5/5 ok");
}

void run();
