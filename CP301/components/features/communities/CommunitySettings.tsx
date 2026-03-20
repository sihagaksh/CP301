'use client';

import React, { useState } from 'react';
import { X, Plus, Trash2, Globe, Lock, Settings2, Megaphone, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { db } from '@/lib/db';
import { createCommunityGroup } from '@/lib/db/communityGroups';
import type { CommunityGroup } from '@/lib/db/communityGroups';
import type { Community, CommunityMember } from '@/lib/types';
import { getInitials } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface CommunitySettingsProps {
    community: Community;
    groups: CommunityGroup[];
    members: CommunityMember[];
    onClose: () => void;
    onUpdated: () => void;
    onDeleted: () => void;
}

export function CommunitySettings({ community, groups, members, onClose, onUpdated, onDeleted }: CommunitySettingsProps) {
    const { user } = useAuth();
    const [saving, setSaving] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupDesc, setNewGroupDesc] = useState('');
    const [newGroupAdminsOnly, setNewGroupAdminsOnly] = useState(false);
    const [creatingGroup, setCreatingGroup] = useState(false);
    const [showNewGroup, setShowNewGroup] = useState(false);

    const amAdmin = community.creatorId === user?.id ||
        members.some(m => m.userId === user?.id && m.role === 'admin');

    async function handleRemoveMember(userId: string) {
        if (!confirm('Remove this member from the community?')) return;
        await db.from('community_members').delete()
            .eq('community_id', community.id)
            .eq('user_id', userId);
        onUpdated();
    }

    async function handlePromoteMember(userId: string) {
        await db.from('community_members').update({ role: 'admin' })
            .eq('community_id', community.id)
            .eq('user_id', userId);
        onUpdated();
    }

    async function handleDemoteMember(userId: string) {
        await db.from('community_members').update({ role: 'member' })
            .eq('community_id', community.id)
            .eq('user_id', userId);
        onUpdated();
    }

    async function createGroup() {
        if (!newGroupName.trim() || !user) return;
        setCreatingGroup(true);
        try {
            await createCommunityGroup({
                communityId: community.id,
                name: newGroupName.trim(),
                description: newGroupDesc.trim() || undefined,
                type: 'group',
                sendPermission: newGroupAdminsOnly ? 'admins_only' : 'all_members',
                createdBy: user.id,
            });
            // Add creator as admin of new group
            const { data: newGrp } = await db
                .from('community_groups')
                .select('id')
                .eq('community_id', community.id)
                .eq('name', newGroupName.trim())
                .order('created_at', { ascending: false })
                .limit(1)
                .single();
            if (newGrp) {
                await db.from('community_group_members').insert([{ group_id: newGrp.id, user_id: user.id, role: 'admin' }]).maybeSingle();
            }
            setNewGroupName('');
            setNewGroupDesc('');
            setNewGroupAdminsOnly(false);
            setShowNewGroup(false);
            onUpdated();
        } finally {
            setCreatingGroup(false);
        }
    }

    async function deleteCommunity() {
        if (!confirm('Delete this entire community? This action cannot be undone.')) return;
        setSaving(true);
        await db.from('communities').delete().eq('id', community.id);
        setSaving(false);
        onDeleted(); // clear page state + refresh list
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
                <div className="flex items-center gap-2">
                    <Settings2 className="w-4 h-4" />
                    <h2 className="font-semibold text-sm">Community Settings</h2>
                </div>
                <button onClick={onClose} className="p-1 rounded hover:bg-accent transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Community Info */}
                <div className="space-y-1">
                    <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Community</h3>
                    <div className="p-3 rounded-lg border border-border bg-card">
                        <p className="font-semibold text-foreground">{community.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{community.description || 'No description'}</p>
                        <div className="flex items-center gap-2 mt-2">
                            {community.isPublic
                                ? <Badge variant="secondary" className="text-[10px] gap-1"><Globe className="w-2.5 h-2.5" />Public</Badge>
                                : <Badge variant="outline" className="text-[10px] gap-1 border-yellow-300 text-yellow-700"><Lock className="w-2.5 h-2.5" />Private</Badge>
                            }
                            <Badge variant="outline" className="text-[10px] gap-1"><Users className="w-2.5 h-2.5" />{community.memberCount} members</Badge>
                        </div>
                    </div>
                </div>

                {/* Groups Overview */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Groups</h3>
                        {amAdmin && (
                            <button onClick={() => setShowNewGroup(v => !v)}
                                className="text-xs text-amber-500 hover:text-amber-600 font-medium flex items-center gap-1 transition-colors">
                                <Plus className="w-3.5 h-3.5" /> New Group
                            </button>
                        )}
                    </div>

                    {showNewGroup && (
                        <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10 space-y-2">
                            <Input value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="Group name" className="h-8 text-sm" />
                            <Input value={newGroupDesc} onChange={e => setNewGroupDesc(e.target.value)} placeholder="Description (optional)" className="h-8 text-sm" />
                            <div className="flex items-center gap-2">
                                <Switch id="ng-admins" checked={newGroupAdminsOnly} onCheckedChange={setNewGroupAdminsOnly} />
                                <Label htmlFor="ng-admins" className="text-xs cursor-pointer">Admins only can send</Label>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" className="h-7 text-xs" onClick={createGroup} disabled={creatingGroup || !newGroupName.trim()}>
                                    {creatingGroup ? 'Creating…' : 'Create'}
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowNewGroup(false)}>Cancel</Button>
                            </div>
                        </div>
                    )}

                    {groups.map(g => (
                        <div key={g.id} className="flex items-center gap-2.5 p-2 rounded-lg border border-border bg-card">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0
                                ${g.type === 'notice_board' ? 'bg-amber-500' : 'bg-indigo-500'}`}>
                                {g.type === 'notice_board' ? <Megaphone className="w-3.5 h-3.5" /> : g.name[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{g.name}</p>
                                <p className="text-[10px] text-muted-foreground">{g.memberCount} members · {g.sendPermission === 'admins_only' ? 'Admins only' : 'All members'} can send</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Members */}
                <div className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Members ({members.length})</h3>
                    {members.map(m => {
                        const isCreator = m.userId === community.creatorId;
                        const isMe = m.userId === user?.id;
                        return (
                            <div key={m.id} className="flex items-center gap-2.5 py-1">
                                <Avatar className="h-7 w-7 flex-shrink-0">
                                    <AvatarImage src={m.user?.profilePictureUrl} />
                                    <AvatarFallback className="text-[9px]">{getInitials(m.user?.fullName || '?')}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{m.user?.fullName} {isMe && '(you)'}</p>
                                    {m.role === 'admin' && <Badge variant="outline" className="text-[9px] h-3.5 border-amber-300 text-amber-600">Admin</Badge>}
                                </div>
                                {amAdmin && !isMe && !isCreator && (
                                    <div className="flex gap-1">
                                        <button onClick={() => m.role === 'admin' ? handleDemoteMember(m.userId) : handlePromoteMember(m.userId)}
                                            className="text-[10px] text-amber-600 hover:underline">
                                            {m.role === 'admin' ? 'Demote' : 'Make admin'}
                                        </button>
                                        <span className="text-muted-foreground">·</span>
                                        <button onClick={() => handleRemoveMember(m.userId)}
                                            className="text-[10px] text-red-500 hover:underline">Remove</button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Danger zone */}
                {community.creatorId === user?.id && (
                    <div className="pt-2 border-t border-red-200 dark:border-red-900">
                        <Button variant="destructive" size="sm" className="w-full" onClick={deleteCommunity} disabled={saving}>
                            <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete Community
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
