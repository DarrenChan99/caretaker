// Re-exports whichever dialect's table objects are actually live, not just
// Postgres's. Column *shapes* match between schema.pg.ts and schema.sqlite.ts, but
// defaults (e.g. `now()` vs `unixepoch()`) are dialect-specific SQL baked into the
// table object — importing the wrong one breaks inserts against the other driver.
//
// Typed as the Postgres shape always (matching lib/db/client.ts's `db` type) so
// call sites get one consistent type instead of a PgTable | SQLiteTable union that
// breaks drizzle's generic inference. Safe because client.ts picks its driver from
// the same usePg flag, so the runtime object always matches the driver in use.
import * as pg from "./schema.pg";
import * as sqlite from "./schema.sqlite";
import { usePg } from "./dialect";

const active = (usePg ? pg : sqlite) as unknown as typeof pg;

export const elders = active.elders;
export const familyMembers = active.familyMembers;
export const memories = active.memories;
export const medications = active.medications;
export const medEvents = active.medEvents;
export const newsItems = active.newsItems;
export const callSessions = active.callSessions;
export const relayMessages = active.relayMessages;
export const relayState = active.relayState;
export const gameScores = active.gameScores;
