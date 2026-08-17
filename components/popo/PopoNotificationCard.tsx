"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useRelayStream } from "@/lib/relay/useRelayStream";
import { zhHK } from "@/lib/i18n/zh-HK";

interface LatestMessage {
  id: string;
  playedAt: string | null;
}

/**
 * §1.5 is the authority: this never auto-plays. It waits for her tap, which is also
 * what unlocks playback audio for that call.
 */
export function PopoNotificationCard() {
  const { lastMessageId } = useRelayStream();
  const [unplayed, setUnplayed] = useState(false);

  function check() {
    fetch("/api/relay/latest")
      .then((r) => r.json())
      .then((row: LatestMessage | null) => setUnplayed(!!row && !row.playedAt));
  }

  useEffect(check, []);
  useEffect(() => {
    if (lastMessageId) check();
  }, [lastMessageId]);

  if (!unplayed) return null;

  return (
    <Link
      href="/popo/relay"
      className="mb-[calc(24px*var(--scale))] flex items-center gap-[calc(16px*var(--scale))] rounded-[16px] border-2 border-[var(--amber)] bg-[var(--paper)] p-[calc(24px*var(--scale))]"
    >
      <MessageCircle size={48} className="shrink-0 text-[var(--amber)]" />
      <span className="font-[family-name:var(--font-zh-sans)] text-[calc(28px*var(--scale))] font-medium text-[var(--ink)]">
        {zhHK.someoneIsCalling}
      </span>
    </Link>
  );
}
