-- Split admin access into full-control Super Admin and media-only Media Admin.
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'media_admin';

CREATE TABLE IF NOT EXISTS public.admin_access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  email text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.admin_access_requests TO authenticated;
GRANT ALL ON public.admin_access_requests TO service_role;
ALTER TABLE public.admin_access_requests ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_main_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role::text IN ('admin', 'super_admin')
  )
$$;

CREATE OR REPLACE FUNCTION public.is_media_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_main_admin() OR EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role::text = 'media_admin'
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_media_admin()
$$;

DROP POLICY IF EXISTS "own admin requests readable" ON public.admin_access_requests;
CREATE POLICY "own admin requests readable" ON public.admin_access_requests
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_main_admin());

DROP POLICY IF EXISTS "users create own admin requests" ON public.admin_access_requests;
CREATE POLICY "users create own admin requests" ON public.admin_access_requests
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "main admins manage admin requests" ON public.admin_access_requests;
CREATE POLICY "main admins manage admin requests" ON public.admin_access_requests
  FOR UPDATE TO authenticated
  USING (public.is_main_admin())
  WITH CHECK (public.is_main_admin());

CREATE OR REPLACE FUNCTION public.request_media_admin_access()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
DECLARE current_email text;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF;
  IF public.is_admin() THEN RAISE EXCEPTION 'This account already has admin access'; END IF;
  SELECT email INTO current_email FROM auth.users WHERE id = auth.uid();
  INSERT INTO public.admin_access_requests (user_id, email)
  VALUES (auth.uid(), COALESCE(current_email, ''))
  ON CONFLICT (user_id) DO UPDATE SET email = EXCLUDED.email, status = 'pending', updated_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.list_admin_access_requests()
RETURNS TABLE (id uuid, user_id uuid, email text, status text, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT r.id, r.user_id, r.email, r.status, r.created_at
  FROM public.admin_access_requests r
  WHERE public.is_main_admin()
  ORDER BY r.created_at DESC
$$;

CREATE OR REPLACE FUNCTION public.review_admin_access_request(_request_id uuid, _approved boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE requested_user uuid;
BEGIN
  IF NOT public.is_main_admin() THEN RAISE EXCEPTION 'Super Admin access required'; END IF;
  SELECT user_id INTO requested_user FROM public.admin_access_requests WHERE id = _request_id AND status = 'pending';
  IF requested_user IS NULL THEN RAISE EXCEPTION 'Pending request not found'; END IF;
  IF _approved THEN
    EXECUTE 'INSERT INTO public.user_roles (user_id, role) VALUES ($1, $2::public.app_role) ON CONFLICT DO NOTHING'
      USING requested_user, 'media_admin';
  END IF;
  UPDATE public.admin_access_requests
  SET status = CASE WHEN _approved THEN 'approved' ELSE 'rejected' END,
      reviewed_by = auth.uid(), reviewed_at = now(), updated_at = now()
  WHERE id = _request_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.list_admin_users()
RETURNS TABLE (user_id uuid, email text, role public.app_role, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, auth AS $$
  SELECT ur.user_id, u.email, ur.role, ur.created_at
  FROM public.user_roles ur JOIN auth.users u ON u.id = ur.user_id
  WHERE public.is_main_admin() AND ur.role::text IN ('admin', 'super_admin', 'media_admin')
  ORDER BY u.email, ur.created_at
$$;

CREATE OR REPLACE FUNCTION public.grant_admin_role(_email text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
DECLARE target_id uuid;
BEGIN
  IF NOT public.is_main_admin() THEN RAISE EXCEPTION 'Super Admin access required'; END IF;
  SELECT id INTO target_id FROM auth.users WHERE lower(email) = lower(trim(_email));
  IF target_id IS NULL THEN RAISE EXCEPTION 'No registered user found for this email'; END IF;
  EXECUTE 'INSERT INTO public.user_roles (user_id, role) VALUES ($1, $2::public.app_role) ON CONFLICT DO NOTHING'
    USING target_id, 'media_admin';
END;
$$;

CREATE OR REPLACE FUNCTION public.revoke_admin_role(_user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_main_admin() THEN RAISE EXCEPTION 'Super Admin access required'; END IF;
  IF _user_id = auth.uid() THEN RAISE EXCEPTION 'You cannot remove your own admin access'; END IF;
  DELETE FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin', 'media_admin');
END;
$$;

REVOKE ALL ON FUNCTION public.request_media_admin_access() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.list_admin_access_requests() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.review_admin_access_request(uuid, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_media_admin_access() TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_admin_access_requests() TO authenticated;
GRANT EXECUTE ON FUNCTION public.review_admin_access_request(uuid, boolean) TO authenticated;

-- Replace the broad legacy policies with role-specific policies.
DO $$
DECLARE table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['districts','news','events','leaders','units','gallery_albums','videos','documents','announcements','campaigns','activities','certificates','site_settings','volunteer_applications','contact_messages','event_registrations']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "admins manage %1$s" ON public.%1$I;', table_name);
  END LOOP;
  FOREACH table_name IN ARRAY ARRAY['news','events','gallery_albums','videos']
  LOOP
    EXECUTE format('CREATE POLICY "media admins manage %1$s" ON public.%1$I FOR ALL TO authenticated USING (public.is_media_admin()) WITH CHECK (public.is_media_admin());', table_name);
  END LOOP;
  FOREACH table_name IN ARRAY ARRAY['districts','leaders','units','documents','announcements','campaigns','activities','certificates','site_settings','volunteer_applications','contact_messages','event_registrations']
  LOOP
    EXECUTE format('CREATE POLICY "main admins manage %1$s" ON public.%1$I FOR ALL TO authenticated USING (public.is_main_admin()) WITH CHECK (public.is_main_admin());', table_name);
  END LOOP;
END $$;

DROP POLICY IF EXISTS "admins manage roles" ON public.user_roles;
CREATE POLICY "main admins manage roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.is_main_admin()) WITH CHECK (public.is_main_admin());

DROP POLICY IF EXISTS "admins manage admin assets" ON storage.objects;
CREATE POLICY "admins manage admin assets" ON storage.objects FOR ALL TO authenticated
  USING (
    bucket_id = 'admin-assets' AND
    (public.is_main_admin() OR (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role::text = 'media_admin') AND split_part(name, '/', 1) IN ('gallery', 'videos', 'events', 'news')))
  )
  WITH CHECK (
    bucket_id = 'admin-assets' AND
    (public.is_main_admin() OR (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role::text = 'media_admin') AND split_part(name, '/', 1) IN ('gallery', 'videos', 'events', 'news')))
  );

REVOKE EXECUTE ON FUNCTION public.is_main_admin() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_media_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_main_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_media_admin() TO authenticated;