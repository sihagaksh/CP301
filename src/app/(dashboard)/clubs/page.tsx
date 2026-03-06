'use client'

import { useState, useEffect } from 'react'
import { Award, Search, Users, Calendar as CalIcon, Mail, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { Club } from '@/lib/types'

const clubCategories = ['All', 'Technical', 'Cultural', 'Sports', 'Social', 'Media', 'Other']

export default function ClubsPage() {
    const [clubs, setClubs] = useState<Club[]>([])
    const [loading, setLoading] = useState(true)
    const [category, setCategory] = useState('All')
    const [searchQuery, setSearchQuery] = useState('')
    const supabase = createClient()

    useEffect(() => { loadClubs() }, [category]) // eslint-disable-line react-hooks/exhaustive-deps

    async function loadClubs() {
        setLoading(true)
        let query = supabase.from('clubs').select('*').eq('is_active', true).order('name')
        if (category !== 'All') query = query.ilike('category', category.toLowerCase())
        const { data } = await query
        setClubs((data as Club[]) || [])
        setLoading(false)
    }

    const filtered = searchQuery ? clubs.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())) : clubs

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">🏆 Clubs & Bodies</h1>
                    <p className="page-subtitle">Explore technical, cultural, sports & social clubs at IIT Ropar</p>
                </div>
            </div>

            <div className="search-bar" style={{ marginBottom: 20, maxWidth: 500 }}>
                <Search size={18} /><input placeholder="Search clubs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>

            <div className="flex gap-2 mb-6" style={{ flexWrap: 'wrap' }}>
                {clubCategories.map(c => (
                    <button key={c} className={`btn btn-sm ${category === c ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setCategory(c)}>{c}</button>
                ))}
            </div>

            {loading ? (
                <div className="grid-auto">{[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="glass-card-static"><div className="flex gap-3 items-center"><div className="skeleton skeleton-avatar" style={{ width: 48, height: 48 }} /><div style={{ flex: 1 }}><div className="skeleton skeleton-title" /><div className="skeleton skeleton-text" style={{ width: '50%' }} /></div></div></div>)}</div>
            ) : filtered.length === 0 ? (
                <div className="glass-card-static empty-state"><Award size={48} /><h3>No Clubs Found</h3><p>No clubs match your search.</p></div>
            ) : (
                <div className="grid-auto">
                    {filtered.map((club, i) => (
                        <div key={club.id} className={`glass-card animate-fade-in-up delay-${Math.min(i + 1, 6)}`}>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="avatar avatar-lg" style={{ background: club.logo_url ? 'none' : 'var(--gradient-gold)', borderRadius: 'var(--radius-md)' }}>
                                    {club.logo_url ? <img src={club.logo_url} alt={club.name} style={{ borderRadius: 'var(--radius-md)' }} /> : club.name.charAt(0)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 className="font-semibold" style={{ fontSize: '1rem' }}>{club.name}</h3>
                                    <div className="flex items-center gap-2 text-xs text-muted">
                                        {club.category && <span className="badge badge-neutral" style={{ fontSize: '0.6rem' }}>{club.category}</span>}
                                        {club.founded_year && <span>Est. {club.founded_year}</span>}
                                    </div>
                                </div>
                            </div>
                            {club.description && <p className="text-sm text-muted" style={{ marginBottom: 12, lineHeight: 1.5 }}>{club.description.slice(0, 120)}{club.description.length > 120 ? '...' : ''}</p>}
                            <div className="flex items-center gap-4 text-xs text-muted mb-3">
                                <span className="flex items-center gap-1"><Users size={12} /> {club.member_count} members</span>
                                <span className="flex items-center gap-1"><CalIcon size={12} /> {club.event_count} events</span>
                            </div>
                            <div className="flex gap-2">
                                {club.email && <a href={`mailto:${club.email}`} className="btn btn-secondary btn-sm"><Mail size={14} /></a>}
                                {club.social_links?.instagram && <a href={club.social_links.instagram} target="_blank" rel="noopener" className="btn btn-secondary btn-sm"><ExternalLink size={14} /></a>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
