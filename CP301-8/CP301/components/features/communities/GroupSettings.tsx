'use client';

import React, { useState } from 'react';
import { X, Shield, ShieldOff, UserMinus, UserPlus, Settings, Trash2, Megaphone, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { promoteToAdmin, demoteAdmin, removeGroupMember, updateGroupSettings, deleteGroup, addGroupMember } from '@/lib/db/communityGroups';
import type { CommunityGroup, GroupMember } from '@/lib/db/communityGroups';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/db';
import { getInitials } from '@/lib/utils';

interface GroupSettingsProps {
    group: CommunityGroup;
    members: GroupMember[];
    communityId: string;
    creatorId: string; // community original creator
    onClose: () => void;
    onUpdated: () => void;
}

export function GroupSettings({ group, members, communityId, creatorId, onClose, onUpdated }: GroupSettingsProps) {
    const { user } = useAuth();
    const [name, setName] = useState(group.name);
    const [description, setDescription] = useState(group.description || '');
    const [adminsOnly, setAdminsOnly] = useState(group.sendPermission === 'admins_only');
    const [saving, setSaving] = useState(false);
    const [addSearch, setAddSearch] = useState('');
    const [addResults, setAddResults] = useState<{ id: string; full_name: string; email: string; profile_picture_url?: string }[]>([]);
    const [searching, setSearching] = useState(false);
    const searchTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const isNoticeboard = group.type === 'notice_board';
    const myMember = members.find(m => m.userId === user?.id);
    const amAdmin = myMember?.role === 'admin' || creatorId === user?.id;

    async function saveSettings() {
        setSaving(true);
        try {
            await updateGroupSettings(group.id, {
                name,
                description,
                sendPermission: adminsOnly ? 'admins_only' : 'all_members',
            });
            onUpdated();
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    }

    async function handlePromote(userId: string) {
        await promoteToAdmin(group.id, userId);
        onUpdated();
    }

    async function handleDemote(userId: string) {
        await demoteAdmin(group.id, userId);
        onUpdated();
    }

    async function handleRemove(userId: string) {
        await removeGroupMember(group.id, userId);
        onUpdated();
    }

    async function handleDelete() {
        if (!confirm('Delete this group? All messages will be lost.')) return;
        await deleteGroup(group.id);
        onUpdated();
        onClose();
    }

    async function searchUsers(q: string) {
        if (!q.trim()) { setAddResults([]); return; }
        setSearching(true);
        const memberIds = members.map(m => m.userId);
        const { data } = await db
            .from('users')
            .select('id, full_name, email, profile_picture_url')
            .or(`full_name.ilike.%${q}%,email.ilike.%${q}%`)
            .limit(6);
        setAddResults((data || []).filter((u: { id: string }) => !memberIds.includes(u.id)));
        setSearching(false);
    }

    function onSearchChange(val: string) {
        setAddSearch(val);
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => searchUsers(val), 300);
    }

    async function handleAdd(u: { id: string; full_name: string; email: string }) {
        // First add to community if not already
        await db.from('community_members').insert([{ community_id: communityId, user_id: u.id, role: 'member' }]).maybeSingle();
        await addGroupMember(group.id, u.id, 'member');
        setAddSearch('');
        setAddResults([]);
        onUpdated();
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
                <div className="flex items-center gap-2">
                    {isNoticeboard ? <Megaphone className="w-4 h-4 text-amber-500" /> : <Settings className="w-4 h-4" />}
                    <h2 className="font-semibold text-sm">{isNoticeboard ? 'Notice Board Settings' : 'Group Settings'}</h2>
                </div>
                <button onClick={onClose} className="p-1 rounded hover:bg-accent transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {/* Name / Description */}
                {amAdmin && (
                    <div className="space-y-3">
                        <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Group Info</h3>
                        <Input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Group name"
                            disabled={isNoticeboard}
                        />
                        <Input
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Description (optional)"
                        />
                    </div>
                )}

                {/* Send Permission */}
                {amAdmin && (
                    <div className="space-y-3">
                        <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Permissions</h3>
                        <div className="flex items-center justify-between rounded-lg border border-border p-3 bg-card">
                            <Label htmlFor="admins-only" className="text-sm font-medium cursor-pointer">
                                <span className="block">Admins only can send</span>
                                <span className="text-xs text-muted-foreground font-normal">Non-admins can only read</span>
                            </Label>
                            <Switch
                                id="admins-only"
                                checked={adminsOnly}
                                onCheckedChange={setAdminsOnly}
                            />
                        </div>
                    </div>
                )}

                {/* Add Members */}
                {amAdmin && (
                    <div className="space-y-2">
                        <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Add Member</h3>
                        <Input
                            value={addSearch}
                            onChange={e => onSearchChange(e.target.value)}
                            placeholder="Search by name or email…"
                        />
                        {searching && <p className="text-xs text-muted-foreground px-1">Searching…</p>}
                        {addResults.map(r => (
                            <div key={r.id} className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-accent transition-colors">
                                <Avatar className="h-7 w-7 flex-shrink-0">
                                    <AvatarImage src={r.profile_picture_url} />
                                    <AvatarFallback className="text-[10px]">{getInitials(r.full_name)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{r.full_name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{r.email}</p>
                                </div>
                                <Button size="sm" variant="outline" className="h-7 text-xs shrink-0" onClick={() => handleAdd(r)}>
                                    <UserPlus className="w-3 h-3 mr-1" /> Add
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Members list */}
                <div className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" /> Members ({members.length})
                    </h3>
                    {members.map(m => {
                        const isCreator = m.userId === creatorId;
                        const isMe = m.userId === user?.id;
                        return (
                            <div key={m.id} className="flex items-center gap-2.5 py-1.5">
                                <Avatar className="h-8 w-8 flex-shrink-0">
                                    <AvatarImage src={m.user?.profilePictureUrl} />
                                    <AvatarFallback className="text-[10px]">{getInitials(m.user?.fullName || '?')}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">
                                        {m.user?.fullName} {isMe && <span className="text-muted-foreground font-normal">(you)</span>}
                                    </p>
                                    {m.role === 'admin' && (
                                        <Badge variant="outline" className="text-[9px] h-4 border-amber-300 text-amber-600 dark:text-amber-400">Admin</Badge>
                                    )}
                                </div>
                                {amAdmin && !isMe && (
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        {m.role === 'member' ? (
                                            <button onClick={() => handlePromote(m.userId)} title="Make admin" className="p-1 rounded hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-600 transition-colors">
                                                <Shield className="w-3.5 h-3.5" />
                                            </button>
                                        ) : !isCreator && (
                                            <button onClick={() => handleDemote(m.userId)} title="Remove admin" className="p-1 rounded hover:bg-muted text-muted-foreground transition-colors">
                                                <ShieldOff className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                        {!isCreator && (
                                            <button onClick={() => handleRemove(m.userId)} title="Remove from group" className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors">
                                                <UserMinus className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Footer */}
            {amAdmin && (
                <div className="p-4 border-t border-border space-y-2 flex-shrink-0">
                    <Button onClick={saveSettings} disabled={saving} className="w-full" size="sm">
                        {saving ? 'Saving…' : 'Save Changes'}
                    </Button>
                    {!isNoticeboard && (
                        <Button onClick={handleDelete} variant="destructive" size="sm" className="w-full">
                            <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete Group
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
