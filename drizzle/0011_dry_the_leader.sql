ALTER TABLE "recently_played_songs" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "recently_played_songs" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "recently_played_songs" ALTER COLUMN "updated_at" SET NOT NULL;