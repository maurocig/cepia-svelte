ALTER TABLE "enrollments"
	ADD COLUMN "treatment_days_per_week" integer NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE "enrollments"
	ADD COLUMN "treatment_schedule" text NOT NULL DEFAULT '[]';
