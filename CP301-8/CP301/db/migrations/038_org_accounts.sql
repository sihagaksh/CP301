-- ============================================================
-- 038_org_accounts.sql
-- Adds org account support to the IIT Ropar Community Platform.
-- 
-- Changes:
--   1. users: add is_org_account + linked_org_id
--   2. feed_posts, blog_posts, events, notices: add acting_as_org_id
--   3. Indexes for fast org-content lookups
--   4. create_org_account_profile() SECURITY DEFINER RPC
--
-- Additive only. Zero breaking changes.
-- Run ONCE in Supabase SQL Editor.
-- ============================================================

-- 1. Extend users table
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS is_org_account BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS linked_org_id  UUID REFERENCES organizations(id) ON DELETE SET NULL;

-- 2. Add acting_as_org_id to all content tables
ALTER TABLE feed_posts
    ADD COLUMN IF NOT EXISTS acting_as_org_id UUID REFERENCES organizations(id) ON DELETE SET NULL;

ALTER TABLE blog_posts
    ADD COLUMN IF NOT EXISTS acting_as_org_id UUID REFERENCES organizations(id) ON DELETE SET NULL;

ALTER TABLE events
    ADD COLUMN IF NOT EXISTS acting_as_org_id UUID REFERENCES organizations(id) ON DELETE SET NULL;

ALTER TABLE notices
    ADD COLUMN IF NOT EXISTS acting_as_org_id UUID REFERENCES organizations(id) ON DELETE SET NULL;

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_users_is_org_account
    ON users(is_org_account) WHERE is_org_account = true;

CREATE INDEX IF NOT EXISTS idx_users_linked_org
    ON users(linked_org_id) WHERE linked_org_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_feed_acting_org
    ON feed_posts(acting_as_org_id) WHERE acting_as_org_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_events_acting_org
    ON events(acting_as_org_id) WHERE acting_as_org_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notices_acting_org
    ON notices(acting_as_org_id) WHERE acting_as_org_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_blogs_acting_org
    ON blog_posts(acting_as_org_id) WHERE acting_as_org_id IS NOT NULL;

-- 4. SECURITY DEFINER RPC for creating org account profiles
--    Called from the /api/admin/org-accounts API route (service_role key).
--    Sets is_org_account=true and linked_org_id so the AuthContext
--    can detect this is an org account on login.
CREATE OR REPLACE FUNCTION create_org_account_profile(
    p_id          UUID,
    p_email       TEXT,
    p_full_name   TEXT,
    p_org_id      UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO users (
        id,
        email,
        full_name,
        role,
        is_org_account,
        linked_org_id,
        is_verified,
        is_admin
    ) VALUES (
        p_id,
        p_email,
        p_full_name,
        'staff',        -- satisfies NOT NULL; is_org_account=true is the real identifier
        true,
        p_org_id,
        true,           -- org accounts are pre-verified; no email confirmation flow
        false
    );
END;
$$;

-- Track migration
INSERT INTO _migrations (filename)
VALUES ('038_org_accounts.sql')
ON CONFLICT (filename) DO NOTHING;