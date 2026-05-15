-- 031_global_search_rpc.sql
-- Unified RPC for Global Header Search via pg_trgm similarity

DROP FUNCTION IF EXISTS global_search_unified(text);

CREATE OR REPLACE FUNCTION global_search_unified(search_query text)
RETURNS TABLE (
  module text,
  id uuid,
  title text,
  snippet text,
  link_url text,
  similarity_score real
)
LANGUAGE sql
STABLE
AS $$
  -- Enforce minimum query length natively
  WITH q AS (SELECT search_query AS term WHERE length(search_query) >= 2)
  
  -- 1. Events
  SELECT 
    'Event' AS module,
    e.id,
    e.title,
    substring(e.description from 1 for 100) AS snippet,
    '/events/' || e.slug AS link_url,
    (e.title <-> q.term) AS similarity_score
  FROM events e, q
  WHERE e.is_published = true AND e.title ILIKE '%' || q.term || '%'
  
  UNION ALL
  
  -- 2. Marketplace
  SELECT 
    'Marketplace' AS module,
    m.id,
    m.title,
    substring(m.description from 1 for 100) AS snippet,
    '/marketplace/' || m.id AS link_url,
    (m.title <-> q.term) AS similarity_score
  FROM marketplace_items m, q
  WHERE m.status = 'available' AND m.title ILIKE '%' || q.term || '%'
  
  UNION ALL
  
  -- 3. Communities
  SELECT 
    'Community' AS module,
    c.id,
    c.name AS title,
    substring(c.description from 1 for 100) AS snippet,
    '/communities/' || c.slug AS link_url,
    (c.name <-> q.term) AS similarity_score
  FROM communities c, q
  WHERE c.is_public = true AND c.name ILIKE '%' || q.term || '%'
  
  UNION ALL
  
  -- 4. Lost & Found
  SELECT 
    'Lost & Found' AS module,
    l.id,
    l.item_name AS title,
    substring(l.description from 1 for 100) AS snippet,
    '/lost-found/' || l.id AS link_url,
    (l.item_name <-> q.term) AS similarity_score
  FROM lost_found_items l, q
  WHERE l.status IN ('lost', 'found') AND l.item_name ILIKE '%' || q.term || '%'
  
  UNION ALL
  
  -- 5. Blogs
  SELECT 
    'Blog' AS module,
    b.id,
    b.title,
    substring(b.excerpt from 1 for 100) AS snippet,
    '/blogs/' || b.slug AS link_url,
    (b.title <-> q.term) AS similarity_score
  FROM blog_posts b, q
  WHERE b.status = 'published' AND b.title ILIKE '%' || q.term || '%'
  
  UNION ALL
  
  -- 6. Notices
  SELECT 
    'Notice' AS module,
    n.id,
    n.title,
    substring(n.content from 1 for 100) AS snippet,
    '/feed?notice=' || n.id AS link_url,
    (n.title <-> q.term) AS similarity_score
  FROM notices n, q
  WHERE n.is_active = true AND n.title ILIKE '%' || q.term || '%'
  
  UNION ALL
  
  -- 7. Organizations (Clubs/Bodies)
  SELECT 
    'Organization' AS module,
    o.id,
    o.name AS title,
    substring(o.description from 1 for 100) AS snippet,
    '/clubs/' || o.slug AS link_url,
    (o.name <-> q.term) AS similarity_score
  FROM organizations o, q
  WHERE o.is_active = true AND o.name ILIKE '%' || q.term || '%'
  
  UNION ALL
  
  -- 8. Quick Links
  SELECT 
    'Quick Link' AS module,
    q_l.id,
    q_l.title,
    substring(q_l.description from 1 for 100) AS snippet,
    q_l.url AS link_url,
    (q_l.title <-> q.term) AS similarity_score
  FROM quick_links q_l, q
  WHERE q_l.is_active = true AND q_l.title ILIKE '%' || q.term || '%'
  
  -- Only return top 15 most relevant results (lower distance = higher similarity)
  ORDER BY similarity_score ASC
  LIMIT 15;
$$;

-- Track Migration
INSERT INTO _migrations (filename) VALUES ('031_global_search_rpc.sql') ON CONFLICT DO NOTHING;
