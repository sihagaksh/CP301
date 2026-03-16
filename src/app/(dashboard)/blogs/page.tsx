'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BookOpen, Search, Plus, Eye, Heart, MessageCircle, Filter, TrendingUp, Briefcase, GraduationCap, User2, FlaskConical } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { BlogPost, BlogCategory } from '@/lib/types'
import { format } from 'date-fns'

const categories: { label: string; value: BlogCategory | 'all'; icon: React.ReactNode; color: string }[] = [
    { label: 'All', value: 'all', icon: <BookOpen size={14} />, color: 'neutral' },
    { label: 'Placement', value: 'placement', icon: <Briefcase size={14} />, color: 'gold' },
    { label: 'Internship', value: 'internship', icon: <TrendingUp size={14} />, color: 'blue' },
    { label: 'Faculty Insight', value: 'faculty_insight', icon: <User2 size={14} />, color: 'purple' },
    { label: 'Alumni', value: 'alumni_experience', icon: <GraduationCap size={14} />, color: 'green' },
    { label: 'Research', value: 'research', icon: <FlaskConical size={14} />, color: 'red' },
]

export default function BlogsPage() {
    const [blogs, setBlogs] = useState<BlogPost[]>([])
    const [loading, setLoading] = useState(true)
    const [activeCategory, setActiveCategory] = useState<string>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const supabase = createClient()

    useEffect(() => {
        loadBlogs()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeCategory])

    async function loadBlogs() {
        setLoading(true)
        let query = supabase
            .from('blog_posts')
            .select('*, author:users(id, full_name, role, profile_picture_url, department), posting_identity:user_positions(id, title, organization:organizations(name, slug))')
            .eq('status', 'published')
            .order('published_at', { ascending: false })
            .limit(20)

        if (activeCategory !== 'all') {
            query = query.eq('category', activeCategory)
        }

        const { data } = await query
        setBlogs((data as BlogPost[]) || [])
        setLoading(false)
    }

    const filtered = searchQuery
        ? blogs.filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.company_name?.toLowerCase().includes(searchQuery.toLowerCase()))
        : blogs

    const getInitials = (name?: string) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'

    const getCategoryBadge = (cat: BlogCategory) => {
        const c = categories.find(c => c.value === cat)
        return c ? `badge-${c.color}` : 'badge-neutral'
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">📝 Blogs</h1>
                    <p className="page-subtitle">Placement experiences, faculty insights, alumni stories & research</p>
                </div>
                <Link href="/blogs/create" className="btn btn-primary">
                    <Plus size={18} /> Write Blog
                </Link>
            </div>

            {/* Search */}
            <div className="search-bar" style={{ marginBottom: 20, maxWidth: 500 }}>
                <Search size={18} />
                <input placeholder="Search blogs, companies..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>

            {/* Category Tabs */}
            <div className="tabs">
                {categories.map(cat => (
                    <button
                        key={cat.value}
                        className={`tab ${activeCategory === cat.value ? 'active' : ''}`}
                        onClick={() => setActiveCategory(cat.value)}
                    >
                        {cat.icon}
                        <span style={{ marginLeft: 6 }}>{cat.label}</span>
                    </button>
                ))}
            </div>

            {/* Blog Grid */}
            {loading ? (
                <div className="grid-auto">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="glass-card-static">
                            <div className="skeleton" style={{ height: 160, marginBottom: 14, borderRadius: 'var(--radius-md)' }} />
                            <div className="skeleton skeleton-title" />
                            <div className="skeleton skeleton-text" />
                            <div className="skeleton skeleton-text" style={{ width: '60%' }} />
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="glass-card-static empty-state">
                    <BookOpen size={48} />
                    <h3>No Blogs Found</h3>
                    <p>Be the first to share your experience with the community!</p>
                    <Link href="/blogs/create" className="btn btn-primary" style={{ marginTop: 16 }}>Write a Blog</Link>
                </div>
            ) : (
                <div className="grid-auto">
                    {filtered.map((blog, i) => (
                        <Link key={blog.id} href={`/blogs/${blog.slug}`} className="no-underline">
                            <article className={`glass-card animate-fade-in-up delay-${Math.min(i + 1, 6)}`} style={{ cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                {blog.featured_image_url && (
                                    <div style={{ marginTop: -20, marginLeft: -20, marginRight: -20, marginBottom: 14, borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0', overflow: 'hidden', height: 160 }}>
                                        <img src={blog.featured_image_url} alt={blog.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                )}
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`badge ${getCategoryBadge(blog.category)}`}>
                                        {blog.category.replace('_', ' ')}
                                    </span>
                                    {blog.is_featured && <span className="badge badge-gold">⭐ Featured</span>}
                                </div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                                    {blog.title}
                                </h3>
                                {blog.company_name && (
                                    <p style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', marginBottom: 6 }}>
                                        🏢 {blog.company_name} {blog.role_applied ? `• ${blog.role_applied}` : ''}
                                    </p>
                                )}
                                <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', flex: 1, lineHeight: 1.5 }}>
                                    {blog.excerpt || blog.content.slice(0, 150)}...
                                </p>
                                <div style={{ borderTop: '1px solid var(--glass-border)', marginTop: 14, paddingTop: 12 }}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="avatar avatar-sm">{getInitials((blog.author as unknown as { full_name: string })?.full_name)}</div>
                                            <div>
                                                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block' }}>
                                                    {(blog.author as unknown as { full_name: string })?.full_name}
                                                </span>
                                                {(blog as unknown as { posting_identity?: { title: string; organization?: { name: string } } }).posting_identity?.title && (
                                                    <span style={{ fontSize: '0.68rem', color: 'var(--accent-primary)' }}>
                                                        {(blog as unknown as { posting_identity: { title: string; organization?: { name: string } } }).posting_identity.title}
                                                        {(blog as unknown as { posting_identity: { organization?: { name: string } } }).posting_identity.organization?.name
                                                            ? `, ${(blog as unknown as { posting_identity: { organization: { name: string } } }).posting_identity.organization.name}`
                                                            : ''}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-muted">
                                            <span className="flex items-center gap-1"><Eye size={12} /> {blog.view_count}</span>
                                            <span className="flex items-center gap-1"><Heart size={12} /> {blog.like_count}</span>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
