'use client'

import { useState, useEffect } from 'react'
import { Megaphone, Search, AlertTriangle, Info, Clock, Pin, Filter } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { Notice } from '@/lib/types'
import { format } from 'date-fns'

const noticeCategories = ['All', 'Academic', 'Administrative', 'Placement', 'Hostel', 'Sports', 'General']

export default function NoticesPage() {
    const [notices, setNotices] = useState<Notice[]>([])
    const [loading, setLoading] = useState(true)
    const [category, setCategory] = useState('All')
    const [searchQuery, setSearchQuery] = useState('')
    const supabase = createClient()

    useEffect(() => { loadNotices() }, [category]) // eslint-disable-line react-hooks/exhaustive-deps

    async function loadNotices() {
        setLoading(true)
        let query = supabase
            .from('notices')
            .select('*, poster:users(id, full_name, role)')
            .eq('is_active', true)
            .order('is_pinned', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(30)

        if (category !== 'All') query = query.ilike('category', category.toLowerCase())
        const { data } = await query
        setNotices((data as Notice[]) || [])
        setLoading(false)
    }

    const filtered = searchQuery ? notices.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase())) : notices

    const priorityConfig: Record<string, { badge: string; icon: React.ReactNode }> = {
        urgent: { badge: 'badge-red', icon: <AlertTriangle size={12} /> },
        high: { badge: 'badge-gold', icon: <AlertTriangle size={12} /> },
        medium: { badge: 'badge-blue', icon: <Info size={12} /> },
        low: { badge: 'badge-green', icon: <Info size={12} /> },
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">📢 Notices</h1>
                    <p className="page-subtitle">Official announcements and institute updates</p>
                </div>
            </div>

            <div className="flex gap-4 mb-6" style={{ flexWrap: 'wrap' }}>
                <div className="search-bar" style={{ flex: 1, minWidth: 250 }}>
                    <Search size={18} /><input placeholder="Search notices..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
            </div>

            <div className="flex gap-2 mb-6" style={{ flexWrap: 'wrap' }}>
                {noticeCategories.map(cat => (
                    <button key={cat} className={`btn btn-sm ${category === cat ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setCategory(cat)}>{cat}</button>
                ))}
            </div>

            {loading ? (
                <div className="flex flex-col gap-4">{[1, 2, 3, 4].map(i => <div key={i} className="glass-card-static"><div className="skeleton skeleton-title" /><div className="skeleton skeleton-text" /></div>)}</div>
            ) : filtered.length === 0 ? (
                <div className="glass-card-static empty-state"><Megaphone size={48} /><h3>No Notices</h3><p>No notices found for this category.</p></div>
            ) : (
                <div className="flex flex-col gap-4">
                    {filtered.map((notice, i) => {
                        const poster = notice.poster as unknown as { full_name: string; role: string } | undefined
                        const pc = priorityConfig[notice.priority] || priorityConfig.medium
                        return (
                            <div key={notice.id} className={`glass-card animate-fade-in-up delay-${Math.min(i + 1, 6)}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    {notice.is_pinned && <span className="badge badge-gold"><Pin size={10} /> Pinned</span>}
                                    <span className={`badge ${pc.badge}`}>{pc.icon} {notice.priority}</span>
                                    <span className="badge badge-neutral">{notice.category}</span>
                                    <span className="text-xs text-muted" style={{ marginLeft: 'auto' }}><Clock size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />{format(new Date(notice.created_at), 'MMM d, yyyy')}</span>
                                </div>
                                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: 8 }}>{notice.title}</h3>
                                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{notice.content}</p>
                                {notice.tags && notice.tags.length > 0 && (
                                    <div className="flex gap-2 mt-4" style={{ flexWrap: 'wrap' }}>{notice.tags.map((tag, i) => <span key={i} className="tag">#{tag}</span>)}</div>
                                )}
                                {notice.attachments && notice.attachments.length > 0 && (
                                    <div className="flex gap-2 mt-4">{notice.attachments.map((a, i) => <a key={i} href={a} target="_blank" rel="noopener" className="btn btn-secondary btn-sm">📎 Attachment {i + 1}</a>)}</div>
                                )}
                                <div style={{ borderTop: '1px solid var(--glass-border)', marginTop: 14, paddingTop: 10 }} className="flex items-center justify-between">
                                    <span className="text-xs text-muted">Posted by {poster?.full_name} ({poster?.role})</span>
                                    {notice.valid_until && <span className="text-xs text-muted">Valid until {format(new Date(notice.valid_until), 'MMM d, yyyy')}</span>}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
