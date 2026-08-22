import Link from "next/link";
import { Settings } from "lucide-react";

export function SettingsFab() {
  return (
    <Link
      href="/family/settings"
      aria-label="Settings"
      className="fixed bottom-3 right-3 z-40 rounded-full border border-[var(--hairline)] bg-[var(--paper)] p-2.5 text-[var(--ink-soft)] shadow-[var(--shadow-card)]"
    >
      <Settings size={18} />
    </Link>
  );
}
