"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { PhoneOff } from "lucide-react";
import { VideoCallRoom } from "@/components/videoCall/VideoCallRoom";
import { zhHK } from "@/lib/i18n/zh-HK";

export default function FamilyVideoCallPage({
  params,
}: {
  params: Promise<{ familyMemberId: string }>;
}) {
  const { familyMemberId } = use(params);
  const router = useRouter();
  const [ended, setEnded] = useState(false);

  if (ended) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-[var(--space-4)] bg-[var(--canvas)] px-8 text-center">
        <PhoneOff size={28} className="text-[var(--text-action)]" />
        <p className="font-[family-name:var(--font-display)] text-[18px] font-semibold text-[var(--text-body)]">
          {zhHK.callEnded}
        </p>
        <button
          onClick={() => router.back()}
          className="h-[var(--control-height-sm)] rounded-[var(--radius-sm)] border border-[var(--border-hairline)] bg-[var(--surface-card)] px-4 text-[14px] text-[var(--text-body)]"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <VideoCallRoom side="family" familyMemberId={familyMemberId} onEnded={() => setEnded(true)} />
  );
}
