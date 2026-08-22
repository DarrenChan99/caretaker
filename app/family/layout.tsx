import Link from "next/link";
import { ViewRoot } from "@/components/ViewRoot";
import { FamilyNav } from "@/components/family/FamilyNav";
import { SettingsFab } from "@/components/family/SettingsFab";

export default function FamilyLayout({ children }: { children: React.ReactNode }) {
  return (
    <ViewRoot view="family">
      <div className="mx-auto flex max-w-[640px] flex-col min-h-dvh">
        <header className="flex items-center justify-between border-b border-[var(--hairline)] px-4 py-3">
          <Link
            href="/"
            target="_top"
            className="font-[family-name:var(--font-display)] text-[20px] font-semibold"
          >
            Caretaker
          </Link>
          <span className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.06em] text-[var(--ink-soft)]">
            Popo · Sunrise SNF
          </span>
        </header>
        <FamilyNav />
        <main className="flex-1 px-4 py-4">{children}</main>
        <SettingsFab />
      </div>
    </ViewRoot>
  );
}
