import { eq, and, isNull, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/lib/db/client";
import { familyMembers, memories, videoCallSessions } from "@/lib/db/schema";
import { PersonEditor } from "@/components/family/PersonEditor";

export default async function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [person] = await db.select().from(familyMembers).where(eq(familyMembers.id, id));
  if (!person) notFound();

  const personMemories = await db.select().from(memories).where(eq(memories.familyMemberId, id));

  // Video calls not yet turned into (or discarded from) a memory — see saveCallMemory.
  const pendingCalls = await db
    .select({
      id: videoCallSessions.id,
      endedAt: videoCallSessions.endedAt,
      transcriptJson: videoCallSessions.transcriptJson,
    })
    .from(videoCallSessions)
    .leftJoin(memories, eq(memories.videoCallSessionId, videoCallSessions.id))
    .where(and(eq(videoCallSessions.familyMemberId, id), isNull(memories.id)))
    .orderBy(desc(videoCallSessions.endedAt));

  return <PersonEditor person={person} memories={personMemories} pendingCalls={pendingCalls} />;
}
