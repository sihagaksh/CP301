-- ============================================================
-- 036_get_events_rpc.sql
-- RPC to fetch events with advanced filtering including related tables.
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_visible_events_json(
  p_type event_type DEFAULT NULL,
  p_search TEXT DEFAULT NULL,
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_cursor_start_time TIMESTAMPTZ DEFAULT NULL,
  p_cursor_id UUID DEFAULT NULL
) RETURNS JSONB
AS $$
BEGIN
  RETURN (
    WITH filtered AS (
      SELECT e.*, 
             org.name as org_name,
             u.full_name as user_name
      FROM events e
      LEFT JOIN organizations org ON e.organizer_id = org.id
      LEFT JOIN users u ON e.posted_by = u.id
      WHERE e.is_published = true
        AND (p_type IS NULL OR e.type = p_type)
        AND (p_start_date IS NULL OR e.start_time >= p_start_date)
        AND (p_end_date IS NULL OR e.start_time <= p_end_date)
        AND (
          p_search IS NULL
          OR e.title ILIKE '%' || p_search || '%'
          OR e.venue_name ILIKE '%' || p_search || '%'
          OR e.description ILIKE '%' || p_search || '%'
          OR org.name ILIKE '%' || p_search || '%'
          -- Searching inside tags array
          OR EXISTS (
            SELECT 1 FROM unnest(e.tags) t WHERE t ILIKE '%' || p_search || '%'
          )
        )
    ),
    total_count AS (SELECT COUNT(*) AS cnt FROM filtered),
    ordered AS (
      SELECT f.*
      FROM filtered f
      WHERE (
        p_cursor_start_time IS NULL 
        OR (f.start_time > p_cursor_start_time OR (f.start_time = p_cursor_start_time AND f.id > p_cursor_id))
      )
      ORDER BY f.start_time ASC, f.id ASC
      LIMIT p_limit + 1
    ),
    paged AS (
      SELECT * FROM ordered LIMIT p_limit
    ),
    enriched AS (
      SELECT
        p.id, p.title, p.slug, p.type, p.start_time, p.end_time,
        p.venue_name, p.is_online, p.cover_image_url,
        p.registration_url, p.max_attendees, p.tags,
        p.is_published, p.created_at, p.organizer_id, p.posted_by,
        p.description,
        CASE WHEN org.id IS NULL THEN NULL ELSE jsonb_build_object(
          'id', org.id, 'name', org.name, 'slug', org.slug, 'type', org.type, 'logo_url', org.logo_url
        ) END AS organizer,
        CASE WHEN u.id IS NULL THEN NULL ELSE jsonb_build_object(
          'id', u.id, 'full_name', u.full_name, 'role', u.role, 'profile_picture_url', u.profile_picture_url
        ) END AS "postedBy"
      FROM paged p
      LEFT JOIN organizations org ON org.id = p.organizer_id
      LEFT JOIN users u ON u.id = p.posted_by
    )
    SELECT jsonb_build_object(
      'data', COALESCE(jsonb_agg(
        jsonb_build_object(
          'id', e.id,
          'title', e.title,
          'slug', e.slug,
          'type', e.type,
          'start_time', e.start_time,
          'end_time', e.end_time,
          'venue_name', e.venue_name,
          'is_online', e.is_online,
          'cover_image_url', e.cover_image_url,
          'registration_url', e.registration_url,
          'max_attendees', e.max_attendees,
          'tags', e.tags,
          'is_published', e.is_published,
          'created_at', e.created_at,
          'description', e.description,
          'organizer', e.organizer,
          'postedBy', e."postedBy"
        ) ORDER BY e.start_time ASC, e.id ASC
      ), '[]'::jsonb),
      'has_more', (SELECT (COUNT(*) > p_limit) FROM ordered)
    ) FROM enriched e LIMIT 1
  );
END;
$$ LANGUAGE plpgsql STABLE;

INSERT INTO _migrations (filename) VALUES ('036_get_events_rpc.sql') ON CONFLICT DO NOTHING;
