-- 020_trending_algorithm.sql

CREATE OR REPLACE FUNCTION get_trending_items(limit_count integer DEFAULT 5)
RETURNS TABLE (
  id uuid,
  title text,
  type text,
  view_count integer,
  like_count integer,
  comment_count integer,
  created_at timestamp with time zone,
  score float,
  slug text
) AS $$
BEGIN
  RETURN QUERY
  WITH all_items AS (
    -- Get published blogs
    SELECT 
      b.id,
      b.title,
      'blog' AS type,
      COALESCE(b.view_count, 0) as view_count,
      COALESCE(b.like_count, 0) as like_count,
      COALESCE(b.comment_count, 0) as comment_count,
      b.created_at,
      b.slug
    FROM blog_posts b
    WHERE b.status = 'published'
    
    UNION ALL
    
    -- Get feed posts
    SELECT 
      f.id,
      CASE 
        WHEN length(f.content) > 60 THEN substring(f.content from 1 for 60) || '...' 
        ELSE f.content 
      END AS title,
      'post' AS type,
      COALESCE(f.view_count, 0) as view_count,
      COALESCE(f.like_count, 0) as like_count,
      COALESCE(f.comment_count, 0) as comment_count,
      f.created_at,
      NULL::text as slug
    FROM feed_posts f
  )
  SELECT 
    i.id,
    i.title,
    i.type,
    i.view_count,
    i.like_count,
    i.comment_count,
    i.created_at,
    (
      (i.view_count + 5 * i.like_count + 10 * i.comment_count)::float 
      / 
      GREATEST(EXTRACT(EPOCH FROM (now() - i.created_at)) / 86400, 1.0)
    ) AS score,
    i.slug
  FROM all_items i
  WHERE i.title IS NOT NULL AND trim(i.title) != ''
  ORDER BY score DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
