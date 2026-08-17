/**
 * Phase 1 bootstrap (§7). Scans /public/people for `{relationship-en}__{name-en}.{ext}`,
 * upserts a family_members row per photo. Idempotent: re-running only adds new files,
 * never touches rows already edited in-app.
 */
import "dotenv/config";
import { readdirSync } from "fs";
import path from "path";
import { db } from "../lib/db/client";
import { familyMembers } from "../lib/db/schema";
import { eq } from "drizzle-orm";
import { relationshipZh } from "../lib/i18n/relationships";
import { zhHK } from "../lib/i18n/zh-HK";

const ELDER_ID = "popo";
const PEOPLE_DIR = path.join(process.cwd(), "public", "people");
const ACCEPTED_EXT = [".jpg", ".jpeg", ".png", ".webp", ".heic"];
const FILENAME_RE = /^([a-z-]+)__([a-z0-9-]+)\.([a-zA-Z]+)$/;

function titleCase(slug: string) {
  return slug
    .split("-")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}

async function convertHeicIfNeeded(file: string): Promise<string> {
  if (!file.toLowerCase().endsWith(".heic")) return file;
  try {
    // @ts-expect-error optional dependency, not installed by default
    const heicConvert = (await import("heic-convert")).default;
    const { readFileSync, writeFileSync } = await import("fs");
    const input = readFileSync(path.join(PEOPLE_DIR, file));
    const output = await heicConvert({ buffer: input, format: "JPEG", quality: 0.9 });
    const jpgName = file.replace(/\.heic$/i, ".jpg");
    writeFileSync(path.join(PEOPLE_DIR, jpgName), output);
    console.log(`converted ${file} -> ${jpgName}`);
    return jpgName;
  } catch (err) {
    console.warn(
      `TODO: missing dependency "heic-convert" — could not convert ${file}. Run: npm i heic-convert`,
    );
    return file;
  }
}

async function main() {
  let files: string[];
  try {
    files = readdirSync(PEOPLE_DIR);
  } catch {
    console.log(`no ${PEOPLE_DIR} directory yet — nothing to seed`);
    return;
  }

  let created = 0;
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!ACCEPTED_EXT.includes(ext)) continue;

    const match = FILENAME_RE.exec(file);
    if (!match) {
      console.warn(`skipped (doesn't match {relationship}__{name}.ext): ${file}`);
      continue;
    }

    const [, relationshipEn, nameSlug] = match;
    const finalFile = await convertHeicIfNeeded(file);
    const nameEn = titleCase(nameSlug);

    const existing = await db
      .select()
      .from(familyMembers)
      .where(eq(familyMembers.nameEn, nameEn));
    if (existing.length) {
      console.log(`already exists, skipping: ${nameEn}`);
      continue;
    }

    await db.insert(familyMembers).values({
      elderId: ELDER_ID,
      nameEn,
      nameZh: zhHK.needsEdit,
      relationshipEn,
      relationshipZh: relationshipZh(relationshipEn),
      photoPath: `/people/${finalFile}`,
      introZh: zhHK.needsEdit,
      treeOrder: 999,
    });
    created++;
    console.log(`created: ${nameEn} (${relationshipEn})`);
  }

  console.log(`\ndone — ${created} new family member(s) created from photos.`);
}

main();
