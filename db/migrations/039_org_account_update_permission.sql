-- ============================================================
-- 039_org_account_update_permission.sql
-- Extends admin_update_organization to allow org accounts to update
-- their own linked organization and any direct children.
--
-- Authorization logic:
--   1. Super-admin (is_admin = true) → always allowed (unchanged)
--   2. Org account (is_org_account = true) where linked_org_id = p_id
--      → allowed (updating own org)
--   3. Org account where the target org's parent_id = caller's linked_org_id
--      → allowed (updating a direct child org)
--   4. Everyone else → Unauthorized
-- ============================================================

CREATE OR REPLACE FUNCTION admin_update_organization(
    p_id UUID,
    p_name TEXT DEFAULT NULL,
    p_slug TEXT DEFAULT NULL,
    p_type org_type DEFAULT NULL,
    p_parent_id UUID DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_logo_url TEXT DEFAULT NULL,
    p_email TEXT DEFAULT NULL,
    p_social_links JSONB DEFAULT NULL,
    p_founded_year INT DEFAULT NULL,
    p_is_active BOOLEAN DEFAULT NULL
)
RETURNS organizations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_is_admin       BOOLEAN;
    v_is_org_account BOOLEAN;
    v_linked_org_id  UUID;
    v_target_parent  UUID;
    v_authorized     BOOLEAN := false;
    v_updated_org    organizations;
BEGIN
    -- Fetch caller's profile
    SELECT is_admin, is_org_account, linked_org_id
    INTO v_is_admin, v_is_org_account, v_linked_org_id
    FROM users
    WHERE id = auth.uid();

    -- Rule 1: super-admin → always OK
    IF COALESCE(v_is_admin, false) THEN
        v_authorized := true;
    END IF;

    -- Rule 2 & 3: org account updating own org or a direct child
    IF NOT v_authorized AND COALESCE(v_is_org_account, false) AND v_linked_org_id IS NOT NULL THEN
        -- Own org
        IF v_linked_org_id = p_id THEN
            v_authorized := true;
        END IF;

        -- Direct child: check the target org's parent_id
        IF NOT v_authorized THEN
            SELECT parent_id INTO v_target_parent FROM organizations WHERE id = p_id;
            IF v_target_parent = v_linked_org_id THEN
                v_authorized := true;
            END IF;
        END IF;
    END IF;

    IF NOT v_authorized THEN
        RAISE EXCEPTION 'Unauthorized: Only admins or the linked org account can update this organization';
    END IF;

    -- Perform the update
    UPDATE organizations
    SET
        name         = COALESCE(p_name, name),
        slug         = COALESCE(p_slug, slug),
        type         = COALESCE(p_type, type),
        parent_id    = COALESCE(p_parent_id, parent_id),
        description  = COALESCE(p_description, description),
        logo_url     = COALESCE(p_logo_url, logo_url),
        email        = COALESCE(p_email, email),
        social_links = COALESCE(p_social_links, social_links),
        founded_year = COALESCE(p_founded_year, founded_year),
        is_active    = COALESCE(p_is_active, is_active),
        updated_at   = now()
    WHERE id = p_id
    RETURNING * INTO v_updated_org;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Organization not found';
    END IF;

    RETURN v_updated_org;
END;
$$;

-- Track migration
INSERT INTO _migrations (filename)
VALUES ('039_org_account_update_permission.sql')
ON CONFLICT (filename) DO NOTHING;