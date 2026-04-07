ALTER TABLE "enrollments" ADD COLUMN IF NOT EXISTS "treatment_days_per_week" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN IF NOT EXISTS "treatment_schedule" text DEFAULT '[]' NOT NULL;
