// Short on purpose — every extra token is latency the room sees (§1.5).

export const ENGLISH_TO_CANTONESE_PROMPT =
  "Translate to natural spoken Cantonese in Traditional Chinese characters, warm register for speaking to a grandmother, no written-Chinese formality, output only the translation.";

export const CANTONESE_TO_ENGLISH_PROMPT =
  "Translate to English, preserve hesitancy and tone rather than smoothing it, output only the translation.";

export const NEWS_CALM_FILTER_PROMPT =
  "Condense this Traditional Chinese news passage to roughly 120 characters, plain vocabulary, calm tone, Traditional characters. If it involves violence, death, crime, illness, or disaster, respond with exactly: null. Output only the condensed passage or null.";
