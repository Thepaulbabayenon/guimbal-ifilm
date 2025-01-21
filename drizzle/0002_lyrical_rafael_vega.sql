CREATE TABLE IF NOT EXISTS "files" (
	"id" serial PRIMARY KEY NOT NULL,
	"file_name" varchar(255),
	"s3_url" varchar(500),
	"upload_date" varchar(50)
);
--> statement-breakpoint
ALTER TABLE "film" RENAME COLUMN "youtubeString" TO "trailer";