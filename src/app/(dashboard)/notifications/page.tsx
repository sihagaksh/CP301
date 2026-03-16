'use client'

import { useState, useEffect } from 'react'
import { Bell, Check, CheckCheck, MessageCircle, Heart, Calendar, Megaphone, ShoppingBag, Trash2, LogIn, Users, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { Notification } from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'
import Link from 'next/link'

export default function NotificationsPage() {
    const { user, loading: authLoading } = useAuth()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        if (authLoading) return // Wait for auth to finish
        if (user) {
            loadNotifications()
        } else {
            setLoading(false)
        }
    }, [user, authLoading]) // eslint-disable-line react-hooks/exhaustive-deps

    async function loadNotifications() {
        try {
            setError(null)
            const { data, error: queryError } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user!.id)
                .order('created_at', { ascending: false })
                .limit(50)

            if (queryError) {
                console.error('Notifications query error:', queryError)
                setError('Failed to load notifications')
                setNotifications([])
            } else {
                setNotifications((data as Notification[]) || [])
            }
        } catch (err) {
            console.error('Notifications error:', err)
            setError('Failed to load notifications')
        } finally {
            setLoading(false)
        }
    }

    async function markRead(id: string) {
        await supabase.from('notifications').update({ is_read: true, read_at: new Date().toISOString() }).eq('id', id)
        setNotifications(ns => ns.map(n => n.id === id ? { ...n, is_read: true } : n))
    }

    async function markAllRead() {
        if (!user) return
        await supabase.from('notifications').update({ is_read: true, read_at: new Date().toISOString() }).eq('user_id', user.id).eq('is_read', false)
        setNotifications(ns => ns.map(n => ({ ...n, is_read: true })))
    }

    const typeIcon = (type: string) => {
        switch (type) {
            case 'comment': return <MessageCircle size={18} style={{ color: 'var(--blue-400)' }} />
            case 'like': return <Heart size={18} style={{ color: 'var(--accent-danger)' }} />
            case 'event': return <Calendar size={18} style={{ color: 'var(--accent-primary)' }} />
            case 'notice': return <Megaphone size={18} style={{ color: 'var(--accent-success)' }} />
            case 'marketplace': return <ShoppingBag size={18} style={{ color: 'var(--accent-purple)' }} />
            case 'club': return <Users size={18} style={{ color: 'var(--accent-primary)' }} />
            case 'governance': return <Shield size={18} style={{ color: 'var(--accent-primary)' }} />
            default: return <Bell size={18} style={{ color: 'var(--text-tertiary)' }} />
        }
    }

    // Show skeleton while auth is loading
    if (authLoading || (loading && user)) {
        return (
            <div className="page-container" style={{ maxWidth: 700, margin: '0 auto' }}>
                <div className="page-header">
                    <h1 className="page-title">🔔 Notifications</h1>
                </div>
                <div className="flex flex-col gap-3">{[1, 2, 3, 4, 5].map(i => <div key={i} className="glass-card-static"><div className="flex gap-3"><div className="skeleton skeleton-avatar" /><div style={{ flex: 1 }}><div className="skeleton skeleton-text" style={{ width: '70%' }} /><div className="skeleton skeleton-text" style={{ width: '40%' }} /></div></div></div>)}</div>
            </div>
        )
    }

    // Show sign-in prompt if not authenticated
    if (!user) {
        return (
            <div className="page-container" style={{ maxWidth: 700, margin: '0 auto' }}>
                <div className="glass-card-static empty-state">
                    <LogIn size={48} />
                    <h3>Please Sign In</h3>
                    <p>You need to be signed in to view your notifications.</p>
                    <Link href="/login" className="btn btn-primary" style={{ marginTop: 12 }}>Sign In</Link>
                </div>
            </div>
        )
    }

    // Show error state
    if (error) {
        return (
            <div className="page-container" style={{ maxWidth: 700, margin: '0 auto' }}>
                <div className="page-header">
                    <h1 className="page-title">🔔 Notifications</h1>
                </div>
                <div className="glass-card-static empty-state">
                    <Bell size={48} />
                    <h3>Something went wrong</h3>
                    <p>{error}</p>
                    <button className="btn btn-secondary" style={{ marginTop: 12 }} onClick={() => { setLoading(true); loadNotifications() }}>Try Again</button>
                </div>
            </div>
        )
    }

    const unreadCount = notifications.filter(n => !n.is_read).length

    return (
        <div className="page-container" style={{ maxWidth: 700, margin: '0 auto' }}>
            <div className="page-header">
                <div>
                    <h1 className="page-title">🔔 Notifications</h1>
                    <p className="page-subtitle">{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}</p>
                </div>
                {unreadCount > 0 && (
                    <button className="btn btn-secondary" onClick={markAllRead}><CheckCheck size={16} /> Mark all read</button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className="glass-card-static empty-state"><Bell size={48} /><h3>No Notifications</h3><p>You&apos;re all caught up! New notifications will appear here.</p></div>
            ) : (
                <div className="flex flex-col gap-2">
                    {notifications.map((n, i) => (
                        <div key={n.id} className={`glass-card animate-fade-in-up delay-${Math.min(i + 1, 6)}`} style={{ padding: '14px 18px', background: n.is_read ? 'var(--glass-bg)' : 'rgba(245,158,11,0.03)', borderColor: n.is_read ? undefined : 'rgba(245,158,11,0.15)', cursor: 'pointer' }} onClick={() => !n.is_read && markRead(n.id)}>
                            <div className="flex items-center gap-3">
                                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {typeIcon(n.type)}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p className="font-semibold" style={{ fontSize: '0.88rem', marginBottom: 2 }}>{n.title}</p>
                                    <p className="text-sm text-muted truncate">{n.message}</p>
                                </div>
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    <p className="text-xs text-muted">{format(new Date(n.created_at), 'MMM d')}</p>
                                    {!n.is_read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-primary)', marginLeft: 'auto', marginTop: 4 }} />}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

