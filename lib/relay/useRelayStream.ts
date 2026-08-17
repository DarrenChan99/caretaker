"use client";

import { useEffect, useRef, useState } from "react";
import type { Turn } from "@/lib/audio/session";

export interface RelayMessage {
  id: string;
  elderId: string;
  senderNameEn: string;
  textEn: string;
  textZh: string;
  createdAt: string;
  playedAt: string | null;
}

export type ConnectionStatus = "connected" | "reconnecting";

/** Subscribes to /api/relay/stream with backoff reconnect. Never surfaces an error code. */
export function useRelayStream() {
  const [whoseTurn, setWhoseTurn] = useState<Turn>("family");
  const [status, setStatus] = useState<ConnectionStatus>("reconnecting");
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);
  const [lastPlayedId, setLastPlayedId] = useState<string | null>(null);
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
        if (data.type === "hello" || data.type === "turn") setWhoseTurn(data.whoseTurn);
        if (data.type === "message") setLastMessageId(data.messageId);
        if (data.type === "played") setLastPlayedId(data.messageId);
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

  return { whoseTurn, status, lastMessageId, lastPlayedId };
}
