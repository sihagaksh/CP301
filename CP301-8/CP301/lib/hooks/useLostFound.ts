// ============================================================
// lib/hooks/useLostFound.ts
// Hook for fetching and managing Lost & Found items
// ============================================================

import { useState, useCallback, useEffect, useRef } from 'react';
import { getLFItemsCursor, createLFItem, getLFItemById, updateLFItemStatus, type GetLFFilters } from '@/lib/db/lost-found';
import type { LostFoundItem, LFStatus, LFCategory } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function useLostFound(initialFilters?: GetLFFilters) {
    const { user } = useAuth();
    const { toast } = useToast();

    const [items, setItems] = useState<LostFoundItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const cursorRef = useRef<{ createdAt?: string | null; id?: string | null }>({});
    const fetchingRef = useRef(false);
    const [filters, setFilters] = useState<GetLFFilters>(initialFilters || { limit: 15 });


    const fetchItems = useCallback(async (isLoadMore = false, currentFilters?: GetLFFilters) => {
        if (fetchingRef.current) {
            return;
        }
        fetchingRef.current = true;
        try {
            setLoading(true);
            setError(null);

            const f = currentFilters || filters;
            let data: any[] = [];
            if (isLoadMore && cursorRef.current.createdAt && cursorRef.current.id) {
                data = await getLFItemsCursor(f, f.limit ?? 15, cursorRef.current.createdAt, cursorRef.current.id);
            } else {
                data = await getLFItemsCursor(f, f.limit ?? 15);
            }

            setItems(prev => isLoadMore ? [...prev, ...data] : data);
            setHasMore(data.length === (f.limit ?? 15));
            if (data.length > 0) {
                const last = data[data.length - 1];
                cursorRef.current = { createdAt: last.createdAt, id: last.id };
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load lost & found items');
        } finally {
            setLoading(false);
            fetchingRef.current = false;
        }
    }, []);

    useEffect(() => {
        fetchItems(false, filters);
    }, [filters]);

    const loadMore = useCallback(() => {
        if (!loading && hasMore) {
            fetchItems(true, filters);
        }
    }, [loading, hasMore, fetchItems, filters]);

    const updateFilters = useCallback((newFilters: Partial<GetLFFilters>) => {
        // Reset cursor state and items when filters change
        cursorRef.current = {};
        setItems([]);
        setFilters(prev => ({ ...prev, ...newFilters }));
    }, []);

    const reportItem = useCallback(async (data: {
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
            const newItem = await createLFItem({ ...data, reporterId: user.id });
            if (newItem) {
                setItems(prev => [newItem, ...prev]);
                toast({
                    title: `Reported as ${data.status === 'lost' ? 'Lost' : 'Found'}`,
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
    }, [user, toast]);

    const resolveItem = useCallback(async (id: string, newStatus: LFStatus) => {
        try {
            const updated = await updateLFItemStatus(id, newStatus, user?.id);
            if (updated) {
                setItems(prev => prev.map(item => item.id === id ? updated : item));
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
    }, [user, toast]);

    return {
        items,
        loading,
        error,
        hasMore,
        loadMore,
        filters,
        updateFilters,
        reportItem,
        resolveItem,
        refreshItems: () => fetchItems(false, filters)
    };
}

/**
 * Hook to fetch a single Lost Found Item by ID
 */
export function useLostFoundItem(id: string | null) {
    const [item, setItem] = useState<LostFoundItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function fetchItem() {
            if (!id) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const data = await getLFItemById(id);
                if (isMounted) setItem(data);
            } catch (err: any) {
                if (isMounted) setError(err.message || 'Failed to fetch item details');
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        fetchItem();

        return () => {
            isMounted = false;
        };
    }, [id]);

    return { item, loading, error };
}
