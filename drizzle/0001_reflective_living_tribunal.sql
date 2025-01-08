CREATE TABLE IF NOT EXISTS "watchHistory" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" varchar NOT NULL,
	"filmId" varchar NOT NULL,
	"watchedDuration" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "film" ADD COLUMN "averageRating" real;