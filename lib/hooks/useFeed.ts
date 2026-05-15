import { useCallback } from 'react';
import useSWRInfinite from 'swr/infinite';
import { FeedPost } from '@/lib/types';
import { getFeedPosts, createFeedPost } from '@/lib/db/feed';

export function useFeed() {
    const limit = 15;

    const getKey = (pageIndex: number, previousPageData: FeedPost[]) => {
        // reached the end
        if (previousPageData && previousPageData.length < limit) return null;
        return ['feed', limit, pageIndex * limit];
    };

    const fetcher = async (args: any[]) => {
        const [_, l, offset] = args;
        return getFeedPosts(l, offset);
    };

    const { data, error, isLoading, size, setSize, mutate } = useSWRInfinite<FeedPost[]>(getKey, fetcher, {
        persistSize: true,
        revalidateOnFocus: false,
        revalidateFirstPage: false,
    });

    const posts = data ? ([] as FeedPost[]).concat(...data) : [];
    const loading = isLoading;
    const hasMore = data ? data[data.length - 1]?.length === limit : true;

    const loadMore = useCallback(() => {
        if (!loading && hasMore) {
            setSize(size + 1);
        }
    }, [loading, hasMore, size, setSize]);

    const addPost = async (authorId: string, content: string, mediaUrls: string[] = []) => {
        try {
            const newPost = await createFeedPost(authorId, content, mediaUrls);
            mutate((currentData) => {
                if (!currentData) return [[newPost]];
                const newData = [...currentData];
                newData[0] = [newPost, ...newData[0]];
                return newData;
            }, false);
            return true;
        } catch (err: any) {
            console.error('[addPost error]', err);
            return false;
        }
    };

    return {
        posts,
        loading,
        error: error?.message || null,
        loadMore,
        hasMore,
        addPost,
        refresh: () => mutate(),
    };
}
