-- Inspiration profiles managed from the admin panel
CREATE TABLE public.inspirations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  quote text NOT NULL,
  photo text,
  sort_order int NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.inspirations TO authenticated;
GRANT ALL ON public.inspirations TO service_role;
GRANT SELECT ON public.inspirations TO anon;
ALTER TABLE public.inspirations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins manage inspirations" ON public.inspirations
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "public reads published inspirations" ON public.inspirations
  FOR SELECT TO anon, authenticated
  USING (published = true);

CREATE TRIGGER touch_inspirations
  BEFORE UPDATE ON public.inspirations
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.inspirations (name, quote, sort_order)
VALUES
  ('Swami Vivekananda', 'Arise, awake and do not stop until the goal is reached.', 1),
  ('Dr. A. P. J. Abdul Kalam', 'Dream, dream, dream. Dreams transform into thoughts and thoughts result in action.', 2),
  ('Dr. K. B. Hedgewar', 'Organised and disciplined youth can build a strong and self-reliant nation.', 3);

NOTIFY pgrst, 'reload schema';
