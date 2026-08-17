import { eq, desc, and } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { newsItems } from "@/lib/db/schema";
import { NewsReader } from "@/components/popo/NewsReader";
import { zhHK } from "@/lib/i18n/zh-HK";
import Link from "next/link";
import { Home } from "lucide-react";

export default async function PopoNewsPage() {
  const [item] = await db
    .select()
    .from(newsItems)
    .where(and(eq(newsItems.approved, true)))
    .orderBy(desc(newsItems.fetchedAt))
    .limit(1);

  if (!item) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-[calc(24px*var(--scale))] px-8 text-center">
        <p className="font-[family-name:var(--font-zh-sans)] text-[calc(32px*var(--scale))] font-bold">
          {zhHK.noNewsToday}
        </p>
        <Link
          href="/popo"
          className="flex min-h-[max(72px,calc(44px*var(--scale)))] items-center gap-2 rounded-[16px] border-2 border-[var(--sage)] px-6 font-[family-name:var(--font-zh-sans)] text-[calc(24px*var(--scale))] text-[var(--sage-deep)]"
        >
          <Home size={32} />
          {zhHK.backHome}
        </Link>
      </div>
    );
  }

  return <NewsReader headlineZh={item.headlineZh} passageZh={item.passageZh} />;
}
