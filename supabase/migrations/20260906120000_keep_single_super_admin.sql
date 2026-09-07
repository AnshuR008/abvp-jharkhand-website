-- Keep exactly one full-control owner. Media Admins remain unlimited.
DO $$
DECLARE keeper_id uuid;
BEGIN
  SELECT id INTO keeper_id
  FROM auth.users
  WHERE lower(email) = 'anshuu.r008@gmail.com';

  IF keeper_id IS NULL THEN
    RAISE EXCEPTION 'Configured Super Admin account was not found';
  END IF;

  DELETE FROM public.user_roles
  WHERE role::text = 'super_admin' AND user_id <> keeper_id;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (keeper_id, 'super_admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS one_super_admin_only
ON public.user_roles (role)
WHERE role = 'super_admin'::public.app_role;