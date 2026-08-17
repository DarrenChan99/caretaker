/**
 * Pre-warms lib/llm/cache.json with a translation line so the demo script never hits
 * the network. Usage: npx tsx scripts/prewarm-cache.ts en-zh "Popo, it's Ken."
 */
import "dotenv/config";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { complete } from "../lib/llm/client";
import { ENGLISH_TO_CANTONESE_PROMPT, CANTONESE_TO_ENGLISH_PROMPT } from "../lib/llm/prompts";

const CACHE_PATH = path.join(process.cwd(), "lib", "llm", "cache.json");

async function main() {
  const [direction, text] = process.argv.slice(2);
  if (direction !== "en-zh" && direction !== "zh-en") {
    console.error('usage: prewarm-cache.ts <en-zh|zh-en> "text"');
    process.exit(1);
  }
  if (!text) {
    console.error("missing text argument");
    process.exit(1);
  }

  const system = direction === "en-zh" ? ENGLISH_TO_CANTONESE_PROMPT : CANTONESE_TO_ENGLISH_PROMPT;
  const translation = await complete(system, text);
  if (!translation) {
    console.error("translation failed — check API key / network");
    process.exit(1);
  }

  const cache = JSON.parse(readFileSync(CACHE_PATH, "utf-8"));
  cache[`${direction}:${text}`] = translation;
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n");
  console.log(`cached: "${text}" -> "${translation}"`);
}

main();
