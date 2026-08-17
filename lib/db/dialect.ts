// Single source of truth for which dialect is active, read by both client.ts
// (driver) and schema.ts (table objects) so they never disagree about which one
// is live. See client.ts for why USE_SQLITE exists.
export const usePg = !process.env.USE_SQLITE && !!process.env.DATABASE_URL;
