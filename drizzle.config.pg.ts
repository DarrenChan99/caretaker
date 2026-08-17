import { defineConfig } from "drizzle-kit";

// Vercel deployment target (Neon Postgres). Run: npm run db:push:pg
export default defineConfig({
  schema: "./lib/db/schema.pg.ts",
  out: "./drizzle-pg",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
