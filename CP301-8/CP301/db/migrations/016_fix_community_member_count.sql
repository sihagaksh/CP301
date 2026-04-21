-- ============================================================
-- 016_fix_community_member_count.sql
-- Adds triggers to keep communities.member_count in sync with
-- the community_members table. Also backfills existing counts.
-- ============================================================

-- ============================================================
-- 1. Create Trigger Functions
-- ============================================================
CREATE OR REPLACE FUNCTION increment_community_member_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE communities
    SET member_count = member_count + 1
    WHERE id = NEW.community_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_community_member_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE communities
    SET member_count = GREATEST(0, member_count - 1)
    WHERE id = OLD.community_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 2. Attach Triggers to community_members
-- ============================================================
DROP TRIGGER IF EXISTS trg_cm_inc ON community_members;
CREATE TRIGGER trg_cm_inc
    AFTER INSERT ON community_members
    FOR EACH ROW EXECUTE FUNCTION increment_community_member_count();

DROP TRIGGER IF EXISTS trg_cm_dec ON community_members;
CREATE TRIGGER trg_cm_dec
    AFTER DELETE ON community_members
    FOR EACH ROW EXECUTE FUNCTION decrement_community_member_count();

-- ============================================================
-- 3. Backfill existing member counts
-- ============================================================
UPDATE communities c
SET member_count = (
    SELECT COUNT(*)
    FROM community_members cm
    WHERE cm.community_id = c.id
);

-- ============================================================
-- 4. Record migration
-- ============================================================
INSERT INTO _migrations (filename) VALUES ('016_fix_community_member_count.sql')
ON CONFLICT (filename) DO NOTHING;
