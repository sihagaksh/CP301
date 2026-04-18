-- ============================================================
-- 028_add_cursor_indexes.sql
-- Add compound indexes to support efficient cursor-based pagination
-- ============================================================

INSERT INTO _migrations (filename) VALUES ('028_add_cursor_indexes.sql') ON CONFLICT (filename) DO NOTHING;

-- Marketplace: newest-first by (created_at, id)
CREATE INDEX IF NOT EXISTS idx_marketplace_items_created_at_id ON marketplace_items (created_at DESC, id DESC);

-- Lost & Found: newest-first by (created_at, id)
CREATE INDEX IF NOT EXISTS idx_lost_found_items_created_at_id ON lost_found_items (created_at DESC, id DESC);

-- Events: upcoming-order by (start_time, id)
CREATE INDEX IF NOT EXISTS idx_events_start_time_id ON events (start_time ASC, id ASC);

-- Feed posts: newest-first by (created_at, id)
CREATE INDEX IF NOT EXISTS idx_feed_posts_created_at_id ON feed_posts (created_at DESC, id DESC);

-- Blogs: published ordering by (published_at, id)
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at_id ON blog_posts (published_at DESC, id DESC);

-- Community posts: support pinned + newest ordering
CREATE INDEX IF NOT EXISTS idx_community_posts_pinned_created_at_id ON community_posts (is_pinned DESC, created_at DESC, id DESC);

-- Helpful filter indexes
CREATE INDEX IF NOT EXISTS idx_marketplace_items_status ON marketplace_items (status);
CREATE INDEX IF NOT EXISTS idx_lost_found_items_status ON lost_found_items (status);

-- Notes:
-- - Prefer running index creation CONCURRENTLY in production for large tables.
-- - If your migration runner wraps files in transactions, run these statements with CONCURRENTLY manually.

