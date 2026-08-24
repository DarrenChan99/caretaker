"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone } from "lucide-react";

/**
 * The family-side twin of Popo's call button, at the caregiver scale (48px, not 96).
 * Bottom-centre so it clears SettingsFab at bottom-right.
 *
 * The Call tab stays in FamilyNav — it's the route index, and this is the shortcut.
 */
export function CallFab() {
  const pathname = usePathname();
  if (pathname !== "/family") return null;

  return (
    <Link
      href="/family/call"
      className="fixed bottom-3 left-1/2 z-40 flex h-[var(--control-height-md)] -translate-x-1/2 items-center gap-2 rounded-full bg-[var(--surface-primary)] px-5 text-[15px] font-medium text-[var(--text-on-primary)] shadow-[var(--shadow-raised)]"
    >
      <Phone size={20} className="shrink-0" />
      Call Popo
    </Link>
  );
}
