CREATE TABLE "albums" (
	"id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp,
	CONSTRAINT "albums_name_unique" UNIQUE("name")
);
