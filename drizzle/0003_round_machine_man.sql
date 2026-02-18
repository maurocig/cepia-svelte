CREATE TABLE "patients" (
	"enrollment_id" text PRIMARY KEY NOT NULL,
	"enrolled_first_name" text NOT NULL,
	"enrolled_last_name" text NOT NULL,
	"enrolled_dob" date NOT NULL,
	"enrolled_id_type" text NOT NULL,
	"enrolled_id_number" text NOT NULL,
	"enrolled_address" text NOT NULL,
	"responsible_adult_name" text NOT NULL,
	"responsible_adult_phone" text NOT NULL,
	"consultation_reason" text NOT NULL,
	"attends_school" boolean DEFAULT false NOT NULL,
	"school_type" text,
	"school_name" text,
	"school_grade" text,
	"school_shift" text,
	"mother_dob" date,
	"mother_occupation" text,
	"father_dob" date,
	"father_occupation" text,
	"siblings_count" integer,
	"family_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE cascade ON UPDATE no action;