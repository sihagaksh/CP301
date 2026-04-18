// ============================================================
// lib/db/search.ts
// Unified FTS Global Search Engine via Trigram & RPC
// ============================================================

import { db } from './client';

export interface GlobalSearchResult {
    module: 'Event' | 'Marketplace' | 'Community' | 'Lost & Found' | 'Blog' | 'Notice' | 'Organization' | 'Quick Link';
    id: string;
    title: string;
    snippet: string | null;
    link_url: string;
    similarity_score: number;
}

/**
 * Searches across all heavily-indexed text columns across the platform
 * instantly returning a unified array of cross-module results.
 */
export async function searchGlobal(searchQuery: string): Promise<GlobalSearchResult[]> {
    if (!searchQuery || searchQuery.trim().length < 2) {
        return [];
    }

    const { data, error } = await db
        .rpc('global_search_unified', { search_query: searchQuery.trim() });

    if (error) {
        console.error('[searchGlobal] Supabase RPC Error:', error);
        return [];
    }

    return (data as GlobalSearchResult[]) || [];
}
