ALTER TABLE "patients" RENAME COLUMN "mother_first_name" TO "mother_name";
--> statement-breakpoint
ALTER TABLE "patients" RENAME COLUMN "father_first_name" TO "father_name";
--> statement-breakpoint
ALTER TABLE "patients" DROP COLUMN "mother_last_name";
--> statement-breakpoint
ALTER TABLE "patients" DROP COLUMN "father_last_name";
