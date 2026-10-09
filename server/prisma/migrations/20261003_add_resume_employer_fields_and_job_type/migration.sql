-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('apprenticeship', 'full_time');

-- AlterTable
ALTER TABLE "employer_profiles" ADD COLUMN "contactPhone" TEXT,
ADD COLUMN "description" TEXT;

-- AlterTable
ALTER TABLE "job_postings" ADD COLUMN "jobType" "JobType" NOT NULL DEFAULT 'apprenticeship';

-- AlterTable
ALTER TABLE "student_profiles" ADD COLUMN "resumeUrl" TEXT;
