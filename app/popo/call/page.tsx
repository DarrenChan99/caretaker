"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, Home } from "lucide-react";
import { useRelayStream } from "@/lib/relay/useRelayStream";
import { VideoCallRoom } from "@/components/videoCall/VideoCallRoom";
import { zhHK } from "@/lib/i18n/zh-HK";

type Stage = "idle" | "ringing" | "in-call" | "ended";

export default function PopoVideoCallPage() {
  const router = useRouter();
  const { callInvite } = useRelayStream();
  const [stage, setStage] = useState<Stage>("idle");
  const [answeredFor, setAnsweredFor] = useState<string | null>(null);

  const effectiveStage: Stage =
    stage === "idle" && callInvite ? "ringing" : stage;

  if (effectiveStage === "in-call" && answeredFor) {
    return (
      <VideoCallRoom
        side="popo"
        familyMemberId={answeredFor}
        onEnded={() => setStage("ended")}
      />
    );
  }

  if (effectiveStage === "ringing" && callInvite) {
    return (
      <Screen>
        <p className="font-[family-name:var(--font-zh-sans)] text-[calc(32px*var(--scale))] font-bold text-[var(--ink)]">
          {zhHK.incomingCallTitle}
        </p>
        <button
          onClick={() => {
            setAnsweredFor(callInvite);
            setStage("in-call");
          }}
          className="flex min-h-[max(72px,calc(44px*var(--scale)))] w-[calc(200px*var(--scale))] flex-col items-center justify-center gap-2 rounded-full bg-[var(--sage)] text-white"
          style={{ height: "calc(200px * var(--scale))" }}
        >
          <Phone size={64} />
          <span className="font-[family-name:var(--font-zh-sans)] text-[calc(32px*var(--scale))] font-medium">
            {zhHK.answer}
          </span>
        </button>
      </Screen>
    );
  }

  if (effectiveStage === "ended") {
    return (
      <Screen>
        <p className="font-[family-name:var(--font-zh-sans)] text-[calc(28px*var(--scale))] font-medium text-[var(--ink)]">
          {zhHK.callEnded}
        </p>
        <HomeButton router={router} />
      </Screen>
    );
  }

  return (
    <Screen>
      <p className="font-[family-name:var(--font-zh-sans)] text-[calc(24px*var(--scale))] text-[var(--ink-soft)]">
        {zhHK.noActiveCall}
      </p>
      <HomeButton router={router} />
    </Screen>
  );
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-[calc(32px*var(--scale))] bg-[var(--cream)] px-8 text-center">
      {children}
    </div>
  );
}

function HomeButton({ router }: { router: ReturnType<typeof useRouter> }) {
  return (
    <button
      onClick={() => router.push("/popo")}
      className="flex min-h-[max(72px,calc(44px*var(--scale)))] items-center gap-2 rounded-[16px] border-2 border-[var(--sage)] bg-[var(--paper)] px-6 font-[family-name:var(--font-zh-sans)] text-[calc(24px*var(--scale))] text-[var(--sage-deep)]"
    >
      <Home size={32} />
      {zhHK.backHome}
    </button>
  );
}
