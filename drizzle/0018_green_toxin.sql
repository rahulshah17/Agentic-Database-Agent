CREATE TABLE "recently_played_songs" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255),
	"artist" varchar(255),
	"album" varchar(255),
	"image" varchar(255),
	"duration" integer
);
