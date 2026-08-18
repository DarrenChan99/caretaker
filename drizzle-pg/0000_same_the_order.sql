CREATE TABLE "call_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"elder_id" text NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone,
	"transcript_json" text
);
--> statement-breakpoint
CREATE TABLE "elders" (
	"id" text PRIMARY KEY NOT NULL,
	"name_en" text NOT NULL,
	"name_zh" text NOT NULL,
	"preferred_name_zh" text NOT NULL,
	"facility_name" text NOT NULL,
	"locale" text DEFAULT 'zh-HK' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "family_members" (
	"id" text PRIMARY KEY NOT NULL,
	"elder_id" text NOT NULL,
	"name_en" text NOT NULL,
	"name_zh" text NOT NULL,
	"relationship_en" text NOT NULL,
	"relationship_zh" text NOT NULL,
	"photo_path" text NOT NULL,
	"intro_zh" text NOT NULL,
	"voice_note_path" text,
	"tree_parent_id" text,
	"tree_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "med_events" (
	"id" text PRIMARY KEY NOT NULL,
	"medication_id" text NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"confirmed" boolean DEFAULT false NOT NULL,
	"source" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medications" (
	"id" text PRIMARY KEY NOT NULL,
	"elder_id" text NOT NULL,
	"name_zh" text NOT NULL,
	"dose_zh" text NOT NULL,
	"scheduled_time" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memories" (
	"id" text PRIMARY KEY NOT NULL,
	"family_member_id" text NOT NULL,
	"title_zh" text NOT NULL,
	"body_zh" text NOT NULL,
	"year" integer,
	"photo_path" text
);
--> statement-breakpoint
CREATE TABLE "news_items" (
	"id" text PRIMARY KEY NOT NULL,
	"source" text NOT NULL,
	"headline_zh" text NOT NULL,
	"passage_zh" text NOT NULL,
	"url" text NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL,
	"approved" boolean DEFAULT false NOT NULL,
	"reviewed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "relay_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"elder_id" text NOT NULL,
	"sender_name_en" text NOT NULL,
	"text_en" text NOT NULL,
	"text_zh" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"played_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "relay_state" (
	"elder_id" text PRIMARY KEY NOT NULL,
	"whose_turn" text DEFAULT 'family' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "call_sessions" ADD CONSTRAINT "call_sessions_elder_id_elders_id_fk" FOREIGN KEY ("elder_id") REFERENCES "public"."elders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_members" ADD CONSTRAINT "family_members_elder_id_elders_id_fk" FOREIGN KEY ("elder_id") REFERENCES "public"."elders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "med_events" ADD CONSTRAINT "med_events_medication_id_medications_id_fk" FOREIGN KEY ("medication_id") REFERENCES "public"."medications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medications" ADD CONSTRAINT "medications_elder_id_elders_id_fk" FOREIGN KEY ("elder_id") REFERENCES "public"."elders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memories" ADD CONSTRAINT "memories_family_member_id_family_members_id_fk" FOREIGN KEY ("family_member_id") REFERENCES "public"."family_members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relay_messages" ADD CONSTRAINT "relay_messages_elder_id_elders_id_fk" FOREIGN KEY ("elder_id") REFERENCES "public"."elders"("id") ON DELETE no action ON UPDATE no action;