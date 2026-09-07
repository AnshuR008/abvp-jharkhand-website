-- roles
CREATE TYPE public.app_role AS ENUM ('admin','editor','member');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- districts
CREATE TABLE public.districts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  cover_image text,
  president_name text,
  contact_email text,
  contact_phone text,
  address text,
  sort_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  category text NOT NULL DEFAULT 'Latest News',
  excerpt text,
  content text,
  featured_image text,
  tags text[] NOT NULL DEFAULT '{}',
  author text,
  district_id uuid REFERENCES public.districts(id) ON DELETE SET NULL,
  views int NOT NULL DEFAULT 0,
  featured boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT true,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  content text,
  banner_image text,
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz,
  venue text,
  city text,
  district_id uuid REFERENCES public.districts(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'upcoming',
  registration_open boolean NOT NULL DEFAULT true,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.leaders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  designation text NOT NULL,
  category text NOT NULL DEFAULT 'State Leadership',
  district_id uuid REFERENCES public.districts(id) ON DELETE SET NULL,
  bio text,
  photo text,
  email text,
  phone text,
  facebook_url text,
  twitter_url text,
  instagram_url text,
  sort_order int NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  district_id uuid REFERENCES public.districts(id) ON DELETE CASCADE,
  college_name text,
  incharge_name text,
  contact_phone text,
  member_count int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.gallery_albums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  cover_image text,
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  album_date date,
  district_id uuid REFERENCES public.districts(id) ON DELETE SET NULL,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  youtube_id text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'General',
  published_on date,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  file_url text NOT NULL,
  file_type text,
  category text NOT NULL DEFAULT 'Report',
  download_count int NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  link text,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  content text,
  banner_image text,
  start_date date,
  end_date date,
  status text NOT NULL DEFAULT 'active',
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  district_id uuid REFERENCES public.districts(id) ON DELETE SET NULL,
  activity_date date,
  image text,
  participants int NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_code text NOT NULL UNIQUE,
  holder_name text NOT NULL,
  certificate_type text NOT NULL DEFAULT 'Participation',
  issued_for text,
  district text,
  issue_date date NOT NULL DEFAULT current_date,
  valid boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name text NOT NULL DEFAULT 'ABVP Jharkhand',
  tagline text NOT NULL DEFAULT 'National Co-ordination of Students',
  logo_url text,
  favicon_url text,
  contact_email text,
  contact_phone text,
  address text,
  footer_text text,
  facebook_url text,
  twitter_url text,
  instagram_url text,
  youtube_url text,
  seo_title text,
  seo_description text,
  maintenance_mode boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.volunteer_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  mobile text NOT NULL,
  email text,
  date_of_birth date,
  district text,
  city text,
  address text,
  college text,
  course text,
  academic_year text,
  interests text[] NOT NULL DEFAULT '{}',
  photo_url text,
  message text,
  consent boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  assigned_district text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  mobile text,
  subject text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  internal_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  mobile text NOT NULL,
  email text,
  district text,
  college text,
  course text,
  academic_year text,
  consent boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'registered',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- grants, RLS, policies, triggers for public-content tables
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['districts','news','events','leaders','units','gallery_albums','videos','documents','announcements','campaigns','activities','certificates','site_settings','volunteer_applications','contact_messages','event_registrations']
  LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated;', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role;', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('CREATE POLICY "admins manage %1$s" ON public.%1$I FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());', t);
    EXECUTE format('CREATE TRIGGER touch_%1$s BEFORE UPDATE ON public.%1$I FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();', t);
  END LOOP;

  -- public read of published content
  FOREACH t IN ARRAY ARRAY['news','events','leaders','gallery_albums','videos','documents','campaigns','activities']
  LOOP
    EXECUTE format('GRANT SELECT ON public.%I TO anon;', t);
    EXECUTE format('CREATE POLICY "public reads published %1$s" ON public.%1$I FOR SELECT TO anon, authenticated USING (published = true);', t);
  END LOOP;

  FOREACH t IN ARRAY ARRAY['districts','units']
  LOOP
    EXECUTE format('GRANT SELECT ON public.%I TO anon;', t);
    EXECUTE format('CREATE POLICY "public reads active %1$s" ON public.%1$I FOR SELECT TO anon, authenticated USING (active = true);', t);
  END LOOP;

  -- public submissions
  FOREACH t IN ARRAY ARRAY['volunteer_applications','contact_messages','event_registrations']
  LOOP
    EXECUTE format('GRANT INSERT ON public.%I TO anon;', t);
    EXECUTE format('CREATE POLICY "anyone can submit %1$s" ON public.%1$I FOR INSERT TO anon, authenticated WITH CHECK (true);', t);
  END LOOP;
END $$;

GRANT SELECT ON public.announcements TO anon;
CREATE POLICY "public reads active announcements" ON public.announcements FOR SELECT TO anon, authenticated
  USING (active = true AND starts_at <= now() AND (ends_at IS NULL OR ends_at > now()));

GRANT SELECT ON public.certificates TO anon;
CREATE POLICY "public verifies certificates" ON public.certificates FOR SELECT TO anon, authenticated USING (true);

GRANT SELECT ON public.site_settings TO anon;
CREATE POLICY "public reads site settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.site_settings (contact_email, contact_phone, address, footer_text, seo_title, seo_description)
VALUES ('contact@abvpjharkhand.org', '+91 90000 00000', 'ABVP Jharkhand State Office, Ranchi, Jharkhand 834001',
        'Akhil Bharatiya Vidyarthi Parishad, Jharkhand Pradesh. Student Power, Nation First.',
        'ABVP Jharkhand — National Co-ordination of Students',
        'Official platform of Akhil Bharatiya Vidyarthi Parishad, Jharkhand state unit.');

INSERT INTO public.announcements (message, link) VALUES
('Sadasyata Abhiyan 2026 is live — join ABVP Jharkhand today!', '/join');

INSERT INTO public.districts (name, slug, president_name, contact_phone, description, sort_order)
SELECT d.name,
       lower(regexp_replace(d.name, '[^a-zA-Z]+', '-', 'g')),
       NULL, NULL,
       'ABVP ' || d.name || ' district unit works across colleges and campuses of ' || d.name || ' for students'' rights, education reform and nation building.',
       d.ord
FROM (VALUES
 ('Ranchi',1),('Dhanbad',2),('Bokaro',3),('East Singhbhum',4),('West Singhbhum',5),('Hazaribagh',6),
 ('Giridih',7),('Deoghar',8),('Dumka',9),('Palamu',10),('Garhwa',11),('Chatra',12),('Koderma',13),
 ('Ramgarh',14),('Lohardaga',15),('Gumla',16),('Simdega',17),('Khunti',18),('Seraikela-Kharsawan',19),
 ('Saraikela',20),('Godda',21),('Sahibganj',22),('Pakur',23),('Jamtara',24),('Latehar',25)
) AS d(name, ord);