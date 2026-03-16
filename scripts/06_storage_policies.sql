-- =====================================================
-- Supabase Storage Policies for feed-media bucket
-- =====================================================
-- BEFORE running this:
--   1. Go to Supabase Dashboard → Storage
--   2. Create a bucket named "feed-media", set to PUBLIC
-- Then run ONLY the policies below in SQL Editor.
-- =====================================================

-- Allow authenticated users to upload to feed-media
DROP POLICY IF EXISTS "Authenticated users can upload feed media" ON storage.objects;
CREATE POLICY "Authenticated users can upload feed media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'feed-media');

-- Allow anyone to read feed media (bucket is public)
DROP POLICY IF EXISTS "Public can view feed media" ON storage.objects;
CREATE POLICY "Public can view feed media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'feed-media');

-- Allow users to delete their own uploads
DROP POLICY IF EXISTS "Users can delete own feed media" ON storage.objects;
CREATE POLICY "Users can delete own feed media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'feed-media' AND (storage.foldername(name))[1] = auth.uid()::text);
