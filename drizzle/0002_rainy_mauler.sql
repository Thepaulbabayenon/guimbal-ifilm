CREATE TABLE IF NOT EXISTS "dismissed_notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"notification_id" integer NOT NULL,
	"dismissed_at" timestamp DEFAULT now()
);
