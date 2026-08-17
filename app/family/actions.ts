"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { medEvents } from "@/lib/db/schema";

export async function markMedTaken(medicationId: string) {
  await db.insert(medEvents).values({ medicationId, confirmed: true, source: "family" });
  revalidatePath("/family");
}
