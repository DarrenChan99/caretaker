CREATE TABLE "game_scores" (
	"id" text PRIMARY KEY NOT NULL,
	"elder_id" text NOT NULL,
	"game_id" text NOT NULL,
	"game_title_zh" text NOT NULL,
	"score" integer NOT NULL,
	"achieved_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "relay_messages" ADD COLUMN "mode" text DEFAULT 'message' NOT NULL;--> statement-breakpoint
ALTER TABLE "game_scores" ADD CONSTRAINT "game_scores_elder_id_elders_id_fk" FOREIGN KEY ("elder_id") REFERENCES "public"."elders"("id") ON DELETE no action ON UPDATE no action;