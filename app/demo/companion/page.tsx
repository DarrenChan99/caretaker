import { eq, asc, desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { elders, familyMembers, medications, callSessions } from "@/lib/db/schema";
import type { CompanionVariables } from "@/lib/vapi/systemPrompt";
import { CompanionSetup } from "@/components/demo/CompanionSetup";

export const dynamic = "force-dynamic";

/**
 * Demo bench for the Vapi companion (§11, step 10): fill in who she is, watch the
 * system prompt fill in live, then start the call with that exact text.
 *
 * The seeded rows only pre-fill the boxes — every field stays editable, so the demo
 * still works end to end on a laptop with no DB and no seed run.
 */
export default async function CompanionDemoPage() {
  const seeded = await loadSeededDefaults();
  return <CompanionSetup defaults={seeded} />;
}

async function loadSeededDefaults(): Promise<Partial<CompanionVariables>> {
  try {
    const [elder] = await db.select().from(elders).where(eq(elders.id, "popo")).limit(1);
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
    // No DB / not seeded yet. The form's own placeholders carry the demo from here.
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
