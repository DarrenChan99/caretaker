"use client";

import Link from "next/link";
import { Home } from "lucide-react";
import { zhHK } from "@/lib/i18n/zh-HK";

/**
 * The full-bleed screen every Popo call state sits on. `tone="calling"` is the
 * sage ground the ring uses — the one moment the whole screen is the brand colour,
 * so an incoming call is unmistakable from across a room.
 *
 * Shared by /popo/call and CompanionCall, which each had their own copy.
 */
export function CallScreen({
  children,
  tone = "calm",
}: {
  children: React.ReactNode;
  tone?: "calm" | "calling";
}) {
  return (
    <div
      className="flex min-h-dvh flex-col items-center justify-center gap-[calc(28px*var(--scale))] px-8 text-center"
      style={{ background: tone === "calling" ? "var(--surface-primary)" : "var(--canvas)" }}
    >
      {children}
    </div>
  );
}

export function HomeButton() {
  return (
    <Link
      href="/popo"
      className="flex items-center gap-2 rounded-[var(--radius-md)] border-2 border-[var(--sage)] bg-[var(--surface-card)] px-[calc(26px*var(--scale))] font-[family-name:var(--font-zh-sans)] text-[calc(21px*var(--scale))] font-medium text-[var(--text-action)]"
      style={{ minHeight: "max(72px, calc(56px * var(--scale)))" }}
    >
      <Home size={28} />
      {zhHK.backHome}
    </Link>
  );
}
