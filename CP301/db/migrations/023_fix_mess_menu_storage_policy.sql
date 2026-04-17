-- Migration: 023_fix_mess_menu_storage_policy.sql
-- Replaces the broken "Auth Upload/Update mess-menus" policies (which used
-- auth.role() = 'authenticated' — unreliable with newer Supabase key formats)
-- with policies explicitly targeting the 'authenticated' role with no condition.

-- Drop all previous attempts
DROP POLICY IF EXISTS "Admin Upload mess-menus"  ON storage.objects;
DROP POLICY IF EXISTS "Admin Update mess-menus"  ON storage.objects;
DROP POLICY IF EXISTS "Auth Upload mess-menus"   ON storage.objects;
DROP POLICY IF EXISTS "Auth Update mess-menus"   ON storage.objects;
DROP POLICY IF EXISTS "mess_menus_select"        ON storage.objects;
DROP POLICY IF EXISTS "mess_menus_insert"        ON storage.objects;
DROP POLICY IF EXISTS "mess_menus_update"        ON storage.objects;

-- Any logged-in user can upload (TO authenticated = only users with a valid session)
CREATE POLICY "mess_menus_insert"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK ( bucket_id = 'mess-menus' );

-- Any logged-in user can overwrite (upsert)
CREATE POLICY "mess_menus_update"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING  ( bucket_id = 'mess-menus' )
  WITH CHECK ( bucket_id = 'mess-menus' );

-- Migration record
INSERT INTO _migrations (filename) VALUES ('023_fix_mess_menu_storage_policy3.sql')
  ON CONFLICT (filename) DO NOTHING;
