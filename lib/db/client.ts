import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import { drizzle as drizzlePg } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as pgSchema from "./schema.pg";
import * as sqliteSchema from "./schema.sqlite";
import { usePg } from "./dialect";

/**
 * Local dev/demo runs on SQLite (offline-safe — venue wifi shouldn't be able to
 * take down the demo). The Vercel deployment runs on Neon Postgres (DATABASE_URL,
 * provisioned via the Marketplace), since serverless instances don't share a
 * filesystem. Set USE_SQLITE=true in .env.local to force the local path even when
 * DATABASE_URL is also present (e.g. after `vercel env pull`).
 */

function createDb(): NeonHttpDatabase<typeof pgSchema> {
  if (usePg) {
    const sql = neon(process.env.DATABASE_URL!);
    return drizzlePg(sql, { schema: pgSchema });
  }

  // better-sqlite3 has a different (sync) driver shape than neon-http, but the two
  // schemas are table-for-table identical, so casting here keeps one `db` type for
  // every call site instead of threading a union type through the whole app.
  const Database = require("better-sqlite3") as typeof import("better-sqlite3");
  const sqlite = new Database(process.env.SQLITE_PATH ?? "./caretaker.db");
  sqlite.pragma("journal_mode = WAL");
  return drizzleSqlite(sqlite, { schema: sqliteSchema }) as unknown as NeonHttpDatabase<
    typeof pgSchema
  >;
}

export const db = createDb();
