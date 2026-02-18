ALTER TABLE "enrollments" ADD COLUMN "holder_first_name" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "holder_last_name" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "holder_id_type" text;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "holder_id_number" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "holder_phone" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "psychology" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "psychomotricity" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "speech_therapy" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "psychopedagogy" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "pedagogical_support" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "physiotherapy" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "occupational_therapy" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "workshops" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "treatments_notes" text DEFAULT '' NOT NULL;