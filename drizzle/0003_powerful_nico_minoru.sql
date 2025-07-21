CREATE TABLE "songs" (
	"id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"album" varchar(255),
	"release_year" integer,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp
);
