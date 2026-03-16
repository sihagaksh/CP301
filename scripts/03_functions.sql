-- =====================================================
-- STORED FUNCTIONS FOR IIT ROPAR COMMUNITY PLATFORM
-- =====================================================
-- Run after 01_schema.sql and 02_seed_data.sql
-- =====================================================

-- Drop all functions first
DROP FUNCTION IF EXISTS search_blogs(TEXT, blog_category) CASCADE;
DROP FUNCTION IF EXISTS search_marketplace(TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_user_stats(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_platform_stats() CASCADE;
DROP FUNCTION IF EXISTS create_notification(UUID, VARCHAR, TEXT, VARCHAR, VARCHAR, UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS mark_notifications_read(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_unread_notification_count(UUID) CASCADE;
DROP FUNCTION IF EXISTS is_community_member(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS get_user_communities(UUID) CASCADE;
DROP FUNCTION IF EXISTS is_event_full(UUID) CASCADE;
DROP FUNCTION IF EXISTS register_for_event(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS get_personalized_feed(UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS increment_view_count(TEXT, UUID) CASCADE;
DROP FUNCTION IF EXISTS get_user_positions(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_user_posting_identities(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_organization_hierarchy(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_org_members_with_positions(UUID) CASCADE;
DROP FUNCTION IF EXISTS is_org_member(UUID, UUID) CASCADE;

-- =====================================================
-- BLOG SEARCH (Full-text)
-- =====================================================

CREATE OR REPLACE FUNCTION search_blogs(
    search_query TEXT,
    category_filter blog_category DEFAULT NULL
)
RETURNS SETOF blog_posts AS $$
BEGIN
    RETURN QUERY
    SELECT bp.*
    FROM blog_posts bp
    WHERE bp.status = 'published'
      AND (category_filter IS NULL OR bp.category = category_filter)
      AND (
          search_query IS NULL
          OR search_query = ''
          OR bp.search_vector @@ plainto_tsquery('english', search_query)
          OR bp.title ILIKE '%' || search_query || '%'
          OR bp.company_name ILIKE '%' || search_query || '%'
      )
    ORDER BY
        CASE WHEN search_query IS NOT NULL AND search_query != ''
            THEN ts_rank(bp.search_vector, plainto_tsquery('english', search_query))
            ELSE 0
        END DESC,
        bp.published_at DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- MARKETPLACE SEARCH
-- =====================================================

CREATE OR REPLACE FUNCTION search_marketplace(
    search_query TEXT DEFAULT NULL,
    category_filter TEXT DEFAULT NULL
)
RETURNS SETOF marketplace_items AS $$
BEGIN
    RETURN QUERY
    SELECT mi.*
    FROM marketplace_items mi
    WHERE mi.status = 'available'
      AND (category_filter IS NULL OR mi.category = category_filter)
      AND (
          search_query IS NULL
          OR search_query = ''
          OR mi.search_vector @@ plainto_tsquery('english', search_query)
          OR mi.title ILIKE '%' || search_query || '%'
      )
    ORDER BY mi.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- USER STATS
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'blog_count', (SELECT COUNT(*) FROM blog_posts WHERE author_id = p_user_id AND status = 'published'),
        'marketplace_count', (SELECT COUNT(*) FROM marketplace_items WHERE seller_id = p_user_id),
        'event_count', (SELECT COUNT(*) FROM events WHERE organizer_id = p_user_id),
        'community_count', (SELECT COUNT(*) FROM community_members WHERE user_id = p_user_id),
        'org_count', (SELECT COUNT(*) FROM org_members WHERE user_id = p_user_id AND status = 'approved'),
        'position_count', (SELECT COUNT(*) FROM user_positions WHERE user_id = p_user_id AND is_active = TRUE),
        'feed_posts', (SELECT COUNT(*) FROM feed_posts WHERE author_id = p_user_id),
        'total_likes', (SELECT COALESCE(SUM(like_count), 0) FROM blog_posts WHERE author_id = p_user_id)
    ) INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PLATFORM STATS
-- =====================================================

CREATE OR REPLACE FUNCTION get_platform_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_users', (SELECT COUNT(*) FROM users WHERE status = 'active'),
        'total_students', (SELECT COUNT(*) FROM users WHERE role = 'student' AND status = 'active'),
        'total_faculty', (SELECT COUNT(*) FROM users WHERE role = 'faculty' AND status = 'active'),
        'total_blogs', (SELECT COUNT(*) FROM blog_posts WHERE status = 'published'),
        'total_events', (SELECT COUNT(*) FROM events WHERE is_published = TRUE),
        'total_marketplace', (SELECT COUNT(*) FROM marketplace_items WHERE status = 'available'),
        'total_organizations', (SELECT COUNT(*) FROM organizations WHERE is_active = TRUE),
        'total_communities', (SELECT COUNT(*) FROM communities),
        'total_notices', (SELECT COUNT(*) FROM notices WHERE is_active = TRUE)
    ) INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- NOTIFICATION HELPERS
-- =====================================================

CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_title VARCHAR,
    p_message TEXT,
    p_type VARCHAR,
    p_entity_type VARCHAR DEFAULT NULL,
    p_entity_id UUID DEFAULT NULL,
    p_action_url TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_id UUID;
BEGIN
    INSERT INTO notifications (user_id, title, message, type, entity_type, entity_id, action_url)
    VALUES (p_user_id, p_title, p_message, p_type, p_entity_type, p_entity_id, p_action_url)
    RETURNING id INTO new_id;
    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION mark_notifications_read(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE notifications SET is_read = TRUE, read_at = NOW()
    WHERE user_id = p_user_id AND is_read = FALSE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    count_val INTEGER;
BEGIN
    SELECT COUNT(*) INTO count_val
    FROM notifications
    WHERE user_id = p_user_id AND is_read = FALSE;
    RETURN count_val;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMUNITY HELPERS
-- =====================================================

CREATE OR REPLACE FUNCTION is_community_member(p_community_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM community_members
        WHERE community_id = p_community_id AND user_id = p_user_id
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_user_communities(p_user_id UUID)
RETURNS SETOF communities AS $$
BEGIN
    RETURN QUERY
    SELECT c.*
    FROM communities c
    INNER JOIN community_members cm ON c.id = cm.community_id
    WHERE cm.user_id = p_user_id
    ORDER BY c.name;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- EVENT HELPERS
-- =====================================================

CREATE OR REPLACE FUNCTION is_event_full(p_event_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    max_p INTEGER;
    current_p INTEGER;
BEGIN
    SELECT max_participants, current_participants INTO max_p, current_p
    FROM events WHERE id = p_event_id;
    IF max_p IS NULL THEN RETURN FALSE; END IF;
    RETURN current_p >= max_p;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION register_for_event(p_event_id UUID, p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    is_full BOOLEAN;
BEGIN
    is_full := is_event_full(p_event_id);
    IF is_full THEN
        RETURN json_build_object('success', FALSE, 'message', 'Event is full');
    END IF;

    INSERT INTO event_registrations (event_id, user_id)
    VALUES (p_event_id, p_user_id)
    ON CONFLICT (event_id, user_id) DO NOTHING;

    UPDATE events SET current_participants = current_participants + 1
    WHERE id = p_event_id;

    RETURN json_build_object('success', TRUE, 'message', 'Registration successful');
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VIEW COUNT INCREMENT
-- =====================================================

CREATE OR REPLACE FUNCTION increment_view_count(p_table TEXT, p_id UUID)
RETURNS VOID AS $$
BEGIN
    IF p_table = 'blog_posts' THEN
        UPDATE blog_posts SET view_count = view_count + 1 WHERE id = p_id;
    ELSIF p_table = 'events' THEN
        UPDATE events SET view_count = view_count + 1 WHERE id = p_id;
    ELSIF p_table = 'marketplace_items' THEN
        UPDATE marketplace_items SET view_count = view_count + 1 WHERE id = p_id;
    ELSIF p_table = 'notices' THEN
        UPDATE notices SET view_count = view_count + 1 WHERE id = p_id;
    ELSIF p_table = 'feed_posts' THEN
        UPDATE feed_posts SET view_count = view_count + 1 WHERE id = p_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PERSONALIZED FEED
-- =====================================================

CREATE OR REPLACE FUNCTION get_personalized_feed(p_user_id UUID, p_limit INTEGER DEFAULT 20)
RETURNS TABLE (
    id UUID,
    author_id UUID,
    author_name TEXT,
    author_role user_role,
    author_avatar TEXT,
    posting_identity_title TEXT,
    posting_identity_org TEXT,
    content TEXT,
    media_urls TEXT[],
    source_type VARCHAR,
    source_id UUID,
    like_count INTEGER,
    comment_count INTEGER,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        fp.id,
        fp.author_id,
        u.full_name::TEXT,
        u.role,
        u.profile_picture_url::TEXT,
        up.title::TEXT,
        o.name::TEXT,
        fp.content,
        fp.media_urls,
        fp.source_type,
        fp.source_id,
        fp.like_count,
        fp.comment_count,
        fp.created_at
    FROM feed_posts fp
    JOIN users u ON fp.author_id = u.id
    LEFT JOIN user_positions up ON fp.posting_identity_id = up.id
    LEFT JOIN organizations o ON up.org_id = o.id
    WHERE fp.is_public = TRUE
    ORDER BY fp.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- USER POSITIONS / POR HELPERS
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_positions(p_user_id UUID)
RETURNS TABLE (
    position_id UUID,
    title TEXT,
    por_type por_type,
    org_id UUID,
    org_name TEXT,
    org_slug TEXT,
    org_type org_type,
    valid_from DATE,
    valid_until DATE,
    is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        up.id,
        up.title::TEXT,
        up.por_type,
        o.id,
        o.name::TEXT,
        o.slug::TEXT,
        o.type,
        up.valid_from,
        up.valid_until,
        up.is_active
    FROM user_positions up
    JOIN organizations o ON up.org_id = o.id
    WHERE up.user_id = p_user_id
    ORDER BY up.is_active DESC, up.valid_from DESC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_user_posting_identities(p_user_id UUID)
RETURNS TABLE (
    identity_id UUID,
    label TEXT,
    org_name TEXT,
    org_slug TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        up.id,
        up.title::TEXT,
        o.name::TEXT,
        o.slug::TEXT
    FROM user_positions up
    JOIN organizations o ON up.org_id = o.id
    WHERE up.user_id = p_user_id
      AND up.is_active = TRUE
      AND (up.valid_until IS NULL OR up.valid_until >= CURRENT_DATE)
    ORDER BY o.name, up.title;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ORGANIZATION HELPERS
-- =====================================================

CREATE OR REPLACE FUNCTION get_organization_hierarchy(p_org_id UUID DEFAULT NULL)
RETURNS TABLE (
    id UUID,
    name TEXT,
    slug TEXT,
    type org_type,
    parent_id UUID,
    parent_name TEXT,
    description TEXT,
    logo_url TEXT,
    category TEXT,
    member_count INTEGER,
    is_active BOOLEAN,
    depth INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE org_tree AS (
        SELECT
            o.id, o.name::TEXT, o.slug::TEXT, o.type, o.parent_id,
            NULL::TEXT as parent_name, o.description::TEXT, o.logo_url::TEXT,
            o.category::TEXT, o.member_count, o.is_active, 0 as depth
        FROM organizations o
        WHERE (p_org_id IS NULL AND o.parent_id IS NULL)
           OR (p_org_id IS NOT NULL AND o.id = p_org_id)
        UNION ALL
        SELECT
            child.id, child.name::TEXT, child.slug::TEXT, child.type, child.parent_id,
            parent.name::TEXT, child.description::TEXT, child.logo_url::TEXT,
            child.category::TEXT, child.member_count, child.is_active, parent.depth + 1
        FROM organizations child
        JOIN org_tree parent ON child.parent_id = parent.id
    )
    SELECT * FROM org_tree ORDER BY depth, name;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_org_members_with_positions(p_org_id UUID)
RETURNS TABLE (
    user_id UUID,
    full_name TEXT,
    email TEXT,
    role user_role,
    profile_picture_url TEXT,
    member_status org_member_status,
    joined_at TIMESTAMPTZ,
    position_title TEXT,
    position_por_type por_type,
    position_is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.id,
        u.full_name::TEXT,
        u.email::TEXT,
        u.role,
        u.profile_picture_url::TEXT,
        om.status,
        om.joined_at,
        up.title::TEXT,
        up.por_type,
        up.is_active
    FROM org_members om
    JOIN users u ON om.user_id = u.id
    LEFT JOIN user_positions up ON up.user_id = u.id AND up.org_id = om.org_id AND up.is_active = TRUE
    WHERE om.org_id = p_org_id AND om.status = 'approved'
    ORDER BY
        CASE WHEN up.id IS NOT NULL THEN 0 ELSE 1 END,
        u.full_name;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION is_org_member(p_org_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM org_members
        WHERE org_id = p_org_id AND user_id = p_user_id AND status = 'approved'
    );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTIONS COMPLETE
-- =====================================================
