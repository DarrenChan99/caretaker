import { pgTable, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

// Mirrors schema.sqlite.ts table-for-table. Kept as a separate file (not a shared
// generic) because drizzle's sqlite-core and pg-core table builders are different
// types — duplicating ~100 lines is simpler than a cross-dialect abstraction here.
const id = (name = "id") =>
  text(name)
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const createdAt = (name = "created_at") =>
  timestamp(name, { mode: "date", withTimezone: true }).notNull().defaultNow();

export const elders = pgTable("elders", {
  id: id(),
  nameEn: text("name_en").notNull(),
  nameZh: text("name_zh").notNull(),
  preferredNameZh: text("preferred_name_zh").notNull(),
  facilityName: text("facility_name").notNull(),
  locale: text("locale").notNull().default("zh-HK"),
});

export const familyMembers = pgTable("family_members", {
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

export const memories = pgTable("memories", {
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

export const medications = pgTable("medications", {
  id: id(),
  elderId: text("elder_id")
    .notNull()
    .references(() => elders.id),
  nameZh: text("name_zh").notNull(),
  doseZh: text("dose_zh").notNull(),
  scheduledTime: text("scheduled_time").notNull(),
  active: boolean("active").notNull().default(true),
});

export const medEvents = pgTable("med_events", {
  id: id(),
  medicationId: text("medication_id")
    .notNull()
    .references(() => medications.id),
  occurredAt: createdAt("occurred_at"),
  confirmed: boolean("confirmed").notNull().default(false),
  source: text("source", { enum: ["call", "family", "reminder"] }).notNull(),
});

export const newsItems = pgTable("news_items", {
  id: id(),
  source: text("source").notNull(),
  headlineZh: text("headline_zh").notNull(),
  passageZh: text("passage_zh").notNull(),
  url: text("url").notNull(),
  fetchedAt: createdAt("fetched_at"),
  approved: boolean("approved").notNull().default(false),
  reviewedAt: timestamp("reviewed_at", { mode: "date", withTimezone: true }), // null = pending review
});

export const callSessions = pgTable("call_sessions", {
  id: id(),
  elderId: text("elder_id")
    .notNull()
    .references(() => elders.id),
  startedAt: createdAt("started_at"),
  endedAt: timestamp("ended_at", { mode: "date", withTimezone: true }),
  transcriptJson: text("transcript_json"),
});

// Family<->popo video call (LiveKit transport + client-side dual Vapi interpreter).
// Kept separate from callSessions (reserved for the single-elder AI-companion call)
// since this always has a familyMemberId — clean attribution, no name-matching guesswork.
export const videoCallSessions = pgTable("video_call_sessions", {
  id: id(),
  elderId: text("elder_id")
    .notNull()
    .references(() => elders.id),
  familyMemberId: text("family_member_id")
    .notNull()
    .references(() => familyMembers.id),
  startedAt: createdAt("started_at"),
  endedAt: timestamp("ended_at", { mode: "date", withTimezone: true }),
  transcriptJson: text("transcript_json"), // TranscriptEntry[] — see components/videoCall/VideoCallRoom.tsx
});

export const relayMessages = pgTable("relay_messages", {
  id: id(),
  elderId: text("elder_id")
    .notNull()
    .references(() => elders.id),
  senderNameEn: text("sender_name_en").notNull(),
  textEn: text("text_en").notNull(),
  textZh: text("text_zh").notNull(),
  mode: text("mode", { enum: ["message", "voice"] }).notNull().default("message"),
  createdAt: createdAt("created_at"),
  playedAt: timestamp("played_at", { mode: "date", withTimezone: true }),
});

export const gameScores = pgTable("game_scores", {
  id: id(),
  elderId: text("elder_id")
    .notNull()
    .references(() => elders.id),
  gameId: text("game_id").notNull(),
  gameTitleZh: text("game_title_zh").notNull(),
  score: integer("score").notNull(),
  achievedAt: createdAt("achieved_at"),
});

export const relayState = pgTable("relay_state", {
  elderId: text("elder_id").primaryKey(),
  whoseTurn: text("whose_turn", { enum: ["family", "popo", "idle"] }).notNull().default("family"),
  updatedAt: createdAt("updated_at"),
  // Set while a video call invite is ringing on the popo side; null otherwise.
  pendingCallFamilyMemberId: text("pending_call_family_member_id"),
});
