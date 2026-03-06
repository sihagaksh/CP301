'use client'

import { useState, useEffect } from 'react'
import { MapPin, Search, Building, Clock, Accessibility, Wifi, FlaskConical, BookOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { Location, LocationType } from '@/lib/types'

const locationTypes: { label: string; value: LocationType | 'all'; icon: React.ReactNode }[] = [
    { label: 'All', value: 'all', icon: <MapPin size={14} /> },
    { label: 'Academic', value: 'academic', icon: <BookOpen size={14} /> },
    { label: 'Hostel', value: 'hostel', icon: <Building size={14} /> },
    { label: 'Administrative', value: 'administrative', icon: <Building size={14} /> },
    { label: 'Recreational', value: 'recreational', icon: <FlaskConical size={14} /> },
    { label: 'Mess', value: 'mess', icon: <Building size={14} /> },
    { label: 'Medical', value: 'medical', icon: <Building size={14} /> },
    { label: 'Sports', value: 'sports', icon: <Building size={14} /> },
]

export default function MapPage() {
    const [locations, setLocations] = useState<Location[]>([])
    const [loading, setLoading] = useState(true)
    const [locType, setLocType] = useState<string>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [selected, setSelected] = useState<Location | null>(null)
    const supabase = createClient()

    useEffect(() => { loadLocations() }, [locType]) // eslint-disable-line react-hooks/exhaustive-deps

    async function loadLocations() {
        setLoading(true)
        let query = supabase.from('locations').select('*').order('name')
        if (locType !== 'all') query = query.eq('type', locType)
        const { data } = await query
        setLocations((data as Location[]) || [])
        setLoading(false)
    }

    const filtered = searchQuery ? locations.filter(l => l.name.toLowerCase().includes(searchQuery.toLowerCase()) || l.code?.toLowerCase().includes(searchQuery.toLowerCase())) : locations

    const typeBadge = (t: LocationType) => {
        const map: Record<string, string> = { academic: 'badge-blue', hostel: 'badge-green', administrative: 'badge-gold', recreational: 'badge-purple', mess: 'badge-gold', medical: 'badge-red', sports: 'badge-green' }
        return map[t] || 'badge-neutral'
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">🗺️ Campus Map</h1>
                    <p className="page-subtitle">Explore buildings, facilities & locations across IIT Ropar</p>
                </div>
            </div>

            <div className="search-bar" style={{ marginBottom: 20, maxWidth: 500 }}>
                <Search size={18} /><input placeholder="Search locations, buildings..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>

            <div className="flex gap-2 mb-6" style={{ flexWrap: 'wrap' }}>
                {locationTypes.map(t => (
                    <button key={t.value} className={`btn btn-sm ${locType === t.value ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setLocType(t.value)}>
                        {t.icon} <span style={{ marginLeft: 4 }}>{t.label}</span>
                    </button>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: 24 }}>
                {/* Map Placeholder + Grid */}
                <div>
                    {/* Map placeholder */}
                    <div className="glass-card-static" style={{ height: 280, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(59,130,246,0.05) 0%, rgba(245,158,11,0.05) 100%)' }}>
                        <div className="text-center">
                            <MapPin size={40} style={{ color: 'var(--accent-primary)', marginBottom: 8 }} />
                            <p className="text-sm text-muted">Interactive campus map</p>
                            <p className="text-xs text-muted" style={{ marginTop: 4 }}>Click on a location below to see details</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid-3">{[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="glass-card-static"><div className="skeleton skeleton-title" /><div className="skeleton skeleton-text" /></div>)}</div>
                    ) : filtered.length === 0 ? (
                        <div className="glass-card-static empty-state"><MapPin size={48} /><h3>No Locations Found</h3></div>
                    ) : (
                        <div className="grid-3">
                            {filtered.map((loc, i) => (
                                <div key={loc.id} className={`glass-card animate-fade-in-up delay-${Math.min(i + 1, 6)} ${selected?.id === loc.id ? 'active' : ''}`} style={{ cursor: 'pointer', borderColor: selected?.id === loc.id ? 'var(--accent-primary)' : undefined }} onClick={() => setSelected(loc)}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`badge ${typeBadge(loc.type)}`}>{loc.type}</span>
                                        {loc.code && <span className="badge badge-neutral">{loc.code}</span>}
                                    </div>
                                    <h3 className="font-semibold" style={{ fontSize: '0.9rem', marginBottom: 4 }}>{loc.name}</h3>
                                    {loc.is_accessible && <span className="text-xs text-muted flex items-center gap-1"><Accessibility size={12} /> Accessible</span>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Detail Panel */}
                {selected && (
                    <div className="glass-card-static animate-slide-in-left" style={{ position: 'sticky', top: 'calc(var(--header-height) + 20px)', alignSelf: 'start' }}>
                        <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: 4 }}>{selected.name}</h2>
                        {selected.code && <p className="text-sm text-gold mb-4">{selected.code}</p>}
                        <span className={`badge ${typeBadge(selected.type)} mb-4`} style={{ display: 'inline-flex' }}>{selected.type}</span>
                        {selected.description && <p className="text-sm text-muted" style={{ lineHeight: 1.6, marginBottom: 16 }}>{selected.description}</p>}
                        <div className="flex flex-col gap-3 text-sm">
                            {selected.floor_count && <span className="flex items-center gap-2"><Building size={14} style={{ color: 'var(--accent-primary)' }} /> {selected.floor_count} floors</span>}
                            {selected.opening_time && <span className="flex items-center gap-2"><Clock size={14} style={{ color: 'var(--accent-primary)' }} /> {selected.opening_time} - {selected.closing_time}</span>}
                            {selected.is_accessible && <span className="flex items-center gap-2"><Accessibility size={14} style={{ color: 'var(--accent-success)' }} /> Wheelchair accessible</span>}
                        </div>
                        {selected.facilities && selected.facilities.length > 0 && (
                            <div style={{ marginTop: 16 }}>
                                <h4 className="text-sm font-semibold mb-2">Facilities</h4>
                                <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>{selected.facilities.map((f, i) => <span key={i} className="tag">{f}</span>)}</div>
                            </div>
                        )}
                        <button className="btn btn-secondary btn-sm mt-4" onClick={() => setSelected(null)}>Close</button>
                    </div>
                )}
            </div>
        </div>
    )
}
