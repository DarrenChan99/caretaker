import { desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { newsItems } from "@/lib/db/schema";
import { NewsQueue } from "@/components/family/NewsQueue";

export default async function FamilyNewsPage() {
  const pendingRows = await db
    .select()
    .from(newsItems)
    .where(isNull(newsItems.reviewedAt))
    .orderBy(desc(newsItems.fetchedAt))
    .limit(1);

  const history = await db.select().from(newsItems).orderBy(desc(newsItems.fetchedAt)).limit(10);

  return <NewsQueue pending={pendingRows[0] ?? null} history={history} />;
}
