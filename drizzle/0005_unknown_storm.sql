ALTER TABLE "albums" DROP CONSTRAINT "albums_name_unique";--> statement-breakpoint
ALTER TABLE "albums" ADD CONSTRAINT "albums_id_unique" UNIQUE("id");