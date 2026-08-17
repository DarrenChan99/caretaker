"use client";

import type { ReactNode } from "react";
import { useSettings } from "@/lib/settings/useSettings";
import type { ViewName } from "@/lib/settings/types";

/** Applies the view's persisted settings (--scale, theme, contrast, motion) to its subtree. */
export function ViewRoot({ view, children }: { view: ViewName; children: ReactNode }) {
  const { settings } = useSettings(view);

  return (
    <div
      data-view={view}
      data-theme={settings.theme === "high-contrast-dark" ? "high-contrast-dark" : undefined}
      data-contrast={settings.contrast === "high" ? "high" : undefined}
      data-motion={settings.motion === "reduced" ? "reduced" : undefined}
      style={{ "--scale": settings.textScale } as React.CSSProperties}
      className="min-h-dvh w-full bg-[var(--cream)] text-[var(--ink)]"
    >
      {children}
    </div>
  );
}
