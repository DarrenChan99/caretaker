import Link from "next/link";

// For the real demo, open /popo and /family in two tiled windows directly — no nav
// crosses between the two views inside the app (§1). This page (and /demo) are just
// convenient jump-off points, useful for sharing one Vercel link.
export default function RootPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[var(--cream)]">
      <p className="font-[family-name:var(--font-display)] text-[24px] font-semibold">
        Caretaker
      </p>
      <div className="flex gap-3">
        <Link href="/popo" className="rounded-[8px] bg-[var(--sage)] px-4 py-2 text-white">
          Open /popo
        </Link>
        <Link
          href="/family"
          className="rounded-[8px] border border-[var(--sage)] px-4 py-2 text-[var(--sage-deep)]"
        >
          Open /family
        </Link>
      </div>
      <Link href="/demo" className="text-[13px] text-[var(--ink-soft)] underline">
        Or open both side by side →
      </Link>
    </div>
  );
}
