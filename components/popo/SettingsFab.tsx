"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";

/** Hidden on /popo/games — the games have their own fixed sizing, so the display
 * settings behind this button (text size, contrast, theme) don't apply there. */
export function SettingsFab() {
  const pathname = usePathname();
  if (pathname.startsWith("/popo/games")) return null;

  return (
    <Link
      href="/popo/settings"
      aria-label="Settings"
      className="absolute bottom-2 right-2 rounded-full p-2 text-[var(--ink)] opacity-30"
    >
      <Settings size={20} />
    </Link>
  );
}
