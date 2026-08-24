"use client";

import { useState } from "react";
import { Phone } from "lucide-react";
import { useRelayStream } from "@/lib/relay/useRelayStream";
import { VideoCallRoom } from "@/components/videoCall/VideoCallRoom";
import { CallScreen, HomeButton } from "@/components/popo/CallScreen";
import { zhHK } from "@/lib/i18n/zh-HK";

type Stage = "idle" | "ringing" | "in-call" | "ended";

export default function PopoVideoCallPage() {
  const { callInvite } = useRelayStream();
  const [stage, setStage] = useState<Stage>("idle");
  const [answeredFor, setAnsweredFor] = useState<string | null>(null);

  const effectiveStage: Stage = stage === "idle" && callInvite ? "ringing" : stage;

  if (effectiveStage === "in-call" && answeredFor) {
    return (
      <VideoCallRoom side="popo" familyMemberId={answeredFor} onEnded={() => setStage("ended")} />
    );
  }

  if (effectiveStage === "ringing" && callInvite) {
    return (
      <CallScreen tone="calling">
        <p className="font-[family-name:var(--font-zh-sans)] text-[calc(30px*var(--scale))] font-bold text-[var(--text-on-primary)]">
          {zhHK.incomingCallTitle}
        </p>
        {/* One button. There is deliberately no decline: refusing a grandchild isn't
            something she needs UI for, and two targets here is the likeliest mistap. */}
        <button
          onClick={() => {
            setAnsweredFor(callInvite);
            setStage("in-call");
          }}
          className="flex aspect-square w-[calc(140px*var(--scale))] flex-col items-center justify-center gap-1 rounded-full bg-white text-[var(--text-action)] animate-[ct-ring_1.6s_var(--ease-out)_infinite]"
          style={{ minWidth: 118 }}
        >
          <Phone size={42} />
          <span className="font-[family-name:var(--font-zh-sans)] text-[calc(21px*var(--scale))] font-medium">
            {zhHK.answer}
          </span>
        </button>
      </CallScreen>
    );
  }

  if (effectiveStage === "ended") {
    return (
      <CallScreen>
        <p className="font-[family-name:var(--font-zh-sans)] text-[calc(25px*var(--scale))] font-medium text-[var(--text-body)]">
          {zhHK.callEnded}
        </p>
        <HomeButton />
      </CallScreen>
    );
  }

  return (
    <CallScreen>
      <p className="font-[family-name:var(--font-zh-sans)] text-[calc(23px*var(--scale))] text-[var(--text-muted)]">
        {zhHK.noActiveCall}
      </p>
      <HomeButton />
    </CallScreen>
  );
}
