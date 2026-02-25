DROP INDEX "patients_document_unique_idx";--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_enrolled_id_number_unique" UNIQUE("enrolled_id_number");