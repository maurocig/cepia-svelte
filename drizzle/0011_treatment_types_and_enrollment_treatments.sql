CREATE TABLE "treatment_types" (
	"code" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enrollment_treatments" (
	"id" text PRIMARY KEY NOT NULL,
	"enrollment_id" text NOT NULL,
	"treatment_type_code" text NOT NULL,
	"day" text DEFAULT '' NOT NULL,
	"time" text DEFAULT '' NOT NULL,
	"professional_name" text DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "enrollment_treatments" ADD CONSTRAINT "enrollment_treatments_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "enrollment_treatments" ADD CONSTRAINT "enrollment_treatments_treatment_type_code_treatment_types_code_fk" FOREIGN KEY ("treatment_type_code") REFERENCES "public"."treatment_types"("code") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "enrollment_treatments_enrollment_idx" ON "enrollment_treatments" USING btree ("enrollment_id","sort_order");
--> statement-breakpoint
CREATE INDEX "enrollment_treatments_type_idx" ON "enrollment_treatments" USING btree ("treatment_type_code");
--> statement-breakpoint
INSERT INTO "treatment_types" ("code", "name")
VALUES
	('psychology', 'Psicología'),
	('psychomotricity', 'Psicomotricidad'),
	('speechTherapy', 'Fonoaudiología'),
	('psychopedagogy', 'Psicopedagogía'),
	('pedagogicalSupport', 'Apoyo pedagógico'),
	('physiotherapy', 'Fisioterapia'),
	('occupationalTherapy', 'Terapia ocupacional'),
	('workshops', 'Talleres')
ON CONFLICT ("code") DO NOTHING;
