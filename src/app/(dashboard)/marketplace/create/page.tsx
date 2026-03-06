'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export default function CreateListingPage() {
    const router = useRouter()
    const { user } = useAuth()
    const supabase = createClient()

    const [form, setForm] = useState({
        title: '', description: '', category: 'books', price: '',
        condition: 'good', is_negotiable: true, pickup_location: '',
        images: '',
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    function update(field: string, value: string | boolean) {
        setForm(p => ({ ...p, [field]: value }))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!user) return
        setLoading(true)

        const { error: err } = await supabase.from('marketplace_items').insert({
            seller_id: user.id,
            title: form.title,
            description: form.description,
            category: form.category,
            price: parseFloat(form.price),
            condition: form.condition,
            is_negotiable: form.is_negotiable,
            pickup_location: form.pickup_location || null,
            images: form.images ? form.images.split(',').map(u => u.trim()) : [],
        })

        if (err) { setError(err.message); setLoading(false) }
        else router.push('/marketplace')
    }

    return (
        <div className="page-container" style={{ maxWidth: 640, margin: '0 auto' }}>
            <Link href="/marketplace" className="btn btn-ghost" style={{ marginBottom: 20, marginLeft: -8 }}><ArrowLeft size={18} /> Back</Link>
            <h1 className="page-title" style={{ marginBottom: 24 }}>🏷️ Sell an Item</h1>

            <form onSubmit={handleSubmit} className="glass-card-static">
                {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--accent-danger)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: 16 }}>{error}</div>}

                <div className="form-group">
                    <label className="input-label">Item Title *</label>
                    <input className="input-field" placeholder="e.g. CLRS Algorithm Book" value={form.title} onChange={(e) => update('title', e.target.value)} required />
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label className="input-label">Category *</label>
                        <select className="select-field" value={form.category} onChange={(e) => update('category', e.target.value)}>
                            {['books', 'electronics', 'furniture', 'clothing', 'cycle', 'stationery', 'sports', 'other'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="input-label">Condition *</label>
                        <select className="select-field" value={form.condition} onChange={(e) => update('condition', e.target.value)}>
                            <option value="new">New</option>
                            <option value="like_new">Like New</option>
                            <option value="good">Good</option>
                            <option value="fair">Fair</option>
                            <option value="poor">Poor</option>
                        </select>
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label className="input-label">Price (₹) *</label>
                        <input className="input-field" type="number" min="0" step="1" placeholder="500" value={form.price} onChange={(e) => update('price', e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label className="input-label">Pickup Location</label>
                        <input className="input-field" placeholder="e.g. Kameng Hostel" value={form.pickup_location} onChange={(e) => update('pickup_location', e.target.value)} />
                    </div>
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="checkbox" id="negotiable" checked={form.is_negotiable} onChange={(e) => update('is_negotiable', e.target.checked)} />
                    <label htmlFor="negotiable" className="text-sm" style={{ color: 'var(--text-secondary)' }}>Price is negotiable</label>
                </div>
                <div className="form-group">
                    <label className="input-label">Description *</label>
                    <textarea className="textarea-field" rows={4} placeholder="Describe the item..." value={form.description} onChange={(e) => update('description', e.target.value)} required />
                </div>
                <div className="form-group">
                    <label className="input-label">Image URLs (comma separated)</label>
                    <input className="input-field" placeholder="https://..." value={form.images} onChange={(e) => update('images', e.target.value)} />
                </div>

                <button type="submit" className="btn btn-primary btn-lg w-full" style={{ marginTop: 8 }} disabled={loading}>
                    {loading ? 'Listing...' : 'List Item for Sale'} {!loading && <Send size={18} />}
                </button>
            </form>
        </div>
    )
}
