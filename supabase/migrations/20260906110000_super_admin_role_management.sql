-- Allow a Super Admin to grant either supported administrator role.
CREATE OR REPLACE FUNCTION public.grant_admin_access(_email text, _role text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
DECLARE target_id uuid;
BEGIN
  IF NOT public.is_main_admin() THEN
    RAISE EXCEPTION 'Super Admin access required';
  END IF;
  IF _role NOT IN ('media_admin', 'super_admin') THEN
    RAISE EXCEPTION 'Invalid admin role';
  END IF;

  SELECT id INTO target_id FROM auth.users WHERE lower(email) = lower(trim(_email));
  IF target_id IS NULL THEN
    RAISE EXCEPTION 'No registered user found for this email';
  END IF;

  EXECUTE 'INSERT INTO public.user_roles (user_id, role) VALUES ($1, $2::public.app_role) ON CONFLICT DO NOTHING'
    USING target_id, _role;

  UPDATE public.admin_access_requests
  SET status = 'approved', reviewed_by = auth.uid(), reviewed_at = now(), updated_at = now()
  WHERE user_id = target_id AND status = 'pending';
END;
$$;

REVOKE ALL ON FUNCTION public.grant_admin_access(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.grant_admin_access(text, text) TO authenticated;