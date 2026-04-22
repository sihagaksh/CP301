// ============================================================
// lib/hooks/useOrganizations.ts
// Hook for fetching organizations (Clubs & Bodies) directory
// ============================================================

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { getOrganizations, getOrganizationBySlug, getOrgMembers, getOrgPositions, getChildOrganizations } from '@/lib/db/organizations';
import type { Organization, OrgMember, UserPosition, OrgType } from '@/lib/types';

export function useOrganizations(typeFilter?: OrgType) {
    const [filterType, setFilterType] = useState<OrgType | undefined>(typeFilter);

    const { data, error, isLoading, mutate } = useSWR(
        ['organizations', filterType],
        () => getOrganizations(filterType),
        {
            revalidateOnFocus: false,
            revalidateIfStale: false,
        }
    );

    return {
        orgs: data || [],
        loading: isLoading,
        error: error?.message || null,
        filterType,
        setFilterType,
        refreshOrgs: () => mutate(),
    };
}

/**
 * Hook to fetch a single organization by slug with its members and positions
 */
export function useOrganizationDetail(slug: string | null) {
    const { data, error, isLoading } = useSWR(
        slug ? ['orgDetail', slug] : null,
        async () => {
            const orgData = await getOrganizationBySlug(slug!);
            if (!orgData) return { org: null, members: [], positions: [], children: [] };

            const [membersData, positionsData, childrenData] = await Promise.all([
                getOrgMembers(orgData.id),
                getOrgPositions(orgData.id),
                getChildOrganizations(orgData.id)
            ]);
            return {
                org: orgData,
                members: membersData,
                positions: positionsData,
                children: childrenData
            };
        },
        {
            revalidateOnFocus: false,
            revalidateIfStale: false,
        }
    );

    return {
        org: data?.org || null,
        members: data?.members || [],
        positions: data?.positions || [],
        children: data?.children || [],
        loading: isLoading,
        error: error?.message || null
    };
}
