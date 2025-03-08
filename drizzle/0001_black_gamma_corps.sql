ALTER TABLE "films" RENAME COLUMN "uploaded_by" TO "uploader_id";--> statement-breakpoint
ALTER TABLE "films" DROP CONSTRAINT "films_uploaded_by_users_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "films" ADD CONSTRAINT "films_uploader_id_users_id_fk" FOREIGN KEY ("uploader_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
