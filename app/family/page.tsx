import { eq, desc, asc } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Clock, Radio } from "lucide-react";
import { db } from "@/lib/db/client";
import { medications, medEvents, callSessions, familyMembers } from "@/lib/db/schema";
import { markMedTaken } from "./actions";

export default async function FamilyToday() {
  const [med] = await db
    .select()
    .from(medications)
    .where(eq(medications.elderId, "popo"))
    .limit(1);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  let confirmedAt: Date | null = null;
  if (med) {
    const [event] = await db
      .select()
      .from(medEvents)
      .where(eq(medEvents.medicationId, med.id))
      .orderBy(desc(medEvents.occurredAt))
      .limit(1);
    if (event && event.confirmed && event.occurredAt >= startOfToday) {
      confirmedAt = event.occurredAt;
    }
  }

  const [lastCall] = await db
    .select()
    .from(callSessions)
    .where(eq(callSessions.elderId, "popo"))
    .orderBy(desc(callSessions.startedAt))
    .limit(1);

  const people = await db
    .select()
    .from(familyMembers)
    .where(eq(familyMembers.elderId, "popo"))
    .orderBy(asc(familyMembers.treeOrder));

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex flex-1 flex-col gap-4">
        <div className="rounded-[12px] border border-[var(--hairline)] bg-[var(--paper)] p-4 shadow-[var(--shadow-card)]">
          <span className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.06em] text-[var(--ink-soft)]">
            Medication
          </span>
          <div className="mt-2 flex items-center gap-2">
            {confirmedAt ? (
              <>
                <CheckCircle2 size={20} className="text-[var(--sage)]" />
                <span className="text-[20px] font-semibold">
                  Confirmed at {confirmedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                </span>
              </>
            ) : (
              <>
                <Clock size={20} className="text-[var(--amber)]" />
                <span className="text-[20px] font-semibold">Not yet confirmed</span>
              </>
            )}
          </div>
          {med && (
            <p className="zh mt-2 text-[16px] text-[var(--ink)]">
              {med.nameZh} · {med.doseZh} · {med.scheduledTime}
            </p>
          )}
          {!confirmedAt && med && (
            <form action={markMedTaken.bind(null, med.id)} className="mt-3">
              <button className="rounded-[8px] border border-[var(--sage)] px-3 py-1.5 text-[13px] text-[var(--sage-deep)]">
                Mark as taken
              </button>
            </form>
          )}
        </div>

        <div className="rounded-[12px] border border-[var(--hairline)] bg-[var(--paper)] p-4 shadow-[var(--shadow-card)]">
          <span className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.06em] text-[var(--ink-soft)]">
            Last Call
          </span>
          {lastCall ? (
            <p className="mt-2 text-[15px] text-[var(--ink)]">
              {new Date(lastCall.startedAt).toLocaleString()}
            </p>
          ) : (
            <p className="mt-2 text-[15px] text-[var(--ink-soft)]">
              No conversations yet. Start one from Speak to Popo.
            </p>
          )}
        </div>
      </div>

      <div className="flex w-full flex-col gap-3 lg:w-[240px]">
        <Link
          href="/family/relay"
          className="flex min-h-[56px] items-center justify-center gap-2 rounded-[8px] bg-[var(--sage)] text-[15px] font-medium text-white"
        >
          <Radio size={18} /> Speak to Popo
        </Link>

        <div className="flex flex-col gap-2">
          {people.map((p) => (
            <Link
              key={p.id}
              href={`/family/people/${p.id}`}
              className="flex items-center gap-2 rounded-[8px] px-1 py-1 hover:bg-[var(--sage)]/5"
            >
              <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full">
                <Image src={p.photoPath} alt={p.nameZh} fill className="object-cover" />
              </div>
              <span className="zh text-[15px]">{p.nameZh}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
