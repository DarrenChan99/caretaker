import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { familyMembers } from "@/lib/db/schema";

/**
 * Who "I" am on the family side. Single-user for now and relay messages are sent as
 * "Ken" (see /api/relay/send), so "me" is Ken — falling back to whoever is first if
 * the seed differs. Shared by /api/family/me and /family/call so the tab and the API
 * can never disagree about which member is placing the call.
 *
 * ponytail: replace both callers with a real session lookup when the family side
 * grows past one user (see also the hardcoded sender in /api/relay/send).
 */
export async function getFamilyMe() {
  const [ken] = await db
    .select()
    .from(familyMembers)
    .where(eq(familyMembers.nameEn, "Ken"))
    .limit(1);
  if (ken) return ken;

  const [first] = await db.select().from(familyMembers).limit(1);
  return first ?? null;
}
