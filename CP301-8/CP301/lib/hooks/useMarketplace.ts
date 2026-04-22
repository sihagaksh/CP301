// ============================================================
// lib/hooks/useMarketplace.ts
// Hook for fetching and managing Marketplace items
// ============================================================

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { getMarketplaceItemsCursor, createMarketplaceItem, getMarketplaceItemById, updateMarketplaceItemStatus, type GetMarketplaceFilters } from '@/lib/db/marketplace';
import type { MarketplaceItem, ListingStatus, ItemCategory, ItemCondition } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function useMarketplace(initialFilters?: GetMarketplaceFilters) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [filters, setFilters] = useState<GetMarketplaceFilters>(initialFilters || { limit: 12 });

  const getKey = (pageIndex: number, previousPageData: MarketplaceItem[]) => {
    if (previousPageData && previousPageData.length < (filters.limit ?? 12)) return null;
    if (pageIndex === 0) return ['marketplace', filters];

    const last = previousPageData[previousPageData.length - 1];
    return ['marketplace', filters, last.createdAt, last.id];
  };

  const fetcher = async (args: any[]) => {
    const [_, f, createdAt, id] = args;
    if (createdAt && id) {
      return getMarketplaceItemsCursor(f, f.limit ?? 12, createdAt, id);
    }
    return getMarketplaceItemsCursor(f, f.limit ?? 12);
  };

  const { data, error, isLoading, size, setSize, mutate } = useSWRInfinite<MarketplaceItem[]>(getKey, fetcher, {
    persistSize: true,
    revalidateOnFocus: false,
    revalidateFirstPage: false,
  });

  const items = data ? ([] as MarketplaceItem[]).concat(...data) : [];
  const loading = isLoading;
  const hasMore = data ? data[data.length - 1]?.length === (filters.limit ?? 12) : true;

  const loadMore = useCallback(() => {
    if (!loading && hasMore) setSize(size + 1);
  }, [loading, hasMore, size, setSize]);

  const updateFilters = useCallback((newFilters: Partial<GetMarketplaceFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const createListing = useCallback(async (dataObj: {
    title: string;
    description?: string;
    category: ItemCategory;
    price: number;
    isNegotiable: boolean;
    condition: ItemCondition;
    images?: string[];
    pickupLocation?: string;
    deliveryAvailable: boolean;
  }) => {
    if (!user) return null;
    try {
      const newItem = await createMarketplaceItem({ ...dataObj, sellerId: user.id });
      if (newItem) {
         mutate((currentData) => {
            if (!currentData) return [[newItem]];
            const newData = [...currentData];
            newData[0] = [newItem, ...newData[0]];
            return newData;
         }, false);
        toast({
          title: "Listing Created",
          description: "Your item has been successfully listed on the marketplace."
        });
        return newItem;
      }
      return null;
    } catch (err: any) {
      toast({
        title: "Failed to create listing",
        description: err.message,
        variant: "destructive"
      });
      return null;
    }
  }, [user, toast, mutate]);

  const updateStatus = useCallback(async (id: string, newStatus: ListingStatus) => {
    try {
      const updated = await updateMarketplaceItemStatus(id, newStatus);
      if (updated) {
         mutate((currentData) => {
           if (!currentData) return currentData;
           return currentData.map(page => 
             page.map(item => item.id === id ? updated : item)
           );
         }, false);
        toast({ title: `Listing marked as ${newStatus}` });
      }
      return updated;
    } catch (err: any) {
      toast({
        title: "Failed to update listing status",
        description: err.message,
        variant: "destructive"
      });
      return null;
    }
  }, [toast, mutate]);

  return {
    items, loading, error: error?.message || null,
    hasMore, loadMore, filters, updateFilters,
    createListing, updateStatus,
    refreshItems: () => mutate()
  };
}

/**
 * Hook to fetch a single Marketplace Item by ID
 */
export function useMarketplaceItem(id: string | null) {
  const fetcher = async () => {
    if (!id) return null;
    return getMarketplaceItemById(id);
  };
  const { data: item, error, isLoading } = useSWR(id ? ['marketplace_item', id] : null, fetcher, { revalidateOnFocus: false });
  return { item: item || null, loading: isLoading, error: error?.message || null };
}
