ALTER TABLE "enrollments"
	ADD COLUMN "treatment_day" text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE "enrollments"
	ADD COLUMN "treatment_time" text NOT NULL DEFAULT '';
