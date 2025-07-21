CREATE TABLE "recently_played" (
	"id" serial PRIMARY KEY NOT NULL,
	"song_name" varchar(255) NOT NULL,
	"artist" varchar(255) NOT NULL,
	"played_at" timestamp DEFAULT now()
);
