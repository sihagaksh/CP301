-- ============================================================
-- 040_org_account_roster_permissions.sql
-- Extend RLS and RPCs to allow Org Accounts to manage:
-- 1. org_members (insert/update)
-- 2. user_positions (assign/revoke/upsert)
-- 3. bulk mem/por upsert
-- ============================================================

-- 1. Update RLS for org_members to include Org Accounts
DROP POLICY IF EXISTS "org_members_insert_admin" ON org_members;
CREATE POLICY "org_members_insert_admin" ON org_members
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
        OR 
        EXISTS (SELECT 1 FROM user_positions WHERE user_id = auth.uid() AND org_id = org_members.org_id AND is_active = true)
        OR
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid() AND u.is_org_account = true 
              AND (u.linked_org_id = org_members.org_id OR u.linked_org_id = (SELECT parent_id FROM organizations WHERE id = org_members.org_id))
        )
    );

DROP POLICY IF EXISTS "org_members_update_admin" ON org_members;
CREATE POLICY "org_members_update_admin" ON org_members
    FOR UPDATE TO authenticated
    USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
        OR 
        EXISTS (SELECT 1 FROM user_positions WHERE user_id = auth.uid() AND org_id = org_members.org_id AND is_active = true)
        OR
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid() AND u.is_org_account = true 
              AND (u.linked_org_id = org_members.org_id OR u.linked_org_id = (SELECT parent_id FROM organizations WHERE id = org_members.org_id))
        )
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
        OR 
        EXISTS (SELECT 1 FROM user_positions WHERE user_id = auth.uid() AND org_id = org_members.org_id AND is_active = true)
        OR
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid() AND u.is_org_account = true 
              AND (u.linked_org_id = org_members.org_id OR u.linked_org_id = (SELECT parent_id FROM organizations WHERE id = org_members.org_id))
        )
    );

-- 2. function admin_assign_por
CREATE OR REPLACE FUNCTION admin_assign_por(
    p_user_id UUID,
    p_org_id UUID,
    p_title TEXT,
    p_por_type por_type,
    p_valid_from DATE DEFAULT CURRENT_DATE,
    p_valid_until DATE DEFAULT NULL,
    p_is_active BOOLEAN DEFAULT true
)
RETURNS user_positions
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
    v_new_por        user_positions;
BEGIN
    SELECT is_admin, is_org_account, linked_org_id
    INTO v_is_admin, v_is_org_account, v_linked_org_id
    FROM users WHERE id = auth.uid();

    IF COALESCE(v_is_admin, false) THEN
        v_authorized := true;
    ELSIF COALESCE(v_is_org_account, false) AND v_linked_org_id IS NOT NULL THEN
        IF v_linked_org_id = p_org_id THEN
            v_authorized := true;
        ELSE
            SELECT parent_id INTO v_target_parent FROM organizations WHERE id = p_org_id;
            IF v_target_parent = v_linked_org_id THEN
                v_authorized := true;
            END IF;
        END IF;
    END IF;

    IF NOT v_authorized THEN
        RAISE EXCEPTION 'Unauthorized: Only admins or linked org accounts can assign positions';
    END IF;

    INSERT INTO user_positions (
        user_id, org_id, title, por_type, valid_from, valid_until, is_active
    ) VALUES (
        p_user_id, p_org_id, p_title, p_por_type, COALESCE(p_valid_from, CURRENT_DATE), p_valid_until, COALESCE(p_is_active, true)
    )
    ON CONFLICT (user_id, org_id, title) DO UPDATE
        SET por_type    = EXCLUDED.por_type,
            valid_from  = EXCLUDED.valid_from,
            valid_until = EXCLUDED.valid_until,
            is_active   = EXCLUDED.is_active
    RETURNING * INTO v_new_por;

    RETURN v_new_por;
END;
$$;

-- 3. function admin_revoke_por
CREATE OR REPLACE FUNCTION admin_revoke_por(
    p_position_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_is_admin       BOOLEAN;
    v_is_org_account BOOLEAN;
    v_linked_org_id  UUID;
    v_org_id         UUID;
    v_target_parent  UUID;
    v_authorized     BOOLEAN := false;
BEGIN
    SELECT org_id INTO v_org_id FROM user_positions WHERE id = p_position_id;
    IF v_org_id IS NULL THEN
        RETURN false;
    END IF;

    SELECT is_admin, is_org_account, linked_org_id
    INTO v_is_admin, v_is_org_account, v_linked_org_id
    FROM users WHERE id = auth.uid();

    IF COALESCE(v_is_admin, false) THEN
        v_authorized := true;
    ELSIF COALESCE(v_is_org_account, false) AND v_linked_org_id IS NOT NULL THEN
        IF v_linked_org_id = v_org_id THEN
            v_authorized := true;
        ELSE
            SELECT parent_id INTO v_target_parent FROM organizations WHERE id = v_org_id;
            IF v_target_parent = v_linked_org_id THEN
                v_authorized := true;
            END IF;
        END IF;
    END IF;

    IF NOT v_authorized THEN
        RAISE EXCEPTION 'Unauthorized: Only admins or linked org accounts can revoke positions';
    END IF;

    UPDATE user_positions
    SET is_active = false, valid_until = CURRENT_DATE
    WHERE id = p_position_id;

    RETURN FOUND;
END;
$$;

-- 4. function admin_upsert_member
CREATE OR REPLACE FUNCTION admin_upsert_member(
    p_user_email TEXT,
    p_org_slug   TEXT,
    p_status     TEXT DEFAULT 'approved'
)
RETURNS org_members
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_is_admin       BOOLEAN;
    v_is_org_account BOOLEAN;
    v_linked_org_id  UUID;
    v_user_id        UUID;
    v_org_id         UUID;
    v_target_parent  UUID;
    v_authorized     BOOLEAN := false;
    v_result         org_members;
BEGIN
    SELECT id INTO v_org_id FROM organizations WHERE slug = p_org_slug LIMIT 1;
    IF v_org_id IS NULL THEN
        RAISE EXCEPTION 'Organization with slug ''%'' not found', p_org_slug;
    END IF;

    SELECT is_admin, is_org_account, linked_org_id
    INTO v_is_admin, v_is_org_account, v_linked_org_id
    FROM users WHERE id = auth.uid();

    IF COALESCE(v_is_admin, false) THEN
        v_authorized := true;
    ELSIF COALESCE(v_is_org_account, false) AND v_linked_org_id IS NOT NULL THEN
        IF v_linked_org_id = v_org_id THEN
            v_authorized := true;
        ELSE
            SELECT parent_id INTO v_target_parent FROM organizations WHERE id = v_org_id;
            IF v_target_parent = v_linked_org_id THEN
                v_authorized := true;
            END IF;
        END IF;
    END IF;

    IF NOT v_authorized THEN
        RAISE EXCEPTION 'Unauthorized: Only admins or linked org accounts can manage members';
    END IF;

    SELECT id INTO v_user_id FROM users WHERE lower(email) = lower(p_user_email) LIMIT 1;
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email ''%'' not found', p_user_email;
    END IF;

    INSERT INTO org_members (user_id, org_id, status)
    VALUES (v_user_id, v_org_id, COALESCE(p_status, 'approved'))
    ON CONFLICT (user_id, org_id) DO UPDATE
        SET status = EXCLUDED.status,
            joined_at = CASE WHEN EXCLUDED.status = 'approved' AND org_members.status <> 'approved'
                             THEN now() ELSE org_members.joined_at END
    RETURNING * INTO v_result;

    RETURN v_result;
END;
$$;

-- 5. function admin_upsert_por
CREATE OR REPLACE FUNCTION admin_upsert_por(
    p_user_email  TEXT,
    p_org_slug    TEXT,
    p_title       TEXT,
    p_por_type    por_type  DEFAULT 'custom',
    p_valid_from  DATE      DEFAULT CURRENT_DATE,
    p_valid_until DATE      DEFAULT NULL,
    p_is_active   BOOLEAN   DEFAULT true
)
RETURNS user_positions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_is_admin       BOOLEAN;
    v_is_org_account BOOLEAN;
    v_linked_org_id  UUID;
    v_user_id        UUID;
    v_org_id         UUID;
    v_target_parent  UUID;
    v_authorized     BOOLEAN := false;
    v_result         user_positions;
BEGIN
    SELECT id INTO v_org_id FROM organizations WHERE slug = p_org_slug LIMIT 1;
    IF v_org_id IS NULL THEN
        RAISE EXCEPTION 'Organization with slug ''%'' not found', p_org_slug;
    END IF;

    SELECT is_admin, is_org_account, linked_org_id
    INTO v_is_admin, v_is_org_account, v_linked_org_id
    FROM users WHERE id = auth.uid();

    IF COALESCE(v_is_admin, false) THEN
        v_authorized := true;
    ELSIF COALESCE(v_is_org_account, false) AND v_linked_org_id IS NOT NULL THEN
        IF v_linked_org_id = v_org_id THEN
            v_authorized := true;
        ELSE
            SELECT parent_id INTO v_target_parent FROM organizations WHERE id = v_org_id;
            IF v_target_parent = v_linked_org_id THEN
                v_authorized := true;
            END IF;
        END IF;
    END IF;

    IF NOT v_authorized THEN
        RAISE EXCEPTION 'Unauthorized: Only admins or linked org accounts can manage positions';
    END IF;

    SELECT id INTO v_user_id FROM users WHERE lower(email) = lower(p_user_email) LIMIT 1;
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email ''%'' not found', p_user_email;
    END IF;

    INSERT INTO user_positions (user_id, org_id, title, por_type, valid_from, valid_until, is_active)
    VALUES (v_user_id, v_org_id, p_title, COALESCE(p_por_type, 'custom'),
            COALESCE(p_valid_from, CURRENT_DATE), p_valid_until, COALESCE(p_is_active, true))
    ON CONFLICT (user_id, org_id, title) DO UPDATE
        SET por_type    = EXCLUDED.por_type,
            valid_from  = EXCLUDED.valid_from,
            valid_until = EXCLUDED.valid_until,
            is_active   = EXCLUDED.is_active
    RETURNING * INTO v_result;

    RETURN v_result;
END;
$$;

-- Track migration
INSERT INTO _migrations (filename) VALUES ('040_org_account_roster_permissions.sql');
