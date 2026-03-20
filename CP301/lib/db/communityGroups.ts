// ============================================================
// lib/db/communityGroups.ts
// Database queries for Community Groups (WhatsApp-style)
// ============================================================

import { db } from './client';

export interface CommunityGroup {
    id: string;
    communityId: string;
    name: string;
    description?: string;
    type: 'notice_board' | 'group';
    sendPermission: 'all_members' | 'admins_only';
    createdBy: string;
    memberCount: number;
    iconUrl?: string;
    createdAt: string;
    updatedAt: string;
}

export interface GroupMember {
    id: string;
    groupId: string;
    userId: string;
    role: 'member' | 'admin';
    joinedAt: string;
    user?: {
        id: string;
        fullName: string;
        email: string;
        role: string;
        profilePictureUrl?: string;
    };
}

export interface GroupMessage {
    id: string;
    groupId: string;
    senderId: string;
    content: string;
    createdAt: string;
    sender?: {
        id: string;
        fullName: string;
        profilePictureUrl?: string;
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapGroup(row: any): CommunityGroup {
    return {
        id: row.id,
        communityId: row.community_id,
        name: row.name,
        description: row.description,
        type: row.type,
        sendPermission: row.send_permission,
        createdBy: row.created_by,
        memberCount: row.member_count || 0,
        iconUrl: row.icon_url,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapMember(row: any): GroupMember {
    return {
        id: row.id,
        groupId: row.group_id,
        userId: row.user_id,
        role: row.role,
        joinedAt: row.joined_at,
        user: row.user ? {
            id: row.user.id,
            fullName: row.user.full_name,
            email: row.user.email,
            role: row.user.role,
            profilePictureUrl: row.user.profile_picture_url,
        } : undefined,
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapMessage(row: any): GroupMessage {
    return {
        id: row.id,
        groupId: row.group_id,
        senderId: row.sender_id,
        content: row.content,
        createdAt: row.created_at,
        sender: row.sender ? {
            id: row.sender.id,
            fullName: row.sender.full_name,
            profilePictureUrl: row.sender.profile_picture_url,
        } : undefined,
    };
}

/** Get all groups for a community */
export async function getCommunityGroups(communityId: string): Promise<CommunityGroup[]> {
    const { data, error } = await db
        .from('community_groups')
        .select('*')
        .eq('community_id', communityId)
        .order('type', { ascending: false }) // notice_board first (alphabetically)
        .order('created_at', { ascending: true });

    if (error) {
        console.warn('[getCommunityGroups]', error.message);
        return [];
    }
    return (data ?? []).map(mapGroup);
}

/** Create a new group under a community */
export async function createCommunityGroup(params: {
    communityId: string;
    name: string;
    description?: string;
    type: 'notice_board' | 'group';
    sendPermission: 'all_members' | 'admins_only';
    createdBy: string;
}): Promise<CommunityGroup | null> {
    const { data, error } = await db
        .from('community_groups')
        .insert([{
            community_id: params.communityId,
            name: params.name,
            description: params.description || null,
            type: params.type,
            send_permission: params.sendPermission,
            created_by: params.createdBy,
        }])
        .select('*')
        .single();

    if (error) throw new Error(`[createCommunityGroup] ${error.message}`);
    return data ? mapGroup(data) : null;
}

/** Update group settings (name, description, send_permission) */
export async function updateGroupSettings(
    groupId: string,
    updates: { name?: string; description?: string; sendPermission?: 'all_members' | 'admins_only' }
): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: Record<string, any> = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.sendPermission !== undefined) payload.send_permission = updates.sendPermission;

    const { error } = await db.from('community_groups').update(payload).eq('id', groupId);
    if (error) throw new Error(`[updateGroupSettings] ${error.message}`);
}

/** Delete a group (notice_board cannot be deleted) */
export async function deleteGroup(groupId: string): Promise<void> {
    const { error } = await db.from('community_groups').delete().eq('id', groupId);
    if (error) throw new Error(`[deleteGroup] ${error.message}`);
}

/** Get members of a group */
export async function getGroupMembers(groupId: string): Promise<GroupMember[]> {
    const { data, error } = await db
        .from('community_group_members')
        .select(`
            id, group_id, user_id, role, joined_at,
            user:users!community_group_members_user_id_fkey(id, full_name, email, role, profile_picture_url)
        `)
        .eq('group_id', groupId)
        .order('joined_at', { ascending: true });

    if (error) {
        console.warn('[getGroupMembers]', error.message);
        return [];
    }
    return (data ?? []).map(mapMember);
}

/** Check if a user is a member of a group */
export async function isGroupMember(groupId: string, userId: string): Promise<boolean> {
    const { data } = await db
        .from('community_group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .maybeSingle();
    return !!data;
}

/** Get a user's role in a group */
export async function getGroupMemberRole(groupId: string, userId: string): Promise<'member' | 'admin' | null> {
    const { data } = await db
        .from('community_group_members')
        .select('role')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .maybeSingle();
    return data?.role as 'member' | 'admin' | null;
}

/** Join a group */
export async function joinGroup(groupId: string, userId: string): Promise<void> {
    const { error } = await db
        .from('community_group_members')
        .insert([{ group_id: groupId, user_id: userId, role: 'member' }]);
    if (error && error.code !== '23505') throw new Error(`[joinGroup] ${error.message}`);
}

/** Add a specific user to a group (admin action) */
export async function addGroupMember(groupId: string, userId: string, role: 'member' | 'admin' = 'member'): Promise<void> {
    const { error } = await db
        .from('community_group_members')
        .insert([{ group_id: groupId, user_id: userId, role }]);
    if (error && error.code !== '23505') throw new Error(`[addGroupMember] ${error.message}`);
}

/** Leave a group */
export async function leaveGroup(groupId: string, userId: string): Promise<void> {
    const { error } = await db
        .from('community_group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId);
    if (error) throw new Error(`[leaveGroup] ${error.message}`);
}

/** Remove a member from a group (admin action — uses service-side delete) */
export async function removeGroupMember(groupId: string, userId: string): Promise<void> {
    // Uses the user's own delete policy — only works if current user IS the target.
    // For admin removal of others, this requires the admin RLS update on community_group_members.
    // For now we rely on the admin having been given delete access via the policy above.
    const { error } = await db
        .from('community_group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId);
    if (error) throw new Error(`[removeGroupMember] ${error.message}`);
}

/** Promote a member to admin */
export async function promoteToAdmin(groupId: string, userId: string): Promise<void> {
    const { error } = await db
        .from('community_group_members')
        .update({ role: 'admin' })
        .eq('group_id', groupId)
        .eq('user_id', userId);
    if (error) throw new Error(`[promoteToAdmin] ${error.message}`);
}

/** Demote an admin to member */
export async function demoteAdmin(groupId: string, userId: string): Promise<void> {
    const { error } = await db
        .from('community_group_members')
        .update({ role: 'member' })
        .eq('group_id', groupId)
        .eq('user_id', userId);
    if (error) throw new Error(`[demoteAdmin] ${error.message}`);
}

/** Get messages in a group */
export async function getGroupMessages(groupId: string, limit = 100): Promise<GroupMessage[]> {
    const { data, error } = await db
        .from('community_group_messages')
        .select(`
            id, group_id, sender_id, content, created_at,
            sender:users!community_group_messages_sender_id_fkey(id, full_name, profile_picture_url)
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: true })
        .limit(limit);

    if (error) {
        console.warn('[getGroupMessages]', error.message);
        return [];
    }
    return (data ?? []).map(mapMessage);
}

/** Send a message to a group */
export async function sendGroupMessage(groupId: string, senderId: string, content: string): Promise<GroupMessage | null> {
    const { data, error } = await db
        .from('community_group_messages')
        .insert([{ group_id: groupId, sender_id: senderId, content }])
        .select(`
            id, group_id, sender_id, content, created_at,
            sender:users!community_group_messages_sender_id_fkey(id, full_name, profile_picture_url)
        `)
        .single();

    if (error) throw new Error(`[sendGroupMessage] ${error.message}`);
    return data ? mapMessage(data) : null;
}
