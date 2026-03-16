'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { BlogCategory } from '@/lib/types'

export default function CreateBlogPage() {
    const router = useRouter()
    const { user, postingIdentities, activeIdentity } = useAuth()
    const supabase = createClient()

    const [form, setForm] = useState({
        title: '',
        content: '',
        excerpt: '',
        category: 'general' as BlogCategory,
        company_name: '',
        role_applied: '',
        interview_round: '',
        tags: '',
        featured_image_url: '',
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    function update(field: string, value: string) {
        setForm(p => ({ ...p, [field]: value }))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!user) {
            setError('You must be signed in to publish a blog.')
            return
        }
        setLoading(true)
        setError('')

        const slug = form.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36)

        try {
            const { error: err } = await supabase.from('blog_posts').insert({
                author_id: user.id,
                title: form.title,
                slug,
                content: form.content,
                excerpt: form.excerpt || form.content.slice(0, 200),
                category: form.category,
                company_name: form.company_name || null,
                role_applied: form.role_applied || null,
                interview_round: form.interview_round || null,
                tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [],
                featured_image_url: form.featured_image_url || null,
                posting_identity_id: activeIdentity?.id || null,
                status: 'published',
                published_at: new Date().toISOString(),
            })

            if (err) {
                console.error('Blog publish error:', err)
                setError(err.message || 'Failed to publish blog. Please try again.')
                setLoading(false)
            } else {
                router.push('/blogs')
            }
        } catch (err) {
            console.error('Blog publish exception:', err)
            setError('An unexpected error occurred. Please try again.')
            setLoading(false)
        }
    }

    const isPlacement = form.category === 'placement' || form.category === 'internship'

    return (
        <div className="page-container" style={{ maxWidth: 720, margin: '0 auto' }}>
            <Link href="/blogs" className="btn btn-ghost" style={{ marginBottom: 20, marginLeft: -8 }}>
                <ArrowLeft size={18} /> Back to Blogs
            </Link>

            <h1 className="page-title" style={{ marginBottom: 24 }}>✍️ Write a Blog</h1>

            <form onSubmit={handleSubmit}>
                <div className="glass-card-static" style={{ marginBottom: 20 }}>
                    {error && (
                        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--accent-danger)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: 16 }}>
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label className="input-label">Title *</label>
                        <input className="input-field" placeholder="e.g. My Google Interview Experience" value={form.title} onChange={(e) => update('title', e.target.value)} required />
                    </div>

                    <div className="form-group">
                        <label className="input-label">Category *</label>
                        <select className="select-field" value={form.category} onChange={(e) => update('category', e.target.value)}>
                            <option value="general">General</option>
                            <option value="placement">Placement Experience</option>
                            <option value="internship">Internship Experience</option>
                            {user?.role === 'faculty' && (
                                <option value="faculty_insight">Faculty Insight</option>
                            )}
                            <option value="alumni_experience">Alumni Experience</option>
                            <option value="research">Research</option>
                        </select>
                    </div>

                    {isPlacement && (
                        <div className="form-row">
                            <div className="form-group">
                                <label className="input-label">Company Name</label>
                                <input className="input-field" placeholder="e.g. Google" value={form.company_name} onChange={(e) => update('company_name', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="input-label">Role Applied</label>
                                <input className="input-field" placeholder="e.g. SDE" value={form.role_applied} onChange={(e) => update('role_applied', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="input-label">Interview Round</label>
                                <input className="input-field" placeholder="e.g. Technical Round 1" value={form.interview_round} onChange={(e) => update('interview_round', e.target.value)} />
                            </div>
                        </div>
                    )}

                    <div className="form-group">
                        <label className="input-label">Excerpt / Summary</label>
                        <textarea className="textarea-field" rows={2} placeholder="Brief summary of your blog..." value={form.excerpt} onChange={(e) => update('excerpt', e.target.value)} style={{ minHeight: 60 }} />
                    </div>

                    <div className="form-group">
                        <label className="input-label">Content *</label>
                        <textarea className="textarea-field" rows={12} placeholder="Write your blog content here..." value={form.content} onChange={(e) => update('content', e.target.value)} required style={{ minHeight: 250 }} />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="input-label">Featured Image URL</label>
                            <input className="input-field" placeholder="https://..." value={form.featured_image_url} onChange={(e) => update('featured_image_url', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="input-label">Tags (comma separated)</label>
                            <input className="input-field" placeholder="e.g. placement, google, dsa" value={form.tags} onChange={(e) => update('tags', e.target.value)} />
                        </div>
                    </div>
                </div>

                <div className="flex justify-between">
                    {postingIdentities.length > 1 && (
                        <p className="text-sm text-muted" style={{ lineHeight: '40px' }}>
                            Posting as <strong style={{ color: 'var(--accent-primary)' }}>{activeIdentity?.label}{activeIdentity?.org_name ? ` — ${activeIdentity.org_name}` : ''}</strong>
                        </p>
                    )}
                    <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ marginLeft: 'auto' }}>
                        {loading ? 'Publishing...' : 'Publish Blog'}
                        {!loading && <Send size={18} />}
                    </button>
                </div>
            </form>
        </div>
    )
}
