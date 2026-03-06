'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, MapPin, Calendar, AlertTriangle, CheckCircle, Plus, Eye } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { LostFoundItem, LostFoundStatus } from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'

export default function LostFoundPage() {
    const { user } = useAuth()
    const [items, setItems] = useState<LostFoundItem[]>([])
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState<'lost' | 'found'>('lost')
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({ item_name: '', description: '', category: 'electronics', location_lost_found: '', date_lost_found: '', contact_info: '', status: 'lost' as LostFoundStatus })
    const supabase = createClient()

    useEffect(() => { loadItems() }, [tab]) // eslint-disable-line react-hooks/exhaustive-deps

    async function loadItems() {
        setLoading(true)
        const { data } = await supabase
            .from('lost_found_items')
            .select('*, reporter:users(id, full_name, profile_picture_url)')
            .eq('status', tab)
            .order('created_at', { ascending: false })
            .limit(30)
        setItems((data as LostFoundItem[]) || [])
        setLoading(false)
    }

    async function submitReport(e: React.FormEvent) {
        e.preventDefault()
        if (!user) return
        await supabase.from('lost_found_items').insert({
            reporter_id: user.id,
            ...form,
            status: tab,
        })
        setShowForm(false)
        setForm({ item_name: '', description: '', category: 'electronics', location_lost_found: '', date_lost_found: '', contact_info: '', status: 'lost' })
        loadItems()
    }

    const getInitials = (name?: string) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
    const categories = ['electronics', 'documents', 'accessories', 'clothing', 'keys', 'wallet', 'bottle', 'other']

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">🔍 Lost & Found</h1>
                    <p className="page-subtitle">Report lost items or help return found ones</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    <Plus size={18} /> Report Item
                </button>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button className={`tab ${tab === 'lost' ? 'active' : ''}`} onClick={() => setTab('lost')}>
                    <AlertTriangle size={14} style={{ marginRight: 6 }} /> Lost Items
                </button>
                <button className={`tab ${tab === 'found' ? 'active' : ''}`} onClick={() => setTab('found')}>
                    <CheckCircle size={14} style={{ marginRight: 6 }} /> Found Items
                </button>
            </div>

            {/* Report Form */}
            {showForm && (
                <form onSubmit={submitReport} className="glass-card-static animate-fade-in-up" style={{ marginBottom: 24 }}>
                    <h3 style={{ marginBottom: 16, fontWeight: 600 }}>Report {tab === 'lost' ? 'Lost' : 'Found'} Item</h3>
                    <div className="form-row">
                        <div className="form-group"><label className="input-label">Item Name *</label><input className="input-field" required value={form.item_name} onChange={e => setForm(p => ({ ...p, item_name: e.target.value }))} placeholder="e.g. Blue Water Bottle" /></div>
                        <div className="form-group"><label className="input-label">Category</label><select className="select-field" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>{categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}</select></div>
                    </div>
                    <div className="form-row">
                        <div className="form-group"><label className="input-label">Location *</label><input className="input-field" required value={form.location_lost_found} onChange={e => setForm(p => ({ ...p, location_lost_found: e.target.value }))} placeholder="e.g. Library, SAB" /></div>
                        <div className="form-group"><label className="input-label">Date *</label><input className="input-field" type="date" required value={form.date_lost_found} onChange={e => setForm(p => ({ ...p, date_lost_found: e.target.value }))} /></div>
                    </div>
                    <div className="form-group"><label className="input-label">Description *</label><textarea className="textarea-field" required rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe the item..." /></div>
                    <div className="form-group"><label className="input-label">Contact Info</label><input className="input-field" value={form.contact_info} onChange={e => setForm(p => ({ ...p, contact_info: e.target.value }))} placeholder="Phone or email" /></div>
                    <div className="flex gap-3">
                        <button type="submit" className="btn btn-primary">Submit Report</button>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                    </div>
                </form>
            )}

            {/* Items Grid */}
            {loading ? (
                <div className="grid-auto">{[1, 2, 3, 4].map(i => <div key={i} className="glass-card-static"><div className="skeleton skeleton-title" /><div className="skeleton skeleton-text" /><div className="skeleton skeleton-text" style={{ width: '60%' }} /></div>)}</div>
            ) : items.length === 0 ? (
                <div className="glass-card-static empty-state">
                    <Search size={48} />
                    <h3>No {tab} items reported</h3>
                    <p>{tab === 'lost' ? 'No items have been reported as lost.' : 'No found items have been reported.'}</p>
                </div>
            ) : (
                <div className="grid-auto">
                    {items.map((item, i) => {
                        const reporter = item.reporter as unknown as { full_name: string } | undefined
                        return (
                            <div key={item.id} className={`glass-card animate-fade-in-up delay-${Math.min(i + 1, 6)}`}>
                                {item.images && item.images.length > 0 && (
                                    <div style={{ margin: '-20px -20px 14px -20px', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0', overflow: 'hidden', height: 150 }}>
                                        <img src={item.images[0]} alt={item.item_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                )}
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`badge ${tab === 'lost' ? 'badge-red' : 'badge-green'}`}>{tab === 'lost' ? '🔴 Lost' : '🟢 Found'}</span>
                                    <span className="badge badge-neutral">{item.category}</span>
                                </div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 6 }}>{item.item_name}</h3>
                                <p className="text-sm text-muted" style={{ marginBottom: 8, lineHeight: 1.5 }}>{item.description.slice(0, 120)}{item.description.length > 120 ? '...' : ''}</p>
                                <div className="flex items-center gap-2 text-xs text-muted mb-2">
                                    <MapPin size={12} /> {item.location_lost_found}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted">
                                    <Calendar size={12} /> {format(new Date(item.date_lost_found), 'MMM d, yyyy')}
                                </div>
                                {item.contact_info && (
                                    <p className="text-xs" style={{ color: 'var(--accent-primary)', marginTop: 8 }}>📞 {item.contact_info}</p>
                                )}
                                <div style={{ borderTop: '1px solid var(--glass-border)', marginTop: 12, paddingTop: 10 }} className="flex items-center gap-2">
                                    <div className="avatar avatar-sm">{getInitials(reporter?.full_name)}</div>
                                    <span className="text-xs text-muted">{reporter?.full_name}</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
