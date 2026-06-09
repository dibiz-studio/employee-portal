# Database Migration Guide

## Files

| File | Purpose |
|------|---------|
| [`database-full-schema.sql`](./database-full-schema.sql) | Complete schema: enums, tables, indexes, triggers, RLS |
| [`seed-admin.sql`](./seed-admin.sql) | Promote/create `tech@dibizsolution.com` as SUPER_ADMIN |
| [`database-schema.md`](./database-schema.md) | Original design doc (entity relationships) |

## Current Supabase Project

- **Project ID:** `fycpmbdrybdgfcsvfrqf`
- **Region:** ap-south-1
- **URL:** `https://fycpmbdrybdgfcsvfrqf.supabase.co`

## Applied Migrations (remote)

1. `extensions_and_enums`
2. `core_tables`
3. `helper_functions`
4. `leave_kpi_tables`
5. `eod_payroll_system_tables`
6. `rls_policies`
7. `seed_departments_and_policies`
8. `avatar_sync_and_profile_insert`
9. `onboarding_status_column`
10. `update_handle_new_user_onboarding`

## Migrate to a New Supabase Project

### Option 1: SQL Editor (manual)

1. Create new Supabase project
2. Open **SQL Editor**
3. Paste and run `docs/database-full-schema.sql` in one go
4. Run `docs/seed-admin.sql` (Option B block for fresh install)
5. Update `.env.local` with new URL and anon key

### Option 2: Supabase CLI

```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR_NEW_PROJECT_REF

# Copy migrations to supabase/migrations/ then:
supabase db push
```

### Option 3: pg_dump (exact copy)

From Supabase dashboard → **Database** → **Backups**, or:

```bash
pg_dump "postgresql://postgres:[PASSWORD]@db.fycpmbdrybdgfcsvfrqf.supabase.co:5432/postgres" \
  --schema=public --no-owner --no-privileges > backup.sql
```

## Entity Relationship (quick reference)

```
auth.users ──1:1── profiles
profiles ──1:1── employee_profiles ──N:1── departments
profiles ──N:N── manager_assignments
profiles ──1:N── leave_requests, employee_kpis, daily_updates, payroll_records
leave_policies ──1:N── leave_requests, employee_leave_policy
kpi_templates ──1:N── employee_kpis
```

## Tables (15)

| Table | Description |
|-------|-------------|
| `profiles` | Users, roles, onboarding_status, avatar |
| `departments` | Org departments |
| `employee_profiles` | HR extended data |
| `manager_assignments` | Manager → employee mapping |
| `leave_policies` | Configurable leave types |
| `employee_leave_policy` | Per-employee leave allocation |
| `leave_requests` | Leave applications |
| `kpi_templates` | KPI definitions |
| `employee_kpis` | Assigned KPIs |
| `daily_updates` | EOD submissions |
| `payroll_records` | Monthly payroll |
| `monthly_reports` | Generated reports |
| `documents` | Employee documents |
| `notifications` | In-app notifications |
| `audit_logs` | Change audit trail |

## Roles

`SUPER_ADMIN` | `HR` | `MANAGER` | `EMPLOYEE` | `INTERN`

`SUPER_ADMIN` and `HR` bypass most RLS via `is_admin()`.

## Useful Queries

```sql
-- List all users
SELECT id, email, role, onboarding_status, full_name FROM profiles;

-- Promote user to admin
UPDATE profiles SET role = 'SUPER_ADMIN', onboarding_status = 'COMPLETED'
WHERE email = 'tech@dibizsolution.com';

-- Reset password
UPDATE auth.users SET encrypted_password = crypt('NewPassword!', gen_salt('bf'))
WHERE email = 'tech@dibizsolution.com';

-- Purge all data (keep schema)
TRUNCATE audit_logs, notifications, documents, monthly_reports,
  payroll_records, daily_updates, employee_kpis, leave_requests,
  employee_leave_policy, manager_assignments, employee_profiles,
  kpi_templates, leave_policies, departments, profiles RESTART IDENTITY CASCADE;
```
