'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Send, Loader2, Settings, LogIn, LogOut, Lock, Megaphone, ChevronLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format, isToday, isYesterday } from 'date-fns';
import { useGroupChat } from '@/lib/hooks/useGroupChat';
import { GroupSettings } from './GroupSettings';
import type { CommunityGroup } from '@/lib/db/communityGroups';
import { useAuth } from '@/contexts/AuthContext';
import { getInitials } from '@/lib/utils';

function formatMsgTime(dateStr: string) {
    const d = new Date(dateStr);
    if (isToday(d)) return format(d, 'HH:mm');
    if (isYesterday(d)) return `Yesterday ${format(d, 'HH:mm')}`;
    return format(d, 'MMM d, HH:mm');
}

interface GroupChatProps {
    group: CommunityGroup;
    communityId: string;
    communityCreatorId: string;
    onBack?: () => void;
}

export function GroupChat({ group, communityId, communityCreatorId, onBack }: GroupChatProps) {
    const { user } = useAuth();
    const { messages, members, myRole, isMember, loading, sending, send, join, leave, refreshMembers } = useGroupChat(group.id);
    const [input, setInput] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length]);

    const isNoticeboard = group.type === 'notice_board';
    const canSend = isMember && (group.sendPermission === 'all_members' || myRole === 'admin');
    const amAdmin = myRole === 'admin' || communityCreatorId === user?.id;

    async function handleSend(e: React.FormEvent) {
        e.preventDefault();
        if (!input.trim()) return;
        await send(input);
        setInput('');
    }

    function handleSettingsUpdated() {
        refreshMembers();
        setShowSettings(false);
    }

    if (showSettings) {
        return (
            <div className="h-full">
                <GroupSettings
                    group={group}
                    members={members}
                    communityId={communityId}
                    creatorId={communityCreatorId}
                    onClose={() => setShowSettings(false)}
                    onUpdated={handleSettingsUpdated}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border bg-card flex-shrink-0">
                {onBack && (
                    <button onClick={onBack} className="p-1 rounded hover:bg-accent transition-colors text-muted-foreground md:hidden">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                )}
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ background: isNoticeboard ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                    {isNoticeboard ? <Megaphone className="w-4 h-4" /> : group.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground">{group.name}</p>
                    <p className="text-xs text-muted-foreground">{group.memberCount} members</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                    {!isMember && (
                        <button onClick={join}
                            className="flex items-center gap-1 text-xs bg-green-500 hover:bg-green-600 text-white px-2.5 py-1.5 rounded-lg font-medium transition-colors">
                            <LogIn className="w-3.5 h-3.5" /> Join
                        </button>
                    )}
                    {isMember && !amAdmin && (
                        <button onClick={leave}
                            className="flex items-center gap-1 text-xs border border-border hover:bg-accent text-muted-foreground px-2.5 py-1.5 rounded-lg transition-colors">
                            <LogOut className="w-3.5 h-3.5" /> Leave
                        </button>
                    )}
                    {amAdmin && (
                        <button onClick={() => setShowSettings(true)}
                            className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground">
                            <Settings className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2 min-h-0">
                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        {isNoticeboard ? <Megaphone className="w-10 h-10 opacity-20" /> : <span className="text-3xl">💬</span>}
                        <p className="text-sm">{isNoticeboard ? 'No announcements yet' : 'No messages yet — say hi! 👋'}</p>
                    </div>
                ) : (
                    messages.map(msg => {
                        const isMine = msg.senderId === user?.id;
                        return (
                            <div key={msg.id} className={`flex gap-2 items-end ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                                {!isMine && (
                                    <Avatar className="h-6 w-6 flex-shrink-0 mb-0.5">
                                        <AvatarImage src={msg.sender?.profilePictureUrl} />
                                        <AvatarFallback className="text-[9px]">{getInitials(msg.sender?.fullName || '?')}</AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={`max-w-[65%] ${isMine ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                                    {!isMine && (
                                        <span className="text-[10px] text-muted-foreground font-medium px-1">{msg.sender?.fullName}</span>
                                    )}
                                    <div className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed break-words
                                        ${isMine
                                            ? 'bg-amber-500 text-white rounded-br-sm'
                                            : 'bg-muted text-foreground rounded-bl-sm border border-border'
                                        }`}>
                                        {msg.content}
                                    </div>
                                    <span className="text-[10px] text-muted-foreground px-1">
                                        {formatMsgTime(msg.createdAt)}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={endRef} />
            </div>

            {/* Input */}
            <div className="flex-shrink-0 border-t border-border p-3 bg-card">
                {!isMember ? (
                    <div className="flex items-center justify-center gap-2 py-2 text-muted-foreground text-sm">
                        <LogIn className="w-4 h-4" />
                        <span>Join the group to participate in the conversation</span>
                    </div>
                ) : !canSend ? (
                    <div className="flex items-center justify-center gap-2 py-2 text-muted-foreground text-sm">
                        <Lock className="w-4 h-4" />
                        <span>Only admins can send messages here</span>
                    </div>
                ) : (
                    <form onSubmit={handleSend} className="flex gap-2">
                        <input
                            className="flex-1 bg-muted border border-border rounded-full px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-amber-400 transition-shadow"
                            placeholder={isNoticeboard ? 'Write an announcement…' : 'Type a message…'}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || sending}
                            className="w-9 h-9 rounded-full bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center flex-shrink-0 disabled:opacity-50 transition-colors"
                        >
                            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
