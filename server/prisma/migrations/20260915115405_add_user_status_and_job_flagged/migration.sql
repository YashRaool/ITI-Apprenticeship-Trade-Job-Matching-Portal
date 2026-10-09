-- AlterTable
ALTER TABLE "job_postings" ADD COLUMN     "flaggedFraudulent" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
