CREATE TABLE "songs" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255),
	"artist" varchar(255),
	"album" varchar(255),
	"played_at" timestamp
);
--> statement-breakpoint
DROP TABLE "albums" CASCADE;--> statement-breakpoint
DROP TABLE "recently_played_songs" CASCADE;