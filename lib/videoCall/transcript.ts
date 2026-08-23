import type { TranscriptEntry } from "@/components/videoCall/VideoCallRoom";

/** Flattens a call transcript into draft Chinese/English memory body text, chronological. */
export function summarizeTranscript(entries: TranscriptEntry[]): { bodyZh: string; bodyEn: string } {
  const sorted = [...entries].sort((a, b) => a.at - b.at);
  const bodyZh = sorted.filter((e) => e.lang === "zh").map((e) => e.text).join(" ");
  const bodyEn = sorted.filter((e) => e.lang === "en").map((e) => e.text).join(" ");
  return { bodyZh, bodyEn };
}
