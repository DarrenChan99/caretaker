"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { newsItems } from "@/lib/db/schema";

export async function approveNews(id: string) {
  await db
    .update(newsItems)
    .set({ approved: true, reviewedAt: new Date() })
    .where(eq(newsItems.id, id));
  revalidatePath("/family/news");
}

export async function skipNews(id: string) {
  await db
    .update(newsItems)
    .set({ approved: false, reviewedAt: new Date() })
    .where(eq(newsItems.id, id));
  revalidatePath("/family/news");
}
