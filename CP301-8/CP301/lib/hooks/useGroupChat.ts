// ============================================================
// lib/hooks/useGroupChat.ts
// Real-time group chat hook for WhatsApp-style community groups
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '@/lib/db';
import {
    getGroupMessages,
    sendGroupMessage,
    getGroupMemberRole,
    isGroupMember,
    joinGroup,
    leaveGroup,
    getCommunityGroups,
    getGroupMembers,
    type GroupMessage,
    type GroupMember,
    type CommunityGroup,
} from '@/lib/db/communityGroups';
import { useAuth } from '@/contexts/AuthContext';

export function useGroupChat(groupId: string | null) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<GroupMessage[]>([]);
    const [members, setMembers] = useState<GroupMember[]>([]);
    const [myRole, setMyRole] = useState<'member' | 'admin' | null>(null);
    const [isMember, setIsMember] = useState(false);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const oldestMsgIdRef = useRef<string | null>(null);

    const groupIdRef = useRef(groupId);
    useEffect(() => { groupIdRef.current = groupId; }, [groupId]);

    const loadMessages = useCallback(async (gid: string) => {
        const msgs = await getGroupMessages(gid, 30);
        const chronological = msgs.reverse();
        setMessages(chronological);
        setHasMore(msgs.length === 30);
        oldestMsgIdRef.current = chronological[0]?.createdAt ?? null;
    }, []);

    const loadMoreMessages = useCallback(async () => {
        if (!groupId || !hasMore || loadingMore || !oldestMsgIdRef.current) return;
        setLoadingMore(true);
        try {
            const olderMsgs = await getGroupMessages(groupId, 30, oldestMsgIdRef.current);
            const chronological = olderMsgs.reverse();
            setMessages(prev => [...chronological, ...prev]);
            setHasMore(olderMsgs.length === 30);
            if (chronological.length > 0) {
                oldestMsgIdRef.current = chronological[0].createdAt;
            }
        } finally {
            setLoadingMore(false);
        }
    }, [groupId, hasMore, loadingMore]);

    const loadGroupInfo = useCallback(async (gid: string, uid: string) => {
        const [role, memberStatus, memberList] = await Promise.all([
            getGroupMemberRole(gid, uid),
            isGroupMember(gid, uid),
            getGroupMembers(gid),
        ]);
        setMyRole(role);
        setIsMember(memberStatus);
        setMembers(memberList);
    }, []);

    useEffect(() => {
        if (!groupId || !user) return;
        setLoading(true);
        Promise.all([
            loadMessages(groupId),
            loadGroupInfo(groupId, user.id),
        ]).finally(() => setLoading(false));
    }, [groupId, user, loadMessages, loadGroupInfo]);

    // Realtime subscription
    useEffect(() => {
        if (!groupId || !user) return;
        const channel = db
            .channel(`group-chat-${groupId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'community_group_messages',
                filter: `group_id=eq.${groupId}`,
            }, () => {
                if (groupIdRef.current) loadMessages(groupIdRef.current);
            })
            .subscribe();
        return () => { db.removeChannel(channel); };
    }, [groupId, user, loadMessages]);

    const send = useCallback(async (content: string, replyToId?: string | null) => {
        if (!groupId || !user || !content.trim() || sending) return;
        setSending(true);
        try {
            await sendGroupMessage(groupId, user.id, content.trim(), replyToId);
            await loadMessages(groupId);
        } finally {
            setSending(false);
        }
    }, [groupId, user, sending, loadMessages]);

    const join = useCallback(async () => {
        if (!groupId || !user) return;
        await joinGroup(groupId, user.id);
        await loadGroupInfo(groupId, user.id);
    }, [groupId, user, loadGroupInfo]);

    const leave = useCallback(async () => {
        if (!groupId || !user) return;
        await leaveGroup(groupId, user.id);
        setIsMember(false);
        setMyRole(null);
    }, [groupId, user]);

    const refreshMembers = useCallback(async () => {
        if (!groupId || !user) return;
        await loadGroupInfo(groupId, user.id);
    }, [groupId, user, loadGroupInfo]);

    return { 
        messages, members, myRole, isMember, loading, sending, 
        send, join, leave, refreshMembers, 
        loadMoreMessages, hasMore, loadingMore 
    };
}

export function useCommunityGroups(communityId: string | null) {
    const [groups, setGroups] = useState<CommunityGroup[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        if (!communityId) { setGroups([]); setLoading(false); return; }
        setLoading(true);
        try {
            const data = await getCommunityGroups(communityId);
            setGroups(data);
        } finally {
            setLoading(false);
        }
    }, [communityId]);

    useEffect(() => { refresh(); }, [refresh]);

    return { groups, loading, refresh };
}
