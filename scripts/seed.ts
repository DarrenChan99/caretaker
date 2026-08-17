import "dotenv/config";
import { db } from "../lib/db/client";
import { elders, familyMembers, medications, newsItems } from "../lib/db/schema";
import { eq } from "drizzle-orm";
import { zhHK } from "../lib/i18n/zh-HK";

const ELDER_ID = "popo";

async function upsertElder() {
  const existing = await db.select().from(elders).where(eq(elders.id, ELDER_ID));
  if (existing.length) return existing[0];
  const [row] = await db
    .insert(elders)
    .values({
      id: ELDER_ID,
      nameEn: "Popo",
      nameZh: "婆婆",
      preferredNameZh: "婆婆",
      facilityName: "Sunrise Skilled Nursing",
      locale: "zh-HK",
    })
    .returning();
  console.log("elder:", row.nameZh);
  return row;
}

async function upsertFamily() {
  const seedPeople = [
    {
      nameEn: "Ken",
      nameZh: "阿健",
      relationshipEn: "grandson",
      relationshipZh: "孫仔",
      photoPath: "/people/grandson__ken.svg",
      introZh: "婆婆，我係阿健，你嘅孫仔。我好掛住你。",
    },
    {
      nameEn: "Mary",
      nameZh: "阿May",
      relationshipEn: "daughter",
      relationshipZh: "女兒",
      photoPath: "/people/daughter__mary.svg",
      introZh: zhHK.needsEdit,
    },
    {
      nameEn: "Tom",
      nameZh: "阿Tom",
      relationshipEn: "son",
      relationshipZh: "兒子",
      photoPath: "/people/son__tom.svg",
      introZh: zhHK.needsEdit,
    },
  ];

  for (const [order, person] of seedPeople.entries()) {
    const existing = await db
      .select()
      .from(familyMembers)
      .where(eq(familyMembers.nameEn, person.nameEn));
    if (existing.length) continue;
    await db.insert(familyMembers).values({
      elderId: ELDER_ID,
      ...person,
      treeOrder: order,
    });
    console.log("family member:", person.nameZh);
  }
}

async function upsertMeds() {
  const existing = await db.select().from(medications).where(eq(medications.elderId, ELDER_ID));
  if (existing.length) return;
  await db.insert(medications).values({
    elderId: ELDER_ID,
    nameZh: "血壓藥",
    doseZh: "一粒，早餐後",
    scheduledTime: "09:00",
    active: true,
  });
  console.log("medication seeded");
}

async function seedNewsQueue() {
  const existing = await db.select().from(newsItems);
  if (existing.length) return;
  const now = Date.now();
  await db.insert(newsItems).values([
    {
      source: "生活副刊",
      headlineZh: "今日天氣涼爽，適合喺花園散步",
      passageZh:
        "今日天氣涼爽，陽光柔和。公園嘅花開得好靚，好多老友記出嚟散步、傾偈。醫生建議，天氣好嘅時候，可以出去曬吓太陽，對身體好。",
      url: "https://example.com/news/weather-garden",
      fetchedAt: new Date(now - 1000 * 60 * 60 * 26),
      approved: false,
      reviewedAt: null, // pending, awaiting family approval
    },
    {
      source: "生活副刊",
      headlineZh: "老人院辦茶會，長者一齊包餃子",
      passageZh:
        "琴日一間老人院舉辦咗一個包餃子活動，好多長者都好開心咁參加。大家一齊搓麵粉、包餡料，好似返去細個時同屋企人一齊過年咁。",
      url: "https://example.com/news/dumpling-party",
      fetchedAt: new Date(now - 1000 * 60 * 60 * 50),
      approved: true,
      reviewedAt: new Date(now - 1000 * 60 * 60 * 49), // approved yesterday
    },
    {
      source: "生活副刊",
      headlineZh: "本地農場開放日，一家大細去摘士多啤梨",
      passageZh:
        "呢個週末，一間本地農場舉辦開放日，好多家庭帶埋小朋友一齊去摘士多啤梨。農場主人話，天氣好嘅日子最多人嚟，大家玩得好開心。",
      url: "https://example.com/news/strawberry-farm",
      fetchedAt: new Date(now - 1000 * 60 * 60 * 74),
      approved: false,
      reviewedAt: new Date(now - 1000 * 60 * 60 * 73), // skipped
    },
  ]);
  console.log("news queue seeded (3 items: pending, approved, skipped)");
}

async function main() {
  await upsertElder();
  await upsertFamily();
  await upsertMeds();
  await seedNewsQueue();
  console.log("seed complete");
}

main();
