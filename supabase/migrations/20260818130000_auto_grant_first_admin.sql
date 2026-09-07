-- Automatically grant admin role to the first user who signs up
-- This trigger ensures at least one admin exists in the system

CREATE OR REPLACE FUNCTION public.auto_grant_first_admin()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth
AS $$
BEGIN
  -- Check if this is the first user in the system
  IF (SELECT COUNT(*) FROM auth.users) = 1 THEN
    -- Grant admin role to the first user
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS auto_grant_first_admin_trigger ON auth.users;
CREATE TRIGGER auto_grant_first_admin_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.auto_grant_first_admin();

-- Also grant admin to the first existing user if no admins exist yet
DO $$
DECLARE
  first_user_id uuid;
BEGIN
  -- Check if there are any admins
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    -- Get the first user created
    SELECT id INTO first_user_id FROM auth.users ORDER BY created_at ASC LIMIT 1;
    
    -- Grant admin role if a user exists
    IF first_user_id IS NOT NULL THEN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (first_user_id, 'admin')
      ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
  END IF;
END $$;
