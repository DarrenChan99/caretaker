import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/lib/db/client";
import { familyMembers, memories } from "@/lib/db/schema";
import { PersonEditor } from "@/components/family/PersonEditor";

export default async function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [person] = await db.select().from(familyMembers).where(eq(familyMembers.id, id));
  if (!person) notFound();

  const personMemories = await db.select().from(memories).where(eq(memories.familyMemberId, id));

  return <PersonEditor person={person} memories={personMemories} />;
}
