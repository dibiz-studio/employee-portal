# Database Schema

## HRMS / KPI Management Portal

**Version:** 1.0  
**Database:** PostgreSQL (Supabase)  
**Schema:** `public`

---

## 1. Design Principles

1. **UUID primary keys** — `gen_random_uuid()` via `uuid-ossp` or `pgcrypto`
2. **Timestamps on every table** — `created_at`, `updated_at` with trigger
3. **Soft references to auth** — `profiles.id` = `auth.users.id`
4. **RLS on all tables** — no exceptions in `public`
5. **Role in profiles** — authorization source of truth (not `user_metadata`)
6. **Audit trail** — `audit_logs` for sensitive mutations
7. **Future multi-tenant ready** — optional `organization_id` column reserved on core tables (nullable in v1)

---

## 2. Enums

```sql
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
```

---

## 3. Helper Functions

```sql
-- Auto-update updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Get current user's role from profiles (security definer in private schema preferred)
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS app_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Check if user is admin (SUPER_ADMIN or HR)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT get_user_role() IN ('SUPER_ADMIN', 'HR');
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Check if user manages employee
CREATE OR REPLACE FUNCTION public.is_manager_of(target_employee_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.manager_assignments
    WHERE manager_id = auth.uid()
      AND employee_id = target_employee_id
      AND is_active = true
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;
```

---

## 4. Tables

### 4.1 profiles

Core user profile linked to Supabase Auth.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, FK → auth.users(id) ON DELETE CASCADE |
| email | text | NOT NULL, UNIQUE |
| full_name | text | NOT NULL |
| avatar_url | text | nullable |
| role | app_role | NOT NULL DEFAULT 'EMPLOYEE' |
| phone | text | nullable |
| is_active | boolean | NOT NULL DEFAULT true |
| created_at | timestamptz | NOT NULL DEFAULT now() |
| updated_at | timestamptz | NOT NULL DEFAULT now() |

**Indexes:** `idx_profiles_role`, `idx_profiles_email`, `idx_profiles_is_active`

**Trigger:** Auto-create profile on signup via database trigger or app logic.

---

### 4.2 departments

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| name | text | NOT NULL, UNIQUE |
| code | text | NOT NULL, UNIQUE |
| description | text | nullable |
| head_id | uuid | FK → profiles(id) ON DELETE SET NULL |
| is_active | boolean | NOT NULL DEFAULT true |
| created_at | timestamptz | NOT NULL DEFAULT now() |
| updated_at | timestamptz | NOT NULL DEFAULT now() |

**Indexes:** `idx_departments_head_id`, `idx_departments_is_active`

---

### 4.3 employee_profiles

Extended HR data for employees.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| profile_id | uuid | NOT NULL, UNIQUE, FK → profiles(id) ON DELETE CASCADE |
| employee_code | text | NOT NULL, UNIQUE |
| department_id | uuid | FK → departments(id) ON DELETE SET NULL |
| job_title | text | NOT NULL |
| employment_status | employment_status | NOT NULL DEFAULT 'ACTIVE' |
| hire_date | date | NOT NULL |
| termination_date | date | nullable |
| date_of_birth | date | nullable |
| address | jsonb | nullable `{ street, city, state, country, zip }` |
| emergency_contact | jsonb | nullable `{ name, phone, relation }` |
| salary_base | numeric(12,2) | nullable (visible to HR/Admin only via RLS) |
| work_location | text | nullable |
| created_at | timestamptz | NOT NULL DEFAULT now() |
| updated_at | timestamptz | NOT NULL DEFAULT now() |

**Indexes:** `idx_employee_profiles_department_id`, `idx_employee_profiles_profile_id`, `idx_employee_profiles_status`, `idx_employee_profiles_employee_code`

---

### 4.4 manager_assignments

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| manager_id | uuid | NOT NULL, FK → profiles(id) ON DELETE CASCADE |
| employee_id | uuid | NOT NULL, FK → profiles(id) ON DELETE CASCADE |
| assigned_at | timestamptz | NOT NULL DEFAULT now() |
| is_active | boolean | NOT NULL DEFAULT true |
| created_at | timestamptz | NOT NULL DEFAULT now() |
| updated_at | timestamptz | NOT NULL DEFAULT now() |

**Unique:** `(manager_id, employee_id)` where `is_active = true` (partial unique index)

**Indexes:** `idx_manager_assignments_manager_id`, `idx_manager_assignments_employee_id`

---

### 4.5 leave_policies

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| name | text | NOT NULL |
| code | text | NOT NULL, UNIQUE |
| description | text | nullable |
| days_per_year | numeric(5,1) | NOT NULL |
| is_paid | boolean | NOT NULL DEFAULT true |
| requires_approval | boolean | NOT NULL DEFAULT true |
| min_notice_days | integer | NOT NULL DEFAULT 0 |
| max_consecutive_days | integer | nullable |
| carry_forward | boolean | NOT NULL DEFAULT false |
| carry_forward_limit | numeric(5,1) | nullable |
| applicable_roles | app_role[] | nullable (null = all roles) |
| is_active | boolean | NOT NULL DEFAULT true |
| created_at | timestamptz | NOT NULL DEFAULT now() |
| updated_at | timestamptz | NOT NULL DEFAULT now() |

**Indexes:** `idx_leave_policies_is_active`, `idx_leave_policies_code`

---

### 4.6 employee_leave_policy

Junction: policy allocation per employee per year.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| employee_id | uuid | NOT NULL, FK → profiles(id) ON DELETE CASCADE |
| policy_id | uuid | NOT NULL, FK → leave_policies(id) ON DELETE CASCADE |
| year | integer | NOT NULL |
| allocated_days | numeric(5,1) | NOT NULL |
| used_days | numeric(5,1) | NOT NULL DEFAULT 0 |
| created_at | timestamptz | NOT NULL DEFAULT now() |
| updated_at | timestamptz | NOT NULL DEFAULT now() |

**Unique:** `(employee_id, policy_id, year)`

**Indexes:** `idx_employee_leave_policy_employee_id`, `idx_employee_leave_policy_year`

---

### 4.7 leave_requests

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| employee_id | uuid | NOT NULL, FK → profiles(id) ON DELETE CASCADE |
| policy_id | uuid | NOT NULL, FK → leave_policies(id) |
| start_date | date | NOT NULL |
| end_date | date | NOT NULL |
| days_requested | numeric(5,1) | NOT NULL |
| reason | text | NOT NULL |
| status | leave_request_status | NOT NULL DEFAULT 'PENDING' |
| reviewed_by | uuid | nullable, FK → profiles(id) |
| reviewed_at | timestamptz | nullable |
| review_notes | text | nullable |
| created_at | timestamptz | NOT NULL DEFAULT now() |
| updated_at | timestamptz | NOT NULL DEFAULT now() |

**Check:** `end_date >= start_date`

**Indexes:** `idx_leave_requests_employee_id`, `idx_leave_requests_status`, `idx_leave_requests_dates`

---

### 4.8 kpi_templates

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| name | text | NOT NULL |
| description | text | nullable |
| category | text | NOT NULL |
| measurement_unit | text | NOT NULL DEFAULT 'percentage' |
| default_target | numeric(12,2) | nullable |
| period | kpi_period | NOT NULL DEFAULT 'MONTHLY' |
| department_id | uuid | nullable, FK → departments(id) ON DELETE SET NULL |
| applicable_roles | app_role[] | nullable |
| weight | numeric(5,2) | NOT NULL DEFAULT 1.0 |
| is_active | boolean | NOT NULL DEFAULT true |
| created_by | uuid | FK → profiles(id) |
| created_at | timestamptz | NOT NULL DEFAULT now() |
| updated_at | timestamptz | NOT NULL DEFAULT now() |

**Indexes:** `idx_kpi_templates_department_id`, `idx_kpi_templates_is_active`, `idx_kpi_templates_category`

---

### 4.9 employee_kpis

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| employee_id | uuid | NOT NULL, FK → profiles(id) ON DELETE CASCADE |
| template_id | uuid | nullable, FK → kpi_templates(id) ON DELETE SET NULL |
| title | text | NOT NULL |
| description | text | nullable |
| target_value | numeric(12,2) | NOT NULL |
| current_value | numeric(12,2) | NOT NULL DEFAULT 0 |
| unit | text | NOT NULL DEFAULT 'percentage' |
| weight | numeric(5,2) | NOT NULL DEFAULT 1.0 |
| period | kpi_period | NOT NULL |
| period_start | date | NOT NULL |
| period_end | date | NOT NULL |
| status | kpi_status | NOT NULL DEFAULT 'NOT_STARTED' |
| assigned_by | uuid | FK → profiles(id) |
| notes | text | nullable |
| created_at | timestamptz | NOT NULL DEFAULT now() |
| updated_at | timestamptz | NOT NULL DEFAULT now() |

**Indexes:** `idx_employee_kpis_employee_id`, `idx_employee_kpis_status`, `idx_employee_kpis_period`, `idx_employee_kpis_template_id`

---

### 4.10 daily_updates (EOD)

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| employee_id | uuid | NOT NULL, FK → profiles(id) ON DELETE CASCADE |
| report_date | date | NOT NULL |
| tasks_completed | text[] | NOT NULL DEFAULT '{}' |
| hours_worked | numeric(4,1) | NOT NULL |
| blockers | text | nullable |
| tomorrow_plan | text | nullable |
| manager_comment | text | nullable |
| reviewed_by | uuid | nullable, FK → profiles(id) |
| reviewed_at | timestamptz | nullable |
| created_at | timestamptz | NOT NULL DEFAULT now() |
| updated_at | timestamptz | NOT NULL DEFAULT now() |

**Unique:** `(employee_id, report_date)`

**Indexes:** `idx_daily_updates_employee_id`, `idx_daily_updates_report_date`

---

### 4.11 payroll_records

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| employee_id | uuid | NOT NULL, FK → profiles(id) ON DELETE CASCADE |
| period_month | integer | NOT NULL (1–12) |
| period_year | integer | NOT NULL |
| base_salary | numeric(12,2) | NOT NULL |
| allowances | jsonb | NOT NULL DEFAULT '{}' |
| deductions | jsonb | NOT NULL DEFAULT '{}' |
| leave_deduction | numeric(12,2) | NOT NULL DEFAULT 0 |
| gross_pay | numeric(12,2) | NOT NULL |
| net_pay | numeric(12,2) | NOT NULL |
| status | payroll_status | NOT NULL DEFAULT 'DRAFT' |
| notes | text | nullable |
| processed_by | uuid | nullable, FK → profiles(id) |
| created_at | timestamptz | NOT NULL DEFAULT now() |
| updated_at | timestamptz | NOT NULL DEFAULT now() |

**Unique:** `(employee_id, period_month, period_year)`

**Indexes:** `idx_payroll_records_employee_id`, `idx_payroll_records_period`

---

### 4.12 monthly_reports

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| title | text | NOT NULL |
| report_type | text | NOT NULL |
| department_id | uuid | nullable, FK → departments(id) |
| period_month | integer | NOT NULL |
| period_year | integer | NOT NULL |
| summary | jsonb | NOT NULL DEFAULT '{}' |
| generated_by | uuid | FK → profiles(id) |
| file_path | text | nullable |
| created_at | timestamptz | NOT NULL DEFAULT now() |
| updated_at | timestamptz | NOT NULL DEFAULT now() |

**Indexes:** `idx_monthly_reports_department_id`, `idx_monthly_reports_period`

---

### 4.13 documents

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| employee_id | uuid | NOT NULL, FK → profiles(id) ON DELETE CASCADE |
| name | text | NOT NULL |
| category | document_category | NOT NULL DEFAULT 'OTHER' |
| file_path | text | NOT NULL |
| file_size | integer | nullable |
| mime_type | text | nullable |
| uploaded_by | uuid | FK → profiles(id) |
| created_at | timestamptz | NOT NULL DEFAULT now() |
| updated_at | timestamptz | NOT NULL DEFAULT now() |

**Indexes:** `idx_documents_employee_id`, `idx_documents_category`

**Storage bucket:** `employee-documents` with RLS policies matching table access.

---

### 4.14 notifications

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| user_id | uuid | NOT NULL, FK → profiles(id) ON DELETE CASCADE |
| type | notification_type | NOT NULL |
| title | text | NOT NULL |
| message | text | NOT NULL |
| link | text | nullable |
| metadata | jsonb | NOT NULL DEFAULT '{}' |
| is_read | boolean | NOT NULL DEFAULT false |
| read_at | timestamptz | nullable |
| created_at | timestamptz | NOT NULL DEFAULT now() |
| updated_at | timestamptz | NOT NULL DEFAULT now() |

**Indexes:** `idx_notifications_user_id`, `idx_notifications_is_read`, `idx_notifications_type`, `idx_notifications_created_at`

---

### 4.15 audit_logs

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| actor_id | uuid | nullable, FK → profiles(id) ON DELETE SET NULL |
| action | audit_action | NOT NULL |
| entity_type | text | NOT NULL |
| entity_id | uuid | nullable |
| old_values | jsonb | nullable |
| new_values | jsonb | nullable |
| ip_address | text | nullable |
| user_agent | text | nullable |
| created_at | timestamptz | NOT NULL DEFAULT now() |
| updated_at | timestamptz | NOT NULL DEFAULT now() |

**Indexes:** `idx_audit_logs_actor_id`, `idx_audit_logs_entity`, `idx_audit_logs_created_at`, `idx_audit_logs_action`

**Note:** INSERT-only for most users; no UPDATE/DELETE policies for non-admins.

---

## 5. Entity Relationship Summary

```
auth.users ──1:1── profiles ──1:1── employee_profiles ──N:1── departments
                      │
                      ├──1:N── manager_assignments (as manager or employee)
                      ├──1:N── leave_requests
                      ├──1:N── employee_leave_policy
                      ├──1:N── employee_kpis
                      ├──1:N── daily_updates
                      ├──1:N── payroll_records
                      ├──1:N── documents
                      └──1:N── notifications

leave_policies ──1:N── employee_leave_policy
               └──1:N── leave_requests

kpi_templates ──1:N── employee_kpis

departments ──1:N── kpi_templates
            └──1:N── monthly_reports
```

---

## 6. RLS Policy Summary

All tables: `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| profiles | Self, admin, manager of | Admin | Self (limited), admin | Admin |
| departments | All authenticated | Admin | Admin | Admin |
| employee_profiles | Self, admin, manager of | Admin | Admin, manager (limited) | Admin |
| manager_assignments | Admin, involved parties | Admin | Admin | Admin |
| leave_policies | All authenticated | Admin | Admin | Admin |
| employee_leave_policy | Self, admin, manager of | Admin | Admin | Admin |
| leave_requests | Self, admin, manager of | Self | Self (pending only), admin, manager | Self (pending), admin |
| kpi_templates | All authenticated | Admin | Admin | Admin |
| employee_kpis | Self, admin, manager of | Admin, manager (team) | Admin, manager (team), self (progress) | Admin |
| daily_updates | Self, admin, manager of | Self | Self, manager (comment) | Admin |
| payroll_records | Self (limited for intern), admin | Admin | Admin | Admin |
| monthly_reports | Admin, manager (dept) | Admin, manager | Admin | Admin |
| documents | Self, admin, manager of | Self, admin | Admin | Admin |
| notifications | Self | System/admin | Self (read) | Self |
| audit_logs | Admin | Authenticated (insert own actions) | None | None |

**Intern payroll restriction:** RLS policy excludes `deductions` detail or returns summary-only view.

---

## 7. Storage Buckets

| Bucket | Public | Purpose |
|--------|--------|---------|
| `avatars` | Yes (read) | Profile photos |
| `employee-documents` | No | HR documents |
| `reports` | No | Generated report PDFs |

---

## 8. Migration File Order

```
supabase/migrations/
├── 00001_extensions_and_enums.sql
├── 00002_helper_functions.sql
├── 00003_profiles_and_departments.sql
├── 00004_employee_and_manager.sql
├── 00005_leave_module.sql
├── 00006_kpi_module.sql
├── 00007_eod_and_payroll.sql
├── 00008_reports_documents_notifications.sql
├── 00009_audit_logs.sql
├── 00010_rls_policies.sql
├── 00011_storage_policies.sql
└── 00012_seed_data.sql
```

---

## 9. Seed Data Outline

See [product-requirements.md](./product-requirements.md) §9.

Seed script creates:

1. Auth users via Supabase Admin API (service role)
2. Profiles with assigned roles
3. Departments and employee_profiles
4. Manager assignments
5. Leave policies and allocations
6. Sample leave requests (mixed statuses)
7. KPI templates and employee KPIs
8. Daily updates (14 days × subset of employees)
9. Payroll records (current month)
10. Notifications and audit log entries

**Default passwords:** Document in README (dev only); force change in production.

---

## 10. Views (Optional)

```sql
-- Employee directory view (security invoker)
CREATE VIEW employee_directory WITH (security_invoker = true) AS
SELECT
  ep.id,
  p.id AS profile_id,
  p.full_name,
  p.email,
  p.avatar_url,
  p.role,
  ep.employee_code,
  ep.job_title,
  ep.employment_status,
  d.name AS department_name,
  d.id AS department_id
FROM employee_profiles ep
JOIN profiles p ON p.id = ep.profile_id
LEFT JOIN departments d ON d.id = ep.department_id
WHERE p.is_active = true;
```

---

## 11. Related Documents

- [rbac.md](./rbac.md) — permission matrix aligned with RLS
- [frontend-architecture.md](./frontend-architecture.md) — data access patterns
- [implementation-plan.md](./implementation-plan.md) — migration timing
