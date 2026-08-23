import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// Column types (text/integer) are chosen to be a mechanical Postgres port later:
// text -> text/uuid, integer timestamp -> timestamptz, integer boolean -> boolean.
const id = (name = "id") =>
  text(name)
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const createdAt = (name = "created_at") =>
  integer(name, { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`);

export const elders = sqliteTable("elders", {
  id: id(),
  nameEn: text("name_en").notNull(),
  nameZh: text("name_zh").notNull(),
  preferredNameZh: text("preferred_name_zh").notNull(),
  facilityName: text("facility_name").notNull(),
  locale: text("locale").notNull().default("zh-HK"),
});

export const familyMembers = sqliteTable("family_members", {
  id: id(),
  elderId: text("elder_id")
    .notNull()
    .references(() => elders.id),
  nameEn: text("name_en").notNull(),
  nameZh: text("name_zh").notNull(),
  relationshipEn: text("relationship_en").notNull(),
  relationshipZh: text("relationship_zh").notNull(),
  photoPath: text("photo_path").notNull(),
  introZh: text("intro_zh").notNull(),
  voiceNotePath: text("voice_note_path"),
  treeParentId: text("tree_parent_id"),
  treeOrder: integer("tree_order").notNull().default(0),
  // Opt-in public profile URL for the Apify memory-draft stretch feature — null = not enabled.
  socialHandle: text("social_handle"),
});

export const memories = sqliteTable("memories", {
  id: id(),
  familyMemberId: text("family_member_id")
    .notNull()
    .references(() => familyMembers.id),
  titleZh: text("title_zh").notNull(),
  bodyZh: text("body_zh").notNull(),
  year: integer("year"),
  photoPath: text("photo_path"),
  source: text("source", { enum: ["manual", "call", "apify"] }).notNull().default("manual"),
  bodyEn: text("body_en"),
  videoCallSessionId: text("video_call_session_id").references(() => videoCallSessions.id),
});

export const medications = sqliteTable("medications", {
  id: id(),
  elderId: text("elder_id")
    .notNull()
    .references(() => elders.id),
  nameZh: text("name_zh").notNull(),
  doseZh: text("dose_zh").notNull(),
  scheduledTime: text("scheduled_time").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
});

export const medEvents = sqliteTable("med_events", {
  id: id(),
  medicationId: text("medication_id")
    .notNull()
    .references(() => medications.id),
  occurredAt: createdAt("occurred_at"),
  confirmed: integer("confirmed", { mode: "boolean" }).notNull().default(false),
  source: text("source", { enum: ["call", "family", "reminder"] }).notNull(),
});

export const newsItems = sqliteTable("news_items", {
  id: id(),
  source: text("source").notNull(),
  headlineZh: text("headline_zh").notNull(),
  passageZh: text("passage_zh").notNull(),
  url: text("url").notNull(),
  fetchedAt: createdAt("fetched_at"),
  approved: integer("approved", { mode: "boolean" }).notNull().default(false),
  reviewedAt: integer("reviewed_at", { mode: "timestamp" }), // null = pending review
});

export const callSessions = sqliteTable("call_sessions", {
  id: id(),
  elderId: text("elder_id")
    .notNull()
    .references(() => elders.id),
  startedAt: createdAt("started_at"),
  endedAt: integer("ended_at", { mode: "timestamp" }),
  transcriptJson: text("transcript_json"),
});

// Family<->popo video call (LiveKit transport + client-side dual Vapi interpreter).
// Kept separate from callSessions (reserved for the single-elder AI-companion call)
// since this always has a familyMemberId — clean attribution, no name-matching guesswork.
export const videoCallSessions = sqliteTable("video_call_sessions", {
  id: id(),
  elderId: text("elder_id")
    .notNull()
    .references(() => elders.id),
  familyMemberId: text("family_member_id")
    .notNull()
    .references(() => familyMembers.id),
  startedAt: createdAt("started_at"),
  endedAt: integer("ended_at", { mode: "timestamp" }),
  transcriptJson: text("transcript_json"), // TranscriptEntry[] — see components/videoCall/VideoCallRoom.tsx
});

export const relayMessages = sqliteTable("relay_messages", {
  id: id(),
  elderId: text("elder_id")
    .notNull()
    .references(() => elders.id),
  senderNameEn: text("sender_name_en").notNull(),
  textEn: text("text_en").notNull(),
  textZh: text("text_zh").notNull(),
  mode: text("mode", { enum: ["message", "voice"] }).notNull().default("message"),
  createdAt: createdAt("created_at"),
  playedAt: integer("played_at", { mode: "timestamp" }),
});

// One row per elder. DB-backed (not in-process) so the turn flag is correct even
// when send/receive/stream land on different serverless instances (Vercel).
export const gameScores = sqliteTable("game_scores", {
  id: id(),
  elderId: text("elder_id")
    .notNull()
    .references(() => elders.id),
  gameId: text("game_id").notNull(),
  gameTitleZh: text("game_title_zh").notNull(),
  score: integer("score").notNull(),
  achievedAt: createdAt("achieved_at"),
});

export const relayState = sqliteTable("relay_state", {
  elderId: text("elder_id").primaryKey(),
  whoseTurn: text("whose_turn", { enum: ["family", "popo", "idle"] }).notNull().default("family"),
  updatedAt: createdAt("updated_at"),
  // Set while a video call invite is ringing on the popo side; null otherwise.
  pendingCallFamilyMemberId: text("pending_call_family_member_id"),
});
