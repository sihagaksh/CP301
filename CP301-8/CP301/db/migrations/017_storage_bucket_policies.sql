-- Migration: 017_storage_bucket_policies.sql
-- Description: Adds storage RLS policies for blogs, lost-found, and marketplace media buckets.

-- Blogs Media Bucket
-- 1. Allow public read access
CREATE POLICY "Public Access blogs-media" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'blogs-media' );

-- 2. Allow authenticated users to upload
CREATE POLICY "Auth Upload blogs-media" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'blogs-media' 
    AND auth.role() = 'authenticated'
);

-- Lost & Found Media Bucket
-- 1. Allow public read access
CREATE POLICY "Public Access lost-found-media" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'lost-found-media' );

-- 2. Allow authenticated users to upload
CREATE POLICY "Auth Upload lost-found-media" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'lost-found-media' 
    AND auth.role() = 'authenticated'
);

-- Market Media Bucket
-- 1. Allow public read access
CREATE POLICY "Public Access market-media" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'market-media' );

-- 2. Allow authenticated users to upload
CREATE POLICY "Auth Upload market-media" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'market-media' 
    AND auth.role() = 'authenticated'
);
