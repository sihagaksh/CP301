-- ============================================================
-- 010_merge_social_features.sql
-- Adds tables and columns required by the merged social features
-- from the original Folder 1 codebase (feed likes, comments,
-- share tracking, message sender tracking, profile picture upload).
-- Run this in the Supabase SQL Editor AFTER migrations 001–009.
-- ============================================================

-- ========================
-- 1. feed_posts: add share_count and view_count columns
--    (Folder 1 feed page tracks shares and views)
-- ========================
ALTER TABLE feed_posts
  ADD COLUMN IF NOT EXISTS share_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS view_count  INT NOT NULL DEFAULT 0;

-- ========================
-- 2. FEED LIKES
--    One row per (user, post) — used for like/unlike toggle
-- ========================
CREATE TABLE IF NOT EXISTS feed_likes (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id    UUID NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_feed_likes_post   ON feed_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_feed_likes_user   ON feed_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_likes_unique ON feed_likes(post_id, user_id);

-- RLS for feed_likes
ALTER TABLE feed_likes ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can see who liked what (needed to show like state)
CREATE POLICY "feed_likes_select" ON feed_likes
    FOR SELECT TO authenticated
    USING (true);

-- Users can like posts (insert their own row)
CREATE POLICY "feed_likes_insert" ON feed_likes
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Users can unlike (delete their own row)
CREATE POLICY "feed_likes_delete" ON feed_likes
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);


-- ========================
-- 3. FEED COMMENTS
--    Comments on feed posts
-- ========================
CREATE TABLE IF NOT EXISTS feed_comments (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id    UUID NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content    TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feed_comments_post    ON feed_comments(post_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_feed_comments_user    ON feed_comments(user_id);

-- Auto-update updated_at trigger for feed_comments
CREATE TRIGGER trg_feed_comments_updated_at
    BEFORE UPDATE ON feed_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS for feed_comments
ALTER TABLE feed_comments ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read comments
CREATE POLICY "feed_comments_select" ON feed_comments
    FOR SELECT TO authenticated
    USING (true);

-- Users can post comments
CREATE POLICY "feed_comments_insert" ON feed_comments
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Users can edit their own comments
CREATE POLICY "feed_comments_update_own" ON feed_comments
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "feed_comments_delete_own" ON feed_comments
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);


-- ========================
-- 4. conversations: add last_message_sender_id
--    (Folder 1 messages page uses this to show read-receipt ticks)
-- ========================
ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS last_message_sender_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- ========================
-- 5. users: add guest_valid_until and guest_purpose
--    (These are in Folder 1's User type and AuthContext signup flow
--     but may be missing from the Folder 2 schema column set)
-- ========================
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS guest_purpose    TEXT,
  ADD COLUMN IF NOT EXISTS guest_valid_until TIMESTAMPTZ;

-- ========================
-- 6. Storage: feed-media bucket configuration
--    Supabase Storage buckets are created via the dashboard or
--    Storage API, NOT via SQL migrations. However, we can create
--    a Storage RLS policy here for the feed-media bucket assuming
--    the bucket already exists as a Public bucket.
--    
--    MANUAL STEP REQUIRED:
--    Go to Supabase Dashboard → Storage → Create Bucket:
--       Name: feed-media
--       Public: YES  (so image URLs are stable and accessible)
--
--    After creating the bucket, also add the following policies
--    in Dashboard → Storage → feed-media → Policies:
--    
--    Policy 1 (INSERT): Allow authenticated users to upload
--       Name: "auth users can upload feed media"
--       Operation: INSERT
--       Target roles: authenticated
--       Expression: (bucket_id = 'feed-media') AND (auth.uid()::text = (storage.foldername(name))[1])
--    
--    Policy 2 (SELECT): Public read (since bucket is Public, this is automatic)
--    
--    Policy 3 (DELETE): Users can delete their own uploads
--       Name: "auth users can delete own feed media"
--       Operation: DELETE
--       Target roles: authenticated
--       Expression: (bucket_id = 'feed-media') AND (auth.uid()::text = (storage.foldername(name))[1])
-- ========================

-- ========================
-- 7. Storage: profile-pictures bucket (for profile photo uploads)
--    MANUAL STEP REQUIRED (same as above):
--    Go to Supabase Dashboard → Storage → Create Bucket:
--       Name: profile-pictures
--       Public: YES
--
--    Add policies:
--    Policy 1 (INSERT): authenticated users upload to their own folder
--       Expression: (bucket_id = 'profile-pictures') AND (auth.uid()::text = (storage.foldername(name))[1])
--    Policy 3 (DELETE): users delete their own
--       Expression: (bucket_id = 'profile-pictures') AND (auth.uid()::text = (storage.foldername(name))[1])
-- ========================


-- ========================
-- 8. Realtime: Enable realtime for messages and conversations
--    (Required for the live messages feature in the Messages page)
--    Run these in the Supabase SQL Editor as well.
-- ========================

-- Enable realtime publications for messages and conversations tables
-- (These are needed for the Supabase Realtime subscription in messages/page.tsx)
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE feed_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ========================
-- 9. Record this migration
-- ========================
INSERT INTO _migrations (filename) VALUES ('010_merge_social_features.sql')
ON CONFLICT (filename) DO NOTHING;
