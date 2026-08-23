// drizzle-kit push hangs/no-ops against this Neon project (confirmed twice), so
// apply a generated drizzle-pg/*.sql migration file directly over the Neon HTTP
// driver instead — same one the app uses at runtime.
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const file = process.argv[2];
if (!file) {
  console.error("usage: node scripts/apply-pg-migration.mjs <path-to-migration.sql>");
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const statements = readFileSync(file, "utf8")
  .split("--> statement-breakpoint")
  .map((s) => s.trim())
  .filter(Boolean);

for (const [i, stmt] of statements.entries()) {
  console.log(`[${i + 1}/${statements.length}] ${stmt.slice(0, 80)}...`);
  await sql.query(stmt);
}
console.log("done.");
