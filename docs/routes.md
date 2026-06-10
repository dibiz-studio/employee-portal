# Routes

## HRMS / KPI Management Portal

**Version:** 1.0  
**Router:** Next.js 15 App Router

---

## 1. Route Map Overview

```
/                           → Redirect to /dashboard or /login
/login                      → Public
/forgot-password            → Public
/reset-password             → Public
/onboarding/[token]         → Public invite landing

/dashboard                  → Role-resolved dashboard
/dashboard/admin            → SUPER_ADMIN
/dashboard/hr               → HR
/dashboard/manager          → MANAGER
/dashboard/employee         → EMPLOYEE
/dashboard/intern           → INTERN

/employees                  → Directory (HR, Admin, Manager)
/employees/new              → Create (HR, Admin)
/employees/[id]             → Detail
/employees/[id]/edit        → Edit (HR, Admin)
/employees/departments      → Department view
/employees/departments/[id] → Department detail

/kpi                        → KPI dashboard
/kpi/templates              → Template list (HR, Admin)
/kpi/templates/new          → Create template
/kpi/templates/[id]         → Template detail/edit
/kpi/assign                 → Assign KPI (HR, Admin, Manager)
/kpi/employee/[id]          → Employee KPI view
/kpi/department/[id]        → Department KPI rollup
/kpi/analytics              → Analytics & trends
/kpi/leaderboard            → Leaderboard

/leave                      → Leave dashboard
/leave/apply                → Apply leave
/leave/history              → Own history
/leave/approvals            → Pending approvals (Manager, HR, Admin)
/leave/calendar             → Calendar view
/leave/analytics            → Leave analytics (HR, Admin, Manager)
/leave/policies             → Policy list (HR, Admin)
/leave/policies/[id]        → Policy edit

/eod                        → EOD dashboard
/eod/submit                 → Submit daily update
/eod/history                → Own EOD history
/eod/review                 → Team review (Manager, HR, Admin)
/eod/[id]                   → Single EOD detail

/onboarding                 → Authenticated onboarding intake

/payroll                    → Payroll dashboard (HR, Admin)
/payroll/employee/[id]      → Employee payroll detail
/payroll/analytics          → Payroll analytics
/payroll/settings           → Deduction rules, config (HR, Admin)

/reports                    → Reports hub
/reports/employee/[id]      → Employee report
/reports/manager/[id]       → Manager report
/reports/department/[id]    → Department report
/reports/payroll            → Payroll report
/reports/organization       → Org report (HR, Admin)

/settings                   → Settings hub
/settings/company           → Company settings (Admin)
/settings/departments       → Departments (HR, Admin)
/settings/roles             → Role management (Admin)
/settings/leave             → Leave settings
/settings/kpi               → KPI defaults
/settings/payroll           → Payroll settings
/settings/notifications     → Notification preferences
/settings/profile           → User profile

/notifications              → Notification center

/audit                      → Audit logs (HR, Admin)

/access-denied              → 403 page
```

---

## 2. Route Groups & Layouts

### 2.1 `(auth)` Group

| Route | Layout | Auth Required |
|-------|--------|:-------------:|
| `/login` | AuthLayout (centered card) | No |
| `/forgot-password` | AuthLayout | No |
| `/reset-password` | AuthLayout | No |

**AuthLayout features:**
- Split panel: brand left (desktop), form right
- Mobile: full-width form
- Geist logo + tagline
- Link to login/register

### 2.2 `(app)` Group

All routes below use **AppLayout** (sidebar + header + mobile nav).

| Route | Auth Required |
|-------|:-------------:|
| All `/dashboard/*`, `/employees/*`, etc. | Yes |

---

## 3. Route Protection Matrix

### 3.1 Middleware Rules

```typescript
// Public — no session required
const PUBLIC = ['/login', '/forgot-password', '/reset-password']

// Authenticated — any role
const AUTHENTICATED = [
  '/dashboard', '/kpi', '/leave/apply', '/leave/history',
  '/eod/submit', '/eod/history', '/notifications', '/settings/profile',
]

// Role-restricted prefixes
const ROLE_ROUTES: Record<string, AppRole[]> = {
  '/dashboard/admin': ['SUPER_ADMIN'],
  '/dashboard/hr': ['HR'],
  '/dashboard/manager': ['MANAGER'],
  '/dashboard/employee': ['EMPLOYEE'],
  '/dashboard/intern': ['INTERN'],
  '/employees/new': ['SUPER_ADMIN', 'HR'],
  '/employees/[id]/edit': ['SUPER_ADMIN', 'HR'],
  '/audit': ['SUPER_ADMIN', 'HR'],
  '/settings/roles': ['SUPER_ADMIN'],
  '/settings/company': ['SUPER_ADMIN'],
  '/leave/policies': ['SUPER_ADMIN', 'HR'],
  '/leave/approvals': ['SUPER_ADMIN', 'HR', 'MANAGER'],
  '/payroll/settings': ['SUPER_ADMIN', 'HR'],
  '/reports/organization': ['SUPER_ADMIN', 'HR'],
}
```

### 3.2 Dynamic Route Access

| Route | Access Logic |
|-------|--------------|
| `/employees/[id]` | Admin/HR: all; Manager: direct reports; Employee: self only |
| `/employees/[id]/edit` | Admin/HR only |
| `/kpi/employee/[id]` | Admin/HR: all; Manager: team; Employee: self |
| `/payroll/employee/[id]` | Admin/HR: all; Employee/Intern: self (intern = summary) |
| `/reports/employee/[id]` | Admin/HR: all; Manager: team; Employee: self |
| `/eod/review` | Manager+: team entries |
| `/eod/[id]` | Owner, their manager, admin, HR |

Dynamic access enforced in **page server component** + RLS; middleware handles prefix-only rules.

---

## 4. Navigation → Route Mapping

### 4.1 Desktop Sidebar

| Label | Route | Roles |
|-------|-------|-------|
| Dashboard | `/dashboard` | All |
| Employees | `/employees` | SUPER_ADMIN, HR, MANAGER |
| KPI | `/kpi` | All |
| Leaves | `/leave` | All |
| EOD | `/eod` | All |
| Payroll | `/payroll` | SUPER_ADMIN, HR, MANAGER |
| Reports | `/reports` | All (scoped content) |
| Settings | `/settings` | All (scoped sections) |

**Footer items:**
| Label | Route | Roles |
|-------|-------|-------|
| Notifications | `/notifications` | All |
| Audit Logs | `/audit` | SUPER_ADMIN, HR |

### 4.2 Mobile Bottom Nav

| Tab | Route | Icon |
|-----|-------|------|
| Dashboard | `/dashboard` | LayoutDashboard |
| Tasks | `/kpi` | Target |
| Leaves | `/leave` | CalendarDays |
| Reports | `/reports` | FileText |
| Profile | `/settings/profile` | User |

Additional pages accessed via drawer menu or in-page navigation.

---

## 5. Page Specifications

### 5.1 Dashboard Pages

| Route | Key Components |
|-------|----------------|
| `/dashboard/admin` | Org metrics, user count, audit summary, system health cards, revenue-style KPIs |
| `/dashboard/hr` | Headcount, open leave, pending approvals, payroll status |
| `/dashboard/manager` | Team KPI progress, pending leave/EOD, team chart |
| `/dashboard/employee` | My KPIs, leave balance, upcoming tasks, recent notifications |
| `/dashboard/intern` | Simplified employee dashboard |

### 5.2 Employee Pages

| Route | States Required |
|-------|-----------------|
| `/employees` | Skeleton table, empty (no employees), error, filtered empty |
| `/employees/[id]` | Tabs: Overview, KPI, Leave, Documents, Performance, Timeline |
| `/employees/new` | Multi-step form with validation |
| `/employees/departments` | Card grid + table toggle |

### 5.3 KPI Pages

| Route | Priority |
|-------|----------|
| `/kpi` | P0 — primary module landing |
| `/kpi/analytics` | P0 — charts, trends |
| `/kpi/leaderboard` | P1 |
| `/kpi/templates` | P0 for HR |

### 5.4 Leave Pages

| Route | Notes |
|-------|-------|
| `/leave/apply` | Policy selector from DB, date range picker, balance display |
| `/leave/calendar` | Team calendar for managers; personal for employees |
| `/leave/policies/[id]` | Full policy form — no hardcoded fields |

### 5.5 EOD Pages

| Route | Notes |
|-------|-------|
| `/eod/submit` | Dynamic task list (add/remove rows) |
| `/eod/review` | Filterable by date, employee; inline comment |

### 5.6 Payroll Pages

| Route | Notes |
|-------|-------|
| `/payroll` | Summary cards, department breakdown chart |
| `/payroll/employee/[id]` | Salary breakdown accordion |
| `/payroll/settings` | Deduction rules as editable JSON/form fields |

### 5.7 Reports Pages

| Route | Notes |
|-------|-------|
| `/reports/*` | Filter bar, PDF preview modal, export button |
| All report pages | Date range picker, loading skeleton for PDF |

### 5.8 Settings Pages

| Route | Access |
|-------|--------|
| `/settings` | Hub with cards linking to sub-settings |
| `/settings/roles` | User table with role dropdown (Admin only) |

---

## 6. API Routes (Minimal)

Prefer Supabase client direct. Optional route handlers:

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/callback` | GET | Supabase OAuth callback (if enabled later) |
| `/api/seed` | POST | Dev seed trigger (protected, disabled in prod) |
| `/api/reports/generate` | POST | Server-side PDF generation if client too heavy |

---

## 7. Redirects & Fallbacks

| Condition | Redirect |
|-----------|----------|
| `/` unauthenticated | `/login` |
| `/` authenticated | `/dashboard` |
| `/dashboard` | Role-specific sub-dashboard |
| Unauthorized role on route | `/access-denied` |
| Unknown route | `not-found.tsx` |
| Session expired | `/login?redirect={pathname}` |

---

## 8. URL Conventions

- Lowercase kebab-case: `/leave/apply` not `/leave/Apply`
- Resource IDs as UUID: `/employees/550e8400-e29b-41d4-a716-446655440000`
- Query params for filters: `/employees?department=eng&status=active`
- Tab state via query: `/employees/[id]?tab=kpi` (optional)

---

## 9. Breadcrumbs

| Route | Breadcrumb |
|-------|------------|
| `/employees/[id]` | Employees → {name} |
| `/kpi/templates/[id]` | KPI → Templates → {name} |
| `/leave/policies/[id]` | Leave → Policies → {name} |
| `/settings/profile` | Settings → Profile |

---

## 10. Deep Links & Notification Links

Notifications `link` field maps to routes:

| Type | Example Link |
|------|--------------|
| LEAVE | `/leave/approvals?id={request_id}` |
| KPI | `/kpi/employee/{employee_id}` |
| PAYROLL | `/payroll/employee/{employee_id}` |
| EOD | `/eod/review?date={date}` |
| APPROVAL | Context-specific approval page |

---

## 11. File Path Mapping

```
src/app/
├── (auth)/
│   ├── layout.tsx
│   ├── login/page.tsx
│   ├── forgot-password/page.tsx
│   └── reset-password/page.tsx
├── (app)/
│   ├── layout.tsx
│   ├── dashboard/
│   │   ├── page.tsx                    # Role resolver
│   │   ├── admin/page.tsx
│   │   ├── hr/page.tsx
│   │   ├── manager/page.tsx
│   │   ├── employee/page.tsx
│   │   └── intern/page.tsx
│   ├── employees/
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   ├── departments/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── [id]/
│   │       ├── page.tsx
│   │       └── edit/page.tsx
│   ├── kpi/ ...
│   ├── leave/ ...
│   ├── eod/ ...
│   ├── payroll/ ...
│   ├── reports/ ...
│   ├── settings/ ...
│   ├── notifications/page.tsx
│   └── audit/page.tsx
├── access-denied/page.tsx
└── not-found.tsx
```

---

## 12. Related Documents

- [rbac.md](./rbac.md) — permission details
- [frontend-architecture.md](./frontend-architecture.md) — layout structure
- [mobile-design.md](./mobile-design.md) — mobile nav behavior
