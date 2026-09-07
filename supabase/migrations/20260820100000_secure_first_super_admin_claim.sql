-- First-admin access is claimed explicitly by an authenticated user.
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';

DROP TRIGGER IF EXISTS auto_grant_first_admin_trigger ON auth.users;
DROP FUNCTION IF EXISTS public.auto_grant_first_admin();