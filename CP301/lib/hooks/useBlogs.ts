import { useState, useCallback, useEffect, useRef } from 'react';
import { BlogPost, BlogCategory } from '@/lib/types';
import { getPublishedBlogsCursor, getBlogBySlug } from '@/lib/db/blogs';

export function useBlogs(initialCategory?: BlogCategory) {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<BlogCategory | undefined>(initialCategory);
  const [hasMore, setHasMore] = useState(true);
  // cursorRef holds either newest-style cursor (publishedAt + id)
  // or popular-style cursor (likeCount + viewCount + id)
  const cursorRef = useRef<{
    createdAt?: string | null;
    id?: string | null;
    likeCount?: number | null;
    viewCount?: number | null;
  }>({});
  const fetchingRef = useRef(false);
  const limit = 20;
  const [sort, setSort] = useState<'newest' | 'popular'>('newest');
  const [tag, setTag] = useState<string | null>(null);
  const [authorId, setAuthorId] = useState<string | null>(null);
  const [keyword, setKeyword] = useState<string | null>(null);

  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [hiringType, setHiringType] = useState<string | null>(null);


  const fetchBlogs = useCallback(async (isLoadMore = false, cat?: BlogCategory) => {
    if (fetchingRef.current) {
      return;
    }
    fetchingRef.current = true;
    try {
      setLoading(true);
      setError(null);
      let data: BlogPost[] = [];
      if (sort === 'popular') {
        if (isLoadMore && cursorRef.current.likeCount != null && cursorRef.current.id) {
          data = await getPublishedBlogsCursor(cat, limit, undefined, cursorRef.current.id, tag, authorId, keyword, 'popular', cursorRef.current.likeCount, cursorRef.current.viewCount, startDate, endDate, hiringType);
        } else {
          data = await getPublishedBlogsCursor(cat, limit, undefined, undefined, tag, authorId, keyword, 'popular', undefined, undefined, startDate, endDate, hiringType);
        }
      } else {
        if (isLoadMore && cursorRef.current.createdAt && cursorRef.current.id) {
          data = await getPublishedBlogsCursor(cat, limit, cursorRef.current.createdAt, cursorRef.current.id, tag, authorId, keyword, 'newest', undefined, undefined, startDate, endDate, hiringType);
        } else {
          data = await getPublishedBlogsCursor(cat, limit, undefined, undefined, tag, authorId, keyword, 'newest', undefined, undefined, startDate, endDate, hiringType);
        }
      }

      setBlogs(prev => isLoadMore ? [...prev, ...data] : data);
      setHasMore(data.length === limit);
      if (data.length > 0) {
        const last = data[data.length - 1];
        if (sort === 'popular') {
          cursorRef.current = { likeCount: last.likeCount ?? 0, viewCount: last.viewCount ?? 0, id: last.id };
        } else {
          cursorRef.current = { createdAt: last.publishedAt ?? last.createdAt, id: last.id };
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch blogs');
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [sort, tag, authorId, keyword, startDate, endDate, hiringType]);

  useEffect(() => {
    // reset cursor when filters/sort/category change
    cursorRef.current = {};
    fetchBlogs(false, category);
  }, [category, sort, tag, authorId, keyword, startDate, endDate, hiringType]); // Re-fetch when any filter changes

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
    refresh: () => fetchBlogs(false, category),
    sort,
    setSort,
    tag,
    setTag,
    authorId,
    setAuthorId,
    keyword,
    setKeyword,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    hiringType,
    setHiringType
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
