import { loadCompanionVars } from "@/lib/vapi/companionVars";
import { CompanionCall } from "@/components/popo/CompanionCall";

export const dynamic = "force-dynamic";

/**
 * The AI companion Popo taps when she wants someone to talk to. Same assistant and
 * same per-elder variables as /demo/companion, minus the bench controls.
 */
export default async function PopoCompanionPage() {
  return <CompanionCall vars={await loadCompanionVars("popo")} />;
}
