-- ==============================================================================
-- db/migrations/022_mess_menus.sql
-- Mess Menus table — stores the monthly markdown menu + optional image/PDF url

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
CREATE TABLE mess_menus (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  month            INTEGER     NOT NULL CHECK (month BETWEEN 1 AND 12),
  year             INTEGER     NOT NULL CHECK (year  BETWEEN 2000 AND 2100),
  markdown_content TEXT        NOT NULL,
  document_url     TEXT,                    -- nullable: image / PDF
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Only one menu per calendar month
CREATE UNIQUE INDEX unique_mess_menu_month_year ON mess_menus (month, year);

-- ── Performance index ──────────────────────────────────────────────────────────
CREATE INDEX idx_mess_menus_year_month ON mess_menus (year DESC, month DESC);

-- ── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE mess_menus ENABLE ROW LEVEL SECURITY;

-- 1. Anyone authenticated (including guest role) can read mess menus
CREATE POLICY "mess_menus_select"
  ON mess_menus
  FOR SELECT TO authenticated
  USING (true);

-- 2. Only admins can insert a new menu
--    Uses the SECURITY DEFINER helper — no direct cross-table reference in policy
CREATE POLICY "mess_menus_insert"
  ON mess_menus
  FOR INSERT TO authenticated
  WITH CHECK (is_admin_user());

-- 3. Only admins can update an existing menu
CREATE POLICY "mess_menus_update"
  ON mess_menus
  FOR UPDATE TO authenticated
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

-- 4. Only admins can delete a menu
CREATE POLICY "mess_menus_delete"
  ON mess_menus
  FOR DELETE TO authenticated
  USING (is_admin_user());

-- ── Trigger ───────────────────────────────────────────────────────────────────
-- Re-uses the `update_updated_at()` function defined in 001_initial_schema.sql
CREATE TRIGGER trg_mess_menus_updated_at
  BEFORE UPDATE ON mess_menus
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Migration record ──────────────────────────────────────────────────────────
INSERT INTO _migrations (filename) VALUES ('022_mess_menus.sql');
