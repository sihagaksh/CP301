// ============================================================
// lib/hooks/useEvents.ts
// Hook for fetching and managing Events
// ============================================================

import { useState, useCallback, useEffect, useRef } from 'react';
import { getEventsCursor, createEvent, getEventBySlug, type GetEventsFilters } from '@/lib/db/events';
import type { Event } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function useEvents(initialFilters?: GetEventsFilters) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const cursorRef = useRef<{ startTime?: string | null; id?: string | null }>({});
  const fetchingRef = useRef(false);
  const [filters, setFilters] = useState<GetEventsFilters>(initialFilters || { limit: 15 });


  const fetchEvents = useCallback(async (isLoadMore = false, currentFilters?: GetEventsFilters) => {
    if (fetchingRef.current) {
      return;
    }
    fetchingRef.current = true;
    try {
      setLoading(true);
      setError(null);

      const f = currentFilters || filters;
      let data = [] as any[];
      if (isLoadMore && cursorRef.current.startTime && cursorRef.current.id) {
        data = await getEventsCursor(f, f.limit ?? 15, cursorRef.current.startTime, cursorRef.current.id);
      } else {
        data = await getEventsCursor(f, f.limit ?? 15);
      }

      setEvents(prev => isLoadMore ? [...prev, ...data] : data);
      setHasMore(data.length === (f.limit ?? 15));
      if (data.length > 0) {
        const last = data[data.length - 1];
        cursorRef.current = { startTime: last.startTime ?? last.createdAt, id: last.id };
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchEvents(false, filters);
  }, [filters]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchEvents(true);
    }
  }, [loading, hasMore, fetchEvents]);

  const updateFilters = useCallback((newFilters: Partial<GetEventsFilters>) => {
    // reset cursor when filters change
    cursorRef.current = {};
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const addEvent = useCallback(async (data: Partial<Event>) => {
    if (!user) {
      toast({ title: "Not logged in", description: "Please log in to create an event.", variant: "destructive" });
      return null;
    }
    try {
      const newEvent = await createEvent({ ...data, postedBy: user.id });
      if (newEvent) {
        setEvents(prev => [newEvent, ...prev]);
        toast({ title: "Event published successfully" });
        return newEvent;
      }
      return null;
    } catch (err: any) {
      console.error('[addEvent]', err);
      toast({ title: "Failed to publish event", description: err.message || 'Database error.', variant: "destructive" });
      return null;
    }
  }, [user, toast]);

  return {
    events,
    loading,
    error,
    hasMore,
    loadMore,
    filters,
    updateFilters,
    addEvent,
    refreshEvents: () => fetchEvents(false, filters)
  };
}

/**
 * Hook to fetch a single event by slug (useful for the detail page)
 */
export function useEvent(slug: string | null) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchEvent() {
      if (!slug) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getEventBySlug(slug);
        if (isMounted) setEvent(data);
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Failed to fetch event details');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchEvent();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  return { event, loading, error };
}
