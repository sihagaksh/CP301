// ============================================================
// lib/hooks/useGroupChat.ts
// Real-time group chat hook for WhatsApp-style community groups
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '@/lib/db';
import {
    getGroupMessages,
    getGroupMessagesBefore,
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

    const groupIdRef = useRef(groupId);
    useEffect(() => { groupIdRef.current = groupId; }, [groupId]);

    const messagesRef = useRef(messages);
    useEffect(() => { messagesRef.current = messages; }, [messages]);

    const membersRef = useRef(members);
    useEffect(() => { membersRef.current = members; }, [members]);

    const loadMessages = useCallback(async (gid: string, limit = 50) => {
        const msgs = await getGroupMessages(gid, limit);
        setMessages(msgs);
    }, []);

    const loadOlderMessages = useCallback(async (count = 50): Promise<boolean> => {
        if (!groupId) return false;
        const earliest = messagesRef.current[0]?.createdAt;
        if (!earliest) return false;
        const older = await getGroupMessagesBefore(groupId, earliest, count);
        if (!older || older.length === 0) return false;
        setMessages(prev => [...older, ...prev]);
        return older.length > 0;
    }, [groupId]);

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
            }, (payload: any) => {
                // Append new message from realtime payload to avoid full reloads.
                const row = payload?.new;
                if (!row) return;
                const newMsg: GroupMessage = {
                    id: row.id,
                    groupId: row.group_id,
                    senderId: row.sender_id,
                    content: row.content,
                    createdAt: row.created_at,
                } as GroupMessage;

                // Try to enrich sender info from current members cache
                const member = membersRef.current.find(m => m.user?.id === newMsg.senderId);
                if (member?.user) {
                    newMsg.sender = {
                        id: member.user.id,
                        fullName: member.user.fullName,
                        profilePictureUrl: member.user.profilePictureUrl,
                    };
                }

                setMessages(prev => {
                    if (prev.some(m => m.id === newMsg.id)) return prev;
                    const merged = [...prev, newMsg];
                    merged.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                    return merged;
                });
            })
            .subscribe();
        return () => { db.removeChannel(channel); };
    }, [groupId, user, loadMessages]);

    const send = useCallback(async (content: string) => {
        if (!groupId || !user || !content.trim() || sending) return;
        setSending(true);
        try {
            const msg = await sendGroupMessage(groupId, user.id, content.trim());
            if (msg) {
                setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
            }
        } finally {
            setSending(false);
        }
    }, [groupId, user, sending]);

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

    // Periodic reconciliation (fallback) — re-fetch latest messages occasionally.
    useEffect(() => {
        if (!groupId || !user) return;
        const t = setInterval(() => {
            if (groupIdRef.current) loadMessages(groupIdRef.current);
        }, 60_000);
        return () => clearInterval(t);
    }, [groupId, user, loadMessages]);

    return { messages, members, myRole, isMember, loading, sending, send, join, leave, refreshMembers, loadOlderMessages };
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
