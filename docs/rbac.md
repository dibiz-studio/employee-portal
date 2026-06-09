# Role-Based Access Control (RBAC)

## HRMS / KPI Management Portal

**Version:** 1.0

---

## 1. Overview

Authorization is **database-backed**. The canonical role lives in `profiles.role`. Frontend route guards and UI wrappers mirror database RLS policies — never the reverse.

**Roles (hierarchy for display only, not inheritance):**

```
SUPER_ADMIN  →  Full organization control
HR           →  People operations, policies, payroll prep
MANAGER      →  Team management, approvals, team KPIs
EMPLOYEE     →  Self-service workflows
INTERN       →  Employee subset with restricted payroll
```

**Security rules:**

- Never authorize via `auth.users.user_metadata` (user-editable)
- Role changes logged in `audit_logs`
- JWT role claims not used; always fetch from `profiles` or RLS helper functions
- Service role key used only in server-side seed/admin scripts

---

## 2. Role Definitions

### 2.1 SUPER_ADMIN

| Attribute | Value |
|-----------|-------|
| Count (seed) | 1 |
| Purpose | Organization owner, full config access |
| Can do | Everything HR can do + role assignment, audit logs, destructive actions, all settings |
| Cannot do | N/A (full access within single org) |

### 2.2 HR

| Attribute | Value |
|-----------|-------|
| Count (seed) | 1 |
| Purpose | Human resources operations |
| Can do | Employee CRUD, policies, payroll records, all reports, KPI templates, leave policy config |
| Cannot do | Assign SUPER_ADMIN role, delete audit logs |

### 2.3 MANAGER

| Attribute | Value |
|-----------|-------|
| Count (seed) | 3 |
| Purpose | Team lead with approval authority |
| Can do | View/manage direct reports, approve leave, review EOD, assign/edit team KPIs, team reports |
| Cannot do | Org-wide employee CRUD, payroll settings, leave policy CRUD, role changes |

### 2.4 EMPLOYEE

| Attribute | Value |
|-----------|-------|
| Count (seed) | ~18 |
| Purpose | Individual contributor |
| Can do | Own profile, apply leave, submit EOD, view own KPIs/payroll/documents |
| Cannot do | View other employees (except directory basic info), approve anything, admin settings |

### 2.5 INTERN

| Attribute | Value |
|-----------|-------|
| Count (seed) | ~3 |
| Purpose | Temporary/junior staff |
| Can do | Same as EMPLOYEE |
| Cannot do | View detailed payroll breakdown (summary/net pay only) |

---

## 3. Permission Matrix

Legend: ✅ Full · 👁 Read · ✏️ Own/Team · ❌ None · ⚙️ Configure

### 3.1 Navigation Access

| Nav Item | SUPER_ADMIN | HR | MANAGER | EMPLOYEE | INTERN |
|----------|:-----------:|:--:|:-------:|:--------:|:------:|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Employees | ✅ | ✅ | 👁 Team | ❌ | ❌ |
| KPI | ✅ | ✅ | ✏️ Team | 👁 Own | 👁 Own |
| Leaves | ✅ | ✅ | ✏️ Approve | ✏️ Apply | ✏️ Apply |
| EOD | ✅ | 👁 | ✏️ Review | ✏️ Submit | ✏️ Submit |
| Payroll | ✅ | ✅ | 👁 Team | 👁 Own | 👁 Summary |
| Reports | ✅ | ✅ | 👁 Team | 👁 Own | 👁 Own |
| Settings | ✅ | ⚙️ Partial | 👁 Profile | 👁 Profile | 👁 Profile |
| Notifications | ✅ | ✅ | ✅ | ✅ | ✅ |
| Audit Logs | ✅ | ✅ | ❌ | ❌ | ❌ |

### 3.2 Module Permissions

#### Employees

| Action | SUPER_ADMIN | HR | MANAGER | EMPLOYEE | INTERN |
|--------|:-----------:|:--:|:-------:|:--------:|:------:|
| View directory | ✅ | ✅ | ✅ Team | ❌ | ❌ |
| View employee detail | ✅ | ✅ | ✅ Reports | 👁 Self | 👁 Self |
| Create employee | ✅ | ✅ | ❌ | ❌ | ❌ |
| Edit employee | ✅ | ✅ | ❌ | ❌ | ❌ |
| Deactivate employee | ✅ | ✅ | ❌ | ❌ | ❌ |
| Upload documents | ✅ | ✅ | ❌ | ✏️ Self | ✏️ Self |
| View salary field | ✅ | ✅ | ❌ | ❌ | ❌ |

#### KPI

| Action | SUPER_ADMIN | HR | MANAGER | EMPLOYEE | INTERN |
|--------|:-----------:|:--:|:-------:|:--------:|:------:|
| View KPI dashboard | ✅ Org | ✅ Org | ✅ Team | ✅ Own | ✅ Own |
| Manage templates | ✅ | ✅ | ❌ | ❌ | ❌ |
| Assign KPIs | ✅ | ✅ | ✅ Team | ❌ | ❌ |
| Edit KPI values | ✅ | ✅ | ✅ Team | ✏️ Progress | ✏️ Progress |
| View leaderboards | ✅ | ✅ | ✅ Team | 👁 Dept | 👁 Dept |
| Delete KPIs | ✅ | ✅ | ❌ | ❌ | ❌ |

#### Leave

| Action | SUPER_ADMIN | HR | MANAGER | EMPLOYEE | INTERN |
|--------|:-----------:|:--:|:-------:|:--------:|:------:|
| View policies | ✅ | ✅ | 👁 | 👁 | 👁 |
| Configure policies | ✅ | ✅ | ❌ | ❌ | ❌ |
| Apply leave | ✅ | ✅ | ✅ | ✅ | ✅ |
| Approve/reject | ✅ | ✅ | ✅ Team | ❌ | ❌ |
| View all requests | ✅ | ✅ | ✅ Team | 👁 Own | 👁 Own |
| Cancel own pending | ✅ | ✅ | ✅ | ✅ | ✅ |

#### EOD

| Action | SUPER_ADMIN | HR | MANAGER | EMPLOYEE | INTERN |
|--------|:-----------:|:--:|:-------:|:--------:|:------:|
| Submit daily update | ✅ | ✅ | ✅ | ✅ | ✅ |
| View own history | ✅ | ✅ | ✅ | ✅ | ✅ |
| Review team EOD | ✅ | ✅ | ✅ Team | ❌ | ❌ |
| Add manager comment | ✅ | ✅ | ✅ Team | ❌ | ❌ |

#### Payroll

| Action | SUPER_ADMIN | HR | MANAGER | EMPLOYEE | INTERN |
|--------|:-----------:|:--:|:-------:|:--------:|:------:|
| Payroll dashboard | ✅ | ✅ | 👁 Team | ❌ | ❌ |
| View own payslip | ✅ | ✅ | ✅ | ✅ | 👁 Summary |
| Create/edit records | ✅ | ✅ | ❌ | ❌ | ❌ |
| Configure rules | ✅ | ✅ | ❌ | ❌ | ❌ |

#### Reports

| Action | SUPER_ADMIN | HR | MANAGER | EMPLOYEE | INTERN |
|--------|:-----------:|:--:|:-------:|:--------:|:------:|
| Organization report | ✅ | ✅ | ❌ | ❌ | ❌ |
| Department report | ✅ | ✅ | ✅ Own dept | ❌ | ❌ |
| Employee report | ✅ | ✅ | ✅ Team | 👁 Self | 👁 Self |
| Export PDF | ✅ | ✅ | ✅ Scoped | 👁 Self | 👁 Self |

#### Settings

| Action | SUPER_ADMIN | HR | MANAGER | EMPLOYEE | INTERN |
|--------|:-----------:|:--:|:-------:|:--------:|:------:|
| Company settings | ✅ | 👁 | ❌ | ❌ | ❌ |
| Department settings | ✅ | ✅ | ❌ | ❌ | ❌ |
| Role assignment | ✅ | ❌ | ❌ | ❌ | ❌ |
| Leave/KPI/Payroll config | ✅ | ✅ | ❌ | ❌ | ❌ |
| Profile settings | ✅ | ✅ | ✅ | ✅ | ✅ |
| Notification prefs | ✅ | ✅ | ✅ | ✅ | ✅ |

#### Audit

| Action | SUPER_ADMIN | HR | MANAGER | EMPLOYEE | INTERN |
|--------|:-----------:|:--:|:-------:|:--------:|:------:|
| View audit logs | ✅ | ✅ | ❌ | ❌ | ❌ |
| Search/filter | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## 4. Permission String Registry

Used by `PermissionWrapper` and server-side checks:

```typescript
type Permission =
  // Employees
  | 'employees:read'
  | 'employees:read:team'
  | 'employees:read:self'
  | 'employees:create'
  | 'employees:update'
  | 'employees:delete'
  // KPI
  | 'kpi:read'
  | 'kpi:read:team'
  | 'kpi:read:self'
  | 'kpi:templates:manage'
  | 'kpi:assign'
  | 'kpi:edit:team'
  | 'kpi:edit:self'
  | 'kpi:delete'
  // Leave
  | 'leave:read'
  | 'leave:apply'
  | 'leave:approve'
  | 'leave:policies:manage'
  // EOD
  | 'eod:submit'
  | 'eod:review:team'
  // Payroll
  | 'payroll:read'
  | 'payroll:read:self'
  | 'payroll:read:summary'
  | 'payroll:manage'
  | 'payroll:settings'
  // Reports
  | 'reports:org'
  | 'reports:department'
  | 'reports:team'
  | 'reports:self'
  // Settings
  | 'settings:company'
  | 'settings:departments'
  | 'settings:roles'
  | 'settings:policies'
  | 'settings:profile'
  // Audit
  | 'audit:read'
```

### Role → Permissions Map

```typescript
const ROLE_PERMISSIONS: Record<AppRole, Permission[]> = {
  SUPER_ADMIN: ['*'], // all permissions
  HR: [
    'employees:*', 'kpi:*', 'leave:*', 'eod:*',
    'payroll:*', 'reports:org', 'reports:department', 'reports:team', 'reports:self',
    'settings:departments', 'settings:policies', 'settings:profile',
    'audit:read',
  ],
  MANAGER: [
    'employees:read:team', 'kpi:read:team', 'kpi:assign', 'kpi:edit:team',
    'leave:read', 'leave:apply', 'leave:approve',
    'eod:submit', 'eod:review:team',
    'payroll:read', 'payroll:read:self',
    'reports:department', 'reports:team', 'reports:self',
    'settings:profile',
  ],
  EMPLOYEE: [
    'kpi:read:self', 'kpi:edit:self',
    'leave:read', 'leave:apply',
    'eod:submit',
    'payroll:read:self',
    'reports:self',
    'settings:profile',
  ],
  INTERN: [
    'kpi:read:self', 'kpi:edit:self',
    'leave:read', 'leave:apply',
    'eod:submit',
    'payroll:read:summary',
    'reports:self',
    'settings:profile',
  ],
}
```

---

## 5. Frontend Guard Implementation

### 5.1 Middleware (`middleware.ts`)

```typescript
const PUBLIC_ROUTES = ['/login', '/forgot-password', '/reset-password']
const ADMIN_ROUTES = ['/audit', '/settings/roles']
const HR_ROUTES = ['/employees/new', '/settings/leave-policies', '/payroll/settings']

// 1. Refresh session
// 2. Redirect unauthenticated → /login
// 3. Check route prefix against role
// 4. Redirect unauthorized → /dashboard?error=forbidden
```

### 5.2 RoleGuard Component

```tsx
interface RoleGuardProps {
  allowed: AppRole[]
  fallback?: React.ReactNode
  children: React.ReactNode
}
```

Renders `children` only if `profile.role` is in `allowed`; otherwise renders fallback or null.

### 5.3 PermissionWrapper Component

```tsx
interface PermissionWrapperProps {
  permission: Permission | Permission[]
  mode?: 'any' | 'all'
  fallback?: React.ReactNode
  children: React.ReactNode
}
```

Uses `hasPermission(role, permission)` from `shared/lib/rbac.ts`.

### 5.4 usePermissions Hook

```typescript
function usePermissions() {
  const role = useAuthStore(s => s.profile?.role)
  return {
    role,
    can: (permission: Permission) => hasPermission(role, permission),
    canAny: (permissions: Permission[]) => ...,
    isAdmin: role === 'SUPER_ADMIN' || role === 'HR',
    isManager: role === 'MANAGER',
  }
}
```

---

## 6. Dashboard Routing

After login, redirect to role-specific dashboard:

| Role | Default Route |
|------|---------------|
| SUPER_ADMIN | `/dashboard/admin` |
| HR | `/dashboard/hr` |
| MANAGER | `/dashboard/manager` |
| EMPLOYEE | `/dashboard/employee` |
| INTERN | `/dashboard/intern` |

Generic `/dashboard` resolves to role-specific view.

---

## 7. RLS Alignment

Frontend permissions must not exceed RLS. Key RLS helpers:

| Function | Purpose |
|----------|---------|
| `get_user_role()` | Returns current user's role |
| `is_admin()` | SUPER_ADMIN or HR |
| `is_manager_of(uuid)` | Direct report check |

When UI shows an action, the corresponding RLS policy must allow the mutation. If RLS blocks, show error toast — do not hide button incorrectly.

---

## 8. Role Assignment Rules

| Actor | Can Assign |
|-------|------------|
| SUPER_ADMIN | Any role including SUPER_ADMIN |
| HR | EMPLOYEE, INTERN, MANAGER only |
| Others | None |

Role changes require audit log entry with `old_values.role` and `new_values.role`.

---

## 9. Manager Scope

"Team" access determined by `manager_assignments` where:

- `manager_id = auth.uid()`
- `is_active = true`

Managers do **not** inherit access to skip-level reports unless also assigned.

HR and SUPER_ADMIN bypass manager scope for read/write where policy allows.

---

## 10. Edge Cases

| Scenario | Behavior |
|----------|----------|
| User deactivated (`is_active = false`) | Force logout on next request; middleware blocks |
| Role changed while logged in | Re-fetch profile on navigation; optional realtime subscription |
| Manager demoted to Employee | Lose team access immediately after profile refresh |
| Intern promoted to Employee | Gain full payroll read on refresh |
| Self-approval of leave | Blocked — approver must be manager or HR, not self |

---

## 11. Related Documents

- [routes.md](./routes.md) — route-level guards
- [database-schema.md](./database-schema.md) — RLS policies
- [frontend-architecture.md](./frontend-architecture.md) — guard components
