ALTER TABLE "recently_played_songs" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "songs" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "recently_played_songs" CASCADE;--> statement-breakpoint
DROP TABLE "songs" CASCADE;--> statement-breakpoint
/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'albums'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

-- ALTER TABLE "albums" DROP CONSTRAINT "<constraint_name>";--> statement-breakpoint
ALTER TABLE "albums" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "albums" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "albums" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "albums" ALTER COLUMN "updated_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "albums" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "albums" ADD COLUMN "title" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "albums" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "albums" ADD CONSTRAINT "albums_title_unique" UNIQUE("title");