CREATE TABLE "recently_played_songs" (
	"id" integer NOT NULL,
	"song_title" varchar(255) NOT NULL,
	"artist" varchar(255) NOT NULL,
	"played_at" timestamp NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp
);
--> statement-breakpoint
DROP TABLE "albums" CASCADE;--> statement-breakpoint
DROP TABLE "playlists" CASCADE;--> statement-breakpoint
DROP TABLE "recently_played" CASCADE;--> statement-breakpoint
DROP TABLE "users" CASCADE;