# Supabase Migrations

Migrations were applied directly to the linked Supabase project via MCP.

## Applied Migrations

| Name | Description |
|------|-------------|
| `extensions_and_enums` | pgcrypto, enums, updated_at trigger |
| `core_tables` | profiles, departments, employee_profiles, manager_assignments |
| `helper_functions` | get_user_role, is_admin, is_manager_of, auth trigger |
| `leave_kpi_tables` | leave and KPI module tables |
| `eod_payroll_system_tables` | EOD, payroll, reports, documents, notifications, audit |
| `rls_policies` | Row Level Security on all tables |
| `seed_departments_and_policies` | Departments, leave policies, KPI templates |

## Seed Data

- 25 auth users (see README for credentials)
- 5 departments, 8 KPI templates, 5 leave policies
- Manager assignments, leave allocations, payroll records
- Daily updates, notifications, audit logs, monthly reports
- ~45 employee KPIs

## Regenerate Types

```bash
# Via Supabase CLI (if linked)
supabase gen types typescript --project-id fycpmbdrybdgfcsvfrqf > src/shared/types/database.types.ts
```

Or use the Supabase MCP `generate_typescript_types` tool.
