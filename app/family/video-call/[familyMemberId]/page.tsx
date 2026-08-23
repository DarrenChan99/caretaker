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
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[var(--cream)] px-8 text-center">
        <PhoneOff size={40} className="text-[var(--sage-deep)]" />
        <p className="text-[20px] font-medium text-[var(--ink)]">{zhHK.callEnded}</p>
        <button
          onClick={() => router.back()}
          className="rounded-[8px] bg-[var(--sage)] px-4 py-2 text-[13px] text-white"
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
