-- Homepage statistics managed from the admin panel
CREATE TABLE public.site_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  value integer NOT NULL DEFAULT 0,
  suffix text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'users',
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_stats TO authenticated;
GRANT ALL ON public.site_stats TO service_role;
GRANT SELECT ON public.site_stats TO anon;
ALTER TABLE public.site_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins manage site stats" ON public.site_stats
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "public reads published site stats" ON public.site_stats
  FOR SELECT TO anon, authenticated
  USING (published = true);

CREATE TRIGGER touch_site_stats
  BEFORE UPDATE ON public.site_stats
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.site_stats (label, value, suffix, icon, sort_order)
VALUES
  ('Active Members', 96000, '+', 'users', 1),
  ('Districts', 25, '', 'districts', 2),
  ('Programmes / Year', 1240, '+', 'programmes', 3),
  ('Years of Seva', 76, '', 'seva', 4);

NOTIFY pgrst, 'reload schema';
