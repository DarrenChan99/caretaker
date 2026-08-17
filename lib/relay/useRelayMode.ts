"use client";

import { useCallback, useEffect, useState } from "react";
import type { DeliveryMode } from "./deliver";

const KEY = "caretaker.relayMode";

/** Message mode is the default and the fallback (§1.5) — flips instantly, no reload. */
export function useRelayMode() {
  const [mode, setMode] = useState<DeliveryMode>("message");

  useEffect(() => {
    const stored = window.localStorage.getItem(KEY);
    if (stored === "message" || stored === "voice") setMode(stored);
  }, []);

  const set = useCallback((next: DeliveryMode) => {
    setMode(next);
    window.localStorage.setItem(KEY, next);
  }, []);

  return { mode, setMode: set };
}
