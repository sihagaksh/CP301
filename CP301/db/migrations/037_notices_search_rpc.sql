-- ============================================================
-- 037_notices_search_rpc.sql
-- Drop the old RPC and recreate it with p_search parameter
-- ============================================================

DROP FUNCTION IF EXISTS public.get_visible_notices_json(TEXT,TEXT,TEXT,notice_category,notice_priority,notice_status,BOOLEAN,INTEGER,TIMESTAMPTZ,UUID,INTEGER,TIMESTAMPTZ,TIMESTAMPTZ);

CREATE OR REPLACE FUNCTION public.get_visible_notices_json(
  p_user_role TEXT,
  p_user_department TEXT,
  p_user_batch TEXT,
  p_category notice_category DEFAULT NULL,
  p_priority notice_priority DEFAULT NULL,
  p_status notice_status DEFAULT 'published'::notice_status,
  p_is_active BOOLEAN DEFAULT true,
  p_limit INTEGER DEFAULT 20,
  p_cursor_created_at TIMESTAMPTZ DEFAULT NULL,
  p_cursor_id UUID DEFAULT NULL,
  p_page INTEGER DEFAULT 1,
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL,
  p_search TEXT DEFAULT NULL
) RETURNS JSONB
AS $$
BEGIN
  RETURN (
    WITH filtered AS (
      SELECT n.*, org.name as org_name
      FROM notices n
      LEFT JOIN user_positions up ON up.id = n.posting_identity_id
      LEFT JOIN organizations org ON org.id = up.org_id
      WHERE (p_is_active IS NULL OR n.is_active = p_is_active)
        AND (p_status IS NULL OR n.status = p_status)
        AND (p_category IS NULL OR n.category = p_category)
        AND (p_priority IS NULL OR n.priority = p_priority)
        AND (n.valid_until IS NULL OR n.valid_until >= now())
        AND (p_start_date IS NULL OR n.created_at >= p_start_date)
        AND (p_end_date IS NULL OR n.created_at <= p_end_date)
        AND (
          p_search IS NULL
          OR n.title ILIKE '%' || p_search || '%'
          OR n.content ILIKE '%' || p_search || '%'
          OR org.name ILIKE '%' || p_search || '%'
          -- Check Tags
          OR EXISTS (
            SELECT 1 FROM unnest(n.tags) t WHERE t ILIKE '%' || p_search || '%'
          )
        )
    ),
    visible AS (
      SELECT f.*
      FROM filtered f
      WHERE (
        COALESCE(array_length(f.target_roles,1),0) = 0
        OR (p_user_role IS NOT NULL AND p_user_role = ANY (f.target_roles))
      )
      AND (
        COALESCE(array_length(f.target_departments,1),0) = 0
        OR (p_user_department IS NOT NULL AND p_user_department = ANY (f.target_departments))
      )
      AND (
        COALESCE(array_length(f.target_batches,1),0) = 0
        OR (p_user_batch IS NOT NULL AND p_user_batch = ANY (f.target_batches))
      )
    ),
    total_count AS (SELECT COUNT(*) AS cnt FROM visible),
    ordered AS (
      SELECT v.*
      FROM visible v
      WHERE (p_cursor_created_at IS NULL OR (v.created_at < p_cursor_created_at OR (v.created_at = p_cursor_created_at AND v.id < p_cursor_id)))
      ORDER BY v.is_pinned DESC, v.created_at DESC, v.id DESC
      OFFSET CASE WHEN p_cursor_created_at IS NULL THEN GREATEST((p_page - 1) * p_limit, 0) ELSE 0 END
      LIMIT p_limit + 1
    ),
    paged AS (
      SELECT * FROM ordered LIMIT p_limit
    ),
    enriched AS (
      SELECT
        p.*,
        jsonb_build_object('id', u.id, 'full_name', u.full_name, 'role', u.role, 'profile_picture_url', u.profile_picture_url) AS poster,
        CASE WHEN up.id IS NULL THEN NULL ELSE jsonb_build_object(
          'id', up.id,
          'user_id', up.user_id,
          'org_id', up.org_id,
          'title', up.title,
          'por_type', up.por_type,
          'is_active', up.is_active,
          'valid_from', up.valid_from,
          'valid_until', up.valid_until,
          'created_at', up.created_at,
          'org', jsonb_build_object('id', org.id, 'name', org.name, 'slug', org.slug, 'type', org.type, 'logo_url', org.logo_url)
        ) END AS postingIdentity
      FROM paged p
      LEFT JOIN users u ON u.id = p.posted_by
      LEFT JOIN user_positions up ON up.id = p.posting_identity_id
      LEFT JOIN organizations org ON org.id = up.org_id
    )
    SELECT jsonb_build_object(
      'data', COALESCE(jsonb_agg(
        jsonb_build_object(
          'id', e.id,
          'posted_by', e.posted_by,
          'posting_identity_id', e.posting_identity_id,
          'title', e.title,
          'content', e.content,
          'category', e.category,
          'priority', e.priority,
          'status', e.status,
          'tags', e.tags,
          'target_roles', e.target_roles,
          'target_departments', e.target_departments,
          'target_batches', e.target_batches,
          'attachments', e.attachments,
          'is_active', e.is_active,
          'is_pinned', e.is_pinned,
          'valid_from', e.valid_from,
          'valid_until', e.valid_until,
          'created_at', e.created_at,
          'updated_at', e.updated_at,
          'poster', e.poster,
          'postingIdentity', e.postingIdentity
        ) ORDER BY e.is_pinned DESC, e.created_at DESC, e.id DESC
      ), '[]'::jsonb),
      'total', (SELECT cnt FROM total_count),
      'has_more', (SELECT (COUNT(*) > p_limit) FROM ordered)
    ) FROM enriched e LIMIT 1
  );
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION public.get_visible_notices_json(TEXT,TEXT,TEXT,notice_category,notice_priority,notice_status,BOOLEAN,INTEGER,TIMESTAMPTZ,UUID,INTEGER,TIMESTAMPTZ,TIMESTAMPTZ,TEXT) IS 'Returns JSON with server-side filtered and paginated notices, supports date range and robust text search.';

INSERT INTO _migrations (filename) VALUES ('037_notices_search_rpc.sql') ON CONFLICT DO NOTHING;
