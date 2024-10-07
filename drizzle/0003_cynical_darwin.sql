CREATE TABLE IF NOT EXISTS "userRatings" (
	"userId" text NOT NULL,
	"movieId" integer NOT NULL,
	"rating" integer NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "userRatings_userId_movieId_pk" PRIMARY KEY("userId","movieId")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "userRatings" ADD CONSTRAINT "userRatings_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "userRatings" ADD CONSTRAINT "userRatings_movieId_movie_id_fk" FOREIGN KEY ("movieId") REFERENCES "public"."movie"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
