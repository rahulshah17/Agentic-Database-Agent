CREATE TABLE "recently_played_songs" (
	"id" integer NOT NULL,
	"song_title" varchar(255) NOT NULL,
	"artist_name" varchar(255) NOT NULL,
	"played_at" timestamp NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp
);
