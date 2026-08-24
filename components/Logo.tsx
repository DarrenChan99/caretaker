import Image from "next/image";

/**
 * The 家 mark beside the wordmark.
 *
 * The design system ships the mark and the wordmark but never a lockup — its brand
 * card predates the icon and still says "no logo mark was supplied". This is the
 * construction from what it does specify: the Demo header's wordmark (Fraunces 600,
 * -0.01em) and the icon board's squircle, whose corner radius is 22.5% of the tile.
 *
 * Popo's view deliberately gets no wordmark — Latin branding is noise on her screen.
 */
export function Logo({ size = 32, wordmark = true }: { size?: number; wordmark?: boolean }) {
  return (
    <span className="flex items-center gap-[var(--space-3)]">
      <Image
        src="/logo-mark.png"
        alt={wordmark ? "" : "Caretaker"}
        aria-hidden={wordmark || undefined}
        width={size}
        height={size}
        priority
        style={{ borderRadius: size * 0.225 }}
      />
      {wordmark && (
        <span
          className="font-[family-name:var(--font-display)] font-semibold text-[var(--ink)]"
          style={{ fontSize: size * 0.66, letterSpacing: "-0.01em" }}
        >
          Caretaker
        </span>
      )}
    </span>
  );
}
