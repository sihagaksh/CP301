// ============================================================
// lib/hooks/useLostFound.ts
// Hook for fetching and managing Lost & Found items
// ============================================================

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { getLFItemsCursor, createLFItem, getLFItemById, updateLFItemStatus, type GetLFFilters } from '@/lib/db/lost-found';
import type { LostFoundItem, LFStatus, LFCategory } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function useLostFound(initialFilters?: GetLFFilters) {
    const { user } = useAuth();
    const { toast } = useToast();

    const [filters, setFilters] = useState<GetLFFilters>(initialFilters || { limit: 15 });

    const getKey = (pageIndex: number, previousPageData: LostFoundItem[]) => {
        if (previousPageData && previousPageData.length < (filters.limit ?? 15)) return null;
        if (pageIndex === 0) return ['lost_found', filters];

        const last = previousPageData[previousPageData.length - 1];
        return ['lost_found', filters, last.createdAt, last.id];
    };

    const fetcher = async (args: any[]) => {
        const [_, f, createdAt, id] = args;
        if (createdAt && id) {
            return getLFItemsCursor(f, f.limit ?? 15, createdAt, id);
        }
        return getLFItemsCursor(f, f.limit ?? 15);
    };

    const { data, error, isLoading, size, setSize, mutate } = useSWRInfinite<LostFoundItem[]>(getKey, fetcher, {
        persistSize: true,
        revalidateOnFocus: false,
        revalidateFirstPage: false,
    });

    const items = data ? ([] as LostFoundItem[]).concat(...data) : [];
    const loading = isLoading;
    const hasMore = data ? data[data.length - 1]?.length === (filters.limit ?? 15) : true;

    const loadMore = useCallback(() => {
        if (!loading && hasMore) setSize(size + 1);
    }, [loading, hasMore, size, setSize]);

    const updateFilters = useCallback((newFilters: Partial<GetLFFilters>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    }, []);

    const reportItem = useCallback(async (dataObj: {
        itemName: string;
        category: LFCategory;
        status: 'lost' | 'found';
        description?: string;
        locationLostFound?: string;
        dateLostFound?: string;
        contactInfo?: string;
        images?: string[];
    }) => {
        if (!user) {
            toast({
                title: "Not logged in",
                description: "Please log in to report an item.",
                variant: "destructive"
            });
            return null;
        }
        try {
            const newItem = await createLFItem({ ...dataObj, reporterId: user.id });
            if (newItem) {
                mutate((currentData) => {
                    if (!currentData) return [[newItem]];
                    const newData = [...currentData];
                    newData[0] = [newItem, ...newData[0]];
                    return newData;
                }, false);
                toast({
                    title: `Reported as ${dataObj.status === 'lost' ? 'Lost' : 'Found'}`,
                    description: "Your item has been posted successfully."
                });
                return newItem;
            }
            return null;
        } catch (err: any) {
            console.error('[reportItem]', err);
            toast({
                title: "Failed to post item",
                description: err.message || 'Database error. Please try again.',
                variant: "destructive"
            });
            return null;
        }
    }, [user, toast, mutate]);

    const resolveItem = useCallback(async (id: string, newStatus: LFStatus) => {
        try {
            const updated = await updateLFItemStatus(id, newStatus, user?.id);
            if (updated) {
                mutate((currentData) => {
                   if (!currentData) return currentData;
                   return currentData.map(page => page.map(item => item.id === id ? updated : item));
                }, false);
                toast({
                    title: "Status updated successfully"
                });
            }
            return updated;
        } catch (err: any) {
            toast({
                title: "Failed to update status",
                description: err.message,
                variant: "destructive"
            });
            return null;
        }
    }, [user, toast, mutate]);

    return {
        items,
        loading,
        error: error?.message || null,
        hasMore,
        loadMore,
        filters,
        updateFilters,
        reportItem,
        resolveItem,
        refreshItems: () => mutate()
    };
}

export function useLostFoundItem(id: string | null) {
    const fetcher = async () => {
        if (!id) return null;
        return getLFItemById(id);
    };
    const { data: item, error, isLoading } = useSWR(id ? ['lost_found_item', id] : null, fetcher, { revalidateOnFocus: false });
    return { item: item || null, loading: isLoading, error: error?.message || null };
}
