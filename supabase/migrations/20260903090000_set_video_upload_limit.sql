-- Allow videos up to 200 MB in the admin assets bucket.
UPDATE storage.buckets
SET file_size_limit = 209715200
WHERE id = 'admin-assets';