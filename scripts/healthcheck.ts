/**
 * Pings every external integration and reports plain pass/fail — run this before a
 * demo instead of trusting the UI, since several integrations degrade silently
 * (translation falls back to placeholder text, news falls back to a fixture, Vapi
 * fails with no visible error). Never inserts/mutates data.
 *
 *     npm run healthcheck            # local env (.env.local / SQLITE)
 *     dotenv -e .env.neon.local -- tsx scripts/healthcheck.ts   # prod DB
 */
import "dotenv/config";
import { db } from "../lib/db/client";
import { elders, medications, medEvents, relayMessages, gameScores } from "../lib/db/schema";
import { complete, MODEL } from "../lib/llm/client";

type Result = { name: string; ok: boolean; detail: string };

async function checkDb(): Promise<Result> {
  // Query builder (not raw .execute) so this works against both the Neon/pg driver
  // and the local better-sqlite3 driver, matching every other query in the app.
  // Confirm the tables the app actually queries exist — schema drift has bitten
  // this project before (game_scores and relay_messages.mode were both missing
  // from a stale migration).
  const checks: [string, unknown][] = [
    ["elders", elders],
    ["medications", medications],
    ["med_events", medEvents],
    ["relay_messages", relayMessages],
    ["game_scores", gameScores],
  ];
  try {
    for (const [name, table] of checks) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await db.select().from(table as any).limit(1);
      void name;
    }
    return { name: "Database", ok: true, detail: "connected, all expected tables present" };
  } catch (err) {
    return { name: "Database", ok: false, detail: err instanceof Error ? err.message : String(err) };
  }
}

async function checkLlm(): Promise<Result> {
  const keyEnvVar =
    MODEL.provider === "openai"
      ? "OPENAI_API_KEY"
      : MODEL.provider === "gemini"
        ? "GEMINI_API_KEY"
        : MODEL.provider === "groq"
          ? "GROQ_API_KEY"
          : "ANTHROPIC_API_KEY";
  if (!process.env[keyEnvVar]) {
    return { name: "LLM", ok: false, detail: `provider=${MODEL.provider}, missing ${keyEnvVar}` };
  }
  const out = await complete("Reply with exactly one word.", "Say: ok");
  if (!out) {
    return { name: "LLM", ok: false, detail: `provider=${MODEL.provider} — request failed or timed out` };
  }
  return { name: "LLM", ok: true, detail: `provider=${MODEL.provider}, model=${MODEL.name}, replied "${out}"` };
}

async function checkApify(): Promise<Result> {
  const token = process.env.APIFY_TOKEN;
  if (!token) return { name: "Apify (news)", ok: false, detail: "missing APIFY_TOKEN" };
  try {
    const res = await fetch(`https://api.apify.com/v2/users/me?token=${token}`);
    if (!res.ok) return { name: "Apify (news)", ok: false, detail: `token rejected (HTTP ${res.status})` };
    const data = await res.json();
    return { name: "Apify (news)", ok: true, detail: `token valid for user ${data.data?.username ?? "?"}` };
  } catch (err) {
    return { name: "Apify (news)", ok: false, detail: err instanceof Error ? err.message : String(err) };
  }
}

function checkVapi(): Result {
  const key = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
  const assistant = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
  if (!key || !assistant) {
    return {
      name: "Vapi (voice)",
      ok: false,
      detail: `missing ${!key ? "NEXT_PUBLIC_VAPI_PUBLIC_KEY" : "NEXT_PUBLIC_VAPI_ASSISTANT_ID"}`,
    };
  }
  return {
    name: "Vapi (voice)",
    ok: true,
    detail: "env vars present (actual call only works from a browser tab — not verified here)",
  };
}

async function main() {
  const results = await Promise.all([checkDb(), checkLlm(), checkApify()]);
  results.push(checkVapi());

  console.log("\nCaretaker health check\n" + "-".repeat(40));
  let allOk = true;
  for (const r of results) {
    allOk &&= r.ok;
    console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name.padEnd(16)} ${r.detail}`);
  }
  console.log("-".repeat(40));
  console.log(allOk ? "All integrations healthy.\n" : "One or more integrations need attention before a demo.\n");
  process.exit(allOk ? 0 : 1);
}

main();
