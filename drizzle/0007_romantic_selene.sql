CREATE TABLE "agreement_reminders" (
	"id" text PRIMARY KEY NOT NULL,
	"enrollment_id" text NOT NULL,
	"reminder_type" text NOT NULL,
	"scheduled_for" date NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"last_attempt_at" timestamp,
	"sent_at" timestamp,
	"resend_message_id" text,
	"last_error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "agreement_reminders" ADD CONSTRAINT "agreement_reminders_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "agreement_reminders_unique_instance_idx" ON "agreement_reminders" USING btree ("enrollment_id","reminder_type","scheduled_for");--> statement-breakpoint
CREATE INDEX "agreement_reminders_status_scheduled_idx" ON "agreement_reminders" USING btree ("status","scheduled_for");