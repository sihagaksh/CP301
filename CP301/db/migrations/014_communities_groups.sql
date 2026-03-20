-- ============================================================
-- 014_communities_groups.sql
-- WhatsApp-style community groups & notice boards
-- Run AFTER migrations 001–013 in the Supabase SQL Editor.
-- ============================================================

-- ========================
-- 1. ENUMS
-- ========================
DO $$ BEGIN
    CREATE TYPE group_type AS ENUM ('notice_board', 'group');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE send_permission AS ENUM ('all_members', 'admins_only');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ========================
-- 2. community_groups
-- ========================
CREATE TABLE IF NOT EXISTS community_groups (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id    UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    description     TEXT,
    type            group_type NOT NULL DEFAULT 'group',
    send_permission send_permission NOT NULL DEFAULT 'all_members',
    created_by      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    member_count    INT NOT NULL DEFAULT 0,
    icon_url        TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_community_groups_community ON community_groups(community_id);
CREATE INDEX IF NOT EXISTS idx_community_groups_type ON community_groups(community_id, type);

CREATE TRIGGER trg_community_groups_updated_at
    BEFORE UPDATE ON community_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ========================
-- 3. community_group_members
-- ========================
CREATE TABLE IF NOT EXISTS community_group_members (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id    UUID NOT NULL REFERENCES community_groups(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role        TEXT NOT NULL DEFAULT 'member',   -- 'member' | 'admin'
    joined_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_cgm_group ON community_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_cgm_user  ON community_group_members(user_id);

-- ========================
-- 4. community_group_messages
-- ========================
CREATE TABLE IF NOT EXISTS community_group_messages (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id    UUID NOT NULL REFERENCES community_groups(id) ON DELETE CASCADE,
    sender_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content     TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cgmsg_group ON community_group_messages(group_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_cgmsg_sender ON community_group_messages(sender_id);

-- ========================
-- 5. Optional extras on communities
-- ========================
ALTER TABLE communities
    ADD COLUMN IF NOT EXISTS icon_url   TEXT,
    ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- ========================
-- 6. RLS
-- ========================

-- community_groups
ALTER TABLE community_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cg_select" ON community_groups
    FOR SELECT TO authenticated USING (true);

-- Only a community admin can insert groups.
-- We check community_members without a recursive policy by using a SECURITY DEFINER helper.
CREATE POLICY "cg_insert" ON community_groups
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM community_members cm
            WHERE cm.community_id = community_groups.community_id
              AND cm.user_id = auth.uid()
              AND cm.role = 'admin'
        )
        OR
        -- creator always allowed
        EXISTS (
            SELECT 1 FROM communities c
            WHERE c.id = community_groups.community_id
              AND c.creator_id = auth.uid()
        )
    );

CREATE POLICY "cg_update" ON community_groups
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM community_members cm
            WHERE cm.community_id = community_groups.community_id
              AND cm.user_id = auth.uid()
              AND cm.role = 'admin'
        )
        OR
        EXISTS (
            SELECT 1 FROM communities c
            WHERE c.id = community_groups.community_id
              AND c.creator_id = auth.uid()
        )
    );

CREATE POLICY "cg_delete" ON community_groups
    FOR DELETE TO authenticated
    USING (
        type != 'notice_board'
        AND (
            EXISTS (
                SELECT 1 FROM community_members cm
                WHERE cm.community_id = community_groups.community_id
                  AND cm.user_id = auth.uid()
                  AND cm.role = 'admin'
            )
            OR
            EXISTS (
                SELECT 1 FROM communities c
                WHERE c.id = community_groups.community_id
                  AND c.creator_id = auth.uid()
            )
        )
    );

-- community_group_members
ALTER TABLE community_group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cgm_select" ON community_group_members
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "cgm_insert_own" ON community_group_members
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cgm_delete_own" ON community_group_members
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- community_group_messages
ALTER TABLE community_group_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cgmsg_select" ON community_group_messages
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "cgmsg_insert" ON community_group_messages
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "cgmsg_delete_own" ON community_group_messages
    FOR DELETE TO authenticated
    USING (auth.uid() = sender_id);

-- ========================
-- 7. member_count triggers
-- ========================
CREATE OR REPLACE FUNCTION increment_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE community_groups SET member_count = member_count + 1 WHERE id = NEW.group_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE community_groups SET member_count = GREATEST(0, member_count - 1) WHERE id = OLD.group_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_cgm_inc ON community_group_members;
CREATE TRIGGER trg_cgm_inc
    AFTER INSERT ON community_group_members
    FOR EACH ROW EXECUTE FUNCTION increment_group_member_count();

DROP TRIGGER IF EXISTS trg_cgm_dec ON community_group_members;
CREATE TRIGGER trg_cgm_dec
    AFTER DELETE ON community_group_members
    FOR EACH ROW EXECUTE FUNCTION decrement_group_member_count();

-- ========================
-- 8. Realtime
-- ========================
ALTER PUBLICATION supabase_realtime ADD TABLE community_group_messages;

-- ========================
-- 9. Record migration
-- ========================
INSERT INTO _migrations (filename) VALUES ('014_communities_groups.sql')
ON CONFLICT (filename) DO NOTHING;
