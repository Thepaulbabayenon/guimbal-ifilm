CREATE TABLE IF NOT EXISTS "watchedMovies" (
	"userId" text NOT NULL,
	"movieId" integer NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "watchedMovies_userId_movieId_pk" PRIMARY KEY("userId","movieId")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "watchedMovies" ADD CONSTRAINT "watchedMovies_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "watchedMovies" ADD CONSTRAINT "watchedMovies_movieId_movie_id_fk" FOREIGN KEY ("movieId") REFERENCES "public"."movie"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "watchLists" ADD CONSTRAINT "watchLists_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "watchLists" ADD CONSTRAINT "watchLists_movieId_movie_id_fk" FOREIGN KEY ("movieId") REFERENCES "public"."movie"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
