-- Add verificationStatus to employer_profiles (mirrors the VerifStatus enum)
-- 'pending' = not yet reviewed, 'verified' = approved, 'rejected' = rejected

ALTER TABLE "employer_profiles"
  ADD COLUMN IF NOT EXISTS "verificationStatus" TEXT NOT NULL DEFAULT 'pending';

-- Back-fill: already-verified employers get 'verified'
UPDATE "employer_profiles" SET "verificationStatus" = 'verified' WHERE "verified" = true;
