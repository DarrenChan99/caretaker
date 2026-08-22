import { eq, asc } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db/client";
import { familyMembers } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function FamilyTreePage() {
  const people = await db
    .select()
    .from(familyMembers)
    .where(eq(familyMembers.elderId, "popo"))
    .orderBy(asc(familyMembers.treeOrder));

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[20px] font-semibold">Family Tree</h1>

      {people.length === 0 && (
        <p className="text-[15px] text-[var(--ink-soft)]">No family members on file.</p>
      )}

      <div className="flex flex-col gap-2">
        {people.map((p) => (
          <Link
            key={p.id}
            href={`/family/people/${p.id}`}
            className="flex items-center gap-3 rounded-[12px] border border-[var(--hairline)] bg-[var(--paper)] p-3 shadow-[var(--shadow-card)]"
          >
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
              <Image src={p.photoPath} alt={p.nameEn} fill className="object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="text-[16px] font-medium text-[var(--ink)]">{p.nameEn}</span>
              <span className="text-[13px] text-[var(--ink-soft)]">{p.relationshipEn}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
