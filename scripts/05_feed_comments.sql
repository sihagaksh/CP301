-- =====================================================
-- FEED COMMENTS TABLE + TRIGGERS
-- Run this in the Supabase SQL Editor
-- =====================================================

-- Drop if exists (idempotent)
DROP TRIGGER IF EXISTS feed_comments_insert ON feed_comments;
DROP TRIGGER IF EXISTS feed_comments_delete ON feed_comments;
DROP TABLE IF EXISTS feed_comments CASCADE;

-- Create feed_comments table
CREATE TABLE feed_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feed_comments_post ON feed_comments(post_id);
CREATE INDEX idx_feed_comments_user ON feed_comments(user_id);
CREATE INDEX idx_feed_comments_created ON feed_comments(created_at DESC);

-- Trigger to increment comment_count when a comment is inserted
CREATE OR REPLACE FUNCTION increment_feed_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE feed_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to decrement comment_count when a comment is deleted
CREATE OR REPLACE FUNCTION decrement_feed_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE feed_posts SET comment_count = GREATEST(0, comment_count - 1) WHERE id = OLD.post_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER feed_comments_insert
    AFTER INSERT ON feed_comments
    FOR EACH ROW EXECUTE FUNCTION increment_feed_comment_count();

CREATE TRIGGER feed_comments_delete
    AFTER DELETE ON feed_comments
    FOR EACH ROW EXECUTE FUNCTION decrement_feed_comment_count();
