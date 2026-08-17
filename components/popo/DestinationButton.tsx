import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export function DestinationButton({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-[calc(20px*var(--scale))] rounded-[16px] border-2 border-[var(--sage)] bg-[var(--paper)] px-[calc(24px*var(--scale))]"
      style={{ minHeight: "calc(140px * var(--scale))" }}
    >
      <Icon size={48} className="shrink-0 text-[var(--sage-deep)]" />
      <span className="font-[family-name:var(--font-zh-sans)] text-[calc(36px*var(--scale))] font-medium text-[var(--ink)]">
        {label}
      </span>
    </Link>
  );
}
