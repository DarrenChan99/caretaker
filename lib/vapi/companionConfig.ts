import {
  COMPANION_FIRST_MESSAGE,
  COMPANION_SYSTEM_PROMPT,
  fillPrompt,
  type CompanionVariables,
} from "@/lib/vapi/systemPrompt";

/**
 * One place to retune the companion's providers; Cantonese support is the only reason
 * for each pick. Shared by the real call on /popo/companion and the /demo/companion
 * bench, so what a stranger hears at the demo table is what Popo hears at home.
 */
export const COMPANION_CALL_CONFIG = {
  model: { provider: "openai", model: "gpt-4o" },
  voice: { provider: "azure", voiceId: "zh-HK-HiuMaanNeural" },
  transcriber: { provider: "deepgram", model: "nova-2", language: "zh-HK" },
} as const;

/**
 * The full inline assistant handed to vapi.start(). The prompt is sent already filled
 * rather than as variableValues, so the model receives exactly the text the demo bench
 * displays.
 */
export function buildCompanionAssistant(vars: Partial<CompanionVariables>) {
  return {
    ...COMPANION_CALL_CONFIG,
    model: {
      ...COMPANION_CALL_CONFIG.model,
      messages: [{ role: "system", content: fillPrompt(COMPANION_SYSTEM_PROMPT, vars) }],
    },
    firstMessage: fillPrompt(COMPANION_FIRST_MESSAGE, vars),
  };
}
