'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, IndianRupee, MapPin, Heart, MessageCircle, Send, ShoppingBag, User } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { MarketplaceItem } from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'

export default function MarketplaceItemPage() {
    const params = useParams()
    const { user } = useAuth()
    const [item, setItem] = useState<MarketplaceItem | null>(null)
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState('')
    const supabase = createClient()

    useEffect(() => {
        loadItem()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.id])

    async function loadItem() {
        const { data } = await supabase
            .from('marketplace_items')
            .select('*, seller:users(id, full_name, profile_picture_url, department, phone_number, email)')
            .eq('id', params.id)
            .single()
        setItem(data as MarketplaceItem)
        setLoading(false)
    }

    async function sendInquiry() {
        if (!message.trim() || !user || !item) return
        await supabase.from('marketplace_inquiries').insert({
            item_id: item.id,
            buyer_id: user.id,
            seller_id: item.seller_id,
            message: message.trim(),
        })
        setMessage('')
        alert('Inquiry sent!')
    }

    const seller = item?.seller as unknown as { full_name: string; department?: string; phone_number?: string; email?: string } | undefined
    const getInitials = (name?: string) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
    const conditionLabels: Record<string, string> = { new: 'New', like_new: 'Like New', good: 'Good', fair: 'Fair', poor: 'Poor' }

    if (loading) return <div className="page-container"><div className="skeleton" style={{ height: 400, borderRadius: 'var(--radius-lg)' }} /></div>

    if (!item) return <div className="page-container"><div className="empty-state"><h3>Item not found</h3><Link href="/marketplace" className="btn btn-secondary" style={{ marginTop: 16 }}>Back to Marketplace</Link></div></div>

    return (
        <div className="page-container" style={{ maxWidth: 900, margin: '0 auto' }}>
            <Link href="/marketplace" className="btn btn-ghost" style={{ marginBottom: 20, marginLeft: -8 }}>
                <ArrowLeft size={18} /> Back to Marketplace
            </Link>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 28 }}>
                {/* Images */}
                <div>
                    {item.images && item.images.length > 0 ? (
                        <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 20 }}>
                            <img src={item.images[0]} alt={item.title} style={{ width: '100%', height: 400, objectFit: 'cover' }} />
                        </div>
                    ) : (
                        <div style={{ borderRadius: 'var(--radius-lg)', height: 400, background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                            <ShoppingBag size={64} style={{ color: 'var(--text-muted)' }} />
                        </div>
                    )}
                    {item.images && item.images.length > 1 && (
                        <div className="flex gap-3">
                            {item.images.slice(1).map((img, i) => (
                                <div key={i} style={{ width: 80, height: 80, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            ))}
                        </div>
                    )}

                    <div style={{ marginTop: 24 }}>
                        <h2 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 12 }}>Description</h2>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{item.description}</p>
                    </div>
                </div>

                {/* Sidebar */}
                <div>
                    <div className="glass-card-static" style={{ position: 'sticky', top: 'calc(var(--header-height) + 20px)' }}>
                        <h1 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 8 }}>{item.title}</h1>
                        <p style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: 2, marginBottom: 12 }}>
                            <IndianRupee size={22} />{item.price}
                        </p>
                        <div className="flex gap-2 mb-4" style={{ flexWrap: 'wrap' }}>
                            <span className="badge badge-gold">{conditionLabels[item.condition]}</span>
                            <span className="badge badge-neutral">{item.category}</span>
                            {item.is_negotiable && <span className="badge badge-green">Negotiable</span>}
                        </div>
                        {item.pickup_location && (
                            <p className="flex items-center gap-2 text-sm text-muted mb-4">
                                <MapPin size={14} /> {item.pickup_location}
                            </p>
                        )}
                        <hr className="divider" />

                        {/* Seller */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="avatar">{getInitials(seller?.full_name)}</div>
                            <div>
                                <p className="font-semibold" style={{ fontSize: '0.9rem' }}>{seller?.full_name}</p>
                                <p className="text-xs text-muted">{seller?.department || 'IIT Ropar'}</p>
                            </div>
                        </div>

                        <hr className="divider" />

                        {/* Contact */}
                        <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 10 }}>Send Inquiry</h3>
                        <textarea className="textarea-field" rows={3} placeholder="Hi, I'm interested in this item..." value={message} onChange={(e) => setMessage(e.target.value)} style={{ minHeight: 80 }} />
                        <button className="btn btn-primary w-full" style={{ marginTop: 10 }} onClick={sendInquiry}>
                            <Send size={16} /> Send Message
                        </button>

                        <p className="text-xs text-muted text-center" style={{ marginTop: 10 }}>
                            Listed {format(new Date(item.created_at), 'MMM d, yyyy')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
