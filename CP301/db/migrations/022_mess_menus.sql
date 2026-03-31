-- ==============================================================================
-- db/migrations/022_mess_menus.sql
-- Mess Menus table — stores the monthly markdown menu + optional image/PDF url
--
-- ✅ IDEMPOTENT: safe to run multiple times — uses IF NOT EXISTS / OR REPLACE
--    throughout. Policies use DROP IF EXISTS before CREATE to avoid conflicts.
-- ==============================================================================

-- ── Helper: admin check (SECURITY DEFINER to avoid RLS recursion on users) ────
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
      AND is_admin = true
  );
END;
$$;

-- ── Table ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mess_menus (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  month            INTEGER     NOT NULL CHECK (month BETWEEN 1 AND 12),
  year             INTEGER     NOT NULL CHECK (year  BETWEEN 2000 AND 2100),
  markdown_content TEXT        NOT NULL,
  document_url     TEXT,                    -- nullable: image / PDF
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Only one menu per calendar month
CREATE UNIQUE INDEX IF NOT EXISTS unique_mess_menu_month_year ON mess_menus (month, year);

-- Performance index
CREATE INDEX IF NOT EXISTS idx_mess_menus_year_month ON mess_menus (year DESC, month DESC);

-- ── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE mess_menus ENABLE ROW LEVEL SECURITY;

-- 1. Anyone can read mess menus — including guests using the anon key
--    DROP first so this is safe to re-run on an already-deployed database.
DROP POLICY IF EXISTS "mess_menus_select" ON mess_menus;
CREATE POLICY "mess_menus_select"
  ON mess_menus
  FOR SELECT TO anon, authenticated
  USING (true);

-- 2. Only admins can insert a new menu
DROP POLICY IF EXISTS "mess_menus_insert" ON mess_menus;
CREATE POLICY "mess_menus_insert"
  ON mess_menus
  FOR INSERT TO authenticated
  WITH CHECK (is_admin_user());

-- 3. Only admins can update an existing menu
DROP POLICY IF EXISTS "mess_menus_update" ON mess_menus;
CREATE POLICY "mess_menus_update"
  ON mess_menus
  FOR UPDATE TO authenticated
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

-- 4. Only admins can delete a menu
DROP POLICY IF EXISTS "mess_menus_delete" ON mess_menus;
CREATE POLICY "mess_menus_delete"
  ON mess_menus
  FOR DELETE TO authenticated
  USING (is_admin_user());

-- ── Trigger ───────────────────────────────────────────────────────────────────
-- Re-uses update_updated_at() defined in 001_initial_schema.sql
DROP TRIGGER IF EXISTS trg_mess_menus_updated_at ON mess_menus;
CREATE TRIGGER trg_mess_menus_updated_at
  BEFORE UPDATE ON mess_menus
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Storage Bucket Policies (mess-menus) ─────────────────────────────────────
-- Mirrors the pattern in 017_storage_bucket_policies.sql, but upload is
-- restricted to admins only (consistent with the table-level RLS above).

-- 1. Anyone (including guests) can read / download the menu document
DROP POLICY IF EXISTS "Public Access mess-menus" ON storage.objects;
CREATE POLICY "Public Access mess-menus"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'mess-menus' );

-- 2. Only admins can upload new files to the bucket
DROP POLICY IF EXISTS "Admin Upload mess-menus" ON storage.objects;
CREATE POLICY "Admin Upload mess-menus"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'mess-menus'
    AND is_admin_user()
  );

-- 3. Only admins can replace / overwrite existing files (upsert path)
DROP POLICY IF EXISTS "Admin Update mess-menus" ON storage.objects;
CREATE POLICY "Admin Update mess-menus"
  ON storage.objects FOR UPDATE
  USING ( bucket_id = 'mess-menus' AND is_admin_user() )
  WITH CHECK ( bucket_id = 'mess-menus' AND is_admin_user() );

-- ── Migration record ──────────────────────────────────────────────────────────
INSERT INTO _migrations (filename) VALUES ('022_mess_menus_update2.sql')
  ON CONFLICT (filename) DO NOTHING;
