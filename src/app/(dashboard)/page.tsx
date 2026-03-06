'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart, MessageCircle, Share2, TrendingUp, BookOpen, Calendar, Megaphone, ShoppingBag, Users, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'

interface FeedItem {
    id: string
    content: string
    media_urls?: string[]
    source_type?: string
    source_id?: string
    like_count: number
    comment_count: number
    created_at: string
    author?: {
        id: string
        full_name: string
        role: string
        profile_picture_url?: string
        department?: string
    }
}

export default function FeedPage() {
    const { user } = useAuth()
    const [feedItems, setFeedItems] = useState<FeedItem[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        loadFeed()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    async function loadFeed() {
        const { data } = await supabase
            .from('feed_posts')
            .select('*, author:users(id, full_name, role, profile_picture_url, department)')
            .order('created_at', { ascending: false })
            .limit(20)

        setFeedItems(data || [])
        setLoading(false)
    }

    const quickActions = [
        { label: 'Write Blog', href: '/blogs/create', icon: BookOpen, color: 'gold' },
        { label: 'Sell Item', href: '/marketplace/create', icon: ShoppingBag, color: 'blue' },
        { label: 'Events', href: '/events', icon: Calendar, color: 'purple' },
        { label: 'Communities', href: '/communities', icon: Users, color: 'green' },
    ]

    const getSourceIcon = (type?: string) => {
        switch (type) {
            case 'blog': return <BookOpen size={14} />
            case 'event': return <Calendar size={14} />
            case 'notice': return <Megaphone size={14} />
            default: return <Sparkles size={14} />
        }
    }

    const getInitials = (name?: string) =>
        name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'

    return (
        <div className="page-container">
            {/* Welcome Header */}
            <div className="feed-welcome glass-card-static" style={{ marginBottom: 24, padding: 28, background: 'var(--gradient-card)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)' }} />
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>
                    Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}! 👋
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Stay connected with the IIT Ropar community
                </p>
            </div>

            {/* Quick Actions */}
            <div className="grid-4" style={{ marginBottom: 28 }}>
                {quickActions.map((action) => (
                    <Link key={action.href} href={action.href} className="no-underline">
                        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
                            <div className={`stat-icon ${action.color}`}>
                                <action.icon size={22} />
                            </div>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                                {action.label}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
                {/* Main Feed */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 style={{ fontSize: '1.15rem', fontWeight: 600 }}>
                            <TrendingUp size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8, color: 'var(--accent-primary)' }} />
                            Activity Feed
                        </h2>
                    </div>

                    {loading ? (
                        <div className="flex flex-col gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="glass-card-static">
                                    <div className="flex gap-3 mb-4">
                                        <div className="skeleton skeleton-avatar" />
                                        <div style={{ flex: 1 }}>
                                            <div className="skeleton skeleton-text" style={{ width: '40%' }} />
                                            <div className="skeleton skeleton-text" style={{ width: '25%' }} />
                                        </div>
                                    </div>
                                    <div className="skeleton skeleton-text" />
                                    <div className="skeleton skeleton-text" style={{ width: '80%' }} />
                                </div>
                            ))}
                        </div>
                    ) : feedItems.length === 0 ? (
                        <div className="glass-card-static empty-state">
                            <Sparkles size={48} />
                            <h3>Your Feed is Empty</h3>
                            <p>Join communities, follow events, and connect with your peers to see activity here.</p>
                            <Link href="/communities" className="btn btn-primary" style={{ marginTop: 16 }}>
                                Explore Communities
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {feedItems.map((item) => (
                                <div key={item.id} className="glass-card animate-fade-in-up">
                                    <div className="flex gap-3" style={{ marginBottom: 12 }}>
                                        <div className="avatar">
                                            {item.author?.profile_picture_url ? (
                                                <img src={item.author.profile_picture_url} alt={item.author.full_name} />
                                            ) : (
                                                getInitials(item.author?.full_name)
                                            )}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold" style={{ fontSize: '0.9rem' }}>
                                                    {item.author?.full_name || 'Unknown User'}
                                                </span>
                                                <span className="badge badge-neutral" style={{ fontSize: '0.6rem' }}>
                                                    {item.author?.role}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted" style={{ marginTop: 2 }}>
                                                {getSourceIcon(item.source_type)}
                                                <span>{item.source_type || 'post'}</span>
                                                <span>•</span>
                                                <span>{format(new Date(item.created_at), 'MMM d, yyyy')}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                        {item.content}
                                    </p>
                                    {item.media_urls && item.media_urls.length > 0 && (
                                        <div style={{ marginTop: 12, borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                                            <img src={item.media_urls[0]} alt="" style={{ width: '100%', maxHeight: 300, objectFit: 'cover' }} />
                                        </div>
                                    )}
                                    <div className="flex items-center gap-4" style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--glass-border)' }}>
                                        <button className="btn btn-ghost btn-sm">
                                            <Heart size={16} /> {item.like_count}
                                        </button>
                                        <button className="btn btn-ghost btn-sm">
                                            <MessageCircle size={16} /> {item.comment_count}
                                        </button>
                                        <button className="btn btn-ghost btn-sm">
                                            <Share2 size={16} /> Share
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="feed-sidebar">
                    {/* Trending Section */}
                    <div className="glass-card-static" style={{ marginBottom: 20 }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 14 }}>
                            🔥 Trending
                        </h3>
                        <div className="flex flex-col gap-3">
                            {['Placement Season Updates', 'Campus Map Expansion', 'New Club Registrations', 'Upcoming ISMP Events'].map((topic, i) => (
                                <div key={i} className="flex items-center gap-3" style={{ fontSize: '0.85rem' }}>
                                    <span style={{ color: 'var(--text-tertiary)', fontWeight: 600, fontSize: '0.75rem' }}>#{i + 1}</span>
                                    <span style={{ color: 'var(--text-secondary)' }}>{topic}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="glass-card-static">
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 14 }}>
                            📊 Community Stats
                        </h3>
                        <div className="flex flex-col gap-3">
                            {[
                                { label: 'Active Members', value: '2.5K+' },
                                { label: 'Blogs Published', value: '340+' },
                                { label: 'Items Listed', value: '128' },
                                { label: 'Events This Month', value: '12' },
                            ].map((stat, i) => (
                                <div key={i} className="flex items-center justify-between" style={{ fontSize: '0.85rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>{stat.label}</span>
                                    <span className="font-semibold text-gold">{stat.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        @media (max-width: 1024px) {
          .feed-sidebar {
            display: none;
          }
        }
      `}</style>
        </div>
    )
}
