'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, MapPin, Users, Ticket, Star, ExternalLink, Calendar, Share2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { Event } from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'

export default function EventDetailPage() {
    const params = useParams()
    const { user } = useAuth()
    const [event, setEvent] = useState<Event | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => { loadEvent() }, [params.slug]) // eslint-disable-line react-hooks/exhaustive-deps

    async function loadEvent() {
        const { data } = await supabase.from('events').select('*, organizer:users(id, full_name, department), location:locations(name, code)').eq('slug', params.slug).single()
        setEvent(data as Event)
        setLoading(false)
    }

    async function markInterested() {
        if (!user || !event) return
        await supabase.from('event_interested').insert({ event_id: event.id, user_id: user.id })
        loadEvent()
    }

    async function register() {
        if (!user || !event) return
        await supabase.from('event_registrations').insert({ event_id: event.id, user_id: user.id })
        loadEvent()
    }

    if (loading) return <div className="page-container" style={{ maxWidth: 800, margin: '0 auto' }}><div className="skeleton" style={{ height: 300, borderRadius: 'var(--radius-lg)' }} /></div>
    if (!event) return <div className="page-container"><div className="empty-state"><h3>Event not found</h3><Link href="/events" className="btn btn-secondary" style={{ marginTop: 16 }}>Back to Events</Link></div></div>

    const organizer = event.organizer as unknown as { full_name: string; department?: string } | undefined
    const loc = event.location as unknown as { name: string; code?: string } | undefined

    return (
        <div className="page-container" style={{ maxWidth: 800, margin: '0 auto' }}>
            <Link href="/events" className="btn btn-ghost" style={{ marginBottom: 20, marginLeft: -8 }}><ArrowLeft size={18} /> Events</Link>

            {event.poster_url && <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 24, height: 320 }}><img src={event.poster_url} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}

            <div className="flex items-center gap-2 mb-4">
                <span className="badge badge-gold">{event.type.replace('_', ' ')}</span>
                {event.is_cancelled && <span className="badge badge-red">Cancelled</span>}
                {event.organizing_body && <span className="badge badge-blue">{event.organizing_body}</span>}
            </div>

            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, lineHeight: 1.3, marginBottom: 20 }}>{event.title}</h1>

            <div className="grid-2" style={{ marginBottom: 24 }}>
                <div className="glass-card-static">
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 12, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Details</h3>
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3 text-sm"><Clock size={16} style={{ color: 'var(--accent-primary)' }} /><div><p className="font-semibold">{format(new Date(event.start_time), 'MMM d, yyyy')}</p><p className="text-xs text-muted">{format(new Date(event.start_time), 'h:mm a')} - {format(new Date(event.end_time), 'h:mm a')}</p></div></div>
                        {(loc?.name || event.venue_name) && <div className="flex items-center gap-3 text-sm"><MapPin size={16} style={{ color: 'var(--accent-primary)' }} /><span>{loc?.name || event.venue_name}</span></div>}
                        <div className="flex items-center gap-3 text-sm"><Users size={16} style={{ color: 'var(--accent-primary)' }} /><span>{event.current_participants}/{event.max_participants || '∞'} participants</span></div>
                        {event.registration_fee > 0 && <div className="flex items-center gap-3 text-sm"><Ticket size={16} style={{ color: 'var(--accent-primary)' }} /><span>₹{event.registration_fee}</span></div>}
                    </div>
                </div>
                <div className="glass-card-static">
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 12, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Organizer</h3>
                    <p className="font-semibold" style={{ fontSize: '0.95rem' }}>{organizer?.full_name}</p>
                    {organizer?.department && <p className="text-sm text-muted">{organizer.department}</p>}
                    {event.organizing_body && <p className="text-sm text-muted mt-2">{event.organizing_body}</p>}
                    <div className="flex gap-2 mt-4">
                        {event.registration_link && <a href={event.registration_link} target="_blank" rel="noopener" className="btn btn-secondary btn-sm"><ExternalLink size={14} /> Register</a>}
                        {event.meeting_link && <a href={event.meeting_link} target="_blank" rel="noopener" className="btn btn-secondary btn-sm"><ExternalLink size={14} /> Meeting</a>}
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: 12 }}>About this Event</h2>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{event.description}</p>
            </div>

            <div className="flex gap-3">
                <button className="btn btn-primary" onClick={register}><Calendar size={16} /> Register</button>
                <button className="btn btn-secondary" onClick={markInterested}><Star size={16} /> Interested ({event.interested_count})</button>
                <button className="btn btn-ghost"><Share2 size={16} /> Share</button>
            </div>
        </div>
    )
}
