-- ============================================================
-- 011_count_triggers.sql
-- Adds DB triggers to auto-maintain like_count and comment_count
-- in feed_posts whenever rows are inserted/deleted in
-- feed_likes and feed_comments.
-- Run this in Supabase SQL Editor AFTER 010_merge_social_features.sql
-- ============================================================

-- ── LIKE COUNT TRIGGER ──────────────────────────────────────

CREATE OR REPLACE FUNCTION update_feed_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE feed_posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE feed_posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_feed_likes_count ON feed_likes;
CREATE TRIGGER trg_feed_likes_count
  AFTER INSERT OR DELETE ON feed_likes
  FOR EACH ROW EXECUTE FUNCTION update_feed_post_like_count();

-- ── COMMENT COUNT TRIGGER ────────────────────────────────────

CREATE OR REPLACE FUNCTION update_feed_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE feed_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE feed_posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_feed_comments_count ON feed_comments;
CREATE TRIGGER trg_feed_comments_count
  AFTER INSERT OR DELETE ON feed_comments
  FOR EACH ROW EXECUTE FUNCTION update_feed_post_comment_count();

-- ── RESYNC existing counts (in case they drifted) ───────────

UPDATE feed_posts p
SET like_count = (SELECT COUNT(*) FROM feed_likes l WHERE l.post_id = p.id);

UPDATE feed_posts p
SET comment_count = (SELECT COUNT(*) FROM feed_comments c WHERE c.post_id = p.id);

-- Record migration
INSERT INTO _migrations (filename) VALUES ('011_count_triggers.sql')
ON CONFLICT (filename) DO NOTHING;
