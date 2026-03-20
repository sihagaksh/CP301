-- Migration: 018_blogs_engagement_views.sql
-- Description: Adds blog_likes, blog_comments, view_count to feed_posts, and increment functions.

-- 1. Add view_count to feed_posts
ALTER TABLE feed_posts
ADD COLUMN IF NOT EXISTS view_count INT NOT NULL DEFAULT 0;

-- 2. Create blog_likes table
CREATE TABLE IF NOT EXISTS blog_likes (
    post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_blog_likes_post ON blog_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_likes_user ON blog_likes(user_id);

-- RLS for blog_likes
ALTER TABLE blog_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "blog_likes_select" ON blog_likes;
CREATE POLICY "blog_likes_select" ON blog_likes
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "blog_likes_insert" ON blog_likes;
CREATE POLICY "blog_likes_insert" ON blog_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "blog_likes_delete" ON blog_likes;
CREATE POLICY "blog_likes_delete" ON blog_likes
    FOR DELETE USING (auth.uid() = user_id);

-- 3. Create blog_comments table
CREATE TABLE IF NOT EXISTS blog_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blog_comments_post ON blog_comments(post_id);

-- RLS for blog_comments
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "blog_comments_select" ON blog_comments;
CREATE POLICY "blog_comments_select" ON blog_comments
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "blog_comments_insert" ON blog_comments;
CREATE POLICY "blog_comments_insert" ON blog_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "blog_comments_update" ON blog_comments;
CREATE POLICY "blog_comments_update" ON blog_comments
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "blog_comments_delete" ON blog_comments;
CREATE POLICY "blog_comments_delete" ON blog_comments
    FOR DELETE USING (auth.uid() = user_id);

-- 4. Triggers for maintaining blog_posts counts

-- trigger function for blog_likes
CREATE OR REPLACE FUNCTION update_blog_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE blog_posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE blog_posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_blog_likes_count ON blog_likes;
CREATE TRIGGER trg_blog_likes_count
    AFTER INSERT OR DELETE ON blog_likes
    FOR EACH ROW EXECUTE FUNCTION update_blog_likes_count();

-- trigger function for blog_comments
CREATE OR REPLACE FUNCTION update_blog_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE blog_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE blog_posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_blog_comments_count ON blog_comments;
CREATE TRIGGER trg_blog_comments_count
    AFTER INSERT OR DELETE ON blog_comments
    FOR EACH ROW EXECUTE FUNCTION update_blog_comments_count();

-- 5. Safe increment functions

-- Increment feed views
CREATE OR REPLACE FUNCTION increment_feed_views(feed_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE feed_posts
    SET view_count = view_count + 1
    WHERE id = feed_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- (Assuming increment_blog_views already exists, but verifying it)
CREATE OR REPLACE FUNCTION increment_blog_views(blog_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE blog_posts
    SET view_count = view_count + 1
    WHERE id = blog_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
