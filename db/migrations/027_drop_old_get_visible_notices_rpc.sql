-- ============================================================
-- 027_drop_old_get_visible_notices_rpc.sql
-- Drop old text-typed overload of get_visible_notices_json to avoid
-- ambiguous function resolution when an enum-typed overload exists.
-- ============================================================

-- Drop the overload that used plain TEXT for category/priority/status
DROP FUNCTION IF EXISTS public.get_visible_notices_json(
  text, text, text, text, text, text, boolean, integer, timestamptz, uuid, integer
);

-- Track this migration as applied
INSERT INTO _migrations (filename) VALUES ('027_drop_old_get_visible_notices_rpc.sql') ON CONFLICT DO NOTHING;
