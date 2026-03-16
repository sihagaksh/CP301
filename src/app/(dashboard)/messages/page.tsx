'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { MessageCircle, Search, Send, User, X, Plus, Check, CheckCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { format, isToday, isYesterday } from 'date-fns'

interface UserResult {
    id: string
    full_name: string
    email: string
    role: string
    department?: string
    profile_picture_url?: string
}

interface Conversation {
    id: string
    participant: UserResult
    last_message?: string
    last_message_at?: string
    last_message_sender_id?: string
    unread_count: number
    last_message_is_read: boolean
}

interface Message {
    id: string
    sender_id: string
    receiver_id: string
    content: string
    created_at: string
    is_read: boolean
}

function formatTime(dateStr: string) {
    const d = new Date(dateStr)
    if (isToday(d)) return format(d, 'HH:mm')
    if (isYesterday(d)) return 'Yesterday'
    return format(d, 'MMM d')
}

export default function MessagesPage() {
    const { user } = useAuth()
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [activeConv, setActiveConv] = useState<Conversation | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [convSearch, setConvSearch] = useState('')   // search within existing conversations
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)

    // New conversation flow
    const [showNewChat, setShowNewChat] = useState(false)
    const [userSearch, setUserSearch] = useState('')
    const [userResults, setUserResults] = useState<UserResult[]>([])
    const [searching, setSearching] = useState(false)

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const userSearchRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // Stable refs so intervals/subscriptions always read the latest values
    const userRef = useRef(user)
    useEffect(() => { userRef.current = user }, [user])
    const activeConvRef = useRef(activeConv)
    useEffect(() => { activeConvRef.current = activeConv }, [activeConv])

    const supabase = createClient()

    // ── Stable data-fetching helpers (use refs, safe to call from intervals/subscriptions) ──

    const fetchConversations = useCallback(async () => {
        const u = userRef.current
        if (!u) return

        const { data } = await supabase
            .from('conversations')
            .select('*, participant1:users!conversations_participant1_id_fkey(id, full_name, email, profile_picture_url, role, department), participant2:users!conversations_participant2_id_fkey(id, full_name, email, profile_picture_url, role, department)')
            .or(`participant1_id.eq.${u.id},participant2_id.eq.${u.id}`)
            .order('last_message_at', { ascending: false, nullsFirst: false })

        // Compute unread counts from messages (source of truth)
        const { data: myUnreadData } = await supabase
            .from('messages')
            .select('conversation_id')
            .eq('receiver_id', u.id)
            .eq('is_read', false)

        const myUnreadMap: Record<string, number> = {}
        ;(myUnreadData || []).forEach((m: { conversation_id: string }) => {
            myUnreadMap[m.conversation_id] = (myUnreadMap[m.conversation_id] || 0) + 1
        })

        // Check which of my sent messages are still unread (for tick display)
        const { data: sentUnreadData } = await supabase
            .from('messages')
            .select('conversation_id')
            .eq('sender_id', u.id)
            .eq('is_read', false)

        const sentUnreadMap: Record<string, number> = {}
        ;(sentUnreadData || []).forEach((m: { conversation_id: string }) => {
            sentUnreadMap[m.conversation_id] = (sentUnreadMap[m.conversation_id] || 0) + 1
        })

        const convs: Conversation[] = (data || []).map((c: Record<string, unknown>) => {
            const p1 = c.participant1 as UserResult
            const p2 = c.participant2 as UserResult
            const other = p1.id === u.id ? p2 : p1
            const convId = c.id as string
            return {
                id: convId,
                participant: other,
                last_message: c.last_message as string,
                last_message_at: c.last_message_at as string,
                last_message_sender_id: c.last_message_sender_id as string | undefined,
                unread_count: myUnreadMap[convId] || 0,
                last_message_is_read: (sentUnreadMap[convId] || 0) === 0,
            }
        })
        setConversations(convs)
        setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchMessages = useCallback(async (convId: string, scroll = true) => {
        const { data } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', convId)
            .order('created_at', { ascending: true })
            .limit(100)

        setMessages((data as Message[]) || [])
        if (scroll) {
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const markAsRead = useCallback(async (convId: string) => {
        const u = userRef.current
        if (!u) return
        await supabase.from('messages')
            .update({ is_read: true })
            .eq('conversation_id', convId)
            .eq('receiver_id', u.id)
            .eq('is_read', false)
        setConversations(prev => prev.map(c =>
            c.id === convId ? { ...c, unread_count: 0 } : c
        ))
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // ── Initial load ──
    useEffect(() => {
        if (user) fetchConversations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])

    // ── Supabase real-time subscription for messages table ──
    useEffect(() => {
        if (!user) return

        const channel = supabase
            .channel('messages-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'messages' },
                () => {
                    // Any INSERT or UPDATE on messages → refresh conversations (unread counts, last msg, ticks)
                    fetchConversations()
                    // If a chat is open, refresh its messages too
                    const conv = activeConvRef.current
                    if (conv) {
                        fetchMessages(conv.id, false)
                    }
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'conversations' },
                () => {
                    fetchConversations()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])

    // ── When active conversation changes, mark messages as read ──
    useEffect(() => {
        if (activeConv && user) {
            markAsRead(activeConv.id)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeConv?.id])

    // Debounced user search
    useEffect(() => {
        if (userSearchRef.current) clearTimeout(userSearchRef.current)
        if (!userSearch.trim()) { setUserResults([]); return }
        setSearching(true)
        userSearchRef.current = setTimeout(() => doUserSearch(userSearch.trim()), 350)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userSearch])

    async function doUserSearch(query: string) {
        if (!user) return
        const { data } = await supabase
            .from('users')
            .select('id, full_name, email, role, department, profile_picture_url')
            .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
            .neq('id', user.id)
            .limit(8)

        setUserResults((data as UserResult[]) || [])
        setSearching(false)
    }

    async function openConversationWith(other: UserResult) {
        if (!user) return
        // Check if conversation already exists
        const { data: existing } = await supabase
            .from('conversations')
            .select('id')
            .or(
                `and(participant1_id.eq.${user.id},participant2_id.eq.${other.id}),and(participant1_id.eq.${other.id},participant2_id.eq.${user.id})`
            )
            .maybeSingle()

        let convId: string
        if (existing) {
            convId = existing.id
        } else {
            const { data: created } = await supabase
                .from('conversations')
                .insert({ participant1_id: user.id, participant2_id: other.id })
                .select('id')
                .single()
            convId = created!.id
        }

        const conv: Conversation = {
            id: convId,
            participant: other,
            last_message: undefined,
            last_message_at: undefined,
            last_message_sender_id: undefined,
            unread_count: 0,
            last_message_is_read: true,
        }

        setActiveConv(conv)
        setShowNewChat(false)
        setUserSearch('')
        setUserResults([])
        fetchMessages(convId)
        fetchConversations()
    }

    async function sendMessage(e: React.FormEvent) {
        e.preventDefault()
        if (!newMessage.trim() || !user || !activeConv || sending) return
        setSending(true)

        const content = newMessage.trim()
        setNewMessage('')

        await supabase.from('messages').insert({
            conversation_id: activeConv.id,
            sender_id: user.id,
            receiver_id: activeConv.participant.id,
            content,
        })

        // Update conversation last_message
        await supabase.from('conversations').update({
            last_message: content,
            last_message_at: new Date().toISOString(),
            last_message_sender_id: user.id,
        }).eq('id', activeConv.id)

        // Real-time subscription will auto-refresh, but we also fetch immediately for snappy UX
        await fetchMessages(activeConv.id)
        fetchConversations()
        setSending(false)
    }

    const getInitials = (name?: string) =>
        name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'

    const filteredConvs = convSearch.trim()
        ? conversations.filter(c =>
            c.participant.full_name.toLowerCase().includes(convSearch.toLowerCase()) ||
            c.participant.email.toLowerCase().includes(convSearch.toLowerCase()))
        : conversations

    if (!user) {
        return (
            <div className="page-container">
                <div className="empty-state"><User size={48} /><h3>Please sign in</h3></div>
            </div>
        )
    }

    // .main-content already handles sidebar offset and header padding-top (64px).
    // This page renders full-height without the standard page-container padding.
    const OUTER: React.CSSProperties = {
        height: 'calc(100vh - var(--header-height))',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 24px 16px',
        overflow: 'hidden',
        boxSizing: 'border-box',
    }

    return (
        <div style={OUTER}>
            {/* Page heading */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexShrink: 0 }}>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 700 }}>💬 Messages</h1>
                <button className="btn btn-primary btn-sm" onClick={() => { setShowNewChat(true); setUserSearch('') }}>
                    <Plus size={15} /> New Message
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 0, flex: 1, border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', background: 'var(--glass-bg)', minHeight: 0, alignItems: 'stretch' }}>

                {/* ── Left: Conversation List ─────────────────────────────── */}
                <div style={{ borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                    {/* Search existing convs */}
                    <div style={{ padding: '12px 12px 8px' }}>
                        <div className="search-bar" style={{ margin: 0 }}>
                            <Search size={15} />
                            <input
                                placeholder="Search conversations..."
                                value={convSearch}
                                onChange={e => setConvSearch(e.target.value)}
                                style={{ padding: '7px 0', fontSize: '0.84rem' }}
                            />
                            {convSearch && (
                                <button onClick={() => setConvSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', display: 'flex', padding: 2 }}>
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* List */}
                    <div style={{ flex: 1, overflow: 'auto', padding: '0 6px 8px' }}>
                        {loading ? (
                            [1, 2, 3].map(i => (
                                <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 8px', alignItems: 'center' }}>
                                    <div className="skeleton skeleton-avatar" style={{ width: 36, height: 36, minWidth: 36 }} />
                                    <div style={{ flex: 1 }}>
                                        <div className="skeleton skeleton-text" style={{ width: '60%' }} />
                                        <div className="skeleton skeleton-text" style={{ width: '80%', marginTop: 4 }} />
                                    </div>
                                </div>
                            ))
                        ) : filteredConvs.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-tertiary)' }}>
                                <MessageCircle size={36} style={{ margin: '0 auto 8px' }} />
                                <p style={{ fontSize: '0.82rem' }}>{convSearch ? 'No matches' : 'No conversations yet'}</p>
                                <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => setShowNewChat(true)}>
                                    Start a chat
                                </button>
                            </div>
                        ) : (
                            filteredConvs.map(conv => (
                                <div
                                    key={conv.id}
                                    onClick={() => { setActiveConv(conv); fetchMessages(conv.id); markAsRead(conv.id); setShowNewChat(false) }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px',
                                        borderRadius: 10, cursor: 'pointer',
                                        background: activeConv?.id === conv.id ? 'rgba(245,158,11,0.1)' : 'transparent',
                                        borderLeft: activeConv?.id === conv.id ? '3px solid var(--accent-primary)' : '3px solid transparent',
                                        transition: 'background 0.15s',
                                    }}
                                >
                                    <div className="avatar avatar-sm" style={{ minWidth: 36 }}>
                                        {conv.participant.profile_picture_url
                                            ? <img src={conv.participant.profile_picture_url} alt={conv.participant.full_name} />
                                            : getInitials(conv.participant.full_name)}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                            <p style={{ fontWeight: conv.unread_count > 0 ? 700 : 600, fontSize: '0.84rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{conv.participant.full_name}</p>
                                            {conv.last_message_at && (
                                                <span style={{ fontSize: '0.7rem', color: conv.unread_count > 0 ? '#25d366' : 'var(--text-tertiary)', marginLeft: 6, flexShrink: 0, fontWeight: conv.unread_count > 0 ? 600 : 400 }}>
                                                    {formatTime(conv.last_message_at)}
                                                </span>
                                            )}
                                        </div>
                                        <p style={{ fontSize: '0.75rem', color: conv.unread_count > 0 ? 'var(--text-primary)' : 'var(--text-tertiary)', fontWeight: conv.unread_count > 0 ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                                            {conv.last_message_sender_id === user.id && conv.last_message && (
                                                conv.last_message_is_read
                                                    ? <CheckCheck size={14} style={{ color: '#53bdeb', flexShrink: 0 }} />
                                                    : <Check size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                                            )}
                                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {conv.last_message || <span style={{ fontStyle: 'italic' }}>No messages yet</span>}
                                            </span>
                                        </p>
                                    </div>
                                    {conv.unread_count > 0 && (
                                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 20, height: 20, borderRadius: 99, background: '#25d366', color: '#fff', fontSize: '0.68rem', fontWeight: 700, padding: '0 5px', boxShadow: '0 1px 3px rgba(37,211,102,0.3)' }}>
                                            {conv.unread_count}
                                        </span>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* ── Right: Chat Area or New Chat ───────────────────────── */}
                <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                    {/* New Chat Modal (inline) */}
                    {showNewChat ? (
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: 24, overflow: 'hidden' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <h2 style={{ fontSize: '1.05rem', fontWeight: 600 }}>New Message</h2>
                                <button className="btn btn-ghost btn-sm" onClick={() => setShowNewChat(false)}><X size={18} /></button>
                            </div>

                            {/* Search bar for users */}
                            <div style={{ position: 'relative', marginBottom: 8 }}>
                                <div className="search-bar" style={{ margin: 0 }}>
                                    <Search size={16} />
                                    <input
                                        autoFocus
                                        placeholder="Search by name or email..."
                                        value={userSearch}
                                        onChange={e => setUserSearch(e.target.value)}
                                        style={{ padding: '9px 0', fontSize: '0.9rem' }}
                                    />
                                    {userSearch && (
                                        <button onClick={() => { setUserSearch(''); setUserResults([]) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', display: 'flex', padding: 2 }}>
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 6, paddingLeft: 4 }}>
                                    Type a name or email to find someone
                                </p>
                            </div>

                            {/* Results */}
                            <div style={{ flex: 1, overflow: 'auto' }}>
                                {searching && (
                                    <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                                        Searching...
                                    </div>
                                )}
                                {!searching && userSearch && userResults.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-tertiary)' }}>
                                        <User size={36} style={{ margin: '0 auto 10px' }} />
                                        <p style={{ fontSize: '0.85rem' }}>No users found for "{userSearch}"</p>
                                    </div>
                                )}
                                {!searching && !userSearch && (
                                    <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-tertiary)' }}>
                                        <Search size={36} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
                                        <p style={{ fontSize: '0.85rem' }}>Start typing to search for a person</p>
                                    </div>
                                )}
                                {userResults.map(result => (
                                    <div
                                        key={result.id}
                                        onClick={() => openConversationWith(result)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px',
                                            borderRadius: 12, cursor: 'pointer', marginBottom: 4,
                                            border: '1px solid var(--glass-border)',
                                            background: 'var(--bg-secondary)',
                                            transition: 'background 0.15s, border-color 0.15s',
                                        }}
                                        onMouseEnter={e => {
                                            (e.currentTarget as HTMLElement).style.background = 'rgba(245,158,11,0.07)'
                                            ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,158,11,0.3)'
                                        }}
                                        onMouseLeave={e => {
                                            (e.currentTarget as HTMLElement).style.background = 'var(--bg-secondary)'
                                            ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--glass-border)'
                                        }}
                                    >
                                        <div className="avatar" style={{ minWidth: 44, fontSize: '1rem' }}>
                                            {result.profile_picture_url
                                                ? <img src={result.profile_picture_url} alt={result.full_name} />
                                                : getInitials(result.full_name)}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            {/* Primary: full name */}
                                            <p style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: 2 }}>
                                                {result.full_name}
                                            </p>
                                            {/* Secondary: email — key disambiguation factor */}
                                            <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {result.email}
                                            </p>
                                            {/* Tertiary: role + department */}
                                            <p style={{ fontSize: '0.72rem', marginTop: 1 }}>
                                                <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>{result.role}</span>
                                                {result.department && (
                                                    <span style={{ color: 'var(--text-tertiary)', marginLeft: 6 }}>{result.department}</span>
                                                )}
                                            </p>
                                        </div>
                                        <div style={{ color: 'var(--accent-primary)', opacity: 0.7, flexShrink: 0 }}>
                                            <MessageCircle size={20} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : activeConv ? (
                        /* ── Active conversation ── */
                        <>
                            {/* Chat Header */}
                            <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                                <div className="avatar avatar-sm">
                                    {activeConv.participant.profile_picture_url
                                        ? <img src={activeConv.participant.profile_picture_url} alt={activeConv.participant.full_name} />
                                        : getInitials(activeConv.participant.full_name)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{activeConv.participant.full_name}</p>
                                    <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                                        {activeConv.participant.email} · {activeConv.participant.role}
                                        {activeConv.participant.department ? ` · ${activeConv.participant.department}` : ''}
                                    </p>
                                </div>
                                <button
                                    onClick={() => { setActiveConv(null); setMessages([]) }}
                                    title="Close chat"
                                    style={{ background: 'none', border: '1px solid var(--glass-border)', borderRadius: 8, cursor: 'pointer', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, flexShrink: 0, transition: 'color 0.15s, border-color 0.15s' }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--text-tertiary)' }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--glass-border)' }}
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Messages */}
                            <div style={{ flex: 1, overflow: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 6, minHeight: 0 }}>
                                {messages.length === 0 ? (
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8, color: 'var(--text-tertiary)' }}>
                                        <MessageCircle size={40} style={{ opacity: 0.4 }} />
                                        <p style={{ fontSize: '0.85rem' }}>No messages yet — say hello! 👋</p>
                                    </div>
                                ) : (
                                    messages.map(msg => {
                                        const isMine = msg.sender_id === user.id
                                        return (
                                            <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 6 }}>
                                                {!isMine && (
                                                    <div className="avatar" style={{ width: 24, height: 24, minWidth: 24, fontSize: '0.6rem', flexShrink: 0 }}>
                                                        {activeConv.participant.profile_picture_url
                                                            ? <img src={activeConv.participant.profile_picture_url} alt="" />
                                                            : getInitials(activeConv.participant.full_name)}
                                                    </div>
                                                )}
                                                <div style={{ maxWidth: '68%' }}>
                                                    <div style={{
                                                        padding: '9px 13px',
                                                        borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                                        background: isMine ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                                                        border: `1px solid ${isMine ? 'transparent' : 'var(--glass-border)'}`,
                                                        color: isMine ? '#000' : 'var(--text-primary)',
                                                    }}>
                                                        <p style={{ fontSize: '0.88rem', lineHeight: 1.5 }}>{msg.content}</p>
                                                    </div>
                                                    <p style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginTop: 3, textAlign: isMine ? 'right' : 'left', paddingLeft: isMine ? 0 : 4, paddingRight: isMine ? 4 : 0 }}>
                                                        {format(new Date(msg.created_at), 'HH:mm')}
                                                        {isMine && (
                                                            <span style={{ marginLeft: 4, display: 'inline-flex', alignItems: 'center' }}>
                                                                {msg.is_read ? <CheckCheck size={13} style={{ color: '#53bdeb' }} /> : <Check size={13} style={{ color: 'var(--text-tertiary)' }} />}
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <form onSubmit={sendMessage} style={{ padding: '10px 14px', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: 10, flexShrink: 0 }}>
                                <input
                                    style={{ flex: 1, padding: '10px 14px', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: 24, color: 'var(--text-primary)', fontSize: '0.88rem', fontFamily: 'inherit', outline: 'none' }}
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ borderRadius: '50%', width: 42, height: 42, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                                    disabled={!newMessage.trim() || sending}
                                >
                                    <Send size={17} />
                                </button>
                            </form>
                        </>
                    ) : (
                        /* ── Empty state ── */
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: 'var(--text-tertiary)', padding: 40 }}>
                            <MessageCircle size={56} style={{ opacity: 0.25 }} />
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 6 }}>Your messages</p>
                                <p style={{ fontSize: '0.83rem' }}>Select a conversation or start a new one</p>
                            </div>
                            <button className="btn btn-primary" onClick={() => setShowNewChat(true)}>
                                <Plus size={16} /> New Message
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
