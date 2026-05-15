-- Migration: Add hiring_type to blog_posts
-- Description: Adds a new column to track if a blog is about On-Campus or Off-Campus hiring.

-- 1. Create the hiring_type column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blog_posts' AND column_name = 'hiring_type') THEN
        ALTER TABLE blog_posts ADD COLUMN hiring_type TEXT;
    END IF;
END $$;

-- 2. Add comment for documentation
COMMENT ON COLUMN blog_posts.hiring_type IS 'Type of hiring context: on_campus or off_campus';

-- 3. Add an index for better filtering performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_hiring_type ON blog_posts(hiring_type) WHERE status = 'published';

INSERT INTO _migrations (filename) VALUES ('034_add_hiring_type.sql') ON CONFLICT DO NOTHING;
