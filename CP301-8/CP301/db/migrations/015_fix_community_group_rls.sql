-- ============================================================
-- 015_fix_community_group_rls.sql
-- Adds missing UPDATE and admin-DELETE policies for
-- community_group_members and community_members tables.
-- Run in Supabase SQL Editor AFTER migration 014.
-- ============================================================

-- ============================================================
-- community_group_members: Allow admins to UPDATE (promote/demote)
-- ============================================================
CREATE POLICY "cgm_update_admin" ON community_group_members
    FOR UPDATE TO authenticated
    USING (
        -- Must be an admin of that group
        EXISTS (
            SELECT 1 FROM community_group_members me
            WHERE me.group_id = community_group_members.group_id
              AND me.user_id = auth.uid()
              AND me.role = 'admin'
        )
        OR
        -- Or the community creator
        EXISTS (
            SELECT 1 FROM community_groups cg
            JOIN communities c ON c.id = cg.community_id
            WHERE cg.id = community_group_members.group_id
              AND c.creator_id = auth.uid()
        )
    )
    WITH CHECK (true);

-- ============================================================
-- community_group_members: Allow admins to DELETE other members
-- ============================================================
CREATE POLICY "cgm_delete_admin" ON community_group_members
    FOR DELETE TO authenticated
    USING (
        -- Can always delete your own row
        auth.uid() = user_id
        OR
        -- Group admin can remove others
        EXISTS (
            SELECT 1 FROM community_group_members me
            WHERE me.group_id = community_group_members.group_id
              AND me.user_id = auth.uid()
              AND me.role = 'admin'
        )
        OR
        -- Community creator can remove anyone
        EXISTS (
            SELECT 1 FROM community_groups cg
            JOIN communities c ON c.id = cg.community_id
            WHERE cg.id = community_group_members.group_id
              AND c.creator_id = auth.uid()
        )
    );

-- ============================================================
-- community_members: Allow community admins to UPDATE and DELETE
-- ============================================================
CREATE POLICY "cm_update_admin" ON community_members
    FOR UPDATE TO authenticated
    USING (
        auth.uid() = user_id
        OR
        EXISTS (
            SELECT 1 FROM community_members me
            WHERE me.community_id = community_members.community_id
              AND me.user_id = auth.uid()
              AND me.role = 'admin'
        )
        OR
        EXISTS (
            SELECT 1 FROM communities c
            WHERE c.id = community_members.community_id
              AND c.creator_id = auth.uid()
        )
    )
    WITH CHECK (true);

CREATE POLICY "cm_delete_admin" ON community_members
    FOR DELETE TO authenticated
    USING (
        auth.uid() = user_id
        OR
        EXISTS (
            SELECT 1 FROM community_members me
            WHERE me.community_id = community_members.community_id
              AND me.user_id = auth.uid()
              AND me.role = 'admin'
        )
        OR
        EXISTS (
            SELECT 1 FROM communities c
            WHERE c.id = community_members.community_id
              AND c.creator_id = auth.uid()
        )
    );

-- ============================================================
-- communities: Allow creator to delete
-- ============================================================
CREATE POLICY "communities_delete_own" ON communities
    FOR DELETE TO authenticated
    USING (auth.uid() = creator_id);

-- ============================================================
-- Record migration
-- ============================================================
INSERT INTO _migrations (filename) VALUES ('015_fix_community_group_rls.sql')
ON CONFLICT (filename) DO NOTHING;
