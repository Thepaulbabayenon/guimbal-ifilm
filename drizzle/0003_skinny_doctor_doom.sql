ALTER TABLE "dismissed_notifications" RENAME TO "dismissed_announcements";--> statement-breakpoint
ALTER TABLE "dismissed_announcements" RENAME COLUMN "notification_id" TO "announcement_id";