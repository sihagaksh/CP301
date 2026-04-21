-- ============================================================
-- 033_fix_org_upsert_socials.sql
-- Fixes social_links update logic to distinguish between 
-- "not provided" (NULL) and "provided empty" ({}).
-- ============================================================

INSERT INTO _migrations (filename) VALUES ('033_fix_org_upsert_socials.sql') ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION admin_upsert_organization(
    p_name         TEXT,
    p_slug         TEXT,
    p_type         org_type,
    p_parent_id    UUID    DEFAULT NULL,
    p_description  TEXT    DEFAULT NULL,
    p_logo_url     TEXT    DEFAULT NULL,
    p_email        TEXT    DEFAULT NULL,
    p_social_links JSONB   DEFAULT NULL,
    p_founded_year INT     DEFAULT NULL,
    p_is_active    BOOLEAN DEFAULT true,
    p_id           UUID    DEFAULT NULL
)
RETURNS organizations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_is_admin  BOOLEAN;
    v_result    organizations;
BEGIN
    -- 1. Check if caller is admin
    SELECT is_admin INTO v_is_admin FROM users WHERE id = auth.uid();
    IF NOT COALESCE(v_is_admin, false) THEN
        RAISE EXCEPTION 'Unauthorized: Only admins can upsert organizations';
    END IF;

    -- 2. Upsert using primary key 'id' anchoring
    IF p_id IS NULL THEN
        -- Insert new row. 
        -- We explicitly handle defaults here to ensure clean state.
        INSERT INTO organizations (
            name, slug, type, parent_id, description, logo_url, email, social_links, founded_year, is_active
        ) VALUES (
            p_name, 
            p_slug, 
            p_type, 
            p_parent_id, 
            p_description, 
            p_logo_url, 
            p_email, 
            COALESCE(p_social_links, '{}'::jsonb), -- New orgs default to empty socials if NULL
            p_founded_year, 
            COALESCE(p_is_active, true)
        )
        RETURNING * INTO v_result;
    ELSE
        -- Update existing mapped row.
        -- IMPORTANT: We pass p_social_links DIRECTLY to VALUES so EXCLUDED.social_links can be NULL.
        INSERT INTO organizations (
            id, name, slug, type, parent_id, description, logo_url, email, social_links, founded_year, is_active
        ) VALUES (
            p_id, 
            p_name, 
            p_slug, 
            p_type, 
            p_parent_id, 
            p_description, 
            p_logo_url, 
            p_email, 
            p_social_links,  -- ALLOW NULL HERE
            p_founded_year, 
            p_is_active
        )
        ON CONFLICT (id) DO UPDATE
            SET name         = EXCLUDED.name,
                slug         = EXCLUDED.slug,
                type         = EXCLUDED.type,
                parent_id    = EXCLUDED.parent_id,
                description  = EXCLUDED.description,
                logo_url     = EXCLUDED.logo_url,
                email        = EXCLUDED.email,
                -- ONLY update if the new value is NOT NULL. 
                -- To clear links, the caller must send an explicit empty object '{}'.
                social_links = COALESCE(EXCLUDED.social_links, organizations.social_links),
                founded_year = EXCLUDED.founded_year,
                is_active    = COALESCE(EXCLUDED.is_active, organizations.is_active),
                updated_at   = now()
        RETURNING * INTO v_result;
    END IF;

    RETURN v_result;
END;
$$;
