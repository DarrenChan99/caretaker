import { eq, asc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { familyMembers } from "@/lib/db/schema";
import { FaceCards } from "@/components/popo/FaceCards";

export default async function PopoPeoplePage() {
  const people = await db
    .select()
    .from(familyMembers)
    .where(eq(familyMembers.elderId, "popo"))
    .orderBy(asc(familyMembers.treeOrder));

  return <FaceCards people={people} />;
}
