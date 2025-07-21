ALTER TABLE "albums" DROP CONSTRAINT "albums_id_unique";--> statement-breakpoint
ALTER TABLE "albums" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "albums" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "recently_played_songs" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "recently_played_songs" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "songs" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "songs" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "albums" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "albums" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "recently_played_songs" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "recently_played_songs" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "songs" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "songs" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "albums" DROP COLUMN "createdAt";--> statement-breakpoint
ALTER TABLE "albums" DROP COLUMN "updatedAt";--> statement-breakpoint
ALTER TABLE "recently_played_songs" DROP COLUMN "createdAt";--> statement-breakpoint
ALTER TABLE "recently_played_songs" DROP COLUMN "updatedAt";--> statement-breakpoint
ALTER TABLE "songs" DROP COLUMN "createdAt";--> statement-breakpoint
ALTER TABLE "songs" DROP COLUMN "updatedAt";