"use client";

import { useState, useTransition } from "react";
import { Check, X, RefreshCw } from "lucide-react";
import { approveNews, skipNews } from "@/app/family/news/actions";

interface NewsRow {
  id: string;
  source: string;
  headlineZh: string;
  passageZh: string;
  approved: boolean;
  reviewedAt: Date | null;
  fetchedAt: Date;
}

export function NewsQueue({ pending, history }: { pending: NewsRow | null; history: NewsRow[] }) {
  const [pendingAction, startTransition] = useTransition();
  const [refreshing, setRefreshing] = useState(false);

  async function refresh() {
    setRefreshing(true);
    await fetch("/api/news/refresh", { method: "POST" });
    setRefreshing(false);
    window.location.reload();
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-[family-name:var(--font-display)] text-[24px] font-semibold">News</h1>

      {pending ? (
        <div className="flex flex-col gap-3 rounded-[12px] border border-[var(--hairline)] bg-[var(--paper)] p-4 shadow-[var(--shadow-card)]">
          <span className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.06em] text-[var(--ink-soft)]">
            {pending.source}
          </span>
          <h2 className="zh text-[24px] font-bold">{pending.headlineZh}</h2>
          <p className="zh text-[18px] leading-[1.7]">{pending.passageZh}</p>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => startTransition(() => approveNews(pending.id))}
              disabled={pendingAction}
              className="flex items-center gap-1.5 rounded-[8px] bg-[var(--sage)] px-4 py-2 text-[14px] font-medium text-white disabled:opacity-50"
            >
              <Check size={16} /> Approve for Popo
            </button>
            <button
              onClick={() => startTransition(() => skipNews(pending.id))}
              disabled={pendingAction}
              className="flex items-center gap-1.5 rounded-[8px] border border-[var(--hairline)] px-4 py-2 text-[14px] text-[var(--ink-soft)] disabled:opacity-50"
            >
              <X size={16} /> Skip today
            </button>
          </div>
        </div>
      ) : (
        <p className="text-[15px] text-[var(--ink-soft)]">Nothing awaiting review right now.</p>
      )}

      <button
        onClick={refresh}
        disabled={refreshing}
        className="flex w-fit items-center gap-1.5 rounded-[8px] border border-[var(--hairline)] px-4 py-2 text-[14px] text-[var(--ink)] disabled:opacity-50"
      >
        <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
        {refreshing ? "Refreshing…" : "Refresh from source"}
      </button>

      <div className="flex flex-col gap-2">
        <h2 className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.06em] text-[var(--ink-soft)]">
          History
        </h2>
        {history.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-[8px] border border-[var(--hairline)] px-3 py-2">
            <span className="zh truncate text-[15px]">{item.headlineZh}</span>
            <span
              className="shrink-0 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.06em]"
              style={{ color: !item.reviewedAt ? "var(--amber)" : item.approved ? "var(--sage-deep)" : "var(--ink-soft)" }}
            >
              {!item.reviewedAt ? "Pending" : item.approved ? "Approved" : "Skipped"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
