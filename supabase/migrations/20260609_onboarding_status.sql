-- Reference migration: onboarding_status on profiles
DO $$ BEGIN
  CREATE TYPE onboarding_status AS ENUM ('PENDING', 'COMPLETED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_status onboarding_status NOT NULL DEFAULT 'PENDING';
