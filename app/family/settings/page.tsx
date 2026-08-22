"use client";

import Link from "next/link";
import { Home } from "lucide-react";
import { useSettings } from "@/lib/settings/useSettings";
import { VOICE_RATES } from "@/lib/settings/types";

export default function FamilySettingsPage() {
  const { settings, update, hydrated } = useSettings("family");
  if (!hydrated) return null;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[20px] font-semibold">Settings</h1>

      <SettingRow label="Contrast">
        {(["standard", "high"] as const).map((c) => (
          <OptionButton key={c} active={settings.contrast === c} onClick={() => update({ contrast: c })}>
            {c === "standard" ? "Standard" : "High contrast"}
          </OptionButton>
        ))}
      </SettingRow>

      <SettingRow label="Motion">
        {(["full", "reduced"] as const).map((m) => (
          <OptionButton key={m} active={settings.motion === m} onClick={() => update({ motion: m })}>
            {m === "full" ? "Full" : "Reduced"}
          </OptionButton>
        ))}
      </SettingRow>

      <SettingRow label="Relay voice rate">
        {VOICE_RATES.map((rate) => (
          <OptionButton key={rate} active={settings.voiceRate === rate} onClick={() => update({ voiceRate: rate })}>
            {rate}×
          </OptionButton>
        ))}
      </SettingRow>

      <SettingRow label="Captions">
        {[true, false].map((v) => (
          <OptionButton key={String(v)} active={settings.showCaptions === v} onClick={() => update({ showCaptions: v })}>
            {v ? "On" : "Off"}
          </OptionButton>
        ))}
      </SettingRow>

      <SettingRow label="Theme">
        {(["cream", "high-contrast-dark"] as const).map((t) => (
          <OptionButton key={t} active={settings.theme === t} onClick={() => update({ theme: t })}>
            {t === "cream" ? "Light" : "Dark"}
          </OptionButton>
        ))}
      </SettingRow>

      <Link
        href="/family"
        className="mt-2 flex min-h-[48px] items-center justify-center gap-2 rounded-[10px] border-2 border-[var(--sage)] px-6 text-[15px] text-[var(--sage-deep)]"
      >
        <Home size={18} />
        Back home
      </Link>
    </div>
  );
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[14px] font-medium text-[var(--ink)]">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
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
      className="rounded-[8px] border-2 px-3 py-1.5 text-[13px]"
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
