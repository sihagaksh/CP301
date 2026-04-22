// ============================================================
// lib/hooks/useNotices.ts
// Hook for fetching and managing Notices
// ============================================================

import { useState, useCallback, useEffect } from 'react';
import useSWRInfinite from 'swr/infinite';
import { getNotices, createNotice, type GetNoticesFilters } from '@/lib/db/notices';
import type { Notice } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function useNotices(initialFilters?: GetNoticesFilters) {
    const { user } = useAuth();
    const { toast } = useToast();

    const [filters, setFilters] = useState<GetNoticesFilters>(initialFilters || { limit: 15 });

    // Sync external filters changes into the hook's state
    useEffect(() => {
        if (initialFilters) {
            setFilters(prev => {
                // Only update if there's an actual change to prevent infinite loops
                const hasChanged = JSON.stringify(prev) !== JSON.stringify(initialFilters);
                return hasChanged ? initialFilters : prev;
            });
        }
    }, [initialFilters]);

    const userContext = user ? {
        role: user.role,
        department: user.department,
        batch: user.batch
    } : undefined;

    const getKey = (pageIndex: number, previousPageData: { data: Notice[], hasMore: boolean }) => {
        if (previousPageData && !previousPageData.hasMore) return null;
        if (pageIndex === 0) return ['notices', filters, userContext];
        return ['notices', filters, userContext, pageIndex + 1];
    };

    const fetcher = async (args: any[]) => {
        const [_, f, ctx, page = 1] = args;
        return getNotices({ ...f, page, userContext: ctx });
    };

    const { data, error, isLoading, size, setSize, mutate } = useSWRInfinite(getKey, fetcher, {
        persistSize: true,
        revalidateOnFocus: false,
        revalidateFirstPage: false,
    });

    const notices = data ? data.flatMap(pageData => pageData.data) : [];
    const loading = isLoading;
    const hasMore = data ? data[data.length - 1]?.hasMore : false;

    const loadMore = useCallback(() => {
        if (!loading && hasMore) {
            setSize(size + 1);
        }
    }, [loading, hasMore, size, setSize]);

    const updateFilters = useCallback((newFilters: Partial<GetNoticesFilters>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    }, []);

    const addNotice = useCallback(async (noticeData: Partial<Notice>) => {
        if (!user) return null;
        try {
            const newNotice = await createNotice({ ...noticeData, postedBy: user.id });
            if (newNotice) {
                mutate((currentData) => {
                    if (!currentData) return [{ data: [newNotice], hasMore: false, total: 1, page: 1, limit: 15 }] as any;
                    const newData = [...currentData];
                    newData[0] = { ...newData[0], data: [newNotice, ...newData[0].data] };
                    return newData;
                }, false);
                toast({ title: "Notice published successfully" });
                return newNotice;
            }
            return null;
        } catch (err: any) {
            toast({
                title: "Failed to publish notice",
                description: err.message,
                variant: "destructive"
            });
            return null;
        }
    }, [user, toast, mutate]);

    return {
        notices,
        loading,
        error: error?.message || null,
        hasMore,
        loadMore,
        filters,
        updateFilters,
        addNotice,
        refreshNotices: () => mutate()
    };
}
