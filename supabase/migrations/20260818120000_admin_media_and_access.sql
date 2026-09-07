-- Admin-uploaded website assets. Public reads are required because uploaded
-- images and documents are displayed on the public website.
INSERT INTO storage.buckets (id, name, public)
VALUES ('admin-assets', 'admin-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "public reads admin assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'admin-assets');

CREATE POLICY "admins manage admin assets"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'admin-assets' AND public.is_admin())
WITH CHECK (bucket_id = 'admin-assets' AND public.is_admin());

-- Lets an existing administrator see registered users and grant/revoke access
-- without exposing auth.users to normal browser clients.
CREATE OR REPLACE FUNCTION public.list_admin_users()
RETURNS TABLE (user_id uuid, email text, role public.app_role, created_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT ur.user_id, u.email, ur.role, ur.created_at
  FROM public.user_roles ur
  JOIN auth.users u ON u.id = ur.user_id
  WHERE public.is_admin()
  ORDER BY u.email, ur.created_at
$$;

CREATE OR REPLACE FUNCTION public.grant_admin_role(_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  target_id uuid;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  SELECT id INTO target_id FROM auth.users WHERE lower(email) = lower(trim(_email));
  IF target_id IS NULL THEN
    RAISE EXCEPTION 'No registered user found for this email';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.revoke_admin_role(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  IF _user_id = auth.uid() THEN
    RAISE EXCEPTION 'You cannot remove your own admin access';
  END IF;

  DELETE FROM public.user_roles WHERE user_id = _user_id AND role = 'admin';
END;
$$;

REVOKE ALL ON FUNCTION public.list_admin_users() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.grant_admin_role(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.revoke_admin_role(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_admin_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.grant_admin_role(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_admin_role(uuid) TO authenticated;
