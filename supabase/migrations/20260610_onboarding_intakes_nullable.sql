-- Relax onboarding intake columns for draft / multi-step saves.
-- The first onboarding migration introduced the tables; this follow-up makes
-- the KYC fields nullable so a draft can be saved before final submission.

ALTER TABLE public.onboarding_intakes
  ALTER COLUMN full_pan DROP NOT NULL,
  ALTER COLUMN full_aadhaar DROP NOT NULL,
  ALTER COLUMN pan_drive_url DROP NOT NULL,
  ALTER COLUMN aadhaar_drive_url DROP NOT NULL;
