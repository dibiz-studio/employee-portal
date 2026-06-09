# Mobile Design

## HRMS / KPI Management Portal

**Version:** 1.0  
**Approach:** Mobile First

---

## 1. Design Mandate

Every page must ship with three layouts:

- **Mobile** — 360px–414px (primary design target)
- **Tablet** — 768px–1024px
- **Desktop** — 1024px+

**Hard requirements:**

- No horizontal scrolling at any breakpoint
- No desktop-only screens
- No broken tables (card fallback on mobile)
- Touch targets minimum 44×44px
- Bottom navigation for primary app flows

---

## 2. Breakpoints

```typescript
// shared/lib/breakpoints.ts
export const BREAKPOINTS = {
  xs: 360,   // Small phones
  sm: 390,   // iPhone 14/15
  md: 768,   // Tablet
  lg: 1024,  // Desktop
  xl: 1280,  // Wide desktop
} as const
```

| Tailwind | Min Width | Layout Mode |
|----------|-----------|-------------|
| default | 0 | Mobile |
| `sm:` | 640px | Large mobile |
| `md:` | 768px | Tablet — sidebar appears |
| `lg:` | 1024px | Full desktop sidebar |
| `xl:` | 1280px | Wide content area |

**Test viewports:** 360, 390, 414, 768, 1024, 1280

---

## 3. Navigation Architecture

### 3.1 Mobile (< md)

```
┌─────────────────────────────┐
│ ☰  Page Title    🔔  👤     │  ← Header (sticky)
├─────────────────────────────┤
│                             │
│      Page Content           │
│      (scrollable)           │
│                             │
│                    [FAB]    │  ← Contextual FAB
├─────────────────────────────┤
│ 🏠   🎯   📅   📄   👤     │  ← Bottom Nav (fixed)
└─────────────────────────────┘
```

| Element | Behavior |
|---------|----------|
| Hamburger (☰) | Opens full-height drawer with complete nav |
| Header | Sticky, 56px height, blur backdrop |
| Bottom Nav | Fixed, 64px + safe-area-inset-bottom |
| FAB | Primary action per page (Apply Leave, Submit EOD, Add Employee) |

### 3.2 Tablet (md – lg)

- Collapsible sidebar (icon-only default)
- Bottom nav hidden
- Header with breadcrumbs
- 2-column grids where desktop uses 4

### 3.3 Desktop (lg+)

- Full sidebar (256px), collapsible to 64px
- No bottom nav
- Multi-column dashboards

---

## 4. Bottom Navigation

| Tab | Route | Icon | Badge |
|-----|-------|------|-------|
| Dashboard | `/dashboard` | LayoutDashboard | — |
| Tasks | `/kpi` | Target | — |
| Leaves | `/leave` | CalendarDays | Pending count |
| Reports | `/reports` | FileText | — |
| Profile | `/settings/profile` | User | — |

**Implementation:** `shared/components/layout/mobile-bottom-nav.tsx`

- Active state: primary color icon + label
- Hidden on auth pages and `md:` breakpoint up
- `padding-bottom: env(safe-area-inset-bottom)`

---

## 5. Drawer Navigation

Triggered by hamburger on mobile. Contains full sidebar items:

```
┌─────────────────────────┐
│ [Avatar] John Doe       │
│ HR Manager              │
├─────────────────────────┤
│ Dashboard               │
│ Employees          →    │
│ KPI                     │
│ Leaves                  │
│ EOD                     │
│ Payroll                 │
│ Reports                 │
│ Settings                │
├─────────────────────────┤
│ Notifications      (3)  │
│ Audit Logs              │
├─────────────────────────┤
│ Log out                 │
└─────────────────────────┘
```

Uses shadcn `Sheet` component, slides from left, 85vw max-width 320px.

Role-filtered items same as desktop sidebar.

---

## 6. Page Patterns by Module

### 6.1 Dashboard (Mobile)

```
┌─────────────────────────┐
│ Good morning, Sarah     │
│ Tuesday, Jun 9          │
├─────────────────────────┤
│ ┌─────────┐ ┌─────────┐ │
│ │ KPI 85% │ │ Leave 5 │ │  2×2 stat grid
│ └─────────┘ └─────────┘ │
│ ┌─────────┐ ┌─────────┐ │
│ │ EOD ✓   │ │ Tasks 3 │ │
│ └─────────┘ └─────────┘ │
├─────────────────────────┤
│ KPI Progress      [→]   │
│ ████████░░  80%         │
├─────────────────────────┤
│ Recent Activity         │
│ • Leave approved        │
│ • KPI updated           │
└─────────────────────────┘
```

- Stats: 2-column grid
- Charts: full width, height 200px
- Activity: compact list, not table

### 6.2 Employee Directory (Mobile)

**No table on mobile.** Use card list:

```
┌─────────────────────────┐
│ 🔍 Search employees     │
│ [Dept ▼] [Status ▼]     │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ [AV] Jane Smith     │ │
│ │ Engineering · Active│ │
│ │ EMP-0042            │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ [AV] Bob Wilson     │ │
│ │ Sales · On Leave    │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

Tap card → employee detail. Swipe actions deferred to v2.

### 6.3 Employee Detail (Mobile)

- Horizontal scroll **tabs** (not page content): Overview | KPI | Leave | Docs
- Sticky tab bar below header
- Each tab is vertically scrollable
- Primary action in header menu (⋯)

### 6.4 KPI Module (Mobile)

| Page | Mobile Pattern |
|------|----------------|
| KPI Dashboard | Progress rings + compact stat row |
| KPI List | Cards with progress bar |
| Assign KPI | Full-screen sheet form |
| Analytics | Stacked charts, swipeable chart tabs |
| Leaderboard | Numbered list, not table |

### 6.5 Leave Module (Mobile)

| Page | Mobile Pattern |
|------|----------------|
| Leave Dashboard | Balance cards per policy |
| Apply Leave | Full-screen form, date pickers as bottom sheets |
| Calendar | Week view default, pinch-to-expand deferred |
| Approvals | Swipeable cards with Approve/Reject buttons |

**Apply Leave FAB:** Fixed above bottom nav on `/leave`

### 6.6 EOD Module (Mobile)

| Page | Mobile Pattern |
|------|----------------|
| Submit EOD | Step-style sections, dynamic task rows |
| Review | Employee cards with expand for detail |
| History | Timeline list grouped by date |

Task input: tap "+" to add row. Hours: numeric keyboard input.

### 6.7 Payroll (Mobile)

- Summary cards only on mobile dashboard
- Employee detail: accordion sections (Earnings, Deductions, Net)
- Interns: single net pay card, no accordion

### 6.8 Reports (Mobile)

- Report type as vertical card list
- Filters in bottom sheet
- PDF preview: full-screen modal with pinch zoom
- Export: bottom sheet with format options

### 6.9 Settings (Mobile)

- Hub: vertical list with chevron navigation
- Sub-pages: full-screen forms
- Toggle switches for notification prefs

### 6.10 Audit Logs (Mobile)

- Timeline view default (not table)
- Toggle to compact table on tablet+
- Filters in bottom sheet

---

## 7. Responsive Tables Strategy

```tsx
// Pattern: DataTable with mobile card fallback
<div className="hidden md:block">
  <DataTable columns={columns} data={data} />
</div>
<div className="md:hidden space-y-3">
  {data.map(item => <MobileCard key={item.id} item={item} />)}
</div>
```

| Module | Mobile Component |
|--------|------------------|
| Employees | `EmployeeMobileCard` |
| Leave requests | `LeaveRequestCard` |
| KPI list | `KpiMobileCard` |
| EOD review | `EodReviewCard` |
| Payroll | `PayrollMobileCard` |
| Audit logs | Timeline items |

---

## 8. Forms on Mobile

### 8.1 Layout

- Single column always
- Full-width inputs
- Labels above fields
- Submit button: sticky footer or FAB

### 8.2 Input Types

| Field | Mobile Optimization |
|-------|---------------------|
| Date | Bottom sheet calendar picker |
| Number (hours, days) | `inputMode="decimal"` |
| Email | `inputMode="email"`, autocapitalize off |
| Phone | `inputMode="tel"` |
| Select | Native-feel sheet with options |
| Long text | Textarea min 4 rows |

### 8.3 Multi-Step Forms

Create Employee uses steps on mobile:

1. Basic Info
2. Employment
3. Department & Manager
4. Review

Progress indicator at top. Swipe back disabled; explicit Back button.

---

## 9. Bottom Sheets & Drawers

| Component | Use Case |
|-----------|----------|
| `Sheet` (bottom) | Filters, date range, quick actions |
| `Sheet` (left) | Main navigation drawer |
| `Dialog` | Confirmations, small forms |
| Full-screen `Sheet` | Apply leave, submit EOD, create employee |

Sheet height: `h-[85vh]` for forms, `h-auto max-h-[50vh]` for filters.

---

## 10. FAB (Floating Action Button)

| Page | FAB Action | Roles |
|------|------------|-------|
| `/leave` | Apply Leave | All |
| `/eod` | Submit Today | All |
| `/employees` | Add Employee | HR, Admin |
| `/kpi` | Assign KPI | HR, Admin, Manager |
| `/leave/approvals` | Hidden (inline actions) | — |

```tsx
<Button
  size="icon"
  className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg md:hidden z-40"
>
  <Plus />
</Button>
```

Position: `bottom-20` clears bottom nav (64px + gap).

---

## 11. Touch & Interaction

| Guideline | Value |
|-----------|-------|
| Min touch target | 44×44px |
| Tap highlight | `active:scale-[0.98]` subtle |
| Scroll | `-webkit-overflow-scrolling: touch` |
| Pull to refresh | Deferred (optional Phase 2) |
| Long press | Not used in v1 |

Spacing between tappable items: minimum 8px.

---

## 12. Typography on Mobile

| Element | Mobile Adjustment |
|---------|-------------------|
| Page title | `text-xl` (20px) instead of display-sm |
| Stat numbers | `text-2xl` (24px) |
| Body | 14px minimum |
| Table → card text | 14px primary, 12px secondary |

Avoid text smaller than 12px.

---

## 13. Charts on Mobile

- Single column, full width
- Reduce height to 200px
- Hide legend; show on tap
- Simplify axis labels (abbreviate months)
- Donut charts: center label with total

Use `ResponsiveContainer` width="100%" always.

---

## 14. Notifications (Mobile)

- Bell in header opens full-screen sheet
- List items: icon + title + time ago
- Swipe to mark read (optional; tap also works)
- Unread: bold title + dot indicator

---

## 15. Auth Pages (Mobile)

```
┌─────────────────────────┐
│         [Logo]          │
│    HRMS Portal          │
├─────────────────────────┤
│  Email                  │
│  [________________]     │
│  Password               │
│  [________________]     │
│  Forgot password?       │
│  [    Sign In    ]      │
└─────────────────────────┘
```

- No split panel
- Logo centered above form
- Keyboard pushes form up (avoid fixed footers)

---

## 16. Performance on Mobile

1. Lazy load charts and PDF preview
2. Paginate lists (20 items per page)
3. Optimize avatar images (48px display → 96px src)
4. Avoid layout shift: reserve space for stat cards
5. Server Components for initial mobile payload

---

## 17. QA Checklist

Per page, verify at **360px**, **390px**, **414px**:

- [ ] No horizontal scroll
- [ ] All text readable without zoom
- [ ] Primary action reachable with thumb
- [ ] Bottom nav doesn't overlap content
- [ ] FAB doesn't overlap bottom nav
- [ ] Forms submittable with on-screen keyboard open
- [ ] Tables replaced with cards
- [ ] Empty/loading/error states render correctly
- [ ] Safe area insets respected (iPhone notch/home bar)

---

## 18. Component Checklist

Build these mobile-specific components:

```
shared/components/layout/
├── mobile-bottom-nav.tsx
├── mobile-header.tsx
├── mobile-nav-drawer.tsx
└── mobile-fab.tsx

shared/components/data/
├── employee-mobile-card.tsx
├── leave-request-card.tsx
├── kpi-mobile-card.tsx
├── eod-review-card.tsx
└── mobile-filter-sheet.tsx
```

---

## 19. Related Documents

- [design-system.md](./design-system.md) — tokens and components
- [routes.md](./routes.md) — page inventory
- [frontend-architecture.md](./frontend-architecture.md) — file structure
