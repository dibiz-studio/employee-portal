# Product Requirements Document

## HRMS / KPI Management Portal

**Version:** 1.0  
**Status:** Pre-implementation  
**Last updated:** June 2026

---

## 1. Executive Summary

The HRMS / KPI Management Portal is a production-grade SaaS platform for employee lifecycle management, performance tracking (KPIs), leave administration, end-of-day reporting, payroll assistance, and organizational analytics.

The product targets mid-size companies (50–500 employees) that need a unified HR operations hub without the complexity of legacy enterprise suites. The initial release prioritizes **frontend polish and user experience** (95% production-ready feel) with **Supabase-backed real auth, sessions, profiles, and database structure**. Business workflows may use seeded or mock data where backend logic is deferred.

**Design north star:** A founder opens the app and believes it is a paid SaaS product already in use by real companies.

**Reference products:** Linear, Stripe, Vercel, Notion, Ramp, Brex.

---

## 2. Problem Statement

HR and people operations teams juggle disconnected tools for:

- Employee records and org structure
- Performance goals and KPI tracking
- Leave requests and policy enforcement
- Daily work visibility (EOD)
- Payroll preparation and reporting

This fragmentation causes data silos, approval delays, poor manager visibility, and inconsistent employee experience.

---

## 3. Product Vision

A single, role-aware portal where:

- **Employees** submit work, request leave, and track personal KPIs
- **Managers** approve leave, review EOD, and manage team KPIs
- **HR** configures policies, manages employees, and oversees payroll prep
- **Super Admin** controls organization-wide settings and audit visibility

---

## 4. Goals & Success Metrics

| Goal | Success Metric |
|------|----------------|
| Premium UX | Time-to-first-action < 3s on dashboard load |
| Role clarity | Users only see nav/actions permitted for their role |
| Data realism | App feels populated immediately after seed (25 employees, sample KPIs, leave, payroll) |
| Mobile parity | Every core flow usable at 360px width without horizontal scroll |
| Extensibility | New modules can be added without folder/architecture rewrites |

---

## 5. User Personas

### 5.1 Super Admin (1 seeded)

- Organization owner or IT admin
- Full configuration access
- Audit log visibility
- Can modify all settings, roles, and policies

### 5.2 HR (1 seeded)

- Manages employee lifecycle
- Configures leave policies, KPI templates, payroll settings
- Approves sensitive changes
- Runs org-wide reports

### 5.3 Manager (3 seeded)

- Manages direct reports
- Approves leave and reviews EOD
- Assigns/edits team KPIs
- Views team analytics

### 5.4 Employee (~18 seeded)

- Submits EOD, applies for leave
- Views own KPIs, payroll, documents
- Receives notifications

### 5.5 Intern (~3 seeded)

- Same as employee with restricted payroll visibility and simplified KPI scope

---

## 6. Scope

### 6.1 In Scope (v1)

| Module | Capabilities |
|--------|-------------|
| **Auth** | Login, logout, forgot password UI, protected routes, session persistence |
| **Dashboard** | Role-specific dashboards with metrics, charts, activity, quick actions |
| **Employees** | Directory, detail, CRUD, departments, manager view, timeline, documents, performance |
| **KPI** | Templates, assignment, employee/department KPIs, analytics, leaderboards, trends |
| **Leave** | Apply, history, approvals, calendar, analytics, configurable policies |
| **EOD** | Daily submission, manager review, comments, consistency tracking |
| **Payroll** | Dashboard, employee view, analytics, settings, salary breakdown (UI-first) |
| **Reports** | Employee, manager, department, payroll, org reports; PDF preview; export UI |
| **Settings** | Company, department, role, leave, KPI, payroll, notification, profile |
| **Notifications** | Center with read/unread, filters, type-based grouping |
| **Audit Logs** | Timeline and table views with filters and search |

### 6.2 Out of Scope (v1)

- Payment processing / bank integrations
- Biometric attendance hardware
- Multi-tenant billing
- Email/SMS delivery (notification records only; delivery mocked or deferred)
- Complex payroll calculation engine (forms and structure only)
- Mobile native apps (responsive web only)

---

## 7. Functional Requirements

### 7.1 Authentication

| ID | Requirement | Priority |
|----|-------------|----------|
| AUTH-01 | Users authenticate via Supabase Auth (email/password) | P0 |
| AUTH-02 | Session persists across browser refresh | P0 |
| AUTH-03 | Protected routes redirect unauthenticated users to login | P0 |
| AUTH-04 | Forgot password flow with email reset UI | P1 |
| AUTH-05 | Auth layout separate from app layout | P0 |
| AUTH-06 | Middleware validates session on server | P0 |

### 7.2 Role-Based Access

| ID | Requirement | Priority |
|----|-------------|----------|
| RBAC-01 | Roles stored in `profiles.role` (database-backed) | P0 |
| RBAC-02 | Route guards enforce role permissions | P0 |
| RBAC-03 | UI guards hide unauthorized actions | P0 |
| RBAC-04 | Navigation adapts per role | P0 |
| RBAC-05 | Dashboard content adapts per role | P0 |

**Roles:** `SUPER_ADMIN`, `HR`, `MANAGER`, `EMPLOYEE`, `INTERN`

### 7.3 Employee Management

| ID | Requirement | Priority |
|----|-------------|----------|
| EMP-01 | Searchable, filterable employee directory | P0 |
| EMP-02 | Employee detail with tabs: overview, KPI, leave, documents, performance, timeline | P0 |
| EMP-03 | Create/edit employee (HR, Super Admin) | P0 |
| EMP-04 | Department and manager assignment views | P0 |
| EMP-05 | Document upload to Supabase Storage | P1 |
| EMP-06 | Employee timeline from audit logs and status changes | P1 |

### 7.4 KPI Management

| ID | Requirement | Priority |
|----|-------------|----------|
| KPI-01 | KPI template CRUD (HR, Super Admin) | P0 |
| KPI-02 | Assign KPIs to employees or departments | P0 |
| KPI-03 | Managers edit KPIs for direct reports | P0 |
| KPI-04 | Progress tracking with status and percentage | P0 |
| KPI-05 | Analytics: trends, leaderboards, department rollups | P0 |
| KPI-06 | KPI dashboard as primary module landing | P0 |

### 7.5 Leave Management

| ID | Requirement | Priority |
|----|-------------|----------|
| LVE-01 | Configurable leave policies (no hardcoded types) | P0 |
| LVE-02 | Employee leave application with date range and reason | P0 |
| LVE-03 | Manager/HR approval workflow | P0 |
| LVE-04 | Leave calendar view | P1 |
| LVE-05 | Leave analytics (usage, balance, trends) | P1 |
| LVE-06 | Policy assignment per employee | P0 |

### 7.6 End of Day (EOD)

| ID | Requirement | Priority |
|----|-------------|----------|
| EOD-01 | Daily submission: tasks, hours, blockers, tomorrow plan | P0 |
| EOD-02 | Manager review with comments | P0 |
| EOD-03 | Consistency/productivity indicators on manager dashboard | P1 |
| EOD-04 | History view for employee and manager | P0 |

### 7.7 Payroll

| ID | Requirement | Priority |
|----|-------------|----------|
| PAY-01 | Payroll dashboard with summary metrics | P0 |
| PAY-02 | Employee salary breakdown view | P0 |
| PAY-03 | Deduction rules configuration UI (HR) | P1 |
| PAY-04 | Leave impact on payroll display | P1 |
| PAY-05 | Payroll analytics charts | P1 |

### 7.8 Reports

| ID | Requirement | Priority |
|----|-------------|----------|
| RPT-01 | Report types: employee, manager, department, payroll, organization | P0 |
| RPT-02 | PDF preview via React PDF | P0 |
| RPT-03 | Export button UI (download/generate) | P1 |
| RPT-04 | Filterable date ranges and dimensions | P1 |

### 7.9 Settings

| ID | Requirement | Priority |
|----|-------------|----------|
| SET-01 | Company profile settings | P0 |
| SET-02 | Department CRUD | P0 |
| SET-03 | Leave policy settings | P0 |
| SET-04 | KPI default settings | P1 |
| SET-05 | Payroll settings | P1 |
| SET-06 | Notification preferences | P1 |
| SET-07 | User profile settings | P0 |

### 7.10 Notifications

| ID | Requirement | Priority |
|----|-------------|----------|
| NTF-01 | Notification center with unread count | P0 |
| NTF-02 | Mark read/unread | P0 |
| NTF-03 | Filter by type (leave, KPI, payroll, approval) | P1 |
| NTF-04 | Database-backed notification records | P0 |

### 7.11 Audit Logs

| ID | Requirement | Priority |
|----|-------------|----------|
| AUD-01 | Log employee, role, leave, KPI, payroll changes | P0 |
| AUD-02 | Timeline and table views | P0 |
| AUD-03 | Search and filter by actor, entity, date | P1 |
| AUD-04 | Super Admin and HR read access | P0 |

---

## 8. Non-Functional Requirements

### 8.1 Performance

- First Contentful Paint target: < 1.5s on broadband
- Skeleton states for all data-fetching views
- Pagination or virtual scroll for large tables (employees, audit logs)

### 8.2 Security

- RLS enabled on all public schema tables
- Role authorization via `profiles` table (not `user_metadata`)
- Service role key never exposed to client
- Storage policies for document buckets

### 8.3 Accessibility

- WCAG 2.1 AA target for forms and navigation
- Keyboard navigable sidebar and mobile nav
- Focus states on all interactive elements

### 8.4 Responsive Design

- Mobile-first: 360px, 390px, 414px breakpoints
- Tablet and desktop layouts for every page
- No horizontal scrolling on any viewport
- No desktop-only screens

### 8.5 UI States

Every page must implement:

- Loading
- Empty
- Success
- Error
- Skeleton

---

## 9. Seed Data Requirements

| Entity | Count | Notes |
|--------|-------|-------|
| Employees (auth users + profiles) | 25 | Mix of roles |
| Departments | 5 | Engineering, Sales, HR, Finance, Operations |
| Managers | 3 | Each with 4–6 direct reports |
| HR | 1 | |
| Super Admin | 1 | |
| KPI templates | 8–10 | Department and role variants |
| Employee KPIs | ~40 | Assigned across employees |
| Leave policies | 4–6 | Annual, sick, unpaid, etc. |
| Leave requests | ~20 | Various statuses |
| Daily updates (EOD) | ~50 | Last 2 weeks |
| Payroll records | 25 | One month per employee |
| Monthly reports | 5 | Department summaries |
| Notifications | ~30 | Mixed types and read states |
| Audit logs | ~50 | Sample change history |
| Documents | ~15 | Linked to employees |

---

## 10. Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 App Router |
| Language | TypeScript |
| Styling | TailwindCSS |
| Components | shadcn/ui |
| Backend | Supabase (Auth, Database, Storage) |
| Validation | Zod |
| Forms | React Hook Form |
| Client state | Zustand |
| Charts | Recharts |
| PDF | React PDF |
| Icons | Lucide |

---

## 11. Assumptions & Constraints

1. Single organization (not multi-tenant) in v1; schema allows future org_id column
2. Supabase is the sole backend; no custom API server in v1
3. Business logic stays thin; complex payroll calculations deferred
4. English-only UI in v1
5. Email delivery for password reset uses Supabase Auth defaults

---

## 12. Release Phases

See [implementation-plan.md](./implementation-plan.md) for detailed phasing.

| Phase | Focus |
|-------|-------|
| 0 | Documentation (this phase) |
| 1 | Project scaffold, auth, layout, RBAC foundation |
| 2 | Database migrations, RLS, seed data |
| 3 | Dashboards and employee module |
| 4 | KPI module (priority) |
| 5 | Leave and EOD |
| 6 | Payroll and reports |
| 7 | Settings, notifications, audit logs |
| 8 | Polish, mobile QA, empty states |

---

## 13. Open Questions

| # | Question | Default Decision |
|---|----------|------------------|
| 1 | Company timezone for EOD cutoff? | UTC with display in user locale |
| 2 | KPI scoring: numeric only or qualitative? | Numeric target + optional notes |
| 3 | Intern payroll visibility? | Summary only, no breakdown |
| 4 | Document max file size? | 10 MB per file |

---

## 14. Appendix: Module Priority

```
P0 (Must ship):  Auth, RBAC, Dashboards, Employees, KPI, Leave, EOD basics
P1 (Should ship): Payroll UI, Reports, Settings, Notifications, Audit
P2 (Nice to have): Advanced analytics, bulk import, email templates
```
