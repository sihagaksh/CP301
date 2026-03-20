'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
    Users, PlusCircle, Search, Megaphone, ChevronRight, Settings2,
    Globe, Lock, Loader2, ArrowLeft, UserPlus, Check
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { db } from '@/lib/db';
import { getCommunities } from '@/lib/db/communities';
import { getCommunityGroups } from '@/lib/db/communityGroups';
import { getCommunityMembers } from '@/lib/db/communities';
import { GroupChat } from '@/components/features/communities/GroupChat';
import { CommunitySettings } from '@/components/features/communities/CommunitySettings';
import { useAuth } from '@/contexts/AuthContext';
import { getInitials } from '@/lib/utils';
import Link from 'next/link';
import type { Community, CommunityMember } from '@/lib/types';
import type { CommunityGroup } from '@/lib/db/communityGroups';

type Panel = 'communities' | 'groups' | 'chat';

export default function CommunitiesPage() {
    const { user } = useAuth();

    // Panel state (mobile-friendly: only one panel visible at a time)
    const [panel, setPanel] = useState<Panel>('communities');

    // Data
    const [allCommunities, setAllCommunities] = useState<Community[]>([]);
    const [myCommunities, setMyCommunities] = useState<Community[]>([]);
    const [discoverList, setDiscoverList] = useState<Community[]>([]);
    const [search, setSearch] = useState('');
    const [tab, setTab] = useState<'mine' | 'discover'>('mine');
    const [loadingComm, setLoadingComm] = useState(true);

    // Selected state
    const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
    const [communityGroups, setCommunityGroups] = useState<CommunityGroup[]>([]);
    const [communityMembers, setCommunityMembers] = useState<CommunityMember[]>([]);
    const [loadingGroups, setLoadingGroups] = useState(false);
    const [showCommSettings, setShowCommSettings] = useState(false);

    // Selected group for chat
    const [selectedGroup, setSelectedGroup] = useState<CommunityGroup | null>(null);

    // Community membership tracking
    const [myMemberships, setMyMemberships] = useState<Set<string>>(new Set());
    const [joiningId, setJoiningId] = useState<string | null>(null);

    const fetchCommunities = useCallback(async () => {
        if (!user) return;
        setLoadingComm(true);
        try {
            // Get all communities
            const result = await getCommunities({ limit: 50 });
            setAllCommunities(result.data);

            // Get my memberships
            const { data: myMems } = await db
                .from('community_members')
                .select('community_id')
                .eq('user_id', user.id);
            const ids = new Set((myMems || []).map((m: { community_id: string }) => m.community_id));
            setMyMemberships(ids);

            // Split
            const mine = result.data.filter(c => ids.has(c.id));
            const discover = result.data.filter(c => !ids.has(c.id));
            setMyCommunities(mine);
            setDiscoverList(discover);
        } finally {
            setLoadingComm(false);
        }
    }, [user]);

    useEffect(() => { fetchCommunities(); }, [fetchCommunities]);

    const selectCommunity = useCallback(async (community: Community) => {
        setSelectedCommunity(community);
        setSelectedGroup(null);
        setShowCommSettings(false);
        setPanel('groups');
        setLoadingGroups(true);
        try {
            const [groups, members] = await Promise.all([
                getCommunityGroups(community.id),
                getCommunityMembers(community.id),
            ]);
            setCommunityGroups(groups);
            setCommunityMembers(members);
            // Auto-select notice board
            const nb = groups.find(g => g.type === 'notice_board');
            if (nb) { 
                setSelectedGroup(nb);
                // We do NOT setPanel('chat') here so mobile users see the groups list first.
                // Desktop users will still see the chat on the right panel automatically.
            }
        } finally {
            setLoadingGroups(false);
        }
    }, []);

    const selectGroup = useCallback((group: CommunityGroup) => {
        setSelectedGroup(group);
        setShowCommSettings(false);
        setPanel('chat');
    }, []);

    const joinCommunity = useCallback(async (community: Community) => {
        if (!user) return;
        setJoiningId(community.id);
        try {
            await db.from('community_members').insert([{
                community_id: community.id,
                user_id: user.id,
                role: 'member',
            }]).maybeSingle();
            // Also join all groups
            const groups = await getCommunityGroups(community.id);
            for (const g of groups) {
                await db.from('community_group_members').insert([{
                    group_id: g.id,
                    user_id: user.id,
                    role: 'member',
                }]).maybeSingle();
            }
            await fetchCommunities();
            selectCommunity(community);
        } finally {
            setJoiningId(null);
        }
    }, [user, fetchCommunities, selectCommunity]);

    const refreshCommunityData = useCallback(async () => {
        if (!selectedCommunity) return;
        const [groups, members] = await Promise.all([
            getCommunityGroups(selectedCommunity.id),
            getCommunityMembers(selectedCommunity.id),
        ]);
        setCommunityGroups(groups);
        setCommunityMembers(members);
        await fetchCommunities();
    }, [selectedCommunity, fetchCommunities]);

    // Called after community is deleted — clears all selected state and refreshes list
    const handleCommunityDeleted = useCallback(async () => {
        setSelectedCommunity(null);
        setSelectedGroup(null);
        setCommunityGroups([]);
        setCommunityMembers([]);
        setShowCommSettings(false);
        setPanel('communities');
        await fetchCommunities();
    }, [fetchCommunities]);

    const listToShow = tab === 'mine' ? myCommunities : discoverList;
    const filtered = listToShow.filter(c =>
        !search || c.name.toLowerCase().includes(search.toLowerCase())
    );

    const isMember = selectedCommunity ? myMemberships.has(selectedCommunity.id) : false;
    const isAdmin = selectedCommunity
        ? (selectedCommunity.creatorId === user?.id ||
            communityMembers.some(m => m.userId === user?.id && m.role === 'admin'))
        : false;

    return (
        <div className="flex h-[calc(100vh-120px)] gap-0 rounded-xl overflow-hidden border border-border bg-card shadow-sm">

            {/* ============================================================
                LEFT PANEL: Communities List
            ============================================================ */}
            <div className={`
                w-full md:w-[260px] flex-shrink-0 flex flex-col border-r border-border bg-card
                ${panel !== 'communities' ? 'hidden md:flex' : 'flex'}
            `}>
                {/* Header */}
                <div className="p-3 border-b border-border flex-shrink-0">
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="font-bold text-base">Communities</h1>
                        <Button asChild size="sm" variant="ghost" className="h-7 px-2 text-amber-500 hover:text-amber-600">
                            <Link href="/communities/create"><PlusCircle className="w-4 h-4" /></Link>
                        </Button>
                    </div>
                    {/* Tab bar */}
                    <div className="flex gap-1 mb-2">
                        {(['mine', 'discover'] as const).map(t => (
                            <button key={t} onClick={() => setTab(t)}
                                className={`flex-1 text-xs font-medium py-1.5 rounded-lg transition-colors
                                    ${tab === t ? 'bg-amber-500 text-white' : 'hover:bg-accent text-muted-foreground'}`}>
                                {t === 'mine' ? 'My Communities' : 'Discover'}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5">
                        <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                        <input
                            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                            placeholder="Search…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Community list */}
                <div className="flex-1 overflow-y-auto p-1.5">
                    {loadingComm ? (
                        <div className="flex justify-center py-8"><Loader2 className="animate-spin w-5 h-5 text-muted-foreground" /></div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p className="text-xs">{tab === 'mine' ? 'Not in any community yet' : 'No communities to discover'}</p>
                            {tab === 'mine' && (
                                <button onClick={() => setTab('discover')} className="mt-1 text-xs text-amber-500 hover:underline">Browse communities</button>
                            )}
                        </div>
                    ) : (
                        filtered.map(community => (
                            <button
                                key={community.id}
                                onClick={() => selectCommunity(community)}
                                className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-colors mb-0.5
                                    ${selectedCommunity?.id === community.id
                                        ? 'bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-700'
                                        : 'hover:bg-accent border border-transparent'}`}
                            >
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm"
                                    style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
                                    {community.name[0].toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-foreground truncate">{community.name}</p>
                                    <p className="text-[10px] text-muted-foreground">{community.memberCount} members</p>
                                </div>
                                {!myMemberships.has(community.id) && (
                                    <Badge variant="secondary" className="text-[9px] shrink-0">Join</Badge>
                                )}
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* ============================================================
                MIDDLE PANEL: Groups List
            ============================================================ */}
            <div className={`
                w-full md:w-[240px] flex-shrink-0 flex flex-col border-r border-border bg-background/50
                ${panel === 'groups' ? 'flex' : panel === 'communities' ? 'hidden md:flex' : 'hidden md:flex'}
            `}>
                {!selectedCommunity ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground p-6">
                        <Users className="w-10 h-10 opacity-20" />
                        <p className="text-sm text-center">Select a community to see its groups</p>
                    </div>
                ) : showCommSettings ? (
                    <CommunitySettings
                        community={selectedCommunity}
                        groups={communityGroups}
                        members={communityMembers}
                        onClose={() => setShowCommSettings(false)}
                        onUpdated={refreshCommunityData}
                        onDeleted={handleCommunityDeleted}
                    />
                ) : (
                    <>
                        {/* Community header */}
                        <div className="p-3 border-b border-border flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <button onClick={() => { setSelectedCommunity(null); setPanel('communities'); }}
                                    className="p-1 rounded hover:bg-accent transition-colors text-muted-foreground md:hidden">
                                    <ArrowLeft className="w-4 h-4" />
                                </button>
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                                    style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
                                    {selectedCommunity.name[0].toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold truncate">{selectedCommunity.name}</p>
                                    <p className="text-[10px] text-muted-foreground">{selectedCommunity.memberCount} members</p>
                                </div>
                                {isAdmin && (
                                    <button onClick={() => { setShowCommSettings(true); setPanel('groups'); }}
                                        className="p-1 rounded hover:bg-accent transition-colors text-muted-foreground flex-shrink-0">
                                        <Settings2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Join button if not member */}
                            {!isMember && (
                                <button
                                    onClick={() => joinCommunity(selectedCommunity)}
                                    disabled={joiningId === selectedCommunity.id}
                                    className="mt-2 w-full flex items-center justify-center gap-1.5 text-xs bg-green-500 hover:bg-green-600 text-white py-1.5 rounded-lg font-medium transition-colors disabled:opacity-60">
                                    {joiningId === selectedCommunity.id
                                        ? <Loader2 className="w-3 h-3 animate-spin" />
                                        : <UserPlus className="w-3.5 h-3.5" />}
                                    {joiningId === selectedCommunity.id ? 'Joining…' : 'Join Community'}
                                </button>
                            )}
                        </div>

                        {/* Visibility + description */}
                        <div className="px-3 py-2 border-b border-border flex-shrink-0">
                            <div className="flex items-center gap-1.5 mb-1">
                                {selectedCommunity.isPublic
                                    ? <><Globe className="w-3 h-3 text-muted-foreground" /><span className="text-[10px] text-muted-foreground">Public community</span></>
                                    : <><Lock className="w-3 h-3 text-muted-foreground" /><span className="text-[10px] text-muted-foreground">Private community</span></>
                                }
                                {isMember && <><span className="text-muted-foreground">·</span><Check className="w-3 h-3 text-green-500" /><span className="text-[10px] text-green-600 dark:text-green-400">Joined</span></>}
                            </div>
                            {selectedCommunity.description && (
                                <p className="text-[11px] text-muted-foreground line-clamp-2">{selectedCommunity.description}</p>
                            )}
                        </div>

                        {/* Groups */}
                        <div className="flex-1 overflow-y-auto p-2">
                            {loadingGroups ? (
                                <div className="flex justify-center py-6"><Loader2 className="animate-spin w-5 h-5 text-muted-foreground" /></div>
                            ) : communityGroups.length === 0 ? (
                                <div className="text-center text-xs text-muted-foreground py-8">No groups yet</div>
                            ) : (
                                <>
                                    {/* Notice board first */}
                                    {communityGroups.filter(g => g.type === 'notice_board').map(g => (
                                        <GroupItem key={g.id} group={g} isSelected={selectedGroup?.id === g.id} onClick={() => selectGroup(g)} />
                                    ))}
                                    {communityGroups.filter(g => g.type === 'group').length > 0 && (
                                        <>
                                            <p className="text-[9px] font-bold uppercase text-muted-foreground tracking-wider px-2 mt-3 mb-1">Groups</p>
                                            {communityGroups.filter(g => g.type === 'group').map(g => (
                                                <GroupItem key={g.id} group={g} isSelected={selectedGroup?.id === g.id} onClick={() => selectGroup(g)} />
                                            ))}
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* ============================================================
                RIGHT PANEL: Group Chat
            ============================================================ */}
            <div className={`
                flex-1 flex flex-col min-w-0
                ${panel === 'chat' ? 'flex' : 'hidden md:flex'}
            `}>
                {selectedGroup && selectedCommunity ? (
                    <GroupChat
                        group={selectedGroup}
                        communityId={selectedCommunity.id}
                        communityCreatorId={selectedCommunity.creatorId}
                        onBack={() => setPanel('groups')}
                    />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground p-8">
                        <div className="w-20 h-20 rounded-3xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#f59e0b20,#d97706)' }}>
                            <Megaphone className="w-9 h-9 text-amber-500" />
                        </div>
                        <div className="text-center">
                            <p className="font-semibold text-base text-foreground mb-1">Communities</p>
                            <p className="text-sm">Select a community and group to start chatting</p>
                        </div>
                        <Button asChild variant="outline" size="sm">
                            <Link href="/communities/create"><PlusCircle className="w-4 h-4 mr-1.5" />Create Community</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

function GroupItem({ group, isSelected, onClick }: { group: CommunityGroup; isSelected: boolean; onClick: () => void }) {
    const isNoticeboard = group.type === 'notice_board';
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-xl text-left transition-colors mb-0.5
                ${isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-700'
                    : 'hover:bg-accent border border-transparent'
                }`}
        >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0
                ${isNoticeboard ? 'bg-amber-500' : 'bg-indigo-500'}`}>
                {isNoticeboard ? <Megaphone className="w-3.5 h-3.5" /> : group.name[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{group.name}</p>
                <p className="text-[10px] text-muted-foreground">
                    {group.memberCount} members · {group.sendPermission === 'admins_only' ? '🔒 Admins only' : '👥 All members'}
                </p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        </button>
    );
}
