// ============================================================
// lib/db/mess-menu.ts
// Mess Menu database queries
// ============================================================

import { db } from './client';
import type { MessMenu } from '@/lib/types';

/**
 * Fetch the mess menu for a specific month and year
 */
export async function getMessMenu(month: number, year: number): Promise<MessMenu | null> {
    const { data, error } = await db
        .from('mess_menus')
        .select(`id, month, year, markdown_content, document_url, created_at, updated_at`)
        .eq('month', month)
        .eq('year', year)
        .single();

    if (error) {
        if (error.code !== 'PGRST116') { // PGRST116 is "Results contain 0 rows, single() expected 1"
            console.warn(`[getMessMenu] ${error.message}`);
        }
        return null;
    }
    
    return data ? mapMessMenu(data) : null;
}

/**
 * Upsert a mess menu (insert or update on conflict)
 */
export async function upsertMessMenu(
    menuData: Omit<MessMenu, 'id' | 'createdAt' | 'updatedAt'>
): Promise<MessMenu | null> {
    // Determine if we need to insert or update based on month/year combo
    const { data: existing } = await db
        .from('mess_menus')
        .select('id')
        .eq('month', menuData.month)
        .eq('year', menuData.year)
        .single();

    let result;

    if (existing) {
        // Update
        result = await db
            .from('mess_menus')
            .update({
                markdown_content: menuData.markdownContent,
                document_url: menuData.documentUrl || null,
                updated_at: new Date().toISOString()
            })
            .eq('id', existing.id)
            .select(`id, month, year, markdown_content, document_url, created_at, updated_at`)
            .single();
    } else {
        // Insert
        result = await db
            .from('mess_menus')
            .insert([{
                month: menuData.month,
                year: menuData.year,
                markdown_content: menuData.markdownContent,
                document_url: menuData.documentUrl || null
            }])
            .select(`id, month, year, markdown_content, document_url, created_at, updated_at`)
            .single();
    }

    if (result.error) throw new Error(`[upsertMessMenu] ${result.error.message}`);
    return result.data ? mapMessMenu(result.data) : null;
}

/**
 * Map database row to MessMenu type
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapMessMenu(row: any): MessMenu {
    return {
        id: row.id,
        month: row.month,
        year: row.year,
        markdownContent: row.markdown_content,
        documentUrl: row.document_url,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}
