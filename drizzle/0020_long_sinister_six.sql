CREATE TABLE "popular_albums" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255),
	"artist" varchar(255),
	"album" varchar(255),
	"image" varchar(255),
	"duration" integer
);
--> statement-breakpoint
ALTER TABLE "albums" ADD COLUMN "album_name" varchar(255);--> statement-breakpoint
ALTER TABLE "albums" DROP COLUMN "title";--> statement-breakpoint
ALTER TABLE "albums" DROP COLUMN "artist";--> statement-breakpoint
ALTER TABLE "albums" DROP COLUMN "album";--> statement-breakpoint
ALTER TABLE "albums" DROP COLUMN "image";--> statement-breakpoint
ALTER TABLE "albums" DROP COLUMN "duration";