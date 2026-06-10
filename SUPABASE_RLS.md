# Supabase Row-Level Security (RLS) Policies

This document summarizes the RLS policies implemented in the Supabase database for the Dibiz Studio Employee Management Portal. All 15 core tables have RLS enabled.

---

## Helper Functions

- `public.get_user_role()`: Retrieves the `role` enum value of the current authenticated user (`auth.uid()`).
- `public.is_admin()`: Returns `true` if the user's role is `SUPER_ADMIN` or `HR`.
- `public.is_manager_of(target_employee_id)`: Returns `true` if the current user is active as a manager for the target employee in `manager_assignments`.

---

## Policies Matrix

### 1. `profiles`
- **SELECT**: Authenticated users can view their own row, or rows where they are an administrator, or rows of employees they manage.
- **UPDATE (self)**: Authenticated users can update only their own row.
- **ALL (admin)**: Only `SUPER_ADMIN` has full CRUD permissions.
- **UPDATE (HR)**: `HR` can update any profile row.
- **INSERT (self)**: Authenticated users can insert their own row on sign-up.

### 2. `departments`
- **SELECT**: All authenticated users can read.
- **ALL**: Restricted to administrators (`SUPER_ADMIN` and `HR`).

### 3. `employee_profiles`
- **SELECT**: Users can view their own, or rows where they are an administrator, or rows of employees they manage.
- **ALL**: Restricted to administrators (`SUPER_ADMIN` and `HR`).

### 4. `manager_assignments`
- **SELECT**: Administrators, the manager assigned, or the employee assigned can view.
- **ALL**: Restricted to administrators (`SUPER_ADMIN` and `HR`).

### 5. `leave_policies`
- **SELECT**: All authenticated users can read.
- **ALL**: Restricted to administrators (`SUPER_ADMIN` and `HR`).

### 6. `employee_leave_policy`
- **SELECT**: Users can view their own, or if they are an administrator, or if they manage the employee.
- **ALL**: Restricted to administrators (`SUPER_ADMIN` and `HR`).

### 7. `leave_requests`
- **SELECT**: Users can view their own requests, or if they are an administrator, or if they manage the employee.
- **INSERT**: Authenticated users can only create requests for themselves.
- **UPDATE**: Users can update their own requests, or administrators and managers can review/update status.

### 8. `kpi_templates`
- **SELECT**: All authenticated users can read.
- **ALL**: Restricted to administrators (`SUPER_ADMIN` and `HR`).

### 9. `employee_kpis`
- **SELECT**: Users can view their own KPIs, or if they are an administrator, or if they manage the employee.
- **INSERT**: Restricted to administrators and managers of the target employee.
- **UPDATE**: Owners, managers, and administrators can update progress/details.

### 10. `daily_updates` (EOD Reports)
- **SELECT**: Users can view their own updates, or if they are an administrator, or if they manage the employee.
- **INSERT**: Authenticated users can only create updates for themselves.
- **UPDATE**: Owners, managers (to add comments/reviews), and administrators can update.

### 11. `payroll_records`
- **SELECT**: Users can view their own payroll, or if they are an administrator, or if they are their active manager.
- **ALL**: Restricted to administrators (`SUPER_ADMIN` and `HR`).

### 12. `monthly_reports`
- **SELECT**: Restricted to administrators and managers.
- **ALL**: Restricted to administrators (`SUPER_ADMIN` and `HR`).

### 13. `documents`
- **SELECT**: Users can view their own documents, or if they are an administrator, or if they manage the employee.
- **INSERT**: Restricted to the employee themselves or administrators.
- **ALL**: Restricted to administrators (`SUPER_ADMIN` and `HR`).

### 14. `notifications`
- **SELECT**: Users can view notifications sent to their own user ID.
- **UPDATE**: Users can mark their own notifications as read.
- **INSERT**: Restricted to administrators or if inserting a notification for oneself.

### 15. `audit_logs`
- **SELECT**: Restricted to administrators (`SUPER_ADMIN` and `HR`).
- **INSERT**: Allowed if inserting an audit log for oneself or by administrators.
