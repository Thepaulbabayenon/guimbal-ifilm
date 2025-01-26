CREATE TABLE IF NOT EXISTS "account" (
	"userId" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "authenticator" (
	"credentialID" text NOT NULL,
	"userId" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"credentialPublicKey" text NOT NULL,
	"counter" integer NOT NULL,
	"credentialDeviceType" text NOT NULL,
	"credentialBackedUp" boolean NOT NULL,
	"transports" text,
	CONSTRAINT "authenticator_userId_credentialID_pk" PRIMARY KEY("userId","credentialID"),
	CONSTRAINT "authenticator_credentialID_unique" UNIQUE("credentialID")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "commentVotes" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"commentId" integer NOT NULL,
	"voteType" varchar(10) NOT NULL,
	"filmId" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"filmId" integer NOT NULL,
	"content" text NOT NULL,
	"username" varchar(255),
	"email" varchar(255) NOT NULL,
	"thumbsUp" integer DEFAULT 0 NOT NULL,
	"thumbsDown" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "files" (
	"id" serial PRIMARY KEY NOT NULL,
	"file_name" varchar(255),
	"s3_url" varchar(500),
	"upload_date" varchar(50)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "film" (
	"id" serial PRIMARY KEY NOT NULL,
	"imageString" varchar NOT NULL,
	"title" varchar NOT NULL,
	"age" integer NOT NULL,
	"duration" double precision NOT NULL,
	"overview" text NOT NULL,
	"release" integer NOT NULL,
	"videoSource" varchar NOT NULL,
	"category" varchar NOT NULL,
	"trailer" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"producer" varchar NOT NULL,
	"director" varchar NOT NULL,
	"coDirector" varchar NOT NULL,
	"studio" varchar NOT NULL,
	"rank" integer DEFAULT 0 NOT NULL,
	"averageRating" real
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "filmRecommendations" (
	"userId" text NOT NULL,
	"filmId" integer NOT NULL,
	"recommendedBy" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "movie" (
	"id" serial PRIMARY KEY NOT NULL,
	"imageString" varchar NOT NULL,
	"title" varchar NOT NULL,
	"age" integer NOT NULL,
	"duration" double precision NOT NULL,
	"overview" text NOT NULL,
	"release" integer NOT NULL,
	"videoSource" varchar NOT NULL,
	"category" varchar NOT NULL,
	"trailer" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"producer" varchar NOT NULL,
	"director" varchar NOT NULL,
	"coDirector" varchar NOT NULL,
	"studio" varchar NOT NULL,
	"rank" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "userInteractions" (
	"userId" text NOT NULL,
	"filmId" integer NOT NULL,
	"ratings" integer NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "userInteractions_userId_filmId_pk" PRIMARY KEY("userId","filmId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "userRatings" (
	"id" serial NOT NULL,
	"userId" text NOT NULL,
	"filmId" integer NOT NULL,
	"rating" integer NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "userRatings_userId_filmId_pk" PRIMARY KEY("userId","filmId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"emailVerified" timestamp,
	"image" text,
	"isAdmin" boolean DEFAULT false,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "watchHistory" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" varchar NOT NULL,
	"filmId" varchar NOT NULL,
	"watchedDuration" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "watchLists" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"filmId" integer NOT NULL,
	"isFavorite" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "watchedFilms" (
	"userId" text NOT NULL,
	"filmId" integer NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"currentTimestamp" double precision DEFAULT 0,
	CONSTRAINT "watchedFilms_userId_filmId_pk" PRIMARY KEY("userId","filmId")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "authenticator" ADD CONSTRAINT "authenticator_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "commentVotes" ADD CONSTRAINT "commentVotes_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "commentVotes" ADD CONSTRAINT "commentVotes_commentId_comments_id_fk" FOREIGN KEY ("commentId") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "commentVotes" ADD CONSTRAINT "commentVotes_filmId_film_id_fk" FOREIGN KEY ("filmId") REFERENCES "public"."film"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comments" ADD CONSTRAINT "comments_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comments" ADD CONSTRAINT "comments_filmId_film_id_fk" FOREIGN KEY ("filmId") REFERENCES "public"."film"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "filmRecommendations" ADD CONSTRAINT "filmRecommendations_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "filmRecommendations" ADD CONSTRAINT "filmRecommendations_filmId_film_id_fk" FOREIGN KEY ("filmId") REFERENCES "public"."film"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "filmRecommendations" ADD CONSTRAINT "filmRecommendations_recommendedBy_user_id_fk" FOREIGN KEY ("recommendedBy") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "userInteractions" ADD CONSTRAINT "userInteractions_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "userInteractions" ADD CONSTRAINT "userInteractions_filmId_film_id_fk" FOREIGN KEY ("filmId") REFERENCES "public"."film"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "userRatings" ADD CONSTRAINT "userRatings_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "userRatings" ADD CONSTRAINT "userRatings_filmId_film_id_fk" FOREIGN KEY ("filmId") REFERENCES "public"."film"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "watchedFilms" ADD CONSTRAINT "watchedFilms_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "watchedFilms" ADD CONSTRAINT "watchedFilms_filmId_film_id_fk" FOREIGN KEY ("filmId") REFERENCES "public"."film"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
