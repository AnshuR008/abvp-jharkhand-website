-- Define these functions after the enum value migration has committed.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'super_admin')
$$;

DROP FUNCTION IF EXISTS public.claim_first_super_admin();

CREATE OR REPLACE FUNCTION public.claim_first_super_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('abvp-first-super-admin'));
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role IN ('admin', 'super_admin')) THEN
    RAISE EXCEPTION 'Super Admin has already been claimed';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (auth.uid(), 'super_admin');
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_first_super_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_first_super_admin() TO authenticated;