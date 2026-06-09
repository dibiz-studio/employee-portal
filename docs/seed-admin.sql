-- =============================================================================
-- Seed Super Admin: tech@dibizsolution.com
-- Run in Supabase SQL Editor (requires service role / postgres access)
-- Password: Password123!
-- =============================================================================

-- Option A: Update existing user (if already signed up via Google/email)
UPDATE public.profiles SET
  role = 'SUPER_ADMIN',
  full_name = 'Dibiz Tech Admin',
  onboarding_status = 'COMPLETED',
  is_active = true,
  updated_at = now()
WHERE email = 'tech@dibizsolution.com';

UPDATE auth.users SET
  encrypted_password = crypt('Password123!', gen_salt('bf')),
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  updated_at = now()
WHERE email = 'tech@dibizsolution.com';

-- Option B: Create from scratch (fresh project)
/*
DO $$
DECLARE
  admin_id uuid := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    admin_id,
    'authenticated', 'authenticated',
    'tech@dibizsolution.com',
    crypt('Password123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Dibiz Tech Admin","role":"SUPER_ADMIN","onboarding_status":"COMPLETED"}',
    now(), now(), '', '', '', ''
  );

  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (
    admin_id, admin_id,
    jsonb_build_object('sub', admin_id::text, 'email', 'tech@dibizsolution.com'),
    'email', admin_id::text, now(), now(), now()
  );

  UPDATE public.profiles SET
    role = 'SUPER_ADMIN',
    full_name = 'Dibiz Tech Admin',
    onboarding_status = 'COMPLETED'
  WHERE id = admin_id;
END $$;
*/
