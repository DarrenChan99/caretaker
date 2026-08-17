"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/family", label: "Today" },
  { href: "/family/relay", label: "Relay" },
  { href: "/family/news", label: "News" },
  { href: "/family/meds", label: "Meds" },
  { href: "/family/tree", label: "Tree" },
  { href: "/family/settings", label: "Settings" },
];

export function FamilyNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-4 overflow-x-auto border-b border-[var(--hairline)] px-4 py-2 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.06em]">
      {LINKS.map((link) => {
        const active = link.href === "/family" ? pathname === "/family" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={active ? "text-[var(--sage-deep)]" : "text-[var(--ink-soft)]"}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
