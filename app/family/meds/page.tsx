import { eq, desc } from "drizzle-orm";
import { CheckCircle2, Clock } from "lucide-react";
import { db } from "@/lib/db/client";
import { medications, medEvents } from "@/lib/db/schema";
import { markMedTaken } from "../actions";

export const dynamic = "force-dynamic";

export default async function FamilyMedsPage() {
  const meds = await db.select().from(medications).where(eq(medications.elderId, "popo"));

  const eventsByMed = await Promise.all(
    meds.map((med) =>
      db
        .select()
        .from(medEvents)
        .where(eq(medEvents.medicationId, med.id))
        .orderBy(desc(medEvents.occurredAt))
        .limit(5),
    ),
  );

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[20px] font-semibold">Medications</h1>

      {meds.length === 0 && (
        <p className="text-[15px] text-[var(--ink-soft)]">No medications on file.</p>
      )}

      {meds.map((med, i) => {
        const events = eventsByMed[i];
        const todayEvent = events.find((e) => e.confirmed && e.occurredAt >= startOfToday);

        return (
          <div
            key={med.id}
            className="rounded-[12px] border border-[var(--hairline)] bg-[var(--paper)] p-4 shadow-[var(--shadow-card)]"
          >
            <div className="flex items-center justify-between">
              <p className="zh text-[16px] font-medium text-[var(--ink)]">
                {med.nameZh} · {med.doseZh}
              </p>
              <span className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.06em] text-[var(--ink-soft)]">
                {med.scheduledTime}
              </span>
            </div>

            <div className="mt-2 flex items-center gap-2">
              {todayEvent ? (
                <>
                  <CheckCircle2 size={18} className="text-[var(--sage)]" />
                  <span className="text-[15px]">
                    Confirmed today at{" "}
                    {todayEvent.occurredAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                  </span>
                </>
              ) : (
                <>
                  <Clock size={18} className="text-[var(--amber)]" />
                  <span className="text-[15px]">Not yet confirmed today</span>
                </>
              )}
            </div>

            {!todayEvent && (
              <form action={markMedTaken.bind(null, med.id)} className="mt-3">
                <button className="rounded-[8px] border border-[var(--sage)] px-3 py-1.5 text-[13px] text-[var(--sage-deep)]">
                  Mark as taken
                </button>
              </form>
            )}

            {events.length > 0 && (
              <div className="mt-3 border-t border-[var(--hairline)] pt-2">
                <span className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.06em] text-[var(--ink-soft)]">
                  Recent history
                </span>
                <ul className="mt-1 flex flex-col gap-1">
                  {events.map((e) => (
                    <li key={e.id} className="text-[13px] text-[var(--ink-soft)]">
                      {e.occurredAt.toLocaleString()} · {e.confirmed ? "confirmed" : "missed"} · via {e.source}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
