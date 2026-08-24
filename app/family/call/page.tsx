import { redirect } from "next/navigation";
import { getFamilyMe } from "@/lib/family/me";

export const dynamic = "force-dynamic";

/**
 * The Call tab. Resolves who "me" is and hands off to the existing per-member call
 * page, which PersonEditor also links to — one call UI, two ways in.
 *
 * This replaces the link that used to sit at the bottom of the relay page, where a
 * null /api/family/me simply rendered nothing and left no way to place a call.
 */
export default async function FamilyCallPage() {
  const me = await getFamilyMe();

  if (!me) {
    return (
      <div className="flex flex-col gap-2 pt-8">
        <h1 className="font-[family-name:var(--font-display)] text-[20px] font-semibold">
          Call Popo
        </h1>
        <p className="text-[15px] text-[var(--ink-soft)]">
          No family members yet — add someone on the Tree tab first, then you can call.
        </p>
      </div>
    );
  }

  redirect(`/family/video-call/${me.id}`);
}
