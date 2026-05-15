-- 030_trigram_indexes.sql
-- Optimizes ILIKE '%term%' sequential scans into GIN-accelerated queries
-- via the pg_trgm extension

-- 1. Enable pg_trgm
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Create GIN indexes for the most heavily queried wildcard text columns
CREATE INDEX IF NOT EXISTS idx_events_title_trgm ON events USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_market_title_trgm ON marketplace_items USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_lf_name_trgm ON lost_found_items USING GIN (item_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_communities_name_trgm ON communities USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_blogs_title_trgm ON blog_posts USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_users_fullname_trgm ON users USING GIN (full_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_notices_title_trgm ON notices USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_orgs_name_trgm ON organizations USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_ql_title_trgm ON quick_links USING GIN (title gin_trgm_ops);

-- Track Migration
INSERT INTO _migrations (filename) VALUES ('030_trigram_indexes.sql') ON CONFLICT DO NOTHING;
