import { eq, asc, desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { elders, familyMembers, medications, callSessions } from "@/lib/db/schema";
import type { CompanionVariables } from "@/lib/vapi/systemPrompt";

/**
 * Builds the companion's per-elder variables from the DB. Server-only.
 *
 * Shared by /popo/companion (where these are the real call) and /demo/companion (where
 * they only pre-fill the form). Returns {} on any DB failure so the demo still works on
 * a laptop with no DB and no seed run — the prompt's own fallbacks carry it from there
 * (see VARIABLE_FALLBACKS in lib/vapi/systemPrompt.ts).
 */
export async function loadCompanionVars(elderId: string): Promise<Partial<CompanionVariables>> {
  try {
    const [elder] = await db.select().from(elders).where(eq(elders.id, elderId)).limit(1);
    if (!elder) return {};

    const people = await db
      .select()
      .from(familyMembers)
      .where(eq(familyMembers.elderId, elder.id))
      .orderBy(asc(familyMembers.treeOrder));

    const meds = await db.select().from(medications).where(eq(medications.elderId, elder.id));

    const [lastCall] = await db
      .select()
      .from(callSessions)
      .where(eq(callSessions.elderId, elder.id))
      .orderBy(desc(callSessions.startedAt))
      .limit(1);

    return {
      preferredName: elder.preferredNameZh,
      facilityName: elder.facilityName,
      familyMembers: people.map((p) => `${p.nameZh}（${p.relationshipZh}）`).join("、"),
      medications: meds
        .filter((m) => m.active)
        .map((m) => `${m.nameZh}，${m.doseZh}，${m.scheduledTime}`)
        .join("；"),
      lastCallSummary: summarize(lastCall?.transcriptJson ?? null),
    };
  } catch {
    return {};
  }
}

/** First thing she said last call, as a thread to pick back up. */
function summarize(transcriptJson: string | null): string {
  if (!transcriptJson) return "";
  try {
    const turns = JSON.parse(transcriptJson) as { role?: string; text?: string }[];
    const hers = turns.find((t) => t.role !== "assistant" && t.text)?.text;
    return hers ? `上次佢講起：${hers}` : "";
  } catch {
    return "";
  }
}
