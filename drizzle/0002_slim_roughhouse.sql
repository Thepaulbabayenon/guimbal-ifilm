ALTER TABLE "films" RENAME COLUMN "uploader_id" TO "uploader_by";--> statement-breakpoint
ALTER TABLE "films" DROP CONSTRAINT "films_uploader_id_users_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "films" ADD CONSTRAINT "films_uploader_by_users_id_fk" FOREIGN KEY ("uploader_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
