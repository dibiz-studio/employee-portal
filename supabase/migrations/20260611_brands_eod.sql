-- Brands + EOD brand tracking
-- Adds a brands table for agency work, links EOD submissions to brands,
-- and keeps brand management restricted to HR/admin while allowing all
-- authenticated users to pick active brands for daily updates.

DO $$ BEGIN
  CREATE TYPE brand_status AS ENUM (
    'ACTIVE',
    'PAUSED',
    'ARCHIVED'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  industry text,
  website_url text,
  description text,
  status brand_status NOT NULL DEFAULT 'ACTIVE',
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_manager_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.daily_updates
  ADD COLUMN IF NOT EXISTS brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_brands_status ON public.brands(status);
CREATE INDEX IF NOT EXISTS idx_brands_name ON public.brands(name);
CREATE INDEX IF NOT EXISTS idx_daily_updates_brand_id ON public.daily_updates(brand_id);

DROP TRIGGER IF EXISTS brands_updated_at ON public.brands;
CREATE TRIGGER brands_updated_at
  BEFORE UPDATE ON public.brands
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS brands_select ON public.brands;
CREATE POLICY brands_select ON public.brands
  FOR SELECT TO authenticated
  USING (
    status = 'ACTIVE'
    OR is_admin()
    OR assigned_manager_id = auth.uid()
  );

DROP POLICY IF EXISTS brands_insert ON public.brands;
CREATE POLICY brands_insert ON public.brands
  FOR INSERT TO authenticated
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS brands_update ON public.brands;
CREATE POLICY brands_update ON public.brands
  FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS brands_delete ON public.brands;
CREATE POLICY brands_delete ON public.brands
  FOR DELETE TO authenticated
  USING (is_admin());
