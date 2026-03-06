'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Phone, Building, GraduationCap, Briefcase, MapPin, Linkedin, Save, Edit2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { User as UserType } from '@/lib/types'

export default function ProfilePage() {
    const { user, session } = useAuth()
    const [editing, setEditing] = useState(false)
    const [form, setForm] = useState<Partial<UserType>>({})
    const [saving, setSaving] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        if (user) setForm({ ...user })
    }, [user])

    async function handleSave() {
        if (!user) return
        setSaving(true)
        await supabase.from('users').update({
            full_name: form.full_name,
            phone_number: form.phone_number,
            bio: form.bio,
            department: form.department,
            batch: form.batch,
            designation: form.designation,
            current_organization: form.current_organization,
            current_position: form.current_position,
            linkedin_url: form.linkedin_url,
            location: form.location,
        }).eq('id', user.id)
        setSaving(false)
        setEditing(false)
    }

    const getInitials = (name?: string) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'

    if (!user) return <div className="page-container"><div className="empty-state"><User size={48} /><h3>Please sign in</h3></div></div>

    return (
        <div className="page-container" style={{ maxWidth: 700, margin: '0 auto' }}>
            <div className="page-header">
                <h1 className="page-title">👤 Profile</h1>
                <button className="btn btn-secondary" onClick={() => setEditing(!editing)}>
                    <Edit2 size={16} /> {editing ? 'Cancel' : 'Edit Profile'}
                </button>
            </div>

            {/* Profile Header */}
            <div className="glass-card-static" style={{ marginBottom: 24, padding: 28, textAlign: 'center' }}>
                <div className="avatar avatar-xl" style={{ margin: '0 auto 16px', fontSize: '2rem' }}>
                    {user.profile_picture_url ? <img src={user.profile_picture_url} alt={user.full_name} /> : getInitials(user.full_name)}
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>{user.full_name}</h2>
                <p className="text-sm text-muted" style={{ marginTop: 4 }}>{user.email}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="badge badge-gold">{user.role}</span>
                    {user.department && <span className="badge badge-blue">{user.department}</span>}
                    <span className={`badge ${user.status === 'active' ? 'badge-green' : 'badge-red'}`}>{user.status}</span>
                </div>
                {user.bio && <p style={{ marginTop: 14, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{user.bio}</p>}
            </div>

            {/* Profile Details */}
            <div className="glass-card-static">
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 18 }}>Details</h3>

                {editing ? (
                    <div>
                        <div className="form-group">
                            <label className="input-label">Full Name</label>
                            <input className="input-field" value={form.full_name || ''} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="input-label">Phone</label>
                                <input className="input-field" value={form.phone_number || ''} onChange={e => setForm(p => ({ ...p, phone_number: e.target.value }))} />
                            </div>
                            <div className="form-group">
                                <label className="input-label">Department</label>
                                <input className="input-field" value={form.department || ''} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} />
                            </div>
                        </div>
                        {(user.role === 'student' || user.role === 'alumni') && (
                            <div className="form-group">
                                <label className="input-label">Batch</label>
                                <input className="input-field" value={form.batch || ''} onChange={e => setForm(p => ({ ...p, batch: e.target.value }))} />
                            </div>
                        )}
                        {(user.role === 'faculty' || user.role === 'staff') && (
                            <div className="form-group">
                                <label className="input-label">Designation</label>
                                <input className="input-field" value={form.designation || ''} onChange={e => setForm(p => ({ ...p, designation: e.target.value }))} />
                            </div>
                        )}
                        {user.role === 'alumni' && (
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="input-label">Organization</label>
                                    <input className="input-field" value={form.current_organization || ''} onChange={e => setForm(p => ({ ...p, current_organization: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label className="input-label">Position</label>
                                    <input className="input-field" value={form.current_position || ''} onChange={e => setForm(p => ({ ...p, current_position: e.target.value }))} />
                                </div>
                            </div>
                        )}
                        <div className="form-group">
                            <label className="input-label">Bio</label>
                            <textarea className="textarea-field" rows={3} value={form.bio || ''} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} placeholder="Tell us about yourself..." />
                        </div>
                        <div className="form-group">
                            <label className="input-label">LinkedIn URL</label>
                            <input className="input-field" value={form.linkedin_url || ''} onChange={e => setForm(p => ({ ...p, linkedin_url: e.target.value }))} placeholder="https://linkedin.com/in/..." />
                        </div>
                        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                            <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3"><Mail size={16} style={{ color: 'var(--text-tertiary)' }} /><div><p className="text-xs text-muted">Email</p><p className="text-sm">{user.email}</p></div></div>
                        {user.phone_number && <div className="flex items-center gap-3"><Phone size={16} style={{ color: 'var(--text-tertiary)' }} /><div><p className="text-xs text-muted">Phone</p><p className="text-sm">{user.phone_number}</p></div></div>}
                        {user.department && <div className="flex items-center gap-3"><Building size={16} style={{ color: 'var(--text-tertiary)' }} /><div><p className="text-xs text-muted">Department</p><p className="text-sm">{user.department}</p></div></div>}
                        {user.enrollment_number && <div className="flex items-center gap-3"><GraduationCap size={16} style={{ color: 'var(--text-tertiary)' }} /><div><p className="text-xs text-muted">Enrollment</p><p className="text-sm">{user.enrollment_number}</p></div></div>}
                        {user.batch && <div className="flex items-center gap-3"><GraduationCap size={16} style={{ color: 'var(--text-tertiary)' }} /><div><p className="text-xs text-muted">Batch</p><p className="text-sm">{user.batch}</p></div></div>}
                        {user.designation && <div className="flex items-center gap-3"><Briefcase size={16} style={{ color: 'var(--text-tertiary)' }} /><div><p className="text-xs text-muted">Designation</p><p className="text-sm">{user.designation}</p></div></div>}
                        {user.current_organization && <div className="flex items-center gap-3"><Building size={16} style={{ color: 'var(--text-tertiary)' }} /><div><p className="text-xs text-muted">Organization</p><p className="text-sm">{user.current_organization}</p></div></div>}
                        {user.linkedin_url && <div className="flex items-center gap-3"><Linkedin size={16} style={{ color: 'var(--text-tertiary)' }} /><div><p className="text-xs text-muted">LinkedIn</p><a href={user.linkedin_url} target="_blank" rel="noopener" className="text-sm text-gold">{user.linkedin_url}</a></div></div>}
                        {user.location && <div className="flex items-center gap-3"><MapPin size={16} style={{ color: 'var(--text-tertiary)' }} /><div><p className="text-xs text-muted">Location</p><p className="text-sm">{user.location}</p></div></div>}
                    </div>
                )}
            </div>
        </div>
    )
}
