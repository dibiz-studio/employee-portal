# Dibiz Studio HRMS — Task Checklist

## 1. Clean Mock Data
- [x] Purge Supabase tables (profiles, departments, KPIs, leave, etc.)
- [x] Single admin user: `admin@dibizstudio.com`

## 2. Branding
- [x] `src/shared/components/logo.tsx`
- [x] App layout meta tags (Dibiz Studio)
- [x] Favicon `/icon.svg`
- [x] `--dibiz-primary` token in `globals.css`

## 3. Google OAuth & Avatar Sync
- [x] `signInWithGoogle()` in auth service
- [x] Google button on login form
- [x] Avatar sync in `auth-provider.tsx`
- [x] `avatar_url` on Profile type

## 4. Onboarding
- [x] `onboarding_status` column (PENDING | COMPLETED)
- [x] `/onboarding` waiting page
- [x] Portal layout redirect for pending users
- [x] Role assignment sets `onboarding_status = COMPLETED`

## 5. Dark Mode
- [x] Dark theme default in `globals.css`
- [x] Theme toggle in AppHeader
- [x] Theme tokens (no hardcoded `bg-white`)

## 6. Mobile Polish
- [x] AppShell `h-screen overflow-hidden`
- [x] Hidden scrollbars (`scrollbar-hidden`)
- [x] Mobile drawer aria-label
- [x] Larger touch targets on mobile header icons

## 7. Edge Cases
- [x] Sign-up page with validation
- [x] Google first-login → PENDING profile
- [x] Session expiration toast + redirect
- [x] Access denied page (403)
- [x] `showErrorToast` helper

## 8. Testing
- [x] Jest unit tests (rbac, auth store)
- [x] Playwright config + smoke test skeleton
- [ ] Manual QA (run locally)

## 9. Documentation
- [x] `walkthrough.md`
- [x] `task.md` (this file)
- [x] `CREDENTIALS.md`
