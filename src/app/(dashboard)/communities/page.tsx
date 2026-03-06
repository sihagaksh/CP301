'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Users, Search, Plus, Globe, Lock, UserPlus } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { Community } from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext'

export default function CommunitiesPage() {
    const { user } = useAuth()
    const [communities, setCommunities] = useState<Community[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [showCreate, setShowCreate] = useState(false)
    const [newCommunity, setNewCommunity] = useState({ name: '', description: '', is_public: true })
    const supabase = createClient()

    useEffect(() => { loadCommunities() }, []) // eslint-disable-line react-hooks/exhaustive-deps

    async function loadCommunities() {
        const { data } = await supabase.from('communities').select('*').order('member_count', { ascending: false }).limit(30)
        setCommunities((data as Community[]) || [])
        setLoading(false)
    }

    async function createCommunity(e: React.FormEvent) {
        e.preventDefault()
        if (!user) return
        const slug = newCommunity.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString(36)
        await supabase.from('communities').insert({ creator_id: user.id, name: newCommunity.name, slug, description: newCommunity.description, is_public: newCommunity.is_public })
        setShowCreate(false)
        setNewCommunity({ name: '', description: '', is_public: true })
        loadCommunities()
    }

    async function joinCommunity(id: string) {
        if (!user) return
        await supabase.from('community_members').insert({ community_id: id, user_id: user.id })
        loadCommunities()
    }

    const filtered = searchQuery ? communities.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())) : communities

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">👥 Communities</h1>
                    <p className="page-subtitle">Join interest-based groups and connect with peers</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}><Plus size={18} /> Create Community</button>
            </div>

            <div className="search-bar" style={{ marginBottom: 24, maxWidth: 500 }}>
                <Search size={18} /><input placeholder="Search communities..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>

            {showCreate && (
                <form onSubmit={createCommunity} className="glass-card-static animate-fade-in-up" style={{ marginBottom: 24 }}>
                    <h3 style={{ marginBottom: 16, fontWeight: 600 }}>Create Community</h3>
                    <div className="form-group"><label className="input-label">Name *</label><input className="input-field" required value={newCommunity.name} onChange={e => setNewCommunity(p => ({ ...p, name: e.target.value }))} placeholder="Community name" /></div>
                    <div className="form-group"><label className="input-label">Description</label><textarea className="textarea-field" rows={3} value={newCommunity.description} onChange={e => setNewCommunity(p => ({ ...p, description: e.target.value }))} placeholder="What's this community about?" /></div>
                    <div className="form-group flex items-center gap-2">
                        <input type="checkbox" id="public" checked={newCommunity.is_public} onChange={e => setNewCommunity(p => ({ ...p, is_public: e.target.checked }))} />
                        <label htmlFor="public" className="text-sm" style={{ color: 'var(--text-secondary)' }}>Public community (anyone can join)</label>
                    </div>
                    <div className="flex gap-3"><button type="submit" className="btn btn-primary">Create</button><button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button></div>
                </form>
            )}

            {loading ? (
                <div className="grid-auto">{[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="glass-card-static"><div className="skeleton skeleton-title" /><div className="skeleton skeleton-text" /><div className="skeleton skeleton-text" style={{ width: '50%' }} /></div>)}</div>
            ) : filtered.length === 0 ? (
                <div className="glass-card-static empty-state"><Users size={48} /><h3>No Communities Found</h3><p>Create the first community!</p></div>
            ) : (
                <div className="grid-auto">
                    {filtered.map((community, i) => (
                        <div key={community.id} className={`glass-card animate-fade-in-up delay-${Math.min(i + 1, 6)}`}>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="avatar" style={{ background: community.icon_url ? 'none' : 'var(--gradient-blue)' }}>
                                    {community.icon_url ? <img src={community.icon_url} alt="" /> : community.name.charAt(0)}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <Link href={`/communities/${community.slug}`} style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>
                                        <h3 className="truncate font-semibold" style={{ fontSize: '0.95rem' }}>{community.name}</h3>
                                    </Link>
                                    <div className="flex items-center gap-2 text-xs text-muted">
                                        {community.is_public ? <Globe size={12} /> : <Lock size={12} />}
                                        <span>{community.is_public ? 'Public' : 'Private'}</span>
                                        <span>•</span>
                                        <span>{community.member_count} members</span>
                                    </div>
                                </div>
                            </div>
                            {community.description && <p className="text-sm text-muted" style={{ marginBottom: 12, lineHeight: 1.5 }}>{community.description.slice(0, 100)}{community.description.length > 100 ? '...' : ''}</p>}
                            <button className="btn btn-secondary btn-sm w-full" onClick={() => joinCommunity(community.id)}>
                                <UserPlus size={14} /> Join Community
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
