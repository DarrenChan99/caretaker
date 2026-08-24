"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone } from "lucide-react";
import { useRelayStream } from "@/lib/relay/useRelayStream";
import { zhHK } from "@/lib/i18n/zh-HK";

/**
 * The ring. Mounted in the popo layout so an incoming video call reaches her on
 * whatever screen she happens to be on — the call invite arrives over the same
 * SSE stream as relay messages (relay_state.pending_call_family_member_id).
 *
 * Like PopoNotificationCard this never auto-joins: it waits for her tap, which is
 * also what unlocks camera/mic for that call.
 */
export function PopoIncomingCall() {
  const { callInvite } = useRelayStream();
  const pathname = usePathname();

  // The video-call page renders its own full-screen ring/answer UI.
  if (!callInvite || pathname === "/popo/video-call") return null;

  return (
    <Link
      href="/popo/video-call"
      className="fixed inset-x-0 top-0 z-50 mx-auto flex max-w-[640px] items-center gap-[calc(16px*var(--scale))] border-b-2 border-[var(--sage)] bg-[var(--sage)] p-[calc(20px*var(--scale))] text-white shadow-lg"
    >
      <Phone size={44} className="shrink-0 animate-pulse" />
      <span className="font-[family-name:var(--font-zh-sans)] text-[calc(28px*var(--scale))] font-medium">
        {zhHK.incomingCallTitle}
      </span>
    </Link>
  );
}
