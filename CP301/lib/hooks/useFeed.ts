import { useState, useCallback, useEffect, useRef } from 'react';
import { FeedPost } from '@/lib/types';
import { getFeedPostsCursor, createFeedPost } from '@/lib/db/feed';

export function useFeed() {
    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const cursorRef = useRef<{ createdAt?: string | null; id?: string | null }>({});
    const limit = 15;
    const fetchingRef = useRef(false);

    const fetchFeed = useCallback(async (isLoadMore = false) => {
        if (fetchingRef.current) return;
        fetchingRef.current = true;

        try {
            setLoading(true);
            setError(null);
            let data: FeedPost[] = [];
            if (isLoadMore && cursorRef.current.createdAt && cursorRef.current.id) {
                data = await getFeedPostsCursor(limit, cursorRef.current.createdAt, cursorRef.current.id);
            } else if (isLoadMore) {
                // no cursor yet, fetch initial page to seed cursor then subsequent call will use it
                data = await getFeedPostsCursor(limit);
            } else {
                data = await getFeedPostsCursor(limit);
            }

            setPosts(prev => isLoadMore ? [...prev, ...data] : data);
            setHasMore(data.length === limit);
            // update cursor to the last item's createdAt/id
            if (data.length > 0) {
                const last = data[data.length - 1];
                cursorRef.current = { createdAt: last.createdAt, id: last.id };
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch feed');
        } finally {
            setLoading(false);
            fetchingRef.current = false;
        }
    }, []);

    useEffect(() => {
        fetchFeed();
    }, []);

    const loadMore = () => {
        if (!loading && hasMore) {
            fetchFeed(true);
        }
    };

    const addPost = async (authorId: string, content: string, mediaUrls: string[] = []) => {
        try {
            const newPost = await createFeedPost(authorId, content, mediaUrls);
            setPosts(prev => [newPost, ...prev]);
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create post');
            return false;
        }
    };

    return {
        posts,
        loading,
        error,
        loadMore,
        hasMore,
        addPost,
        refresh: () => fetchFeed(false),
    };
}
