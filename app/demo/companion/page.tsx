import { loadCompanionVars } from "@/lib/vapi/companionVars";
import { CompanionSetup } from "@/components/demo/CompanionSetup";

export const dynamic = "force-dynamic";

/**
 * Demo bench for the Vapi companion: fill in who she is, watch the system prompt fill
 * in live, then start the call with that exact text.
 *
 * The seeded rows only pre-fill the boxes — every field stays editable, so the demo
 * still works end to end on a laptop with no DB and no seed run. The real call Popo
 * taps lives at /popo/companion and shares the same config and variables.
 */
export default async function CompanionDemoPage() {
  return <CompanionSetup defaults={await loadCompanionVars("popo")} />;
}
