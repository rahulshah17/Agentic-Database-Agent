ALTER TABLE "albums" DROP CONSTRAINT "albums_title_unique";--> statement-breakpoint
ALTER TABLE "albums" ADD COLUMN "name" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "albums" DROP COLUMN "title";--> statement-breakpoint
ALTER TABLE "albums" ADD CONSTRAINT "albums_name_unique" UNIQUE("name");