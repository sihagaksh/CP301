'use client'

import { useState, useEffect } from 'react'
import { Link2, Search, ExternalLink, Star, BookOpen, Settings, Library, GraduationCap } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { QuickLink } from '@/lib/types'

const linkCategories = ['All', 'Academic', 'Administrative', 'Library', 'Placement', 'Hostel', 'General']

const categoryIcons: Record<string, React.ReactNode> = {
    academic: <BookOpen size={18} />,
    administrative: <Settings size={18} />,
    library: <Library size={18} />,
    placement: <GraduationCap size={18} />,
}

export default function QuickLinksPage() {
    const [links, setLinks] = useState<QuickLink[]>([])
    const [loading, setLoading] = useState(true)
    const [category, setCategory] = useState('All')
    const [searchQuery, setSearchQuery] = useState('')
    const supabase = createClient()

    useEffect(() => { loadLinks() }, [category]) // eslint-disable-line react-hooks/exhaustive-deps

    async function loadLinks() {
        setLoading(true)
        let query = supabase.from('quick_links').select('*').eq('is_active', true).order('display_order').order('click_count', { ascending: false })
        if (category !== 'All') query = query.ilike('category', category.toLowerCase())
        const { data } = await query
        setLinks((data as QuickLink[]) || [])
        setLoading(false)
    }

    const filtered = searchQuery ? links.filter(l => l.title.toLowerCase().includes(searchQuery.toLowerCase())) : links
    const featured = filtered.filter(l => l.is_featured)
    const rest = filtered.filter(l => !l.is_featured)

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">🔗 Quick Links</h1>
                    <p className="page-subtitle">All institute portals and useful links in one place</p>
                </div>
            </div>

            <div className="search-bar" style={{ marginBottom: 20, maxWidth: 500 }}>
                <Search size={18} /><input placeholder="Search links..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>

            <div className="flex gap-2 mb-6" style={{ flexWrap: 'wrap' }}>
                {linkCategories.map(c => (
                    <button key={c} className={`btn btn-sm ${category === c ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setCategory(c)}>{c}</button>
                ))}
            </div>

            {loading ? (
                <div className="grid-auto">{[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="glass-card-static"><div className="skeleton skeleton-title" /><div className="skeleton skeleton-text" /></div>)}</div>
            ) : filtered.length === 0 ? (
                <div className="glass-card-static empty-state"><Link2 size={48} /><h3>No Links Found</h3></div>
            ) : (
                <>
                    {featured.length > 0 && (
                        <div style={{ marginBottom: 28 }}>
                            <h2 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Star size={16} style={{ color: 'var(--accent-primary)' }} /> Featured Links
                            </h2>
                            <div className="grid-3">
                                {featured.map((link, i) => (
                                    <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="no-underline">
                                        <div className={`glass-card animate-fade-in-up delay-${Math.min(i + 1, 6)}`} style={{ cursor: 'pointer', borderColor: 'rgba(245,158,11,0.2)', borderWidth: 1 }}>
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="stat-icon gold">{categoryIcons[link.category] || <Link2 size={18} />}</div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <h3 className="font-semibold truncate" style={{ fontSize: '0.9rem' }}>{link.title}</h3>
                                                    <span className="text-xs text-muted">{link.category}</span>
                                                </div>
                                                <ExternalLink size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                                            </div>
                                            {link.description && <p className="text-xs text-muted" style={{ lineHeight: 1.5 }}>{link.description}</p>}
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    <h2 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 14 }}>All Links</h2>
                    <div className="grid-auto">
                        {rest.map((link, i) => (
                            <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="no-underline">
                                <div className={`glass-card animate-fade-in-up delay-${Math.min(i + 1, 6)}`} style={{ cursor: 'pointer' }}>
                                    <div className="flex items-center gap-3">
                                        <div className="stat-icon blue" style={{ width: 40, height: 40 }}>{categoryIcons[link.category] || <Link2 size={16} />}</div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <h3 className="font-semibold truncate" style={{ fontSize: '0.88rem' }}>{link.title}</h3>
                                            {link.description && <p className="text-xs text-muted truncate">{link.description}</p>}
                                        </div>
                                        <ExternalLink size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
