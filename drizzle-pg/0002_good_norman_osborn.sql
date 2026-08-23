CREATE TABLE "video_call_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"elder_id" text NOT NULL,
	"family_member_id" text NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone,
	"transcript_json" text
);
--> statement-breakpoint
ALTER TABLE "family_members" ADD COLUMN "social_handle" text;--> statement-breakpoint
ALTER TABLE "memories" ADD COLUMN "source" text DEFAULT 'manual' NOT NULL;--> statement-breakpoint
ALTER TABLE "memories" ADD COLUMN "body_en" text;--> statement-breakpoint
ALTER TABLE "memories" ADD COLUMN "video_call_session_id" text;--> statement-breakpoint
ALTER TABLE "relay_state" ADD COLUMN "pending_call_family_member_id" text;--> statement-breakpoint
ALTER TABLE "video_call_sessions" ADD CONSTRAINT "video_call_sessions_elder_id_elders_id_fk" FOREIGN KEY ("elder_id") REFERENCES "public"."elders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_call_sessions" ADD CONSTRAINT "video_call_sessions_family_member_id_family_members_id_fk" FOREIGN KEY ("family_member_id") REFERENCES "public"."family_members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memories" ADD CONSTRAINT "memories_video_call_session_id_video_call_sessions_id_fk" FOREIGN KEY ("video_call_session_id") REFERENCES "public"."video_call_sessions"("id") ON DELETE no action ON UPDATE no action;