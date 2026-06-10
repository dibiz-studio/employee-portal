-- =============================================================================
-- Dibiz Studio HRMS — Full PostgreSQL Schema
-- =============================================================================
-- Target: Supabase (PostgreSQL 15+)
-- Usage: Run in order on a fresh Supabase project, or use `supabase db push`
--
-- Sections:
--   1. Extensions
--   2. Enums
--   3. Helper functions
--   4. Tables
--   5. Indexes
--   6. Triggers (updated_at)
--   7. Auth trigger (profile on signup)
--   8. Row Level Security policies
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. EXTENSIONS
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 2. ENUMS
-- -----------------------------------------------------------------------------
CREATE TYPE app_role AS ENUM (
  'SUPER_ADMIN',
  'HR',
  'MANAGER',
  'EMPLOYEE',
  'INTERN'
);

CREATE TYPE employment_status AS ENUM (
  'ACTIVE',
  'ON_LEAVE',
  'PROBATION',
  'TERMINATED',
  'RESIGNED'
);

CREATE TYPE leave_request_status AS ENUM (
  'PENDING',
  'APPROVED',
  'REJECTED',
  'CANCELLED'
);

CREATE TYPE kpi_status AS ENUM (
  'NOT_STARTED',
  'IN_PROGRESS',
  'ON_TRACK',
  'AT_RISK',
  'COMPLETED',
  'CANCELLED'
);

CREATE TYPE kpi_period AS ENUM (
  'WEEKLY',
  'MONTHLY',
  'QUARTERLY',
  'YEARLY'
);

CREATE TYPE notification_type AS ENUM (
  'LEAVE',
  'KPI',
  'PAYROLL',
  'APPROVAL',
  'SYSTEM',
  'EOD'
);

CREATE TYPE audit_action AS ENUM (
  'CREATE',
  'UPDATE',
  'DELETE',
  'APPROVE',
  'REJECT',
  'ASSIGN',
  'LOGIN'
);

CREATE TYPE document_category AS ENUM (
  'CONTRACT',
  'ID_PROOF',
  'CERTIFICATE',
  'POLICY',
  'PAYSLIP',
  'OTHER'
);

CREATE TYPE payroll_status AS ENUM (
  'DRAFT',
  'PROCESSED',
  'PAID',
  'CANCELLED'
);

CREATE TYPE onboarding_status AS ENUM (
  'PENDING',
  'COMPLETED'
);

-- -----------------------------------------------------------------------------
-- 3. HELPER FUNCTIONS
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS app_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT get_user_role() IN ('SUPER_ADMIN', 'HR');
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_manager_of(target_employee_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.manager_assignments
    WHERE manager_id = auth.uid()
      AND employee_id = target_employee_id
      AND is_active = true
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role, onboarding_status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'EMPLOYEE'),
    COALESCE((NEW.raw_user_meta_data->>'onboarding_status')::onboarding_status, 'PENDING')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    email = EXCLUDED.email,
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- -----------------------------------------------------------------------------
-- 4. TABLES
-- -----------------------------------------------------------------------------

-- profiles (central user table, linked to auth.users)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  full_name text NOT NULL,
  avatar_url text,
  role app_role NOT NULL DEFAULT 'EMPLOYEE',
  phone text,
  is_active boolean NOT NULL DEFAULT true,
  onboarding_status onboarding_status NOT NULL DEFAULT 'PENDING',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  code text NOT NULL UNIQUE,
  description text,
  head_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.employee_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  employee_code text NOT NULL UNIQUE,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  job_title text NOT NULL,
  employment_status employment_status NOT NULL DEFAULT 'ACTIVE',
  hire_date date NOT NULL,
  termination_date date,
  date_of_birth date,
  address jsonb,
  emergency_contact jsonb,
  salary_base numeric(12,2),
  work_location text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.manager_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(manager_id, employee_id)
);

CREATE TABLE public.leave_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  description text,
  days_per_year numeric(5,1) NOT NULL,
  is_paid boolean NOT NULL DEFAULT true,
  requires_approval boolean NOT NULL DEFAULT true,
  min_notice_days integer NOT NULL DEFAULT 0,
  max_consecutive_days integer,
  carry_forward boolean NOT NULL DEFAULT false,
  carry_forward_limit numeric(5,1),
  applicable_roles app_role[],
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.employee_leave_policy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  policy_id uuid NOT NULL REFERENCES public.leave_policies(id) ON DELETE CASCADE,
  year integer NOT NULL,
  allocated_days numeric(5,1) NOT NULL,
  used_days numeric(5,1) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(employee_id, policy_id, year)
);

CREATE TABLE public.leave_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  policy_id uuid NOT NULL REFERENCES public.leave_policies(id),
  start_date date NOT NULL,
  end_date date NOT NULL,
  days_requested numeric(5,1) NOT NULL,
  reason text NOT NULL,
  status leave_request_status NOT NULL DEFAULT 'PENDING',
  reviewed_by uuid REFERENCES public.profiles(id),
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_date >= start_date)
);

CREATE TABLE public.kpi_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL,
  measurement_unit text NOT NULL DEFAULT 'percentage',
  default_target numeric(12,2),
  period kpi_period NOT NULL DEFAULT 'MONTHLY',
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  applicable_roles app_role[],
  weight numeric(5,2) NOT NULL DEFAULT 1.0,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.employee_kpis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  template_id uuid REFERENCES public.kpi_templates(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  target_value numeric(12,2) NOT NULL,
  current_value numeric(12,2) NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'percentage',
  weight numeric(5,2) NOT NULL DEFAULT 1.0,
  period kpi_period NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  status kpi_status NOT NULL DEFAULT 'NOT_STARTED',
  assigned_by uuid REFERENCES public.profiles(id),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.daily_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  report_date date NOT NULL,
  tasks_completed text[] NOT NULL DEFAULT '{}',
  hours_worked numeric(4,1) NOT NULL,
  blockers text,
  tomorrow_plan text,
  manager_comment text,
  reviewed_by uuid REFERENCES public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(employee_id, report_date)
);

CREATE TABLE public.payroll_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  period_month integer NOT NULL CHECK (period_month BETWEEN 1 AND 12),
  period_year integer NOT NULL,
  base_salary numeric(12,2) NOT NULL,
  allowances jsonb NOT NULL DEFAULT '{}',
  deductions jsonb NOT NULL DEFAULT '{}',
  leave_deduction numeric(12,2) NOT NULL DEFAULT 0,
  gross_pay numeric(12,2) NOT NULL,
  net_pay numeric(12,2) NOT NULL,
  status payroll_status NOT NULL DEFAULT 'DRAFT',
  notes text,
  processed_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(employee_id, period_month, period_year)
);

CREATE TABLE public.monthly_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  report_type text NOT NULL,
  department_id uuid REFERENCES public.departments(id),
  period_month integer NOT NULL,
  period_year integer NOT NULL,
  summary jsonb NOT NULL DEFAULT '{}',
  generated_by uuid REFERENCES public.profiles(id),
  file_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  category document_category NOT NULL DEFAULT 'OTHER',
  file_path text NOT NULL,
  file_size integer,
  mime_type text,
  uploaded_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  link text,
  metadata jsonb NOT NULL DEFAULT '{}',
  is_read boolean NOT NULL DEFAULT false,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  action audit_action NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 5. INDEXES
-- -----------------------------------------------------------------------------
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_onboarding ON public.profiles(onboarding_status);
CREATE INDEX idx_employee_profiles_department ON public.employee_profiles(department_id);
CREATE INDEX idx_manager_assignments_manager ON public.manager_assignments(manager_id);
CREATE INDEX idx_manager_assignments_employee ON public.manager_assignments(employee_id);
CREATE INDEX idx_leave_requests_employee ON public.leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status ON public.leave_requests(status);
CREATE INDEX idx_employee_kpis_employee ON public.employee_kpis(employee_id);
CREATE INDEX idx_daily_updates_employee ON public.daily_updates(employee_id);
CREATE INDEX idx_payroll_records_employee ON public.payroll_records(employee_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at);

-- -----------------------------------------------------------------------------
-- 6. UPDATED_AT TRIGGERS
-- -----------------------------------------------------------------------------
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER departments_updated_at BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER employee_profiles_updated_at BEFORE UPDATE ON public.employee_profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER manager_assignments_updated_at BEFORE UPDATE ON public.manager_assignments FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER leave_policies_updated_at BEFORE UPDATE ON public.leave_policies FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER employee_leave_policy_updated_at BEFORE UPDATE ON public.employee_leave_policy FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER leave_requests_updated_at BEFORE UPDATE ON public.leave_requests FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER kpi_templates_updated_at BEFORE UPDATE ON public.kpi_templates FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER employee_kpis_updated_at BEFORE UPDATE ON public.employee_kpis FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER daily_updates_updated_at BEFORE UPDATE ON public.daily_updates FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER payroll_records_updated_at BEFORE UPDATE ON public.payroll_records FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER monthly_reports_updated_at BEFORE UPDATE ON public.monthly_reports FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER notifications_updated_at BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER audit_logs_updated_at BEFORE UPDATE ON public.audit_logs FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Auth: auto-create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manager_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_leave_policy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY profiles_select ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR is_admin() OR is_manager_of(id));
CREATE POLICY profiles_update_self ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY profiles_admin ON public.profiles FOR ALL TO authenticated
  USING (get_user_role() = 'SUPER_ADMIN') WITH CHECK (get_user_role() = 'SUPER_ADMIN');
CREATE POLICY profiles_hr_update ON public.profiles FOR UPDATE TO authenticated
  USING (get_user_role() = 'HR') WITH CHECK (get_user_role() = 'HR');
CREATE POLICY profiles_insert_self ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

-- departments
CREATE POLICY departments_select ON public.departments FOR SELECT TO authenticated USING (true);
CREATE POLICY departments_admin ON public.departments FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- employee_profiles
CREATE POLICY employee_profiles_select ON public.employee_profiles FOR SELECT TO authenticated
  USING (profile_id = auth.uid() OR is_admin() OR is_manager_of(profile_id));
CREATE POLICY employee_profiles_admin ON public.employee_profiles FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- manager_assignments
CREATE POLICY manager_assignments_select ON public.manager_assignments FOR SELECT TO authenticated
  USING (is_admin() OR manager_id = auth.uid() OR employee_id = auth.uid());
CREATE POLICY manager_assignments_admin ON public.manager_assignments FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- leave_policies
CREATE POLICY leave_policies_select ON public.leave_policies FOR SELECT TO authenticated USING (true);
CREATE POLICY leave_policies_admin ON public.leave_policies FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- employee_leave_policy
CREATE POLICY elp_select ON public.employee_leave_policy FOR SELECT TO authenticated
  USING (employee_id = auth.uid() OR is_admin() OR is_manager_of(employee_id));
CREATE POLICY elp_admin ON public.employee_leave_policy FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- leave_requests
CREATE POLICY leave_requests_select ON public.leave_requests FOR SELECT TO authenticated
  USING (employee_id = auth.uid() OR is_admin() OR is_manager_of(employee_id));
CREATE POLICY leave_requests_insert ON public.leave_requests FOR INSERT TO authenticated
  WITH CHECK (employee_id = auth.uid());
CREATE POLICY leave_requests_update ON public.leave_requests FOR UPDATE TO authenticated
  USING (employee_id = auth.uid() OR is_admin() OR is_manager_of(employee_id));

-- kpi_templates
CREATE POLICY kpi_templates_select ON public.kpi_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY kpi_templates_admin ON public.kpi_templates FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- employee_kpis
CREATE POLICY employee_kpis_select ON public.employee_kpis FOR SELECT TO authenticated
  USING (employee_id = auth.uid() OR is_admin() OR is_manager_of(employee_id));
CREATE POLICY employee_kpis_insert ON public.employee_kpis FOR INSERT TO authenticated
  WITH CHECK (is_admin() OR is_manager_of(employee_id));
CREATE POLICY employee_kpis_update ON public.employee_kpis FOR UPDATE TO authenticated
  USING (employee_id = auth.uid() OR is_admin() OR is_manager_of(employee_id));

-- daily_updates
CREATE POLICY daily_updates_select ON public.daily_updates FOR SELECT TO authenticated
  USING (employee_id = auth.uid() OR is_admin() OR is_manager_of(employee_id));
CREATE POLICY daily_updates_insert ON public.daily_updates FOR INSERT TO authenticated
  WITH CHECK (employee_id = auth.uid());
CREATE POLICY daily_updates_update ON public.daily_updates FOR UPDATE TO authenticated
  USING (employee_id = auth.uid() OR is_admin() OR is_manager_of(employee_id));

-- payroll_records
CREATE POLICY payroll_select ON public.payroll_records FOR SELECT TO authenticated
  USING (employee_id = auth.uid() OR is_admin() OR (get_user_role() = 'MANAGER' AND is_manager_of(employee_id)));
CREATE POLICY payroll_admin ON public.payroll_records FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- monthly_reports
CREATE POLICY reports_select ON public.monthly_reports FOR SELECT TO authenticated
  USING (is_admin() OR get_user_role() = 'MANAGER');
CREATE POLICY reports_admin ON public.monthly_reports FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- documents
CREATE POLICY documents_select ON public.documents FOR SELECT TO authenticated
  USING (employee_id = auth.uid() OR is_admin() OR is_manager_of(employee_id));
CREATE POLICY documents_insert ON public.documents FOR INSERT TO authenticated
  WITH CHECK (employee_id = auth.uid() OR is_admin());
CREATE POLICY documents_admin ON public.documents FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- notifications
CREATE POLICY notifications_select ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY notifications_update ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY notifications_insert ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (is_admin() OR user_id = auth.uid());

-- audit_logs
CREATE POLICY audit_select ON public.audit_logs FOR SELECT TO authenticated
  USING (is_admin());
CREATE POLICY audit_insert ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid() OR is_admin());

-- -----------------------------------------------------------------------------
-- 8. SEED: Super Admin (run after creating auth.users row)
-- -----------------------------------------------------------------------------
-- See docs/seed-admin.sql for creating auth user + profile

-- -----------------------------------------------------------------------------
-- 9. ONBOARDING EXTENSION
-- -----------------------------------------------------------------------------
-- Added via `supabase/migrations/20260610_onboarding_invites_intakes.sql`
--
-- New tables:
--   - public.onboarding_invites
--   - public.onboarding_intakes
--
-- Added columns:
--   - public.profiles.onboarding_invite_id
--   - public.profiles.onboarding_started_at
--   - public.profiles.onboarding_completed_at
--   - public.employee_profiles.pan_number
--   - public.employee_profiles.aadhaar_number
--   - public.employee_profiles.stipend_amount
--   - public.employee_profiles.onboarding_started_at
--   - public.employee_profiles.onboarding_completed_at
--   - public.employee_profiles.joining_letter_document_id
--   - public.employee_profiles.joining_letter_signed_document_id
--   - public.employee_profiles.joining_letter_sent_at
--   - public.employee_profiles.joining_letter_returned_at
--   - public.documents.document_key
--   - public.documents.source_url
--   - public.documents.source_type
--   - public.documents.review_status
--   - public.documents.reviewed_by
--   - public.documents.reviewed_at
--   - public.documents.review_notes
--   - public.documents.source_metadata
--
-- New enums:
--   - onboarding_intake_status
--   - onboarding_document_review_status
--   - document_source_type
--
-- Trigger behavior:
--   - onboarding intake submission records invite usage
--   - approved intakes mark profile onboarding as COMPLETED
--   - completion timestamps are mirrored onto profiles and employee_profiles
