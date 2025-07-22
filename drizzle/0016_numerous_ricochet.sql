ALTER TABLE "albums" ADD COLUMN "title" varchar(255);--> statement-breakpoint
ALTER TABLE "albums" ADD COLUMN "artist" varchar(255);--> statement-breakpoint
ALTER TABLE "albums" ADD COLUMN "album" varchar(255);--> statement-breakpoint
ALTER TABLE "albums" ADD COLUMN "image" varchar(255);--> statement-breakpoint
ALTER TABLE "albums" ADD COLUMN "duration" integer;--> statement-breakpoint
ALTER TABLE "albums" DROP COLUMN "album_name";