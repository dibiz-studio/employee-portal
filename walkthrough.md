# Dibiz Studio HRMS — Walkthrough

## What Changed

### Database
- All mock seed data removed
- Single **Super Admin**: `admin@dibizstudio.com` / `Password123!`
- Added `onboarding_status` (`PENDING` | `COMPLETED`) on `profiles`

### Branding
- **Dibiz Studio** logo component across auth, sidebar, and header
- Dark theme as default with teal `--dibiz-primary` accent
- Custom favicon at `/icon.svg`

### Authentication
- **Sign in with Google** + `/auth/callback` handler
- Google avatar synced to `profiles.avatar_url`
- **Sign up** at `/signup` → pending onboarding
- **Onboarding** waiting page at `/onboarding`

### Architecture
- Routes split: `(portal)` group has AppShell; `/onboarding` is standalone
- `InitialStateProvider` prevents empty sidebar hydration

### Mobile
- Scroll-lock shell, hidden scrollbars, larger touch targets
- Role-aware mobile bottom nav

---

## How to Run

```bash
npm install
npm run dev
```

Open http://localhost:3000

---

## Test Credentials

| Email | Password | Role |
|-------|----------|------|
| `admin@dibizstudio.com` | `Password123!` | SUPER_ADMIN |

---

## Manual QA Checklist

| Test | Steps | Expected |
|------|-------|----------|
| Dark theme | Open any page | Dark background, teal accents |
| Admin login | Email/password above | Dashboard loads, full sidebar |
| Google SSO | Click Sign in with Google | Redirect to Google (requires Supabase Google provider) |
| Avatar | Login with Google | Profile photo in header |
| Sign up | `/signup` → create account → login | Onboarding waiting page |
| Role assign | Admin → Settings → Roles → assign role | User reaches dashboard |
| Mobile drawer | Resize to mobile, tap menu | Drawer opens with nav items |
| Session | Sign out | Redirect to login |
| RBAC | Sign up user tries `/settings/company` | Access denied or redirect |

---

## Test Results

| Suite | Command | Status |
|-------|---------|--------|
| Lint | `npm run lint` | Run locally |
| Build | `npm run build` | Run locally |
| Unit | `npm run test` | Jest — rbac + auth store |
| E2E | `npm run test:e2e` | Playwright skeleton |

---

## Screenshots

_Add screenshots after local QA:_
1. Dark theme dashboard
2. Onboarding waiting page
3. Google avatar in header
4. Mobile navigation drawer
