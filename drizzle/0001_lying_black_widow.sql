ALTER TABLE "enrollments" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "form_status" text DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "completed_at" timestamp;