import { defineConfig } from "drizzle-kit";

// Local dev/demo target (SQLite). See drizzle.config.pg.ts for the Neon target.
export default defineConfig({
  schema: "./lib/db/schema.sqlite.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.SQLITE_PATH ?? "./caretaker.db",
  },
});
