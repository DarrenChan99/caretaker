"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { familyMembers, memories, videoCallSessions } from "@/lib/db/schema";

export async function updatePerson(id: string, formData: FormData) {
  const socialHandle = String(formData.get("socialHandle") ?? "").trim();
  await db
    .update(familyMembers)
    .set({
      nameEn: String(formData.get("nameEn") ?? ""),
      nameZh: String(formData.get("nameZh") ?? ""),
      relationshipEn: String(formData.get("relationshipEn") ?? ""),
      relationshipZh: String(formData.get("relationshipZh") ?? ""),
      introZh: String(formData.get("introZh") ?? ""),
      socialHandle: socialHandle || null,
    })
    .where(eq(familyMembers.id, id));

  revalidatePath(`/family/people/${id}`);
}

export async function addMemory(familyMemberId: string, formData: FormData) {
  const yearRaw = String(formData.get("year") ?? "").trim();
  await db.insert(memories).values({
    familyMemberId,
    titleZh: String(formData.get("titleZh") ?? ""),
    bodyZh: String(formData.get("bodyZh") ?? ""),
    year: yearRaw ? Number(yearRaw) : null,
  });

  revalidatePath(`/family/people/${familyMemberId}`);
}

/** Approves an Apify-sourced post draft (see app/api/social/refresh) into a real memory. */
export async function saveDraftMemory(familyMemberId: string, formData: FormData) {
  await db.insert(memories).values({
    familyMemberId,
    titleZh: String(formData.get("titleZh") ?? ""),
    bodyZh: String(formData.get("bodyZh") ?? ""),
    bodyEn: String(formData.get("bodyEn") ?? "") || null,
    source: "apify",
  });

  revalidatePath(`/family/people/${familyMemberId}`);
}

/** Approves a video-call transcript draft into a real memory, family-edited first. */
export async function saveCallMemory(
  familyMemberId: string,
  videoCallSessionId: string,
  formData: FormData,
) {
  const [session] = await db
    .select()
    .from(videoCallSessions)
    .where(eq(videoCallSessions.id, videoCallSessionId));
  if (!session) return;

  await db.insert(memories).values({
    familyMemberId,
    titleZh: String(formData.get("titleZh") ?? ""),
    bodyZh: String(formData.get("bodyZh") ?? ""),
    bodyEn: String(formData.get("bodyEn") ?? "") || null,
    source: "call",
    videoCallSessionId,
  });

  revalidatePath(`/family/people/${familyMemberId}`);
}
