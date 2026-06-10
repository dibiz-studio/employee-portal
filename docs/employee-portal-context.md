# Employee Portal Context

## Source of truth
- **Target repo:** `Employee management portal`
- **Demo/reference repo:** `employee-tech-reel`
- The real portal is the Supabase-backed app in this checkout.
- Do not mix the mock/demo repo into future implementation work.

## Product direction
The portal should feel like a polished production HRMS for Dibiz Studio.
Primary focus is onboarding plus the existing employee lifecycle modules:
- Dashboard
- Employees
- KPI
- Leave
- EOD
- Payroll
- Reports
- Settings
- Notifications
- Audit logs

## Onboarding requirements confirmed by the user
- Snigdha (founder + HR) sends the onboarding link.
- The onboarding link should expire after **24 hours**.
- A new user can either set a password during onboarding or continue with Google OAuth.
- Collect full PAN, full Aadhaar, and Drive links for the PAN/Aadhaar documents for now.
- Cloudinary can be added later, but keep the current Drive-link flow for now.
- The onboarding flow should be multi-step.
- Interns have stipend + joining letter; intern completion letter is optional.
- Joining letter is uploaded by Snigdha and the employee returns the signed version through the same document flow for now.
- Founders/admin access: Snigdha and Vaibhav.
- Managers can oversee their assigned team members.

## Schema notes
- The target repo contains `docs/database-full-schema.sql` and `docs/database-schema.md`.
- The current schema includes `profiles`, `employee_profiles`, `documents`, `daily_updates`, `employee_kpis`, `leave_requests`, `payroll_records`, etc.
- The onboarding extension now needs to include `onboarding_invites`, `onboarding_intakes`, and extra profile/document columns before the UI can rely on it.
- Keep onboarding invite validation hash-based, 24h-expiring, and single-use.
- Do **not** invent extra onboarding tables beyond the confirmed invite/intake/doc profile fields unless the schema is updated again.

## UI / feature decisions already made
- Use the polished sidebar/header/logo treatment from the tech-reel UI in the real portal.
- `dibiz-logo.png` is now available in `public/` for branding use.
- KPI items should open to a detail page showing full KPI data for that assignment.
- Employee profiles should expose an EOD tab/history so managers can inspect what an employee worked on.
- The EOD review flow should let users click an employee name and land on a history/detail page for that employee.

## Open implementation questions
- Onboarding is now modeled with a custom invite-token table plus intake staging.
- Remaining work is implementation detail, not schema choice:
  - wire the invite lookup/consumption flow into auth and onboarding screens
  - map the exact intake steps into the multi-step UI
  - decide whether any extra document review statuses need to surface in the UI

## Notes for future AI
When continuing this repo:
1. Read this file first.
2. Check `docs/database-full-schema.sql` before adding new data assumptions.
3. Keep the real portal implementation aligned to the confirmed schema.
4. Avoid porting mock/demo assumptions back into this repository.
