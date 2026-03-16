'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Search, MapPin, Clock, Users, Ticket, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { Event, EventType } from '@/lib/types'
import { format } from 'date-fns'

const eventTypes: { label: string; value: EventType | 'all' }[] = [
    { label: 'All', value: 'all' },
    { label: 'ISMP', value: 'ismp' },
    { label: 'Workshop', value: 'workshop' },
    { label: 'Seminar', value: 'seminar' },
    { label: 'Competition', value: 'competition' },
    { label: 'Cultural', value: 'cultural' },
    { label: 'Sports', value: 'sports' },
    { label: 'E-Sports', value: 'esports' },
    { label: 'Literary', value: 'literary' },
    { label: 'Fest', value: 'fest' },
    { label: 'Club', value: 'club_activity' },
]

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)
    const [eventType, setEventType] = useState<string>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const supabase = createClient()

    useEffect(() => { loadEvents() }, [eventType]) // eslint-disable-line react-hooks/exhaustive-deps

    async function loadEvents() {
        setLoading(true)
        let query = supabase
            .from('events')
            .select('*, organizer:users(id, full_name), location:locations(name, code), posting_identity:user_positions(id, title, organization:organizations(name))')
            .eq('is_published', true)
            .eq('is_cancelled', false)
            .order('start_time', { ascending: true })
            .limit(30)

        if (eventType !== 'all') query = query.eq('type', eventType)
        const { data } = await query
        setEvents((data as Event[]) || [])
        setLoading(false)
    }

    const filtered = searchQuery ? events.filter(e => e.title.toLowerCase().includes(searchQuery.toLowerCase())) : events

    const typeBadgeColor = (t: EventType) => {
        const map: Record<string, string> = { ismp: 'badge-gold', workshop: 'badge-blue', seminar: 'badge-purple', competition: 'badge-red', cultural: 'badge-green', sports: 'badge-gold', esports: 'badge-red', literary: 'badge-purple', fest: 'badge-gold', club_activity: 'badge-blue' }
        return map[t] || 'badge-neutral'
    }

    const isUpcoming = (d: string) => new Date(d) > new Date()

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">🎉 Events</h1>
                    <p className="page-subtitle">Campus events, workshops, competitions & activities</p>
                </div>
            </div>

            <div className="search-bar" style={{ marginBottom: 20, maxWidth: 500 }}>
                <Search size={18} /><input placeholder="Search events..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>

            <div className="flex gap-2 mb-6" style={{ flexWrap: 'wrap', overflowX: 'auto' }}>
                {eventTypes.map(t => (
                    <button key={t.value} className={`btn btn-sm ${eventType === t.value ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setEventType(t.value)}>{t.label}</button>
                ))}
            </div>

            {loading ? (
                <div className="grid-auto">{[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="glass-card-static"><div className="skeleton" style={{ height: 160, marginBottom: 12, borderRadius: 'var(--radius-md)' }} /><div className="skeleton skeleton-title" /><div className="skeleton skeleton-text" /></div>)}</div>
            ) : filtered.length === 0 ? (
                <div className="glass-card-static empty-state"><Calendar size={48} /><h3>No Events Found</h3><p>Check back later for upcoming events!</p></div>
            ) : (
                <div className="grid-auto">
                    {filtered.map((event, i) => {
                        const organizer = event.organizer as unknown as { full_name: string } | undefined
                        const loc = event.location as unknown as { name: string; code?: string } | undefined
                        const upcoming = isUpcoming(event.start_time)
                        return (
                            <Link key={event.id} href={`/events/${event.slug}`} className="no-underline">
                                <div className={`glass-card animate-fade-in-up delay-${Math.min(i + 1, 6)}`} style={{ cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    {event.poster_url && (
                                        <div style={{ margin: '-20px -20px 14px -20px', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0', overflow: 'hidden', height: 160 }}>
                                            <img src={event.poster_url} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`badge ${typeBadgeColor(event.type)}`}>{event.type.replace('_', ' ')}</span>
                                        {upcoming && <span className="badge badge-green">Upcoming</span>}
                                        {event.registration_fee > 0 && <span className="badge badge-gold"><Ticket size={10} /> ₹{event.registration_fee}</span>}
                                    </div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>{event.title}</h3>
                                    <div className="flex flex-col gap-2 text-sm text-muted" style={{ flex: 1 }}>
                                        <span className="flex items-center gap-2"><Clock size={14} /> {format(new Date(event.start_time), 'MMM d, yyyy • h:mm a')}</span>
                                        {(loc?.name || event.venue_name) && <span className="flex items-center gap-2"><MapPin size={14} /> {loc?.name || event.venue_name}</span>}
                                        {event.organizing_body && <span className="flex items-center gap-2"><Users size={14} /> {event.organizing_body}</span>}
                                    </div>
                                    <div style={{ borderTop: '1px solid var(--glass-border)', marginTop: 12, paddingTop: 10 }} className="flex items-center justify-between text-xs text-muted">
                                        <span>{organizer?.full_name}</span>
                                        <span className="flex items-center gap-1"><Star size={12} /> {event.interested_count} interested</span>
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
