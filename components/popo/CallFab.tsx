"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone } from "lucide-react";
import { zhHK } from "@/lib/i18n/zh-HK";

/**
 * Calling family is the one thing on this screen that isn't browsing, so it leaves
 * the destination stack and floats. Bottom-centre because HomeFab owns bottom-left
 * and SettingsFab owns bottom-right.
 *
 * Home only — everywhere else HomeFab is the way back and a second floating action
 * would compete with it.
 */
export function CallFab() {
  const pathname = usePathname();
  if (pathname !== "/popo") return null;

  return (
    <Link
      href="/popo/call"
      aria-label={zhHK.homeCall}
      className="fixed bottom-[calc(20px*var(--scale))] left-1/2 z-40 flex -translate-x-1/2 items-center gap-[calc(16px*var(--scale))] rounded-full bg-[var(--surface-primary)] px-[calc(32px*var(--scale))] text-[var(--text-on-primary)] shadow-[var(--shadow-dialog)]"
      // The call-control floor is 96px however small her text scale is set.
      style={{ minHeight: "max(96px, calc(72px * var(--scale)))" }}
    >
      <Phone className="shrink-0" style={{ width: "calc(40px*var(--scale))", height: "calc(40px*var(--scale))" }} />
      <span className="font-[family-name:var(--font-zh-sans)] text-[calc(32px*var(--scale))] font-medium">
        {zhHK.homeCall}
      </span>
    </Link>
  );
}
