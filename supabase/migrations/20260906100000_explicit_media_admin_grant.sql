-- Explicit Super Admin action for granting the restricted Media Admin role.
CREATE OR REPLACE FUNCTION public.grant_media_admin_role(_email text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
DECLARE target_id uuid;
BEGIN
  IF NOT public.is_main_admin() THEN
    RAISE EXCEPTION 'Super Admin access required';
  END IF;

  SELECT id INTO target_id
  FROM auth.users
  WHERE lower(email) = lower(trim(_email));

  IF target_id IS NULL THEN
    RAISE EXCEPTION 'No registered user found for this email';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_id, 'media_admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  UPDATE public.admin_access_requests
  SET status = 'approved', reviewed_by = auth.uid(), reviewed_at = now(), updated_at = now()
  WHERE user_id = target_id AND status = 'pending';
END;
$$;

REVOKE ALL ON FUNCTION public.grant_media_admin_role(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.grant_media_admin_role(text) TO authenticated;