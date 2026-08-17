"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { familyMembers, memories } from "@/lib/db/schema";

export async function updatePerson(id: string, formData: FormData) {
  await db
    .update(familyMembers)
    .set({
      nameEn: String(formData.get("nameEn") ?? ""),
      nameZh: String(formData.get("nameZh") ?? ""),
      relationshipEn: String(formData.get("relationshipEn") ?? ""),
      relationshipZh: String(formData.get("relationshipZh") ?? ""),
      introZh: String(formData.get("introZh") ?? ""),
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
