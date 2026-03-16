'use client'

import { useState, useEffect } from 'react'
import { Award, Search, Users, Calendar as CalIcon, Mail, ExternalLink, ChevronRight, Building2, UserPlus } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { Organization, OrgType } from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext'

const orgTabs: { label: string; value: OrgType | 'all' }[] = [
    { label: 'All', value: 'all' },
    { label: 'Boards', value: 'board' },
    { label: 'Clubs', value: 'club' },
    { label: 'Societies', value: 'society' },
    { label: 'Committees', value: 'committee' },
    { label: 'Cells', value: 'cell' },
    { label: 'Departments', value: 'department' },
]

export default function ClubsPage() {
    const { user } = useAuth()
    const [orgs, setOrgs] = useState<Organization[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<string>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const supabase = createClient()

    useEffect(() => { loadOrgs() }, [activeTab]) // eslint-disable-line react-hooks/exhaustive-deps

    async function loadOrgs() {
        setLoading(true)
        let query = supabase
            .from('organizations')
            .select('*, parent:organizations!organizations_parent_id_fkey(id, name, slug, type)')
            .eq('is_active', true)
            .order('name')

        if (activeTab !== 'all') query = query.eq('type', activeTab)
        const { data } = await query
        setOrgs((data as Organization[]) || [])
        setLoading(false)
    }

    async function requestJoin(orgId: string) {
        if (!user) return
        await supabase.from('org_members').insert({
            organization_id: orgId,
            user_id: user.id,
            role: 'member',
            status: 'pending',
        })
        alert('Join request sent!')
    }

    const filtered = searchQuery ? orgs.filter(o => o.name.toLowerCase().includes(searchQuery.toLowerCase()) || o.description?.toLowerCase().includes(searchQuery.toLowerCase())) : orgs

    const typeBadge = (t: OrgType) => {
        const map: Record<string, string> = { gymkhana: 'badge-gold', board: 'badge-purple', club: 'badge-blue', society: 'badge-green', committee: 'badge-red', cell: 'badge-neutral', department: 'badge-neutral' }
        return map[t] || 'badge-neutral'
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">🏛️ Organizations</h1>
                    <p className="page-subtitle">Gymkhana boards, clubs, societies & committees at IIT Ropar</p>
                </div>
            </div>

            <div className="search-bar" style={{ marginBottom: 20, maxWidth: 500 }}>
                <Search size={18} /><input placeholder="Search organizations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>

            <div className="flex gap-2 mb-6" style={{ flexWrap: 'wrap' }}>
                {orgTabs.map(t => (
                    <button key={t.value} className={`btn btn-sm ${activeTab === t.value ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab(t.value)}>{t.label}</button>
                ))}
            </div>

            {loading ? (
                <div className="grid-auto">{[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="glass-card-static"><div className="flex gap-3 items-center"><div className="skeleton skeleton-avatar" style={{ width: 48, height: 48 }} /><div style={{ flex: 1 }}><div className="skeleton skeleton-title" /><div className="skeleton skeleton-text" style={{ width: '50%' }} /></div></div></div>)}</div>
            ) : filtered.length === 0 ? (
                <div className="glass-card-static empty-state"><Award size={48} /><h3>No Organizations Found</h3><p>No organizations match your search.</p></div>
            ) : (
                <div className="grid-auto">
                    {filtered.map((org, i) => {
                        const parent = org.parent as unknown as { id: string; name: string; slug: string; type: string } | undefined
                        return (
                            <div key={org.id} className={`glass-card animate-fade-in-up delay-${Math.min(i + 1, 6)}`}>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="avatar avatar-lg" style={{ background: org.logo_url ? 'none' : 'var(--gradient-gold)', borderRadius: 'var(--radius-md)' }}>
                                        {org.logo_url ? <img src={org.logo_url} alt={org.name} style={{ borderRadius: 'var(--radius-md)' }} /> : org.name.charAt(0)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 className="font-semibold" style={{ fontSize: '1rem' }}>{org.name}</h3>
                                        <div className="flex items-center gap-2 text-xs text-muted" style={{ flexWrap: 'wrap', marginTop: 4 }}>
                                            <span className={`badge ${typeBadge(org.type)}`} style={{ fontSize: '0.6rem' }}>{org.type}</span>
                                            {org.founded_year && <span>Est. {org.founded_year}</span>}
                                        </div>
                                    </div>
                                </div>
                                {parent && (
                                    <div className="flex items-center gap-1 text-xs text-muted mb-2">
                                        <Building2 size={12} />
                                        <span>Under</span>
                                        <ChevronRight size={10} />
                                        <span style={{ color: 'var(--accent-primary)' }}>{parent.name}</span>
                                    </div>
                                )}
                                {org.description && <p className="text-sm text-muted" style={{ marginBottom: 12, lineHeight: 1.5 }}>{org.description.slice(0, 120)}{org.description.length > 120 ? '...' : ''}</p>}
                                <div className="flex items-center gap-4 text-xs text-muted mb-3">
                                    <span className="flex items-center gap-1"><Users size={12} /> {org.member_count} members</span>
                                    <span className="flex items-center gap-1"><CalIcon size={12} /> {org.event_count} events</span>
                                </div>
                                <div className="flex gap-2">
                                    <button className="btn btn-primary btn-sm" onClick={() => requestJoin(org.id)}>
                                        <UserPlus size={14} /> Join
                                    </button>
                                    {org.email && <a href={`mailto:${org.email}`} className="btn btn-secondary btn-sm"><Mail size={14} /></a>}
                                    {org.social_links?.instagram && <a href={org.social_links.instagram} target="_blank" rel="noopener" className="btn btn-secondary btn-sm"><ExternalLink size={14} /></a>}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
