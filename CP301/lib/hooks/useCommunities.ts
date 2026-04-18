// ============================================================
// lib/hooks/useCommunities.ts
// Hook for fetching and managing Communities
// ============================================================

import { useState, useCallback, useEffect, useRef } from 'react';
import { getCommunitiesCursor, createCommunity, getCommunityBySlug, getCommunityMembers, getCommunityPostsCursor, type GetCommunityFilters } from '@/lib/db/communities';
import type { Community, CommunityMember, CommunityPost } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function useCommunities(initialFilters?: GetCommunityFilters) {
    const [communities, setCommunities] = useState<Community[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const cursorRef = useRef<{ memberCount?: number | null; id?: string | null }>({});
    const [filters, setFilters] = useState<GetCommunityFilters>(initialFilters || { limit: 12 });

    const fetchCommunities = useCallback(async (isLoadMore = false, currentFilters?: GetCommunityFilters) => {
        try {
            setLoading(true);
            setError(null);
            const f = currentFilters || filters;
            let data: any[] = [];
            if (isLoadMore && cursorRef.current.memberCount !== undefined && cursorRef.current.id) {
                data = await getCommunitiesCursor(f, f.limit ?? 12, cursorRef.current.memberCount ?? null, cursorRef.current.id);
            } else {
                data = await getCommunitiesCursor(f, f.limit ?? 12);
            }
            setCommunities(prev => isLoadMore ? [...prev, ...data] : data);
            setHasMore(data.length === (f.limit ?? 12));
            if (data.length > 0) {
                const last = data[data.length - 1];
                cursorRef.current = { memberCount: last.memberCount, id: last.id };
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load communities');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCommunities(false, filters);
    }, [filters]);

    const loadMore = useCallback(() => {
        if (!loading && hasMore) fetchCommunities(true);
    }, [loading, hasMore, fetchCommunities]);

    const updateFilters = useCallback((newFilters: Partial<GetCommunityFilters>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    }, []);

    return { communities, loading, error, hasMore, loadMore, filters, updateFilters, refreshCommunities: () => fetchCommunities(false, filters) };
}

/**
 * Hook to fetch a single community with its members and posts
 */
export function useCommunityDetail(slug: string | null) {
    const [community, setCommunity] = useState<Community | null>(null);
    const [members, setMembers] = useState<CommunityMember[]>([]);
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        async function fetchDetail() {
            if (!slug) { setLoading(false); return; }
            try {
                setLoading(true);
                setError(null);
                const communityData = await getCommunityBySlug(slug);
                if (!isMounted) return;
                setCommunity(communityData);

                if (communityData) {
                        const [membersResult, postsResult] = await Promise.allSettled([
                            getCommunityMembers(communityData.id),
                            getCommunityPostsCursor(communityData.id),
                        ]);
                        if (isMounted) {
                            setMembers(membersResult.status === 'fulfilled' ? membersResult.value : []);
                            setPosts(postsResult.status === 'fulfilled' ? postsResult.value : []);
                        }
                }
            } catch (err: any) {
                if (isMounted) setError(err.message);
            } finally {
                if (isMounted) setLoading(false);
            }
        }
        fetchDetail();
        return () => { isMounted = false; };
    }, [slug]);

    return { community, members, posts, loading, error };
}

/**
 * Hook to create a community
 */
export function useCreateCommunity() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const create = useCallback(async (data: { name: string; description?: string; isPublic: boolean; requiresApproval: boolean }) => {
        if (!user) {
            toast({ title: 'Not logged in', description: 'Please log in to create a community.', variant: 'destructive' });
            return null;
        }
        setIsSubmitting(true);
        try {
            const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const result = await createCommunity({ ...data, creatorId: user.id, slug });
            toast({ title: 'Community Created', description: `"${data.name}" is now live!` });
            return result;
        } catch (err: any) {
            console.error('[createCommunity]', err);
            toast({ title: 'Failed to create community', description: err.message || 'Database error.', variant: 'destructive' });
            return null;
        } finally {
            setIsSubmitting(false);
        }
    }, [user, toast]);

    return { create, isSubmitting };
}
