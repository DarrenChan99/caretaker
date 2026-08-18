"use client";

import { useEffect, useRef, useState } from "react";
import type { Turn } from "@/lib/audio/session";

export interface RelayMessage {
  id: string;
  elderId: string;
  senderNameEn: string;
  textEn: string;
  textZh: string;
  mode: "message" | "voice";
  createdAt: string;
  playedAt: string | null;
}

export type ConnectionStatus = "connected" | "reconnecting";

/**
 * Subscribes to /api/relay/stream (DB-polled server-side, not in-process pub/sub —
 * see the route for why). `revision` bumps on any change (turn, new message, played
 * status) so consumers can just refetch on change instead of tracking event shapes.
 */
export function useRelayStream() {
  const [whoseTurn, setWhoseTurn] = useState<Turn>("family");
  const [status, setStatus] = useState<ConnectionStatus>("reconnecting");
  const [revision, setRevision] = useState(0);
  const retryDelay = useRef(1000);

  useEffect(() => {
    let es: EventSource | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    function connect() {
      es = new EventSource("/api/relay/stream");

      es.onopen = () => {
        retryDelay.current = 1000;
        setStatus("connected");
      };

      es.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.whoseTurn) setWhoseTurn(data.whoseTurn);
        if (data.type === "update") setRevision((r) => r + 1);
      };

      es.onerror = () => {
        setStatus("reconnecting");
        es?.close();
        if (cancelled) return;
        retryTimer = setTimeout(connect, retryDelay.current);
        retryDelay.current = Math.min(retryDelay.current * 2, 10000);
      };
    }

    connect();
    return () => {
      cancelled = true;
      es?.close();
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, []);

  return { whoseTurn, status, revision };
}
