-- ============================================================
-- 024_org_icons_storage.sql
-- Storage bucket and policies for organization icons.
-- ============================================================

INSERT INTO _migrations (filename) VALUES ('024_org_icons_storage.sql')
ON CONFLICT (filename) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('org-icons', 'org-icons', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Access org-icons" ON storage.objects;
CREATE POLICY "Public Access org-icons"
ON storage.objects FOR SELECT
USING (bucket_id = 'org-icons');

DROP POLICY IF EXISTS "Admin Upload org-icons" ON storage.objects;
CREATE POLICY "Admin Upload org-icons"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'org-icons'
    AND is_admin_user()
);

DROP POLICY IF EXISTS "Admin Update org-icons" ON storage.objects;
CREATE POLICY "Admin Update org-icons"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'org-icons'
    AND is_admin_user()
)
WITH CHECK (
    bucket_id = 'org-icons'
    AND is_admin_user()
);
