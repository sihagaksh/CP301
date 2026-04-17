-- ============================================================
-- 025_mess_menu_media_uploads.sql
-- Normalizes storage setup for mess menu documents.
-- Uploads are performed server-side after admin authorization, but policies
-- keep the bucket readable and admin-restricted if direct storage writes are
-- attempted later.
-- ============================================================

INSERT INTO _migrations (filename) VALUES ('025_mess_menu_media_uploads.sql')
ON CONFLICT (filename) DO NOTHING;

CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM users
    WHERE id = auth.uid()
      AND is_admin = true
  );
END;
$$;

INSERT INTO storage.buckets (id, name, public)
VALUES ('mess-menus', 'mess-menus', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Access mess-menus" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload mess-menus" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update mess-menus" ON storage.objects;
DROP POLICY IF EXISTS "Auth Upload mess-menus" ON storage.objects;
DROP POLICY IF EXISTS "Auth Update mess-menus" ON storage.objects;
DROP POLICY IF EXISTS "mess_menus_select" ON storage.objects;
DROP POLICY IF EXISTS "mess_menus_insert" ON storage.objects;
DROP POLICY IF EXISTS "mess_menus_update" ON storage.objects;
DROP POLICY IF EXISTS "mess_menus_public_read" ON storage.objects;
DROP POLICY IF EXISTS "mess_menus_admin_insert" ON storage.objects;
DROP POLICY IF EXISTS "mess_menus_admin_update" ON storage.objects;

CREATE POLICY "mess_menus_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'mess-menus');

CREATE POLICY "mess_menus_admin_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'mess-menus'
    AND is_admin_user()
);

CREATE POLICY "mess_menus_admin_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'mess-menus'
    AND is_admin_user()
)
WITH CHECK (
    bucket_id = 'mess-menus'
    AND is_admin_user()
);
