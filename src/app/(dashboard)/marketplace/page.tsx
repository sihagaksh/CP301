'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingBag, Search, Plus, Eye, IndianRupee, User, CheckCircle, XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { MarketplaceItem } from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext'

type Tab = 'browse' | 'mine'

const itemCategories = ['All', 'Books', 'Electronics', 'Furniture', 'Clothing', 'Cycle', 'Stationery', 'Sports', 'Other']
const conditionLabels: Record<string, string> = { new: 'New', like_new: 'Like New', good: 'Good', fair: 'Fair', poor: 'Poor' }

export default function MarketplacePage() {
    const { user } = useAuth()
    const [items, setItems] = useState<MarketplaceItem[]>([])
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState<Tab>('browse')
    const [category, setCategory] = useState('All')
    const [searchQuery, setSearchQuery] = useState('')
    const [removingId, setRemovingId] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        loadItems()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category, tab])

    async function loadItems() {
        setLoading(true)
        let query = supabase
            .from('marketplace_items')
            .select('*, seller:users(id, full_name, profile_picture_url, department)')
            .order('created_at', { ascending: false })
            .limit(30)

        if (tab === 'mine') {
            if (user) query = query.eq('seller_id', user.id).eq('status', 'available')
        } else {
            query = query.eq('status', 'available')
        }

        if (category !== 'All') {
            query = query.ilike('category', category.toLowerCase())
        }

        const { data } = await query
        setItems((data as MarketplaceItem[]) || [])
        setLoading(false)
    }

    async function removeItem(itemId: string, reason: 'sold' | 'cancelled') {
        setRemovingId(itemId)
        await supabase.from('marketplace_items').update({ status: reason }).eq('id', itemId)
        setItems(prev => prev.filter(item => item.id !== itemId))
        setRemovingId(null)
    }

    const filtered = searchQuery
        ? items.filter(i => i.title.toLowerCase().includes(searchQuery.toLowerCase()))
        : items

    const getInitials = (name?: string) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'

    const conditionBadgeColor = (c: string) => {
        switch (c) { case 'new': return 'badge-green'; case 'like_new': return 'badge-blue'; case 'good': return 'badge-gold'; default: return 'badge-neutral'; }
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">🛒 Buy & Sell</h1>
                    <p className="page-subtitle">Campus marketplace for students and staff</p>
                </div>
                <Link href="/marketplace/create" className="btn btn-primary">
                    <Plus size={18} /> Sell Item
                </Link>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button className={`tab ${tab === 'browse' ? 'active' : ''}`} onClick={() => setTab('browse')}>
                    <ShoppingBag size={14} style={{ marginRight: 6 }} /> Browse
                </button>
                <button className={`tab ${tab === 'mine' ? 'active' : ''}`} onClick={() => setTab('mine')}>
                    <User size={14} style={{ marginRight: 6 }} /> My Products
                </button>
            </div>

            <div className="flex gap-4 mb-6" style={{ flexWrap: 'wrap' }}>
                <div className="search-bar" style={{ flex: 1, minWidth: 250 }}>
                    <Search size={18} />
                    <input placeholder="Search items..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
            </div>

            {/* Category Pills */}
            <div className="flex gap-2 mb-6" style={{ flexWrap: 'wrap' }}>
                {itemCategories.map(cat => (
                    <button
                        key={cat}
                        className={`btn btn-sm ${category === cat ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setCategory(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="grid-auto">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="glass-card-static">
                            <div className="skeleton" style={{ height: 180, marginBottom: 12, borderRadius: 'var(--radius-md)' }} />
                            <div className="skeleton skeleton-title" />
                            <div className="skeleton skeleton-text" style={{ width: '40%' }} />
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="glass-card-static empty-state">
                    <ShoppingBag size={48} />
                    <h3>{tab === 'mine' ? 'No Active Listings' : 'No Items Found'}</h3>
                    <p>{tab === 'mine' ? 'Items you list for sale will appear here.' : 'Be the first to list something for sale!'}</p>
                    <Link href="/marketplace/create" className="btn btn-primary" style={{ marginTop: 16 }}>List an Item</Link>
                </div>
            ) : (
                <div className="grid-auto">
                    {filtered.map((item, i) => {
                        const seller = item.seller as unknown as { full_name: string; department?: string } | undefined
                        return (
                            <div key={item.id} className={`glass-card animate-fade-in-up delay-${Math.min(i + 1, 6)}`} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <Link href={`/marketplace/${item.id}`} className="no-underline" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    {item.images && item.images.length > 0 ? (
                                        <div style={{ margin: '-20px -20px 14px -20px', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0', overflow: 'hidden', height: 180 }}>
                                            <img src={item.images[0]} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    ) : (
                                        <div style={{ margin: '-20px -20px 14px -20px', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0', height: 180, background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <ShoppingBag size={40} style={{ color: 'var(--text-muted)' }} />
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`badge ${conditionBadgeColor(item.condition)}`}>{conditionLabels[item.condition] || item.condition}</span>
                                        {item.is_negotiable && <span className="badge badge-neutral">Negotiable</span>}
                                    </div>
                                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }} className="truncate">{item.title}</h3>
                                    <p style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <IndianRupee size={16} />{item.price}
                                    </p>
                                    <p className="text-sm text-muted truncate" style={{ flex: 1 }}>{item.description.slice(0, 80)}</p>
                                    <div style={{ borderTop: '1px solid var(--glass-border)', marginTop: 12, paddingTop: 10 }} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="avatar avatar-sm">{getInitials(seller?.full_name)}</div>
                                            <span className="text-xs text-muted">{seller?.full_name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted">
                                            <Eye size={12} /> {item.view_count}
                                        </div>
                                    </div>
                                </Link>

                                {/* Owner actions — Sold / Cancel */}
                                {tab === 'mine' && (
                                    <div style={{ borderTop: '1px solid var(--glass-border)', marginTop: 10, paddingTop: 10 }} className="flex gap-2">
                                        <button
                                            className="btn btn-sm btn-primary"
                                            style={{ flex: 1, fontSize: '0.75rem', padding: '6px 10px' }}
                                            disabled={removingId === item.id}
                                            onClick={() => removeItem(item.id, 'sold')}
                                        >
                                            <CheckCircle size={13} /> {removingId === item.id ? 'Updating...' : 'Sold'}
                                        </button>
                                        <button
                                            className="btn btn-sm btn-secondary"
                                            style={{ flex: 1, fontSize: '0.75rem', padding: '6px 10px' }}
                                            disabled={removingId === item.id}
                                            onClick={() => removeItem(item.id, 'cancelled')}
                                        >
                                            <XCircle size={13} /> {removingId === item.id ? 'Updating...' : 'Cancel'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
