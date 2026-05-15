import { useState, useCallback } from 'react';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { BlogPost, BlogCategory } from '@/lib/types';
import { getPublishedBlogsCursor, getBlogBySlug } from '@/lib/db/blogs';

export function useBlogs(initialCategory?: BlogCategory) {
  const [category, setCategory] = useState<BlogCategory | undefined>(initialCategory);
  const [sort, setSort] = useState<'newest' | 'popular'>('newest');
  const [tag, setTag] = useState<string | null>(null);
  const [authorId, setAuthorId] = useState<string | null>(null);
  const [keyword, setKeyword] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [hiringType, setHiringType] = useState<string | null>(null);

  const limit = 20;

  const getKey = (pageIndex: number, previousPageData: BlogPost[]) => {
    if (previousPageData && previousPageData.length < limit) return null;
    
    const params = [
      'blogs', category, sort, tag, authorId, keyword, startDate, endDate, hiringType, limit
    ];

    if (pageIndex === 0) return params;

    const last = previousPageData[previousPageData.length - 1];
    
    if (sort === 'popular') {
       return [...params, last.id, last.likeCount ?? 0, last.viewCount ?? 0];
    } else {
       return [...params, last.id, last.publishedAt ?? last.createdAt];
    }
  };

  const fetcher = async (args: any[]) => {
     const [_, cat, s, t, a, k, start, end, hir, lim, id, cursorA, cursorB] = args;
     
     if (s === 'popular') {
        if (id && cursorA != null) {
           return getPublishedBlogsCursor(cat, lim, undefined, id, t, a, k, 'popular', cursorA, cursorB, start, end, hir);
        }
        return getPublishedBlogsCursor(cat, lim, undefined, undefined, t, a, k, 'popular', undefined, undefined, start, end, hir);
     } else {
        if (id && cursorA) {
           return getPublishedBlogsCursor(cat, lim, cursorA, id, t, a, k, 'newest', undefined, undefined, start, end, hir);
        }
        return getPublishedBlogsCursor(cat, lim, undefined, undefined, t, a, k, 'newest', undefined, undefined, start, end, hir);
     }
  };

  const { data, error, isLoading, size, setSize, mutate } = useSWRInfinite<BlogPost[]>(getKey, fetcher, {
      persistSize: true,
      revalidateOnFocus: false,
      revalidateFirstPage: false,
  });

  const blogs = data ? ([] as BlogPost[]).concat(...data) : [];
  const loading = isLoading;
  const hasMore = data ? data[data.length - 1]?.length === limit : true;

  const loadMore = useCallback(() => {
    if (!loading && hasMore) setSize(size + 1);
  }, [loading, hasMore, size, setSize]);

  return {
    blogs, loading, error: error?.message || null,
    category, setCategory,
    loadMore, hasMore,
    refresh: () => mutate(),
    sort, setSort, tag, setTag, authorId, setAuthorId,
    keyword, setKeyword, startDate, setStartDate, endDate, setEndDate,
    hiringType, setHiringType,
  };
}

export function useBlog(slug: string) {
  const fetcher = async () => {
    if (!slug) return null;
    return getBlogBySlug(slug);
  };
  
  const { data: blog, error, isLoading, mutate } = useSWR(slug ? ['blog', slug] : null, fetcher, {
    revalidateOnFocus: false,
  });

  return { blog: blog || null, loading: isLoading, error: error?.message || null, refresh: () => mutate() };
}
