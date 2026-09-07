-- Run after the role enum migration has committed. PostgreSQL does not allow
-- using a newly-added enum value in the same transaction that creates it.
UPDATE public.user_roles
SET role = 'super_admin'
WHERE role = 'admin';