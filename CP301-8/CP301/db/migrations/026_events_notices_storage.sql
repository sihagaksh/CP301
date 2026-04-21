-- ============================================================
-- 026_events_notices_storage.sql
-- Storage buckets and policies for events and notices media.
-- ============================================================

INSERT INTO _migrations (filename) VALUES ('026_events_notices_storage.sql')
ON CONFLICT (filename) DO NOTHING;

-- Create Buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('events-media', 'events-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('notices-media', 'notices-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Public Access Policies
DROP POLICY IF EXISTS "Public Access events-media" ON storage.objects;
CREATE POLICY "Public Access events-media"
ON storage.objects FOR SELECT
USING (bucket_id = 'events-media');

DROP POLICY IF EXISTS "Public Access notices-media" ON storage.objects;
CREATE POLICY "Public Access notices-media"
ON storage.objects FOR SELECT
USING (bucket_id = 'notices-media');

-- RLS Upload policies (Restricting uploads to through API)
-- We enforce this via Server API Role Key but allow authenticated users with API endpoint checks
DROP POLICY IF EXISTS "Admin Upload events-media" ON storage.objects;
CREATE POLICY "Auth Upload events-media"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'events-media'
    AND auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Admin Update events-media" ON storage.objects;
CREATE POLICY "Auth Update events-media"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'events-media'
    AND auth.role() = 'authenticated'
)
WITH CHECK (
    bucket_id = 'events-media'
    AND auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Admin Upload notices-media" ON storage.objects;
CREATE POLICY "Auth Upload notices-media"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'notices-media'
    AND auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Admin Update notices-media" ON storage.objects;
CREATE POLICY "Auth Update notices-media"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'notices-media'
    AND auth.role() = 'authenticated'
)
WITH CHECK (
    bucket_id = 'notices-media'
    AND auth.role() = 'authenticated'
);
