ALTER TABLE "albums" ALTER COLUMN "id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "albums" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "albums" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "albums" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "albums" ALTER COLUMN "updated_at" DROP NOT NULL;