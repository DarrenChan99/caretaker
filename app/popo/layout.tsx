import Link from "next/link";
import { Settings } from "lucide-react";
import { ViewRoot } from "@/components/ViewRoot";
import { EntryGate } from "@/components/popo/EntryGate";

export default function PopoLayout({ children }: { children: React.ReactNode }) {
  return (
    <ViewRoot view="popo">
      <div className="relative mx-auto flex min-h-dvh max-w-[640px] flex-col">
        <EntryGate>{children}</EntryGate>
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
