'use client'

import { useState, useEffect } from 'react'
import { Search, MapPin, Calendar, AlertTriangle, CheckCircle, Plus, User, CheckCheck, Eye } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { LostFoundItem, LostFoundStatus } from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'

type Tab = 'lost' | 'found' | 'mine'

export default function LostFoundPage() {
    const { user } = useAuth()
    const [items, setItems] = useState<LostFoundItem[]>([])
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState<Tab>('lost')
    const [showForm, setShowForm] = useState(false)
    const [formType, setFormType] = useState<'lost' | 'found'>('lost')
    
    const [form, setForm] = useState({ item_name: '', description: '', category: 'electronics', location_lost_found: '', date_lost_found: '', contact_info: '' })
    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => { loadItems() }, [tab]) // eslint-disable-line react-hooks/exhaustive-deps

    async function loadItems() {
        setLoading(true)
        let query = supabase
            .from('lost_found_items')
            .select('*, reporter:users!lost_found_items_reporter_id_fkey(id, full_name, profile_picture_url)')
            .order('created_at', { ascending: false })
            .limit(50)

        if (tab === 'mine') {
            if (user) query = query.eq('reporter_id', user.id)
        } else {
            // For 'lost' tab, only show strict 'lost' items
            // For 'found' tab, show 'found' AND 'returned' items so people can see historical found items too?
            // Usually 'found' by someone else means the status is 'found'.
            query = query.eq('status', tab)
        }

        const { data } = await query
        setItems((data as LostFoundItem[]) || [])
        setLoading(false)
    }

    async function submitReport(e: React.FormEvent) {
        e.preventDefault()
        if (!user) {
            setError('You must be logged in to report an item. Please refresh the page.')
            return
        }
        setError(null)
        const payload = {
            reporter_id: user.id,
            item_name: form.item_name,
            description: form.description,
            category: form.category,
            location_lost_found: form.location_lost_found,
            date_lost_found: form.date_lost_found,
            contact_info: form.contact_info || null,
            status: formType as LostFoundStatus, // 'lost' or 'found' initially
        }
        const { error: insertError } = await supabase.from('lost_found_items').insert(payload)
        if (insertError) {
            setError(`Failed to submit report: ${insertError.message}`)
            return
        }
        setShowForm(false)
        setForm({ item_name: '', description: '', category: 'electronics', location_lost_found: '', date_lost_found: '', contact_info: '' })
        
        // Switch to the relevant tab to see the newly reported item
        setTab(formType)
        loadItems()
    }

    async function updateItemStatus(itemId: string, newStatus: LostFoundStatus) {
        setUpdatingId(itemId)
        await supabase.from('lost_found_items').update({ status: newStatus }).eq('id', itemId)
        setItems(prev => prev.map(item => item.id === itemId ? { ...item, status: newStatus } : item))
        setUpdatingId(null)
    }

    const getInitials = (name?: string) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
    const categories = ['electronics', 'documents', 'accessories', 'clothing', 'keys', 'wallet', 'bottle', 'other']

    const statusBadge = (status: string) => {
        switch (status) {
            case 'lost': return <span className="badge badge-red">🔴 Lost</span>
            case 'found': return <span className="badge badge-green">🟢 Found</span>
            case 'returned': return <span className="badge badge-blue">✓ Returned</span>
            default: return <span className="badge badge-neutral">{status}</span>
        }
    }

    function openForm(type: 'lost' | 'found') {
        setFormType(type)
        setShowForm(true)
        setError(null)
        // Auto-scroll to top so they see the form
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">🔍 Lost & Found</h1>
                    <p className="page-subtitle">Report lost items or help return found ones</p>
                </div>
                <div className="flex gap-3">
                    <button className="btn btn-secondary" onClick={() => openForm('found')}>
                        <Eye size={16} /> I Found Something
                    </button>
                    <button className="btn btn-primary" onClick={() => openForm('lost')}>
                        <AlertTriangle size={16} /> I Lost Something
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button className={`tab ${tab === 'lost' ? 'active' : ''}`} onClick={() => setTab('lost')}>
                    <AlertTriangle size={14} style={{ marginRight: 6 }} /> Lost Items
                </button>
                <button className={`tab ${tab === 'found' ? 'active' : ''}`} onClick={() => setTab('found')}>
                    <CheckCircle size={14} style={{ marginRight: 6 }} /> Found Items
                </button>
                <button className={`tab ${tab === 'mine' ? 'active' : ''}`} onClick={() => setTab('mine')}>
                    <User size={14} style={{ marginRight: 6 }} /> Your Reports
                </button>
            </div>

            {/* Report Form */}
            {error && (
                <div className="glass-card-static" style={{ marginBottom: 16, padding: '12px 16px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#ef4444' }}>
                    ⚠️ {error}
                </div>
            )}
            {showForm && (
                <form onSubmit={submitReport} className="glass-card-static animate-fade-in-up" style={{ marginBottom: 24, border: formType === 'found' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                            {formType === 'lost' ? (
                                <><AlertTriangle size={18} color="var(--accent-danger)" /> Report a Lost Item</>
                            ) : (
                                <><Eye size={18} color="var(--accent-success)" /> Report a Found Item</>
                            )}
                        </h3>
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group"><label className="input-label">Item Name *</label><input className="input-field" required value={form.item_name} onChange={e => setForm(p => ({ ...p, item_name: e.target.value }))} placeholder="e.g. Blue Water Bottle" /></div>
                        <div className="form-group"><label className="input-label">Category</label><select className="select-field" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>{categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}</select></div>
                    </div>
                    <div className="form-row">
                        <div className="form-group"><label className="input-label">Location {formType === 'lost' ? 'Lost' : 'Found'} *</label><input className="input-field" required value={form.location_lost_found} onChange={e => setForm(p => ({ ...p, location_lost_found: e.target.value }))} placeholder="e.g. Library, SAC" /></div>
                        <div className="form-group"><label className="input-label">Date {formType === 'lost' ? 'Lost' : 'Found'} *</label><input className="input-field" type="date" required value={form.date_lost_found} onChange={e => setForm(p => ({ ...p, date_lost_found: e.target.value }))} /></div>
                    </div>
                    <div className="form-group"><label className="input-label">Description *</label><textarea className="textarea-field" required rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder={formType === 'lost' ? "Describe the item in detail..." : "Describe the item, where exactly you found it, and where it is currently kept..."} /></div>
                    <div className="form-group"><label className="input-label">Contact Info (Optional)</label><input className="input-field" value={form.contact_info} onChange={e => setForm(p => ({ ...p, contact_info: e.target.value }))} placeholder="Phone or email. If left blank, users can message you on the app if you are the finder/loser." /></div>
                    <div className="flex gap-3">
                        <button type="submit" className={formType === 'found' ? 'btn btn-primary' : 'btn btn-primary'}>Submit Report</button>
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
                    <h3>
                        {tab === 'mine' ? 'You haven\'t reported any items' : 
                         tab === 'found' ? 'No items have been reported as found' :
                         'No items have been reported as lost'}
                    </h3>
                    <p>
                        {tab === 'mine' ? 'Items you report will appear here so you can track and update their status.' : 
                         tab === 'found' ? 'If you find something, click "I Found Something" above to report it.' :
                         'If you lose something, click "I Lost Something" above to report it.'}
                    </p>
                </div>
            ) : (
                <div className="grid-auto">
                    {items.map((item, i) => {
                        const reporter = item.reporter as unknown as { full_name: string } | undefined
                        const isOwner = user?.id === (item as unknown as { reporter_id: string }).reporter_id
                        return (
                            <div key={item.id} className={`glass-card animate-fade-in-up delay-${Math.min(i + 1, 6)}`}>
                                {item.images && item.images.length > 0 && (
                                    <div style={{ margin: '-20px -20px 14px -20px', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0', overflow: 'hidden', height: 150 }}>
                                        <img src={item.images[0]} alt={item.item_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                )}
                                <div className="flex items-center gap-2 mb-2">
                                    {statusBadge(item.status)}
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
                                    {/* Additional label based on original status (found items are reported by finder) */}
                                    <span className="text-xs text-secondary" style={{ fontStyle: 'italic', marginLeft: 'auto' }}>
                                        {item.status === 'lost' && isOwner ? 'Lost by you' : ''}
                                        {item.status === 'lost' && !isOwner ? '(Loser)' : ''}
                                        {(item.status === 'found' || item.status === 'returned') && !isOwner ? '(Finder)' : ''}
                                        {(item.status === 'found' || item.status === 'returned') && isOwner ? 'Found by you' : ''}
                                    </span>
                                </div>

                                {/* Owner actions */}
                                {isOwner && (
                                    <div style={{ borderTop: '1px solid var(--glass-border)', marginTop: 10, paddingTop: 10 }} className="flex gap-2">
                                        {item.status === 'lost' && (
                                            <button
                                                className="btn btn-sm btn-primary"
                                                style={{ flex: 1, fontSize: '0.75rem', padding: '6px 10px' }}
                                                disabled={updatingId === item.id}
                                                onClick={() => updateItemStatus(item.id, 'found')}
                                            >
                                                <CheckCircle size={13} /> {updatingId === item.id ? 'Updating...' : 'Mark as Found'}
                                            </button>
                                        )}
                                        {item.status === 'found' && (
                                            <button
                                                className="btn btn-sm"
                                                style={{ flex: 1, fontSize: '0.75rem', padding: '6px 10px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--blue-500)', border: '1px solid rgba(59, 130, 246, 0.2)' }}
                                                disabled={updatingId === item.id}
                                                onClick={() => updateItemStatus(item.id, 'returned')}
                                            >
                                                <CheckCheck size={13} /> {updatingId === item.id ? 'Updating...' : 'Mark as Returned'}
                                            </button>
                                        )}
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
