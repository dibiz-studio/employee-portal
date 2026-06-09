-- Fix handle_new_user to sync role/onboarding on conflict
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role, onboarding_status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'EMPLOYEE'),
    COALESCE((NEW.raw_user_meta_data->>'onboarding_status')::onboarding_status, 'PENDING')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    email = EXCLUDED.email,
    role = COALESCE(EXCLUDED.role, profiles.role),
    onboarding_status = COALESCE(EXCLUDED.onboarding_status, profiles.onboarding_status),
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Notify SUPER_ADMIN and HR when a self-signup user is pending approval
CREATE OR REPLACE FUNCTION public.notify_admins_pending_onboarding()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.onboarding_status = 'PENDING' AND (TG_OP = 'INSERT' OR OLD.onboarding_status IS DISTINCT FROM 'PENDING') THEN
    INSERT INTO public.notifications (user_id, type, title, message, link)
    SELECT
      p.id,
      'SYSTEM',
      'New user awaiting approval',
      NEW.full_name || ' (' || NEW.email || ') signed up and needs a role assigned.',
      '/settings/roles'
    FROM public.profiles p
    WHERE p.role IN ('SUPER_ADMIN', 'HR')
      AND p.is_active = true
      AND p.id <> NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS profiles_notify_pending_onboarding ON public.profiles;
CREATE TRIGGER profiles_notify_pending_onboarding
  AFTER INSERT OR UPDATE OF onboarding_status ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admins_pending_onboarding();

-- Admin-created employees with profiles should not stay pending
UPDATE public.profiles p
SET onboarding_status = 'COMPLETED', updated_at = now()
WHERE p.onboarding_status = 'PENDING'
  AND EXISTS (
    SELECT 1 FROM public.employee_profiles ep WHERE ep.profile_id = p.id
  );
