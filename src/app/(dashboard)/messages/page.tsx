'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, Search, Send, User, ArrowLeft, Plus, Circle } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'

interface Conversation {
    id: string
    participant: { id: string; full_name: string; profile_picture_url?: string; role: string }
    last_message?: string
    last_message_at?: string
    unread_count: number
}

interface Message {
    id: string
    sender_id: string
    content: string
    created_at: string
    is_read: boolean
}

export default function MessagesPage() {
    const { user } = useAuth()
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [activeConv, setActiveConv] = useState<Conversation | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(true)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    useEffect(() => { if (user) loadConversations() }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

    async function loadConversations() {
        const { data } = await supabase
            .from('conversations')
            .select('*, participant1:users!conversations_participant1_id_fkey(id, full_name, profile_picture_url, role), participant2:users!conversations_participant2_id_fkey(id, full_name, profile_picture_url, role)')
            .or(`participant1_id.eq.${user!.id},participant2_id.eq.${user!.id}`)
            .order('last_message_at', { ascending: false })

        const convs: Conversation[] = (data || []).map((c: Record<string, unknown>) => {
            const p1 = c.participant1 as { id: string; full_name: string; profile_picture_url?: string; role: string }
            const p2 = c.participant2 as { id: string; full_name: string; profile_picture_url?: string; role: string }
            const other = p1.id === user!.id ? p2 : p1
            return { id: c.id as string, participant: other, last_message: c.last_message as string, last_message_at: c.last_message_at as string, unread_count: (c.unread_count as number) || 0 }
        })
        setConversations(convs)
        setLoading(false)
    }

    async function loadMessages(convId: string) {
        const { data } = await supabase.from('messages').select('*').eq('conversation_id', convId).order('created_at', { ascending: true }).limit(100)
        setMessages((data as Message[]) || [])
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    }

    async function sendMessage(e: React.FormEvent) {
        e.preventDefault()
        if (!newMessage.trim() || !user || !activeConv) return
        await supabase.from('messages').insert({ conversation_id: activeConv.id, sender_id: user.id, receiver_id: activeConv.participant.id, content: newMessage.trim() })
        setNewMessage('')
        loadMessages(activeConv.id)
    }

    const getInitials = (name?: string) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
    const filteredConvs = searchQuery ? conversations.filter(c => c.participant.full_name.toLowerCase().includes(searchQuery.toLowerCase())) : conversations

    return (
        <div className="page-container" style={{ height: 'calc(100vh - var(--header-height) - 48px)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: activeConv ? '300px 1fr' : '1fr', gap: 0, height: '100%', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', background: 'var(--glass-bg)' }}>
                {/* Conversation List */}
                <div style={{ borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ padding: 16, borderBottom: '1px solid var(--glass-border)' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 12 }}>💬 Messages</h2>
                        <div className="search-bar" style={{ marginBottom: 0 }}><Search size={16} /><input placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ padding: '8px 0' }} /></div>
                    </div>
                    <div style={{ flex: 1, overflow: 'auto', padding: 8 }}>
                        {loading ? (
                            [1, 2, 3].map(i => <div key={i} style={{ padding: 12 }}><div className="skeleton skeleton-text" /></div>)
                        ) : filteredConvs.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}><MessageCircle size={32} /><p className="text-sm mt-2">No conversations</p></div>
                        ) : (
                            filteredConvs.map(conv => (
                                <div key={conv.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 'var(--radius-md)', cursor: 'pointer', background: activeConv?.id === conv.id ? 'rgba(245,158,11,0.08)' : 'transparent', transition: 'background 0.15s' }} onClick={() => { setActiveConv(conv); loadMessages(conv.id) }} onMouseEnter={e => { if (activeConv?.id !== conv.id) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)' }} onMouseLeave={e => { if (activeConv?.id !== conv.id) (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                                    <div className="avatar avatar-sm">{getInitials(conv.participant.full_name)}</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p className="font-semibold truncate" style={{ fontSize: '0.85rem' }}>{conv.participant.full_name}</p>
                                        {conv.last_message && <p className="text-xs text-muted truncate">{conv.last_message}</p>}
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        {conv.last_message_at && <p className="text-xs text-muted">{format(new Date(conv.last_message_at), 'HH:mm')}</p>}
                                        {conv.unread_count > 0 && <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, borderRadius: '50%', background: 'var(--accent-primary)', color: '#000', fontSize: '0.65rem', fontWeight: 700, marginTop: 2 }}>{conv.unread_count}</span>}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                {activeConv ? (
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        {/* Chat Header */}
                        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div className="avatar avatar-sm">{getInitials(activeConv.participant.full_name)}</div>
                            <div><p className="font-semibold" style={{ fontSize: '0.9rem' }}>{activeConv.participant.full_name}</p><p className="text-xs text-muted">{activeConv.participant.role}</p></div>
                        </div>
                        {/* Messages */}
                        <div style={{ flex: 1, overflow: 'auto', padding: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {messages.length === 0 ? (
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}><p className="text-sm">Start a conversation</p></div>
                            ) : (
                                messages.map(msg => {
                                    const isMine = msg.sender_id === user?.id
                                    return (
                                        <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                                            <div style={{ maxWidth: '70%', padding: '10px 14px', borderRadius: isMine ? '14px 14px 4px 14px' : '14px 14px 14px 4px', background: isMine ? 'rgba(245,158,11,0.15)' : 'var(--bg-tertiary)', border: `1px solid ${isMine ? 'rgba(245,158,11,0.2)' : 'var(--glass-border)'}` }}>
                                                <p style={{ fontSize: '0.88rem', lineHeight: 1.5 }}>{msg.content}</p>
                                                <p className="text-xs text-muted" style={{ marginTop: 4, textAlign: 'right' }}>{format(new Date(msg.created_at), 'HH:mm')}</p>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        {/* Input */}
                        <form onSubmit={sendMessage} style={{ padding: '12px 18px', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: 10 }}>
                            <input style={{ flex: 1, padding: '10px 14px', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '0.88rem', fontFamily: 'inherit', outline: 'none' }} placeholder="Type a message..." value={newMessage} onChange={e => setNewMessage(e.target.value)} />
                            <button type="submit" className="btn btn-primary"><Send size={16} /></button>
                        </form>
                    </div>
                ) : !loading && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-tertiary)' }}>
                        <div className="text-center"><MessageCircle size={48} /><p className="text-sm mt-2">Select a conversation to start chatting</p></div>
                    </div>
                )}
            </div>
        </div>
    )
}
