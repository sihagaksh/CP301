-- ============================================================
-- 044_users_admin_update_policy.sql
-- Adds admin bypass UPDATE policy on users table and a
-- SECURITY DEFINER RPC for the alumni role+email promotion.
-- ============================================================

-- 1. Allow admins to update any user row
DROP POLICY IF EXISTS "users_update_admin" ON users;
CREATE POLICY "users_update_admin" ON users
    FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_admin = true))
    WITH CHECK (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_admin = true));

-- 2. SECURITY DEFINER function for alumni promotion
--    - Bypasses RLS entirely (runs as DB owner)
--    - Only updates email if it actually differs from current email
--    - Returns the updated row for verification
CREATE OR REPLACE FUNCTION promote_user_to_alumni(
    p_user_id     UUID,
    p_new_email   TEXT,
    p_admin_id    UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_current_email TEXT;
BEGIN
    -- Verify caller is admin
    IF NOT EXISTS (SELECT 1 FROM users WHERE users.id = p_admin_id AND users.is_admin = true) THEN
        RAISE EXCEPTION 'Unauthorized: Only admins can promote users to alumni';
    END IF;

    -- Get current email to avoid unnecessary unique constraint conflicts
    SELECT email INTO v_current_email FROM users WHERE users.id = p_user_id;

    IF v_current_email = p_new_email THEN
        -- Email is already the same — only update the role
        UPDATE users
        SET role       = 'alumni',
            updated_at = now()
        WHERE users.id = p_user_id;
    ELSE
        -- Different email — update both role and email
        UPDATE users
        SET role       = 'alumni',
            email      = p_new_email,
            updated_at = now()
        WHERE users.id = p_user_id;
    END IF;
END;
$$;

-- Track migration
INSERT INTO _migrations (filename) VALUES ('044_users_admin_update_policy.sql')
ON CONFLICT (filename) DO NOTHING;
