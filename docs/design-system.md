# Design System

## HRMS / KPI Management Portal

**Version:** 1.0  
**Aesthetic:** Premium · Modern · Minimal · Enterprise

**References:** Linear, Stripe, Vercel, Notion, Ramp, Brex

**Avoid:** Bootstrap look, generic templates, student-project aesthetics

---

## 1. Design Principles

1. **Clarity over decoration** — every element serves scanning or action
2. **Whitespace is structure** — generous padding, clear section separation
3. **Subtle depth** — borders and soft shadows, not heavy gradients
4. **Motion with purpose** — 150–200ms transitions on interactive states only
5. **Data-first dashboards** — numbers and charts lead; chrome recedes
6. **Consistent density** — comfortable default, compact option for tables

---

## 2. Typography

### 2.1 Font Stack

| Role | Font | Usage |
|------|------|-------|
| Primary | **Geist Sans** | Headings, navigation, buttons, stat numbers |
| Secondary | **Inter** | Body text, table cells, form labels, descriptions |
| Mono | **Geist Mono** | Employee codes, IDs, audit timestamps |

```tsx
// app/layout.tsx
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
```

### 2.2 Type Scale

| Token | Size | Weight | Font | Use |
|-------|------|--------|------|-----|
| `display-lg` | 36px / 2.25rem | 600 | Geist | Marketing hero (auth pages) |
| `display-sm` | 30px / 1.875rem | 600 | Geist | Page titles |
| `heading-lg` | 24px / 1.5rem | 600 | Geist | Section headers |
| `heading-md` | 20px / 1.25rem | 600 | Geist | Card titles |
| `heading-sm` | 16px / 1rem | 600 | Geist | Subsection labels |
| `body-lg` | 16px / 1rem | 400 | Inter | Primary body |
| `body-md` | 14px / 0.875rem | 400 | Inter | Default UI text |
| `body-sm` | 13px / 0.8125rem | 400 | Inter | Secondary text, captions |
| `label` | 12px / 0.75rem | 500 | Inter | Form labels, badges |
| `stat` | 32px / 2rem | 600 | Geist | Dashboard metrics |

**Line heights:** Headings 1.2–1.3, body 1.5–1.6

### 2.3 Typography Rules

- Page titles: one `display-sm` per page, never stacked competing H1s
- Table headers: `label` uppercase tracking-wide optional for dense tables
- Truncate long names with tooltip on hover
- Tabular numbers for metrics: `font-variant-numeric: tabular-nums`

---

## 3. Color System

### 3.1 Core Palette (CSS Variables — shadcn compatible)

```css
:root {
  /* Background layers */
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 240 10% 3.9%;

  /* Brand — refined teal/slate (not generic bootstrap blue) */
  --primary: 173 58% 39%;           /* #2A9D8F inspired */
  --primary-foreground: 0 0% 100%;

  /* Neutrals */
  --secondary: 240 4.8% 95.9%;
  --secondary-foreground: 240 5.9% 10%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  --accent: 240 4.8% 95.9%;
  --accent-foreground: 240 5.9% 10%;

  /* Semantic */
  --destructive: 0 72% 51%;
  --destructive-foreground: 0 0% 100%;
  --success: 142 71% 45%;
  --warning: 38 92% 50%;
  --info: 217 91% 60%;

  /* Borders & inputs */
  --border: 240 5.9% 90%;
  --input: 240 5.9% 90%;
  --ring: 173 58% 39%;

  /* Radius */
  --radius: 0.5rem;

  /* Sidebar */
  --sidebar-background: 240 5.9% 98%;
  --sidebar-foreground: 240 5.3% 26.1%;
  --sidebar-border: 240 5.9% 90%;
  --sidebar-accent: 240 4.8% 95.9%;
}
```

### 3.2 Semantic Colors

| Token | Use |
|-------|-----|
| `success` | Approved leave, KPI on-track, completed |
| `warning` | At-risk KPI, pending approvals |
| `destructive` | Rejected, terminated, errors |
| `info` | Informational badges, links |
| `muted` | Disabled, placeholders, secondary labels |

### 3.3 Chart Colors

Sequential palette for Recharts (accessible):

```
#2A9D8F  primary
#264653  dark slate
#E9C46A  amber
#F4A261  orange
#E76F51  coral
#8B9DC3  muted blue
#6C757D  gray
```

---

## 4. Spacing & Layout

### 4.1 Spacing Scale (Tailwind)

Base unit: 4px. Common values: 2, 3, 4, 6, 8, 12, 16, 24

| Context | Padding |
|---------|---------|
| Page container | `px-4 md:px-6 lg:px-8 py-6` |
| Card | `p-4 md:p-6` |
| Card compact | `p-3 md:p-4` |
| Form section gap | `space-y-6` |
| Stat grid gap | `gap-4 md:gap-6` |

### 4.2 Grid Systems

| Layout | Grid |
|--------|------|
| Dashboard stats | `grid-cols-2 lg:grid-cols-4` |
| Dashboard charts | `grid-cols-1 lg:grid-cols-2` |
| Settings hub | `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` |
| Employee cards (mobile) | `grid-cols-1` |

### 4.3 Max Widths

| Container | Max Width |
|-----------|-----------|
| App content | `max-w-7xl` (1280px) |
| Auth form | `max-w-md` (448px) |
| Settings form | `max-w-2xl` (672px) |
| Report preview | `max-w-4xl` (896px) |

---

## 5. Elevation & Borders

| Level | Style |
|-------|-------|
| Flat | `border border-border` only |
| Card | `border border-border bg-card shadow-sm` |
| Dropdown/Popover | `shadow-md border border-border` |
| Modal | `shadow-lg` |
| Sidebar | `border-r border-sidebar-border` |

**No** heavy box shadows or glassmorphism in v1.

---

## 6. Component Library (shadcn/ui)

### 6.1 Required Primitives

```
Button, Input, Textarea, Select, Checkbox, Switch, RadioGroup
Label, Form, Card, Badge, Avatar, Separator, Skeleton
Dialog, Sheet, Drawer, Popover, DropdownMenu, Command
Table, Tabs, Accordion, Tooltip, Alert, Toast (Sonner)
Calendar, DatePicker (built on Calendar + Popover)
ScrollArea, Progress, Breadcrumb
Sidebar (shadcn sidebar block)
```

### 6.2 Custom Shared Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `PageHeader` | `shared/components/layout` | Title, description, actions |
| `StatCard` | `shared/components/data` | Metric with trend indicator |
| `DataTable` | `shared/components/data` | Sortable, filterable table |
| `EmptyState` | `shared/components/data` | Icon, title, description, CTA |
| `LoadingSkeleton` | `shared/components/data` | Page/section skeletons |
| `StatusBadge` | `shared/components/data` | KPI/leave/employment status |
| `RoleBadge` | `shared/components/data` | Colored role indicator |
| `FilterBar` | `shared/components/data` | Search + filter chips |
| `ConfirmDialog` | `shared/components/ui` | Destructive action confirmation |
| `RoleGuard` | `shared/components/guards` | RBAC wrapper |

---

## 7. Component Specifications

### 7.1 Buttons

| Variant | Use |
|---------|-----|
| `default` | Primary actions (Save, Submit, Create) |
| `secondary` | Secondary actions (Cancel, Back) |
| `outline` | Tertiary (Export, Filter) |
| `ghost` | Icon buttons, table row actions |
| `destructive` | Delete, Reject |

Sizes: `sm` (tables), `default` (forms), `lg` (auth CTAs)

### 7.2 Cards

```tsx
<Card>
  <CardHeader className="flex flex-row items-center justify-between pb-2">
    <CardTitle className="text-heading-md">Title</CardTitle>
    <CardAction>{/* optional button */}</CardAction>
  </CardHeader>
  <CardContent>...</CardContent>
</Card>
```

Stat cards: title (muted sm), value (stat size Geist), delta badge (+12% green/red)

### 7.3 Tables

- Header: `bg-muted/50`, `text-label`, sticky on scroll
- Row hover: `hover:bg-muted/50`
- Zebra optional for dense data (audit logs)
- Row height: 48px default, 40px compact
- Actions column: right-aligned icon button

### 7.4 Forms

- Label above input, `text-body-sm font-medium`
- Helper text below: `text-muted-foreground text-body-sm`
- Error: destructive color + icon
- Required indicator: asterisk on label
- Section dividers for long forms

### 7.5 Badges

| Status | Color |
|--------|-------|
| ACTIVE / APPROVED / ON_TRACK | success variant |
| PENDING / IN_PROGRESS | warning variant |
| REJECTED / AT_RISK / TERMINATED | destructive variant |
| DRAFT / NOT_STARTED | secondary/muted |

### 7.6 Charts

- Card wrapper with title and optional period selector
- Height: 280px default, 200px sparkline
- Grid lines: subtle `#E5E7EB`
- Tooltip: white card with border shadow
- Legend below chart on mobile

---

## 8. Icons

**Library:** Lucide React

| Context | Size |
|---------|------|
| Navigation | 20px |
| Inline with text | 16px |
| Stat card accent | 20px, muted color |
| Empty state | 48px, muted |
| FAB (mobile) | 24px |

Consistent stroke width (2px default).

---

## 9. Motion

| Interaction | Duration | Easing |
|-------------|----------|--------|
| Button hover | 150ms | ease |
| Sidebar collapse | 200ms | ease-in-out |
| Dialog open | 200ms | ease-out |
| Toast | slide-in 300ms | ease |
| Skeleton pulse | 2s | infinite |

Respect `prefers-reduced-motion`.

---

## 10. Auth Pages

Split layout (desktop):

```
┌─────────────────────┬─────────────────────┐
│  Brand panel        │  Form card          │
│  Gradient subtle    │  max-w-md centered  │
│  Logo + tagline     │  Login / Forgot     │
│  Testimonial opt.   │  Footer links       │
└─────────────────────┴─────────────────────┘
```

Mobile: brand header strip + full-width form.

---

## 11. Dashboard Patterns

### 11.1 Page Structure

```
PageHeader (title + date range + primary action)
StatCard grid (4 cols desktop, 2 cols mobile)
Chart row (2 cols desktop, 1 col mobile)
Recent activity table / list
Quick actions row
```

### 11.2 Role Visual Differentiation

Same layout shell; content differs. Optional subtle accent:

| Role | Accent (optional badge border) |
|------|-------------------------------|
| SUPER_ADMIN | Primary |
| HR | Info blue |
| MANAGER | Teal |
| EMPLOYEE | Neutral |
| INTERN | Muted |

---

## 12. Dark Mode

Deferred to Phase 2. Design tokens structured for future toggle via `class="dark"` on html.

---

## 13. Accessibility

- Minimum contrast 4.5:1 for body text
- Focus ring: `ring-2 ring-ring ring-offset-2`
- All icons in buttons have `aria-label` or visible text
- Form errors linked via `aria-describedby`
- Skip to main content link

---

## 14. Tailwind Config Extensions

```typescript
// tailwind.config.ts
theme: {
  extend: {
    fontFamily: {
      sans: ['var(--font-geist-sans)', 'var(--font-inter)', 'system-ui'],
      mono: ['var(--font-geist-mono)', 'monospace'],
    },
    fontSize: {
      'stat': ['2rem', { lineHeight: '1.2', fontWeight: '600' }],
    },
    borderRadius: {
      lg: 'var(--radius)',
      md: 'calc(var(--radius) - 2px)',
      sm: 'calc(var(--radius) - 4px)',
    },
  },
}
```

---

## 15. Do / Don't

| Do | Don't |
|----|-------|
| Use consistent 8px spacing rhythm | Mix random padding values |
| Show skeletons while loading | Flash empty then populate |
| Use StatusBadge for all statuses | Raw text status strings |
| Truncate with tooltips in tables | Horizontal scroll on desktop |
| One primary button per section | Multiple competing CTAs |
| Geist for numbers and headings | Inter for large stat numbers |

---

## 16. Related Documents

- [mobile-design.md](./mobile-design.md) — responsive patterns
- [frontend-architecture.md](./frontend-architecture.md) — component locations
- [product-requirements.md](./product-requirements.md) — UX requirements
