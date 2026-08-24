import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ViewRoot } from "@/components/ViewRoot";
import { FamilyNav } from "@/components/family/FamilyNav";
import { CallFab } from "@/components/family/CallFab";
import { SettingsFab } from "@/components/family/SettingsFab";

export default function FamilyLayout({ children }: { children: React.ReactNode }) {
  return (
    <ViewRoot view="family">
      <div className="mx-auto flex max-w-[640px] flex-col min-h-dvh">
        <header className="flex items-center justify-between border-b border-[var(--hairline)] px-4 py-3">
          <Link href="/" target="_top">
            <Logo size={32} />
          </Link>
          <span className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.06em] text-[var(--ink-soft)]">
            Popo · Sunrise SNF
          </span>
        </header>
        <FamilyNav />
        <main className="flex-1 px-4 py-4">{children}</main>
        <CallFab />
        <SettingsFab />
      </div>
    </ViewRoot>
  );
}
