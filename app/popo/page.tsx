import { eq } from "drizzle-orm";
import { Users, Newspaper, Phone } from "lucide-react";
import { db } from "@/lib/db/client";

export const dynamic = "force-dynamic";
import { elders } from "@/lib/db/schema";
import { zhHK } from "@/lib/i18n/zh-HK";
import { PopoNotificationCard } from "@/components/popo/PopoNotificationCard";
import { DestinationButton } from "@/components/popo/DestinationButton";

export default async function PopoHome() {
  const [elder] = await db.select().from(elders).where(eq(elders.id, "popo"));
  const name = elder?.preferredNameZh ?? "婆婆";
  const dateZh = new Intl.DateTimeFormat("zh-Hant", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(new Date());

  return (
    <div className="flex min-h-dvh flex-col justify-between px-[calc(24px*var(--scale))] py-[calc(32px*var(--scale))]">
      <div>
        <PopoNotificationCard />
        <h1 className="font-[family-name:var(--font-zh-sans)] text-[calc(56px*var(--scale))] font-bold leading-[1.15] text-[var(--ink)]">
          {zhHK.greeting(name)}
        </h1>
        <p className="mt-[calc(8px*var(--scale))] font-[family-name:var(--font-zh-sans)] text-[calc(28px*var(--scale))] text-[var(--ink)]">
          {dateZh}
        </p>
      </div>

      <div className="flex flex-col gap-[calc(24px*var(--scale))]">
        <DestinationButton href="/popo/people" icon={Users} label={zhHK.homeFamily} />
        <DestinationButton href="/popo/news" icon={Newspaper} label={zhHK.homeNews} />
        <DestinationButton href="/popo/call" icon={Phone} label={zhHK.homeChat} />
      </div>
    </div>
  );
}
