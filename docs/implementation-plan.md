# Implementation Plan

## HRMS / KPI Management Portal

**Version:** 1.0  
**Status:** Ready to begin Phase 1 after doc approval

---

## 1. Overview

Phased delivery prioritizing **foundation → auth/RBAC → database → core modules → polish**. Frontend quality is the primary success metric; backend business logic stays thin.

**Estimated phases:** 8 (+ Phase 0 complete)

---

## 2. Phase Summary

| Phase | Name | Deliverables | Depends On |
|-------|------|--------------|------------|
| 0 | Documentation | All docs in `/docs` | — |
| 1 | Foundation | Next.js scaffold, auth, layouts | 0 |
| 2 | Database | Migrations, RLS, seed | 1 |
| 3 | Core UI | Dashboards, employees, shared components | 2 |
| 4 | KPI Module | Full KPI experience (priority) | 3 |
| 5 | Leave & EOD | Leave + daily updates | 3 |
| 6 | Payroll & Reports | Payroll UI, PDF reports | 3 |
| 7 | Settings & System | Settings, notifications, audit | 3 |
| 8 | Polish & QA | Mobile QA, states, performance | 4–7 |

---

## 3. Phase 0: Documentation ✅

**Goal:** Architecture and product specs before code.

**Deliverables:**
- [x] `product-requirements.md`
- [x] `frontend-architecture.md`
- [x] `database-schema.md`
- [x] `rbac.md`
- [x] `routes.md`
- [x] `design-system.md`
- [x] `mobile-design.md`
- [x] `implementation-plan.md`

**Exit criteria:** All docs reviewed; no implementation started.

---

## 4. Phase 1: Foundation

**Goal:** Runnable Next.js app with real Supabase auth and app shell.

### 4.1 Tasks

| # | Task | Output |
|---|------|--------|
| 1.1 | Initialize Next.js 15 + TypeScript + Tailwind | `package.json`, configs |
| 1.2 | Install shadcn/ui, configure theme tokens | `components/ui/*`, `globals.css` |
| 1.3 | Configure Geist + Inter fonts | `app/layout.tsx` |
| 1.4 | Set up Supabase clients (browser, server, middleware) | `shared/lib/supabase/*` |
| 1.5 | Environment validation with Zod | `src/env.ts`, `.env.example` |
| 1.6 | Auth pages: login, forgot password, reset password | `(auth)/*` |
| 1.7 | Middleware: session refresh, route protection | `middleware.ts` |
| 1.8 | AuthProvider + useAuthStore (Zustand) | `features/auth/*` |
| 1.9 | App layout: sidebar, header, mobile nav shell | `(app)/layout.tsx` |
| 1.10 | RBAC utilities: hasPermission, RoleGuard | `shared/lib/rbac.ts`, guards |
| 1.11 | Placeholder dashboard pages (5 roles) | `/dashboard/*` |
| 1.12 | Access denied + not-found pages | Error pages |

### 4.2 Dependencies

```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir
npx shadcn@latest init
npm install @supabase/supabase-js @supabase/ssr zod zustand react-hook-form @hookform/resolvers lucide-react
```

### 4.3 Exit Criteria

- [ ] Login/logout works with Supabase
- [ ] Protected routes redirect unauthenticated users
- [ ] Sidebar renders with role-filtered items (hardcoded until profiles exist)
- [ ] Mobile bottom nav visible below `md`
- [ ] App builds without errors

---

## 5. Phase 2: Database

**Goal:** Full schema, RLS, and seed data in Supabase.

### 5.1 Tasks

| # | Task | Output |
|---|------|--------|
| 2.1 | Init Supabase project link / CLI | `supabase/` folder |
| 2.2 | Migration: enums + helper functions | `00001`, `00002` |
| 2.3 | Migration: profiles, departments | `00003` |
| 2.4 | Migration: employee_profiles, manager_assignments | `00004` |
| 2.5 | Migration: leave module tables | `00005` |
| 2.6 | Migration: KPI module tables | `00006` |
| 2.7 | Migration: EOD, payroll, reports, documents | `00007` |
| 2.8 | Migration: notifications, audit_logs | `00008`, `00009` |
| 2.9 | Migration: RLS policies (all tables) | `00010` |
| 2.10 | Migration: storage buckets + policies | `00011` |
| 2.11 | Seed script: 25 users, departments, sample data | `00012_seed_data.sql` + script |
| 2.12 | Generate TypeScript types | `database.types.ts` |
| 2.13 | Profile auto-create trigger on auth signup | DB trigger |
| 2.14 | Wire auth to fetch real profile + role | Update AuthProvider |

### 5.2 Seed Accounts (Document in README)

| Role | Email Pattern | Count |
|------|---------------|-------|
| SUPER_ADMIN | admin@company.dev | 1 |
| HR | hr@company.dev | 1 |
| MANAGER | manager{1-3}@company.dev | 3 |
| EMPLOYEE | employee{1-18}@company.dev | 18 |
| INTERN | intern{1-3}@company.dev | 3 |

### 5.3 Exit Criteria

- [ ] All 15 tables created with indexes
- [ ] RLS enabled and tested per role
- [ ] Seed data visible via Supabase dashboard
- [ ] Login as each role type works
- [ ] Navigation reflects real roles from DB

---

## 6. Phase 3: Core UI & Employees

**Goal:** Shared component library and employee management module.

### 6.1 Shared Components

| Component | Priority |
|-----------|----------|
| PageHeader, StatCard, EmptyState | P0 |
| DataTable + mobile card fallbacks | P0 |
| FilterBar, SearchBar | P0 |
| StatusBadge, RoleBadge | P0 |
| Chart wrappers (Area, Bar, Donut) | P0 |
| Loading skeletons (page, table, card) | P0 |
| ConfirmDialog, Form wrappers | P0 |

### 6.2 Dashboards (Role-Specific)

| Dashboard | Key Widgets |
|-----------|-------------|
| Admin | Org stats, audit summary, headcount chart |
| HR | Pending approvals, leave overview, payroll status |
| Manager | Team KPI, pending leave/EOD, team chart |
| Employee | My KPIs, leave balance, tasks, notifications |
| Intern | Simplified employee dashboard |

### 6.3 Employee Module

| Page | Priority |
|------|----------|
| Directory (search, filter, pagination) | P0 |
| Employee detail (tabs) | P0 |
| Create employee | P0 |
| Edit employee | P0 |
| Department view | P1 |
| Documents upload | P1 |
| Timeline | P1 |

### 6.4 Exit Criteria

- [ ] All 5 dashboards populated with real seed data
- [ ] Employee CRUD works for HR/Admin
- [ ] Manager sees team only
- [ ] Mobile card fallback on employee directory
- [ ] All UI states implemented on employee pages

---

## 7. Phase 4: KPI Module (Priority)

**Goal:** Best-in-app module — templates, assignment, analytics, leaderboards.

### 7.1 Tasks

| # | Page/Feature | Priority |
|---|--------------|----------|
| 4.1 | KPI dashboard landing | P0 |
| 4.2 | KPI templates CRUD | P0 |
| 4.3 | Assign KPI (individual + bulk) | P0 |
| 4.4 | Employee KPI detail + progress edit | P0 |
| 4.5 | Department KPI rollup | P0 |
| 4.6 | Analytics: trends, completion rates | P0 |
| 4.7 | Leaderboard | P1 |
| 4.8 | KPI settings in /settings/kpi | P1 |

### 7.2 Exit Criteria

- [ ] HR can create template and assign to employee
- [ ] Manager can edit team KPI progress
- [ ] Employee sees own KPIs with progress update
- [ ] Charts render with seed data
- [ ] Mobile KPI cards and FAB work

---

## 8. Phase 5: Leave & EOD

**Goal:** Complete leave workflow and daily reporting.

### 8.1 Leave Tasks

| # | Feature | Priority |
|---|---------|----------|
| 5.1 | Leave dashboard with balances | P0 |
| 5.2 | Apply leave form (dynamic policies) | P0 |
| 5.3 | Leave history | P0 |
| 5.4 | Approval queue (manager/HR) | P0 |
| 5.5 | Leave calendar | P1 |
| 5.6 | Leave analytics | P1 |
| 5.7 | Policy CRUD (no hardcoded values) | P0 |

### 8.2 EOD Tasks

| # | Feature | Priority |
|---|---------|----------|
| 5.8 | Submit daily update | P0 |
| 5.9 | EOD history | P0 |
| 5.10 | Manager review + comments | P0 |
| 5.11 | Consistency indicators on manager dashboard | P1 |

### 8.3 Exit Criteria

- [ ] Full leave apply → approve flow
- [ ] Policies configurable from UI
- [ ] EOD submit and manager review works
- [ ] Notifications created on leave approval (DB records)

---

## 9. Phase 6: Payroll & Reports

**Goal:** Frontend-heavy payroll and premium reporting.

### 9.1 Payroll

| # | Feature | Priority |
|---|---------|----------|
| 6.1 | Payroll dashboard | P0 |
| 6.2 | Employee payroll detail + breakdown | P0 |
| 6.3 | Payroll analytics charts | P1 |
| 6.4 | Payroll settings (deduction rules form) | P1 |
| 6.5 | Intern summary-only view | P0 |

### 9.2 Reports

| # | Feature | Priority |
|---|---------|----------|
| 6.6 | Reports hub | P0 |
| 6.7 | Employee report + PDF preview | P0 |
| 6.8 | Department report | P1 |
| 6.9 | Manager report | P1 |
| 6.10 | Payroll report | P1 |
| 6.11 | Organization report | P1 |
| 6.12 | Export button UI | P1 |

### 9.3 Exit Criteria

- [ ] Payroll records display from seed data
- [ ] PDF preview renders in modal
- [ ] HR can edit payroll settings form (persists to DB)
- [ ] Reports filterable by date range

---

## 10. Phase 7: Settings, Notifications, Audit

**Goal:** Configuration hub and system visibility.

### 10.1 Settings

| Page | Access |
|------|--------|
| Company settings | Admin |
| Departments | HR, Admin |
| Roles | Admin |
| Leave/KPI/Payroll settings | HR, Admin |
| Profile | All |
| Notifications prefs | All |

### 10.2 Notifications

- Notification center page
- Header bell with unread count
- Mark read/unread
- Filter by type
- Realtime subscription (optional)

### 10.3 Audit Logs

- Table view (desktop) + timeline (mobile)
- Filters: actor, action, entity, date range
- Search by entity ID

### 10.4 Exit Criteria

- [ ] Super Admin can change user roles from UI
- [ ] All settings pages persist to DB
- [ ] Notification center shows seed notifications
- [ ] Audit log visible to HR/Admin

---

## 11. Phase 8: Polish & QA

**Goal:** 95% production-ready feel.

### 11.1 Tasks

| # | Task |
|---|------|
| 8.1 | Mobile QA at 360, 390, 414px — all pages |
| 8.2 | Verify all loading/empty/error/skeleton states |
| 8.3 | Performance: dynamic imports for PDF/charts |
| 8.4 | Accessibility audit (focus, contrast, labels) |
| 8.5 | Consistent empty states with CTAs |
| 8.6 | Toast feedback on all mutations |
| 8.7 | README: setup, env vars, seed accounts |
| 8.8 | Final design pass: spacing, typography, polish |

### 11.2 Exit Criteria

- [ ] No horizontal scroll on any page at any breakpoint
- [ ] Founder-ready demo with seeded data
- [ ] All roles login and see correct experience
- [ ] Build passes with zero TypeScript errors

---

## 12. Risk Register

| Risk | Mitigation |
|------|------------|
| RLS too restrictive blocks UI | Test each role after migration; use advisors |
| Seed script complexity | Use service role script; idempotent SQL |
| PDF performance on mobile | Lazy load; preview server-side if needed |
| Scope creep on payroll logic | UI forms only; defer calculations |
| Auth session edge cases | Follow @supabase/ssr patterns exactly |

---

## 13. Definition of Done (Global)

Every feature is done when:

1. Works for all permitted roles
2. Has loading, empty, error, and success states
3. Responsive at mobile/tablet/desktop
4. Form validation with Zod + RHF
5. RLS allows intended operations
6. Matches design system tokens
7. No TypeScript errors

---

## 14. Suggested Build Order (Sprint View)

### Sprint 1 (Week 1)
Phase 1 + Phase 2 start

### Sprint 2 (Week 2)
Phase 2 complete + Phase 3 (shared components + dashboards)

### Sprint 3 (Week 3)
Phase 3 (employees) + Phase 4 start (KPI)

### Sprint 4 (Week 4)
Phase 4 complete (KPI priority)

### Sprint 5 (Week 5)
Phase 5 (Leave + EOD)

### Sprint 6 (Week 6)
Phase 6 (Payroll + Reports)

### Sprint 7 (Week 7)
Phase 7 (Settings, Notifications, Audit)

### Sprint 8 (Week 8)
Phase 8 (Polish + QA)

---

## 15. File Creation Order (Phase 1 Detail)

```
1.  package.json, tsconfig, tailwind.config.ts
2.  src/env.ts
3.  src/shared/lib/supabase/client.ts
4.  src/shared/lib/supabase/server.ts
5.  src/shared/lib/supabase/middleware.ts
6.  src/middleware.ts
7.  src/shared/types/roles.ts
8.  src/shared/lib/rbac.ts
9.  src/shared/stores/auth-store.ts
10. src/features/auth/services/auth.service.ts
11. src/features/auth/components/login-form.tsx
12. src/features/auth/components/auth-provider.tsx
13. src/app/(auth)/layout.tsx
14. src/app/(auth)/login/page.tsx
15. src/shared/components/layout/app-sidebar.tsx
16. src/shared/components/layout/app-header.tsx
17. src/shared/components/layout/mobile-bottom-nav.tsx
18. src/app/(app)/layout.tsx
19. src/app/(app)/dashboard/page.tsx
20. Role-specific dashboard pages
```

---

## 16. Next Step

**Begin Phase 1** upon approval:

1. Scaffold Next.js 15 project
2. Connect Supabase environment variables
3. Implement auth flow and app shell

---

## 17. Related Documents

| Document | Purpose |
|----------|---------|
| [product-requirements.md](./product-requirements.md) | What to build |
| [frontend-architecture.md](./frontend-architecture.md) | How to structure code |
| [database-schema.md](./database-schema.md) | Data model |
| [rbac.md](./rbac.md) | Permissions |
| [routes.md](./routes.md) | URL map |
| [design-system.md](./design-system.md) | Visual specs |
| [mobile-design.md](./mobile-design.md) | Responsive specs |
