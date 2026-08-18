/**
 * One small, fast model for both translation directions. Swap providers by changing
 * MODEL below — nothing else in the app knows which provider is active.
 */
export const MODEL = {
  provider: (process.env.LLM_PROVIDER ?? "anthropic") as
    | "anthropic"
    | "openai"
    | "gemini"
    | "groq",
  name:
    process.env.LLM_PROVIDER === "openai"
      ? "gpt-4o-mini"
      : process.env.LLM_PROVIDER === "gemini"
        ? "gemini-1.5-flash"
        : process.env.LLM_PROVIDER === "groq"
          ? "openai/gpt-oss-20b"
          : "claude-haiku-4-5-20251001",
};

const MAX_TOKENS = 150;
const TIMEOUT_MS = 4000;

/** Returns null on timeout/failure/missing key — caller supplies a visible fallback. */
export async function complete(system: string, user: string): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    if (MODEL.provider === "anthropic") {
      const key = process.env.ANTHROPIC_API_KEY;
      if (!key) {
        console.warn("TODO: missing env var ANTHROPIC_API_KEY — translation stubbed");
        return null;
      }
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "content-type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: MODEL.name,
          max_tokens: MAX_TOKENS,
          system,
          messages: [{ role: "user", content: user }],
        }),
      });
      if (!res.ok) throw new Error(`anthropic ${res.status}`);
      const data = await res.json();
      return data.content?.[0]?.text?.trim() ?? null;
    }

    if (MODEL.provider === "openai") {
      const key = process.env.OPENAI_API_KEY;
      if (!key) {
        console.warn("TODO: missing env var OPENAI_API_KEY — translation stubbed");
        return null;
      }
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        signal: controller.signal,
        headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: MODEL.name,
          max_tokens: MAX_TOKENS,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
      });
      if (!res.ok) throw new Error(`openai ${res.status}`);
      const data = await res.json();
      return data.choices?.[0]?.message?.content?.trim() ?? null;
    }

    if (MODEL.provider === "groq") {
      const key = process.env.GROQ_API_KEY;
      if (!key) {
        console.warn("TODO: missing env var GROQ_API_KEY — translation stubbed");
        return null;
      }
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        signal: controller.signal,
        headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: MODEL.name,
          max_tokens: MAX_TOKENS,
          // gpt-oss is a reasoning model — without this it can burn the whole
          // token budget on its reasoning trace and return empty content.
          reasoning_effort: "low",
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
      });
      if (!res.ok) throw new Error(`groq ${res.status}`);
      const data = await res.json();
      return data.choices?.[0]?.message?.content?.trim() || null;
    }

    // gemini
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("TODO: missing env var GEMINI_API_KEY — translation stubbed");
      return null;
    }
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL.name}:generateContent?key=${key}`,
      {
        method: "POST",
        signal: controller.signal,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: user }] }],
          systemInstruction: { parts: [{ text: system }] },
          generationConfig: { maxOutputTokens: MAX_TOKENS },
        }),
      },
    );
    if (!res.ok) throw new Error(`gemini ${res.status}`);
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? null;
  } catch (err) {
    console.error("llm complete failed:", err instanceof Error ? err.message : err);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
