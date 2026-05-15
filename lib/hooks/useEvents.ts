// ============================================================
// lib/hooks/useEvents.ts
// Hook for fetching and managing Events
// ============================================================

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { getEventsCursor, createEvent, getEventBySlug, type GetEventsFilters } from '@/lib/db/events';
import type { Event } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function useEvents(initialFilters?: GetEventsFilters) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [filters, setFilters] = useState<GetEventsFilters>(initialFilters || { limit: 15 });

  const getKey = (pageIndex: number, previousPageData: Event[]) => {
    // reached the end
    if (previousPageData && !previousPageData.length) return null;
    
    // first page, we don't have `previousPageData`
    if (pageIndex === 0) return ['events', filters];

    // add the cursor to the API fetch based on the last item
    const last = previousPageData[previousPageData.length - 1];
    const startTime = last.startTime ?? last.createdAt;
    const id = last.id;
    return ['events', filters, startTime, id];
  };

  const fetcher = async (args: any[]) => {
    const [_, f, startTime, id] = args;
    if (startTime && id) {
       return getEventsCursor(f, f.limit ?? 15, startTime, id);
    }
    return getEventsCursor(f, f.limit ?? 15);
  };

  const { data, error, isLoading, size, setSize, mutate } = useSWRInfinite<Event[]>(
    getKey,
    fetcher,
    {
      persistSize: true,
      revalidateOnFocus: false,
      revalidateFirstPage: false,
    }
  );

  const events = data ? ([] as Event[]).concat(...data) : [];
  const loading = isLoading;
  const isReachingEnd = data && data[data.length - 1]?.length < (filters.limit || 15);
  const hasMore = !isReachingEnd;

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setSize(size + 1);
    }
  }, [loading, hasMore, size, setSize]);

  const updateFilters = useCallback((newFilters: Partial<GetEventsFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const addEvent = useCallback(async (eventData: Partial<Event>) => {
    if (!user) {
      toast({ title: "Not logged in", description: "Please log in to create an event.", variant: "destructive" });
      return null;
    }
    try {
      const newEvent = await createEvent({ ...eventData, postedBy: user.id });
      if (newEvent) {
        // Optimistically prepend the new event
        mutate((currentData) => {
          if (!currentData) return [[newEvent]];
          const newData = [...currentData];
          newData[0] = [newEvent, ...newData[0]];
          return newData;
        }, false);
        toast({ title: "Event published successfully" });
        return newEvent;
      }
      return null;
    } catch (err: any) {
      console.error('[addEvent]', err);
      toast({ title: "Failed to publish event", description: err.message || 'Database error.', variant: "destructive" });
      return null;
    }
  }, [user, toast, mutate]);

  return {
    events,
    loading,
    error: error?.message || null,
    hasMore,
    loadMore,
    filters,
    updateFilters,
    addEvent,
    refreshEvents: () => mutate()
  };
}

/**
 * Hook to fetch a single event by slug (useful for the detail page)
 */
export function useEvent(slug: string | null) {
  const fetcher = async () => {
    if (!slug) return null;
    return getEventBySlug(slug);
  };

  const { data: event, error, isLoading } = useSWR(
    slug ? ['event', slug] : null,
    fetcher,
    {
       revalidateOnFocus: false,
    }
  );

  return { 
    event: event || null, 
    loading: isLoading, 
    error: error?.message || null 
  };
}
