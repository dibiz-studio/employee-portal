-- Onboarding invite + KYC intake schema
-- Adds secure invite tracking, multi-step onboarding intake staging,
-- onboarding completion timestamps, and document metadata for joining letters.

DO $$ BEGIN
  CREATE TYPE onboarding_intake_status AS ENUM (
    'DRAFT',
    'SUBMITTED',
    'UNDER_REVIEW',
    'NEEDS_CHANGES',
    'APPROVED',
    'REJECTED'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE onboarding_document_review_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'NEEDS_CHANGES'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE document_source_type AS ENUM (
    'UPLOAD',
    'DRIVE_LINK',
    'SYSTEM',
    'SIGNED_RETURN'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.onboarding_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_token_hash text NOT NULL UNIQUE,
  invite_token_hint text,
  invitee_email text NOT NULL,
  invitee_full_name text,
  target_role app_role NOT NULL DEFAULT 'EMPLOYEE',
  created_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  assigned_manager_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  estimated_stipend numeric(12,2),
  joining_letter_file_path text,
  joining_letter_signed_file_path text,
  joining_letter_sent_at timestamptz,
  joining_letter_returned_at timestamptz,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  used_by_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  revoked_at timestamptz,
  revoked_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  revocation_reason text,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (expires_at > created_at)
);

CREATE TABLE IF NOT EXISTS public.onboarding_intakes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_id uuid NOT NULL UNIQUE REFERENCES public.onboarding_invites(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  current_step integer NOT NULL DEFAULT 1,
  status onboarding_intake_status NOT NULL DEFAULT 'DRAFT',
  full_pan text NOT NULL,
  full_aadhaar text NOT NULL,
  pan_drive_url text NOT NULL,
  aadhaar_drive_url text NOT NULL,
  review_notes text,
  submitted_at timestamptz,
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  completed_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (current_step BETWEEN 1 AND 6)
);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_invite_id uuid REFERENCES public.onboarding_invites(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS onboarding_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz;

ALTER TABLE public.employee_profiles
  ADD COLUMN IF NOT EXISTS pan_number text,
  ADD COLUMN IF NOT EXISTS aadhaar_number text,
  ADD COLUMN IF NOT EXISTS stipend_amount numeric(12,2),
  ADD COLUMN IF NOT EXISTS onboarding_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS joining_letter_document_id uuid REFERENCES public.documents(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS joining_letter_signed_document_id uuid REFERENCES public.documents(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS joining_letter_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS joining_letter_returned_at timestamptz;

ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS document_key text,
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS source_type document_source_type NOT NULL DEFAULT 'UPLOAD',
  ADD COLUMN IF NOT EXISTS review_status onboarding_document_review_status NOT NULL DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS review_notes text,
  ADD COLUMN IF NOT EXISTS source_metadata jsonb NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_onboarding_invites_email ON public.onboarding_invites(invitee_email);
CREATE INDEX IF NOT EXISTS idx_onboarding_invites_creator ON public.onboarding_invites(created_by);
CREATE INDEX IF NOT EXISTS idx_onboarding_invites_manager ON public.onboarding_invites(assigned_manager_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_invites_expires_at ON public.onboarding_invites(expires_at);
CREATE INDEX IF NOT EXISTS idx_onboarding_invites_used_at ON public.onboarding_invites(used_at);
CREATE INDEX IF NOT EXISTS idx_onboarding_intakes_profile ON public.onboarding_intakes(profile_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_intakes_status ON public.onboarding_intakes(status);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_invite ON public.profiles(onboarding_invite_id);
CREATE INDEX IF NOT EXISTS idx_employee_profiles_onboarding_completed ON public.employee_profiles(onboarding_completed_at);
CREATE INDEX IF NOT EXISTS idx_documents_source_type ON public.documents(source_type);
CREATE INDEX IF NOT EXISTS idx_documents_review_status ON public.documents(review_status);

CREATE OR REPLACE FUNCTION public.sync_onboarding_intake_progress()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('SUBMITTED', 'UNDER_REVIEW', 'NEEDS_CHANGES', 'APPROVED') THEN
    UPDATE public.onboarding_invites
    SET used_at = COALESCE(used_at, now()),
        used_by_profile_id = COALESCE(used_by_profile_id, NEW.profile_id),
        updated_at = now()
    WHERE id = NEW.invite_id;

    UPDATE public.profiles
    SET onboarding_started_at = COALESCE(onboarding_started_at, now()),
        onboarding_invite_id = COALESCE(onboarding_invite_id, NEW.invite_id),
        updated_at = now()
    WHERE id = NEW.profile_id;

    UPDATE public.employee_profiles
    SET onboarding_started_at = COALESCE(onboarding_started_at, now()),
        updated_at = now()
    WHERE profile_id = NEW.profile_id;
  END IF;

  IF NEW.status = 'APPROVED' THEN
    UPDATE public.profiles
    SET onboarding_status = 'COMPLETED',
        onboarding_completed_at = COALESCE(onboarding_completed_at, now()),
        updated_at = now()
    WHERE id = NEW.profile_id;

    UPDATE public.employee_profiles
    SET onboarding_completed_at = COALESCE(onboarding_completed_at, now()),
        updated_at = now()
    WHERE profile_id = NEW.profile_id;
  ELSIF NEW.status = 'REJECTED' THEN
    UPDATE public.profiles
    SET onboarding_status = 'PENDING',
        updated_at = now()
    WHERE id = NEW.profile_id
      AND onboarding_status <> 'COMPLETED';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS onboarding_intakes_progress_sync ON public.onboarding_intakes;
CREATE TRIGGER onboarding_intakes_progress_sync
  AFTER INSERT OR UPDATE OF status ON public.onboarding_intakes
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_onboarding_intake_progress();

ALTER TABLE public.onboarding_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_intakes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS onboarding_invites_select ON public.onboarding_invites;
CREATE POLICY onboarding_invites_select ON public.onboarding_invites
  FOR SELECT TO authenticated
  USING (
    is_admin()
    OR created_by = auth.uid()
    OR assigned_manager_id = auth.uid()
    OR used_by_profile_id = auth.uid()
  );

DROP POLICY IF EXISTS onboarding_invites_insert ON public.onboarding_invites;
CREATE POLICY onboarding_invites_insert ON public.onboarding_invites
  FOR INSERT TO authenticated
  WITH CHECK (is_admin() OR created_by = auth.uid());

DROP POLICY IF EXISTS onboarding_invites_update ON public.onboarding_invites;
CREATE POLICY onboarding_invites_update ON public.onboarding_invites
  FOR UPDATE TO authenticated
  USING (is_admin() OR created_by = auth.uid())
  WITH CHECK (is_admin() OR created_by = auth.uid());

DROP POLICY IF EXISTS onboarding_intakes_select ON public.onboarding_intakes;
CREATE POLICY onboarding_intakes_select ON public.onboarding_intakes
  FOR SELECT TO authenticated
  USING (
    profile_id = auth.uid()
    OR is_admin()
    OR is_manager_of(profile_id)
  );

DROP POLICY IF EXISTS onboarding_intakes_insert ON public.onboarding_intakes;
CREATE POLICY onboarding_intakes_insert ON public.onboarding_intakes
  FOR INSERT TO authenticated
  WITH CHECK (profile_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS onboarding_intakes_update ON public.onboarding_intakes;
CREATE POLICY onboarding_intakes_update ON public.onboarding_intakes
  FOR UPDATE TO authenticated
  USING (
    profile_id = auth.uid()
    OR is_admin()
    OR is_manager_of(profile_id)
  )
  WITH CHECK (
    profile_id = auth.uid()
    OR is_admin()
    OR is_manager_of(profile_id)
  );
