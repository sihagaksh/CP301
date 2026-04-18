// ============================================================
// lib/db/quick-links.ts
// Quick Links database queries
// ============================================================

import { db } from './client';
import type { QuickLink } from '@/lib/types';

/**
 * Fetch all active Quick Links ordered by section, subsection, and display_order.
 */
export async function getQuickLinks(): Promise<QuickLink[]> {
    console.log('[getQuickLinks] Starting fetch from Supabase...');
    const { data, error } = await db
        .from('quick_links')
        .select('*')
        .eq('is_active', true)
        .order('section', { ascending: true })
        .order('sub_section', { ascending: true, nullsFirst: true })
        .order('display_order', { ascending: true });

    if (error) {
        console.error(`[getQuickLinks] Supabase Error:`, error);
        return [];
    }
    
    console.log(`[getQuickLinks] Successfully fetched ${data?.length || 0} links.`);
    return data ? data.map(mapQuickLink) : [];
}

/**
 * Fetch a single Quick Link by ID
 */
export async function getQuickLinkById(id: string): Promise<QuickLink | null> {
    const { data, error } = await db
        .from('quick_links')
        .select('*')
        .eq('id', id)
        .single();
        
    if (error) return null;
    return mapQuickLink(data);
}

/**
 * Add a new Quick Link
 */
export async function addQuickLink(
    linkData: Omit<QuickLink, 'id' | 'createdAt' | 'clickCount' | 'isFeatured' | 'isActive' | 'targetRoles'>
): Promise<QuickLink | null> {
    const insertData = {
        title: linkData.title,
        url: linkData.url,
        description: linkData.description || null,
        section: linkData.section,
        sub_section: linkData.subSection || null,
        display_order: linkData.displayOrder || 100,
        // Optional tracking if implemented
        created_by: linkData.createdBy || null 
    };

    const { data, error } = await db
        .from('quick_links')
        .insert([insertData])
        .select('*')
        .single();

    if (error) throw new Error(`[addQuickLink] ${error.message}`);
    return data ? mapQuickLink(data) : null;
}

/**
 * Update an existing Quick Link
 */
export async function updateQuickLink(
    id: string,
    updates: Partial<Omit<QuickLink, 'id' | 'createdAt'>>
): Promise<QuickLink | null> {
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.url !== undefined) updateData.url = updates.url;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.section !== undefined) updateData.section = updates.section;
    if (updates.subSection !== undefined) updateData.sub_section = updates.subSection;
    if (updates.displayOrder !== undefined) updateData.display_order = updates.displayOrder;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

    const { data, error } = await db
        .from('quick_links')
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single();

    if (error) throw new Error(`[updateQuickLink] ${error.message}`);
    return data ? mapQuickLink(data) : null;
}

/**
 * Delete a Quick Link
 */
export async function deleteQuickLink(id: string): Promise<boolean> {
    const { error } = await db
        .from('quick_links')
        .delete()
        .eq('id', id);

    if (error) throw new Error(`[deleteQuickLink] ${error.message}`);
    return true;
}

/**
 * Map database row to QuickLink type
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapQuickLink(row: any): QuickLink {
    return {
        id: row.id,
        createdBy: row.created_by,
        title: row.title,
        description: row.description,
        url: row.url,
        section: row.section,
        subSection: row.sub_section,
        targetRoles: row.target_roles || [],
        displayOrder: row.display_order,
        isFeatured: row.is_featured,
        isActive: row.is_active,
        clickCount: row.click_count,
        createdAt: row.created_at,
    };
}
