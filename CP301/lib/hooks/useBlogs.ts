import { useState, useCallback, useEffect, useRef } from 'react';
import { BlogPost, BlogCategory } from '@/lib/types';
import { getPublishedBlogsCursor, getBlogBySlug } from '@/lib/db/blogs';

export function useBlogs(initialCategory?: BlogCategory) {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<BlogCategory | undefined>(initialCategory);
  const [hasMore, setHasMore] = useState(true);
  const cursorRef = useRef<{ createdAt?: string | null; id?: string | null }>({});
  const fetchingRef = useRef(false);
  const limit = 20;


  const fetchBlogs = useCallback(async (isLoadMore = false, cat?: BlogCategory) => {
    if (fetchingRef.current) {
      return;
    }
    fetchingRef.current = true;
    try {
      setLoading(true);
      setError(null);
      let data: BlogPost[] = [];
      if (isLoadMore && cursorRef.current.createdAt && cursorRef.current.id) {
        data = await getPublishedBlogsCursor(cat, limit, cursorRef.current.createdAt, cursorRef.current.id);
      } else {
        data = await getPublishedBlogsCursor(cat, limit);
      }

      setBlogs(prev => isLoadMore ? [...prev, ...data] : data);
      setHasMore(data.length === limit);
      if (data.length > 0) {
        const last = data[data.length - 1];
        cursorRef.current = { createdAt: last.publishedAt ?? last.createdAt, id: last.id };
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch blogs');
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchBlogs(false, category);
  }, [category]); // Re-fetch when category changes

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchBlogs(true, category);
    }
  };

  return {
    blogs,
    loading,
    error,
    category,
    setCategory,
    loadMore,
    hasMore,
    refresh: () => fetchBlogs(false, category)
  };
}

export function useBlog(slug: string) {
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await getBlogBySlug(slug);
        if (cancelled) return;
        if (!data) {
          setError('Blog not found');
        } else {
          setBlog(data);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to fetch blog');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [slug]);

  return {
    blog,
    loading,
    error,
    refresh: () => { } // Re-mount the component to refresh
  };
}
