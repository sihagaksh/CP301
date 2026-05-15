-- ============================================================
-- 042_secure_csv_upsert_scope.sql
--
-- Fixes a privilege escalation gap in the entry_number CSV upsert RPCs.
--
-- The `004_robust_csv_anchors.sql` versions of admin_upsert_member and
-- admin_upsert_por only check `is_admin = true`, meaning:
--   (a) org-admin POR holders couldn't use the CSV upload at all, AND
--   (b) if those checks were ever relaxed, any user could call them with
--       an arbitrary org_slug they knew.
--
-- This migration replaces both functions with scope-aware versions that
-- mirror the authorization logic from `040_org_account_roster_permissions.sql`:
--   1. Platform admins (is_admin = true)            → full access
--   2. Org account (is_org_account = true)          → own linked org + its direct children
--   3. Active POR holder                            → only the org(s) they hold a position in
--   4. Anyone else                                  → RAISE EXCEPTION 'Unauthorized'
-- ============================================================

INSERT INTO _migrations (filename) VALUES ('042_secure_csv_upsert_scope.sql') ON CONFLICT DO NOTHING;

-- ─── 1. admin_upsert_member (entry_number variant) ──────────────────────────
CREATE OR REPLACE FUNCTION admin_upsert_member(
    p_entry_number TEXT,
    p_org_slug     TEXT,
    p_status       membership_status DEFAULT 'approved'
)
RETURNS SETOF org_members
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_caller_id      UUID    := auth.uid();
    v_is_admin       BOOLEAN;
    v_is_org_account BOOLEAN;
    v_linked_org_id  UUID;
    v_has_por        BOOLEAN;
    v_authorized     BOOLEAN := false;
    v_user_id        UUID;
    v_org_id         UUID;
    v_target_parent  UUID;
BEGIN
    -- 1. Resolve target org from slug
    SELECT id INTO v_org_id FROM organizations WHERE slug = p_org_slug LIMIT 1;
    IF v_org_id IS NULL THEN
        RAISE EXCEPTION 'Organization with slug ''%'' not found', p_org_slug;
    END IF;

    -- 2. Inspect caller
    SELECT is_admin, is_org_account, linked_org_id
    INTO v_is_admin, v_is_org_account, v_linked_org_id
    FROM users WHERE id = v_caller_id;

    -- 3. Authorization: platform admin
    IF COALESCE(v_is_admin, false) THEN
        v_authorized := true;

    -- 4. Authorization: org account linked to the target org or its parent
    ELSIF COALESCE(v_is_org_account, false) AND v_linked_org_id IS NOT NULL THEN
        IF v_linked_org_id = v_org_id THEN
            v_authorized := true;
        ELSE
            SELECT parent_id INTO v_target_parent FROM organizations WHERE id = v_org_id;
            IF v_target_parent = v_linked_org_id THEN
                v_authorized := true;
            END IF;
        END IF;

    -- 5. Authorization: human POR holder with an active position in the target org
    ELSE
        SELECT EXISTS (
            SELECT 1 FROM user_positions
            WHERE user_id = v_caller_id
              AND org_id  = v_org_id
              AND is_active = true
        ) INTO v_has_por;

        IF v_has_por THEN
            v_authorized := true;
        END IF;
    END IF;

    IF NOT v_authorized THEN
        RAISE EXCEPTION 'Unauthorized: you do not have permission to manage members of org ''%''', p_org_slug;
    END IF;

    -- 6. Resolve user from entry number (enrollment_number or employee_id)
    SELECT id INTO v_user_id
    FROM users
    WHERE enrollment_number = p_entry_number
       OR employee_id       = p_entry_number
    LIMIT 1;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User with entry number ''%'' not found', p_entry_number;
    END IF;

    -- 7. Upsert membership
    INSERT INTO org_members (org_id, user_id, status)
    VALUES (v_org_id, v_user_id, COALESCE(p_status, 'approved'))
    ON CONFLICT (org_id, user_id) DO UPDATE
        SET status     = EXCLUDED.status,
            joined_at  = CASE
                             WHEN EXCLUDED.status = 'approved'
                              AND org_members.status <> 'approved'
                             THEN now()
                             ELSE org_members.joined_at
                         END,
            updated_at = now();

    RETURN QUERY SELECT * FROM org_members WHERE org_id = v_org_id AND user_id = v_user_id;
END;
$$;


-- ─── 2. admin_upsert_por (entry_number variant) ─────────────────────────────
CREATE OR REPLACE FUNCTION admin_upsert_por(
    p_entry_number TEXT,
    p_org_slug     TEXT,
    p_title        TEXT,
    p_por_type     TEXT    DEFAULT 'custom',
    p_valid_from   DATE    DEFAULT CURRENT_DATE,
    p_valid_until  DATE    DEFAULT NULL,
    p_is_active    BOOLEAN DEFAULT true
)
RETURNS SETOF user_positions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_caller_id      UUID    := auth.uid();
    v_is_admin       BOOLEAN;
    v_is_org_account BOOLEAN;
    v_linked_org_id  UUID;
    v_has_por        BOOLEAN;
    v_authorized     BOOLEAN := false;
    v_user_id        UUID;
    v_org_id         UUID;
    v_target_parent  UUID;
    v_enum_val       por_type;
BEGIN
    -- 1. Resolve target org from slug
    SELECT id INTO v_org_id FROM organizations WHERE slug = p_org_slug LIMIT 1;
    IF v_org_id IS NULL THEN
        RAISE EXCEPTION 'Organization with slug ''%'' not found', p_org_slug;
    END IF;

    -- 2. Inspect caller
    SELECT is_admin, is_org_account, linked_org_id
    INTO v_is_admin, v_is_org_account, v_linked_org_id
    FROM users WHERE id = v_caller_id;

    -- 3. Authorization: platform admin
    IF COALESCE(v_is_admin, false) THEN
        v_authorized := true;

    -- 4. Authorization: org account
    ELSIF COALESCE(v_is_org_account, false) AND v_linked_org_id IS NOT NULL THEN
        IF v_linked_org_id = v_org_id THEN
            v_authorized := true;
        ELSE
            SELECT parent_id INTO v_target_parent FROM organizations WHERE id = v_org_id;
            IF v_target_parent = v_linked_org_id THEN
                v_authorized := true;
            END IF;
        END IF;

    -- 5. Authorization: active POR holder for that specific org
    ELSE
        SELECT EXISTS (
            SELECT 1 FROM user_positions
            WHERE user_id = v_caller_id
              AND org_id  = v_org_id
              AND is_active = true
        ) INTO v_has_por;

        IF v_has_por THEN
            v_authorized := true;
        END IF;
    END IF;

    IF NOT v_authorized THEN
        RAISE EXCEPTION 'Unauthorized: you do not have permission to manage positions of org ''%''', p_org_slug;
    END IF;

    -- 6. Resolve user from entry number
    SELECT id INTO v_user_id
    FROM users
    WHERE enrollment_number = p_entry_number
       OR employee_id       = p_entry_number
    LIMIT 1;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User with entry number ''%'' not found', p_entry_number;
    END IF;

    -- 7. Safely cast por_type string to enum; fall back to custom
    BEGIN
        v_enum_val := p_por_type::por_type;
    EXCEPTION WHEN invalid_text_representation THEN
        v_enum_val := 'custom'::por_type;
    END;

    -- 8. Upsert position
    INSERT INTO user_positions (
        user_id, org_id, title, por_type, valid_from, valid_until, is_active
    ) VALUES (
        v_user_id, v_org_id, p_title, v_enum_val,
        COALESCE(p_valid_from, CURRENT_DATE), p_valid_until,
        COALESCE(p_is_active, true)
    )
    ON CONFLICT (user_id, org_id, title) DO UPDATE
        SET por_type    = EXCLUDED.por_type,
            valid_from  = EXCLUDED.valid_from,
            valid_until = EXCLUDED.valid_until,
            is_active   = EXCLUDED.is_active,
            updated_at  = now();

    RETURN QUERY SELECT * FROM user_positions
    WHERE user_id = v_user_id AND org_id = v_org_id AND title = p_title;
END;
$$;
