"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";
import { zhHK } from "@/lib/i18n/zh-HK";

/** Persistent way back to /popo from any screen — hidden on the home screen itself. */
export function HomeFab() {
  const pathname = usePathname();
  if (pathname === "/popo") return null;

  return (
    <Link
      href="/popo"
      aria-label={zhHK.backHome}
      className="fixed bottom-2 left-2 z-40 flex items-center gap-1.5 rounded-full border-2 border-[var(--sage)] bg-[var(--paper)] px-3 py-2 text-[var(--sage-deep)] shadow-[var(--shadow-card)]"
    >
      <Home size={20} />
    </Link>
  );
}
