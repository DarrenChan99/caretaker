"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULTS, storageKey, type Settings, type ViewName } from "./types";

function read(view: ViewName): Settings {
  if (typeof window === "undefined") return DEFAULTS[view];
  try {
    const raw = window.localStorage.getItem(storageKey(view));
    if (!raw) return DEFAULTS[view];
    return { ...DEFAULTS[view], ...JSON.parse(raw) };
  } catch {
    return DEFAULTS[view];
  }
}

/** Reads/writes `caretaker.prefs.<view>` in localStorage. Each view's store is independent. */
export function useSettings(view: ViewName) {
  const [settings, setSettings] = useState<Settings>(() => DEFAULTS[view]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSettings(read(view));
    setHydrated(true);
  }, [view]);

  const update = useCallback(
    (patch: Partial<Settings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...patch };
        window.localStorage.setItem(storageKey(view), JSON.stringify(next));
        return next;
      });
    },
    [view],
  );

  return { settings, update, hydrated };
}
