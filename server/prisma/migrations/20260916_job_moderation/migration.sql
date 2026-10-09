-- Add soft-moderation columns to job_postings
-- moderatedAt: non-null means admin has formally removed this job from the platform
-- moderationReason: optional explanation shown to employer
ALTER TABLE "job_postings"
  ADD COLUMN IF NOT EXISTS "moderatedAt"      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "moderationReason" TEXT;
