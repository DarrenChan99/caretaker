"use client";

import Link from "next/link";
import { Home } from "lucide-react";
import { useSettings } from "@/lib/settings/useSettings";
import { TEXT_SCALES, VOICE_RATES } from "@/lib/settings/types";
import { zhHK } from "@/lib/i18n/zh-HK";

export default function PopoSettingsPage() {
  const { settings, update, hydrated } = useSettings("popo");
  if (!hydrated) return null;

  return (
    <div className="flex min-h-dvh flex-col gap-[calc(24px*var(--scale))] px-[calc(24px*var(--scale))] py-[calc(32px*var(--scale))]">
      <h1 className="font-[family-name:var(--font-zh-sans)] text-[calc(36px*var(--scale))] font-bold">
        Settings
      </h1>

      <SettingRow label="Text size">
        {TEXT_SCALES.map((scale) => (
          <OptionButton
            key={scale}
            active={settings.textScale === scale}
            onClick={() => update({ textScale: scale })}
          >
            {scale}×
          </OptionButton>
        ))}
      </SettingRow>

      <SettingRow label="Contrast">
        {(["standard", "high"] as const).map((c) => (
          <OptionButton
            key={c}
            active={settings.contrast === c}
            onClick={() => update({ contrast: c })}
          >
            {c === "standard" ? "Standard" : "High contrast"}
          </OptionButton>
        ))}
      </SettingRow>

      <SettingRow label="Theme">
        {(["cream", "high-contrast-dark"] as const).map((t) => (
          <OptionButton
            key={t}
            active={settings.theme === t}
            onClick={() => update({ theme: t })}
          >
            {t === "cream" ? "Light" : "Dark"}
          </OptionButton>
        ))}
      </SettingRow>

      <SettingRow label="Speech rate">
        {VOICE_RATES.map((rate) => (
          <OptionButton
            key={rate}
            active={settings.voiceRate === rate}
            onClick={() => update({ voiceRate: rate })}
          >
            {rate}×
          </OptionButton>
        ))}
      </SettingRow>

      <Link
        href="/popo"
        className="mt-auto flex min-h-[max(72px,calc(44px*var(--scale)))] items-center justify-center gap-2 rounded-[16px] border-2 border-[var(--sage)] px-6 font-[family-name:var(--font-zh-sans)] text-[calc(24px*var(--scale))] text-[var(--sage-deep)]"
      >
        <Home size={28} />
        {zhHK.backHome}
      </Link>
    </div>
  );
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[calc(12px*var(--scale))]">
      <p className="font-[family-name:var(--font-zh-sans)] text-[calc(22px*var(--scale))] font-medium">
        {label}
      </p>
      <div className="flex flex-wrap gap-[calc(8px*var(--scale))]">{children}</div>
    </div>
  );
}

function OptionButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-[10px] border-2 px-[calc(16px*var(--scale))] py-[calc(10px*var(--scale))] font-[family-name:var(--font-zh-sans)] text-[calc(18px*var(--scale))]"
      style={{
        borderColor: active ? "var(--sage-deep)" : "var(--sage)",
        background: active ? "var(--sage-deep)" : "var(--paper)",
        color: active ? "white" : "var(--sage-deep)",
      }}
    >
      {children}
    </button>
  );
}
