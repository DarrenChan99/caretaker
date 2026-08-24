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
 *
 * A card rather than a full-width banner: caution-bordered so it reads as something
 * waiting on her, and it never stacks — there is only ever one call to answer.
 */
export function PopoIncomingCall() {
  const { callInvite } = useRelayStream();
  const pathname = usePathname();

  // The video-call page renders its own full-screen ring/answer UI.
  if (!callInvite || pathname === "/popo/call") return null;

  return (
    <div className="fixed inset-x-0 top-0 z-50 mx-auto max-w-[640px] p-[calc(16px*var(--scale))]">
      <div className="flex flex-col gap-[calc(14px*var(--scale))] rounded-[var(--radius-md)] border-2 border-[var(--surface-primary)] bg-[var(--surface-card)] p-[calc(18px*var(--scale))] shadow-[var(--shadow-dialog)]">
        <span className="font-[family-name:var(--font-zh-sans)] text-[calc(26px*var(--scale))] font-medium text-[var(--ink)]">
          {zhHK.incomingCallTitle}
        </span>
        <Link
          href="/popo/call"
          aria-label={zhHK.answer}
          className="flex items-center justify-center gap-[calc(12px*var(--scale))] rounded-[var(--radius-md)] bg-[var(--surface-primary)] px-[calc(20px*var(--scale))] text-[var(--text-on-primary)]"
          style={{ minHeight: "max(72px, calc(56px * var(--scale)))" }}
        >
          <Phone
            className="shrink-0 animate-[ct-ring_1.6s_var(--ease-out)_infinite]"
            style={{ width: "calc(30px*var(--scale))", height: "calc(30px*var(--scale))" }}
          />
          <span className="font-[family-name:var(--font-zh-sans)] text-[calc(24px*var(--scale))] font-medium">
            {zhHK.answer}
          </span>
        </Link>
      </div>
    </div>
  );
}
