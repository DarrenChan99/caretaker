import Link from "next/link";
import { Settings } from "lucide-react";
import { ViewRoot } from "@/components/ViewRoot";
import { EntryGate } from "@/components/popo/EntryGate";
import { ReminderPopup } from "@/components/popo/ReminderPopup";

export default function PopoLayout({ children }: { children: React.ReactNode }) {
  return (
    <ViewRoot view="popo">
      <div className="relative mx-auto flex min-h-dvh max-w-[640px] flex-col">
        {/* Inside the gate: the reminder must not fire (or try to speak) before she
            has tapped in and unlocked audio. */}
        <EntryGate>
          {children}
          <ReminderPopup />
        </EntryGate>
        <Link
          href="/popo/settings"
          aria-label="設定"
          className="absolute bottom-2 right-2 rounded-full p-2 text-[var(--ink)] opacity-30"
        >
          <Settings size={20} />
        </Link>
      </div>
    </ViewRoot>
  );
}
