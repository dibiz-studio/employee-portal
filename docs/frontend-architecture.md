# Frontend Architecture

## HRMS / KPI Management Portal

**Version:** 1.0  
**Stack:** Next.js 15 App Router · TypeScript · TailwindCSS · shadcn/ui · Supabase · Zustand

---

## 1. Architecture Principles

1. **Feature-first folders** — colocate pages, components, hooks, and services by domain
2. **Server-first data fetching** — use Server Components and Supabase server client where possible
3. **Thin client, rich UI** — business logic deferred; focus on forms, states, and navigation
4. **Role-aware by default** — every layout and nav item checks permissions
5. **No duplicate primitives** — shared UI lives in `shared/components`
6. **Type-safe boundaries** — Zod schemas at form and API boundaries; generated DB types from Supabase

---

## 2. Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group (no sidebar)
│   │   ├── login/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── (app)/                    # Authenticated app shell
│   │   ├── layout.tsx            # Sidebar + header + mobile nav
│   │   ├── dashboard/
│   │   ├── employees/
│   │   ├── kpi/
│   │   ├── leave/
│   │   ├── eod/
│   │   ├── payroll/
│   │   ├── reports/
│   │   ├── settings/
│   │   ├── notifications/
│   │   └── audit/
│   ├── api/                      # Route handlers (minimal, prefer Supabase direct)
│   ├── layout.tsx                # Root: fonts, providers
│   └── globals.css
│
├── features/
│   ├── auth/
│   │   ├── components/           # LoginForm, AuthGuard, etc.
│   │   ├── hooks/                # useAuth, useSession
│   │   ├── services/             # auth.service.ts
│   │   └── types/
│   ├── dashboard/
│   ├── employees/
│   ├── kpi/
│   ├── leave/
│   ├── eod/
│   ├── payroll/
│   ├── reports/
│   ├── settings/
│   ├── notifications/
│   └── audit/
│
├── shared/
│   ├── components/
│   │   ├── ui/                   # shadcn primitives
│   │   ├── layout/               # Sidebar, Header, MobileNav, PageHeader
│   │   ├── data/                 # DataTable, StatCard, EmptyState, Skeletons
│   │   ├── charts/               # Chart wrappers (Recharts)
│   │   ├── forms/                # FormField wrappers, DatePicker
│   │   └── guards/               # RoleGuard, PermissionWrapper
│   ├── hooks/                    # useMediaQuery, useDebounce, useToast
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts         # Browser client
│   │   │   ├── server.ts         # Server client (cookies)
│   │   │   └── middleware.ts     # Middleware client
│   │   ├── utils.ts              # cn(), formatters
│   │   └── constants.ts
│   ├── services/                 # Cross-feature services
│   ├── stores/                   # Zustand stores
│   └── types/
│       ├── database.types.ts     # Supabase generated types
│       ├── roles.ts
│       └── index.ts
│
├── middleware.ts                 # Auth + route protection
└── env.ts                        # Validated env (Zod)
```

---

## 3. App Router Conventions

### 3.1 Route Groups

| Group | Purpose |
|-------|---------|
| `(auth)` | Unauthenticated pages; centered layout, no sidebar |
| `(app)` | Authenticated shell with sidebar (desktop) and bottom nav (mobile) |

### 3.2 Layout Hierarchy

```
RootLayout
├── fonts (Geist, Inter)
├── ThemeProvider (light default, dark optional later)
├── AuthProvider (client session sync)
└── Toaster

AppLayout (authenticated)
├── SidebarProvider (collapsible state)
├── AppSidebar (role-filtered nav)
├── AppHeader (search, notifications, profile)
├── main { children }
└── MobileBottomNav (md:hidden)
```

### 3.3 Page Pattern

Every feature page follows:

```tsx
// app/(app)/employees/page.tsx
export default async function EmployeesPage() {
  // 1. Server: get session + role
  // 2. Server: fetch initial data (or pass to client)
  // 3. Render PageHeader + feature component
}

// features/employees/components/employees-page-client.tsx
'use client'
// Interactive table, filters, dialogs
```

---

## 4. Supabase Integration

### 4.1 Client Types

| Client | Usage |
|--------|-------|
| `createBrowserClient` | Client Components, mutations, realtime |
| `createServerClient` | Server Components, Route Handlers |
| `createMiddlewareClient` | `middleware.ts` session refresh |

### 4.2 Auth Flow

```
Login → supabase.auth.signInWithPassword
      → Session cookie set via @supabase/ssr
      → middleware.ts refreshes session on each request
      → AuthProvider syncs user + profile to Zustand
      → RoleGuard reads profile.role from store or server
```

### 4.3 Profile Loading

On auth state change:

1. Fetch `profiles` row where `id = auth.user.id`
2. Join `employee_profiles` if exists
3. Store in `useAuthStore` for client guards
4. Server Components fetch profile independently (no store dependency)

### 4.4 Data Access Pattern

```typescript
// features/employees/services/employee.service.ts
export async function getEmployees(supabase: SupabaseClient, filters?: EmployeeFilters) {
  const { data, error } = await supabase
    .from('employee_profiles')
    .select(`
      *,
      profile:profiles(*),
      department:departments(*)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}
```

Prefer direct Supabase queries over custom API routes unless:

- Service role required (admin-only server actions)
- Complex aggregation better done in SQL view
- File upload orchestration

---

## 5. State Management

### 5.1 Zustand Stores

| Store | Responsibility |
|-------|----------------|
| `useAuthStore` | User, profile, role, loading state |
| `useSidebarStore` | Collapsed state, mobile drawer open |
| `useNotificationStore` | Unread count, recent notifications (optimistic) |
| `useUIStore` | Global modals, command palette (future) |

**Rule:** Server data lives in React Query or Server Components; Zustand for UI and session-adjacent client state only.

### 5.2 Optional: TanStack Query

For client-heavy pages (KPI analytics, live filters), wrap Supabase calls in `useQuery` / `useMutation` within feature hooks. Not required in Phase 1 if Server Components suffice.

---

## 6. Forms & Validation

### 6.1 Stack

- **React Hook Form** — form state
- **Zod** — schema validation
- **@hookform/resolvers/zod** — bridge

### 6.2 Pattern

```typescript
// features/leave/schemas/leave-request.schema.ts
export const leaveRequestSchema = z.object({
  policy_id: z.string().uuid(),
  start_date: z.string().date(),
  end_date: z.string().date(),
  reason: z.string().min(10).max(500),
})

// features/leave/components/apply-leave-form.tsx
const form = useForm<LeaveRequestInput>({
  resolver: zodResolver(leaveRequestSchema),
})
```

Shared form components in `shared/components/forms/` wrap shadcn `Form` primitives.

---

## 7. RBAC Integration (Frontend)

See [rbac.md](./rbac.md) for full matrix.

### 7.1 Route Protection

`middleware.ts`:

- Refresh Supabase session
- Redirect `/app/*` → `/login` if no session
- Optional: redirect by role if route not permitted

### 7.2 Component Guards

```tsx
<RoleGuard allowed={['HR', 'SUPER_ADMIN']}>
  <CreateEmployeeButton />
</RoleGuard>

<PermissionWrapper permission="kpi:edit:team">
  <EditKpiDialog />
</PermissionWrapper>
```

### 7.3 Navigation Filtering

`AppSidebar` receives `navItems` filtered by `canAccess(role, item.roles)`.

---

## 8. Layout System

### 8.1 Desktop Sidebar

- Width: 256px expanded, 64px collapsed
- Sections: main nav, secondary (settings), footer (profile)
- Collapse persisted in `localStorage` via Zustand
- Role-dependent item visibility

### 8.2 Header

- Breadcrumbs (desktop)
- Global search (command-style, Phase 2)
- Notification bell with unread badge
- Profile dropdown

### 8.3 Mobile

See [mobile-design.md](./mobile-design.md).

- Bottom nav replaces sidebar
- Hamburger opens drawer with full nav
- Page headers stack vertically

---

## 9. Data Tables

Enterprise table pattern using shadcn `DataTable` + TanStack Table:

| Feature | Implementation |
|---------|----------------|
| Sorting | Column headers |
| Filtering | Toolbar with Select + Input |
| Pagination | Server or client side |
| Row actions | Dropdown menu |
| Mobile | Card list fallback below `md` breakpoint |
| Selection | Checkbox column (bulk actions, HR only) |
| Empty state | Illustration + CTA |

---

## 10. Charts (Recharts)

Wrapper components in `shared/components/charts/`:

- `AreaChartCard` — trends (KPI, leave, payroll)
- `BarChartCard` — comparisons (department, leaderboard)
- `DonutChartCard` — distribution (leave types, KPI status)
- `Sparkline` — inline metric trends

All charts: responsive container, skeleton while loading, empty state when no data.

---

## 11. PDF Reports (React PDF)

```
features/reports/
├── templates/
│   ├── employee-report.pdf.tsx
│   ├── department-report.pdf.tsx
│   └── payroll-report.pdf.tsx
├── components/
│   └── pdf-preview-dialog.tsx    # @react-pdf/renderer PDFViewer
└── hooks/
    └── use-pdf-download.ts
```

Preview in modal; download triggers blob generation client-side.

---

## 12. Error Handling

| Layer | Strategy |
|-------|----------|
| Server Components | `error.tsx` boundary per route segment |
| Client mutations | Toast on error + inline field errors |
| Auth errors | Redirect to login with return URL |
| 403 | Dedicated "Access Denied" page |
| Network | Retry button + offline message |

---

## 13. Loading & Skeleton Strategy

| View | Skeleton |
|------|----------|
| Dashboard | Stat cards + chart placeholders |
| Tables | 5–10 row skeletons |
| Detail pages | Header + tab content blocks |
| Forms | Disabled inputs with pulse |

Use `loading.tsx` in App Router for route-level suspense.

---

## 14. Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
# Server only (never NEXT_PUBLIC):
SUPABASE_SERVICE_ROLE_KEY=   # Seed scripts / admin actions only
```

Validated via `src/env.ts` with Zod at build time.

---

## 15. Key Dependencies

```json
{
  "next": "^15",
  "@supabase/supabase-js": "latest",
  "@supabase/ssr": "latest",
  "react-hook-form": "latest",
  "@hookform/resolvers": "latest",
  "zod": "latest",
  "zustand": "latest",
  "recharts": "latest",
  "@react-pdf/renderer": "latest",
  "lucide-react": "latest",
  "date-fns": "latest",
  "@tanstack/react-table": "latest"
}
```

---

## 16. Code Conventions

| Topic | Convention |
|-------|------------|
| Components | PascalCase files, named exports |
| Hooks | `use-*.ts` prefix |
| Services | `*.service.ts`, async functions |
| Types | Co-located or `types/` per feature |
| Imports | `@/` alias → `src/` |
| Server actions | `'use server'` in `features/*/actions/` sparingly |

---

## 17. Performance Guidelines

1. Server Components by default; `'use client'` only when needed
2. Dynamic import heavy modules (PDF, charts) with `next/dynamic`
3. Image optimization via `next/image` for avatars
4. Paginate large lists (employees, audit logs)
5. Debounce search inputs (300ms)

---

## 18. Testing Strategy (Future)

| Type | Tool | Scope |
|------|------|-------|
| Unit | Vitest | Utils, Zod schemas, RBAC helpers |
| Component | Testing Library | Forms, guards |
| E2E | Playwright | Auth flow, leave apply, KPI assign |

Not in Phase 0–1 scope; architecture supports adding later.

---

## 19. Diagram: Request Flow

```
Browser Request
    │
    ▼
middleware.ts ──► refresh session, auth check
    │
    ▼
Server Component ──► supabase/server.ts ──► PostgreSQL (RLS)
    │
    ▼
HTML + RSC payload
    │
    ▼
Client Hydration ──► AuthProvider, interactive islands
    │
    ▼
User Action ──► supabase/client.ts ──► PostgreSQL (RLS)
```

---

## 20. Related Documents

- [routes.md](./routes.md) — URL structure
- [rbac.md](./rbac.md) — permissions
- [design-system.md](./design-system.md) — UI tokens
- [database-schema.md](./database-schema.md) — data model
- [implementation-plan.md](./implementation-plan.md) — build order
