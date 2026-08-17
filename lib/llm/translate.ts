import { appendFile, mkdir } from "fs/promises";
import path from "path";
import { complete } from "./client";
import { ENGLISH_TO_CANTONESE_PROMPT, CANTONESE_TO_ENGLISH_PROMPT } from "./prompts";
import cache from "./cache.json";

export type Direction = "en-zh" | "zh-en";

const LOG_PATH = path.join(process.cwd(), "logs", "translations.log");

async function log(direction: Direction, input: string, output: string, cached: boolean) {
  console.log(`[translate:${direction}]${cached ? " (cache)" : ""} "${input}" -> "${output}"`);
  try {
    await mkdir(path.dirname(LOG_PATH), { recursive: true });
    await appendFile(
      LOG_PATH,
      `${new Date().toISOString()}\t${direction}\t${cached ? "cache" : "llm"}\t${input}\t${output}\n`,
    );
  } catch {
    // best-effort logging only
  }
}

/** Cache lookup first (committed, prewarmed with demo lines), then a live LLM call. */
export async function translate(text: string, direction: Direction): Promise<string> {
  const key = `${direction}:${text}`;
  const hit = (cache as Record<string, string>)[key];
  if (hit) {
    await log(direction, text, hit, true);
    return hit;
  }

  const system =
    direction === "en-zh" ? ENGLISH_TO_CANTONESE_PROMPT : CANTONESE_TO_ENGLISH_PROMPT;
  const result = await complete(system, text);
  const output = result ?? (direction === "en-zh" ? "〔傳譯暫時未能使用〕" : "[translation unavailable]");
  await log(direction, text, output, false);
  return output;
}
