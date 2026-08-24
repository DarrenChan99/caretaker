import Link from "next/link";
import { MonitorPlay } from "lucide-react";
import { Logo } from "@/components/Logo";

// For the real demo, open /popo and /family in two tiled windows directly — no nav
// crosses between the two views inside the app (§1). This page is the shareable
// entry point: the split-screen demo is the featured path, with direct single-view
// links kept underneath for testing each side on its own.
export default function RootPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-[var(--cream)] px-6">
      <Logo size={56} />

      <Link
        href="/demo"
        className="flex w-full max-w-[360px] flex-col items-center gap-2 rounded-[16px] bg-[var(--sage)] px-6 py-6 text-center text-white shadow-[var(--shadow-card)]"
      >
        <MonitorPlay size={28} />
        <span className="text-[18px] font-semibold">Look at the demo</span>
        <span className="text-[13px] text-white/85">Both views side by side</span>
      </Link>

      <div className="flex w-full max-w-[360px] flex-col gap-3">
        <Link
          href="/popo"
          className="rounded-[10px] border border-[var(--sage)] px-4 py-3 text-center text-[15px] text-[var(--sage-deep)]"
        >
          See what Grandma sees
        </Link>
        <Link
          href="/family"
          className="rounded-[10px] border border-[var(--sage)] px-4 py-3 text-center text-[15px] text-[var(--sage-deep)]"
        >
          What you see
        </Link>
      </div>
    </div>
  );
}
