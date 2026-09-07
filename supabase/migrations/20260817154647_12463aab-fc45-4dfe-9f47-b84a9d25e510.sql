-- 1) Certificates: no more full-table public reads; verification via exact-code RPC
DROP POLICY IF EXISTS "public verifies certificates" ON public.certificates;
REVOKE SELECT ON public.certificates FROM anon;

CREATE OR REPLACE FUNCTION public.verify_certificate(_code text)
RETURNS TABLE (
  certificate_code text,
  holder_name text,
  certificate_type text,
  issued_for text,
  issue_date date,
  valid boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.certificate_code, c.holder_name, c.certificate_type, c.issued_for, c.issue_date, c.valid
  FROM public.certificates c
  WHERE _code IS NOT NULL
    AND length(btrim(_code)) BETWEEN 3 AND 60
    AND upper(c.certificate_code) = upper(btrim(_code))
  LIMIT 1
$$;

REVOKE ALL ON FUNCTION public.verify_certificate(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_certificate(text) TO anon, authenticated;

-- 2) Internal SECURITY DEFINER helper not meant to be called directly by clients
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;