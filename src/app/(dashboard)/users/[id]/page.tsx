'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeft, Heart, MessageCircle, Share2, Grid, List,
    Mail, Building, GraduationCap, Briefcase, Linkedin,
    MapPin, Award, Calendar, ChevronLeft, ChevronRight
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'

interface UserProfile {
    id: string
    full_name: string
    role: string
    email: string
    profile_picture_url?: string
    bio?: string
    department?: string
    branch?: string
    batch?: string
    designation?: string
    current_organization?: string
    current_position?: string
    linkedin_url?: string
    is_verified: boolean
}

interface PostItem {
    id: string
    content: string
    media_urls?: string[]
    like_count: number
    comment_count: number
    created_at: string
    source_type?: string
}

export default function UserProfilePage() {
    const params = useParams()
    const router = useRouter()
    const { user: me } = useAuth()
    const userId = params.id as string

    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [posts, setPosts] = useState<PostItem[]>([])
    const [loading, setLoading] = useState(true)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [activeCarousel, setActiveCarousel] = useState<Record<string, number>>({})

    const supabase = createClient()

    useEffect(() => {
        loadProfile()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId])

    async function loadProfile() {
        setLoading(true)
        const [{ data: userData }, { data: postsData }] = await Promise.all([
            supabase
                .from('users')
                .select('id, full_name, role, email, profile_picture_url, bio, department, branch, batch, designation, current_organization, current_position, linkedin_url, is_verified')
                .eq('id', userId)
                .single(),
            supabase
                .from('feed_posts')
                .select('id, content, media_urls, like_count, comment_count, created_at, source_type')
                .eq('author_id', userId)
                .order('created_at', { ascending: false })
                .limit(30),
        ])

        if (userData) setProfile(userData as UserProfile)
        setPosts(postsData || [])
        setLoading(false)
    }

    const getInitials = (name?: string) =>
        name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'

    function changeCarousel(postId: string, dir: 1 | -1, total: number) {
        setActiveCarousel(prev => ({
            ...prev,
            [postId]: ((prev[postId] ?? 0) + dir + total) % total
        }))
    }

    if (loading) {
        return (
            <div className="page-container" style={{ maxWidth: 700, margin: '0 auto' }}>
                <div className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-lg)', marginBottom: 20 }} />
                <div className="skeleton skeleton-title" style={{ width: '40%' }} />
                <div className="skeleton skeleton-text" />
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="page-container">
                <div className="empty-state">
                    <h3>User not found</h3>
                    <button className="btn btn-secondary" onClick={() => router.back()} style={{ marginTop: 16 }}>Go back</button>
                </div>
            </div>
        )
    }

    const isOwnProfile = me?.id === userId

    return (
        <div className="page-container" style={{ maxWidth: 680, margin: '0 auto' }}>
            {/* Back */}
            <button className="btn btn-ghost" onClick={() => router.back()} style={{ marginBottom: 20, marginLeft: -8 }}>
                <ArrowLeft size={18} /> Back
            </button>

            {/* Profile Header — Instagram style */}
            <div className="glass-card-static" style={{ marginBottom: 24, padding: '28px 28px 20px' }}>
                <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>
                    {/* Avatar */}
                    <div className="avatar" style={{ width: 88, height: 88, minWidth: 88, fontSize: '2rem', flexShrink: 0, border: '3px solid var(--accent-primary)' }}>
                        {profile.profile_picture_url
                            ? <img src={profile.profile_picture_url} alt={profile.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : getInitials(profile.full_name)}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="flex items-center gap-2" style={{ flexWrap: 'wrap', marginBottom: 6 }}>
                            <h1 style={{ fontSize: '1.3rem', fontWeight: 700 }}>{profile.full_name}</h1>
                            {profile.is_verified && <span style={{ color: 'var(--accent-primary)', fontSize: 18 }}>✓</span>}
                            {isOwnProfile && (
                                <Link href="/profile" className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }}>
                                    Edit Profile
                                </Link>
                            )}
                        </div>

                        {/* Badges */}
                        <div className="flex gap-2" style={{ flexWrap: 'wrap', marginBottom: 10 }}>
                            <span className="badge badge-gold">{profile.role}</span>
                            {profile.department && <span className="badge badge-blue">{profile.department}</span>}
                            {profile.branch && <span className="badge badge-purple">{profile.branch}</span>}
                            {profile.batch && <span className="badge badge-neutral">{profile.batch}</span>}
                        </div>

                        {/* Stats row */}
                        <div className="flex gap-6" style={{ marginBottom: 10 }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{posts.length}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Posts</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{posts.reduce((s, p) => s + p.like_count, 0)}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Likes</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{posts.reduce((s, p) => s + p.comment_count, 0)}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Comments</div>
                            </div>
                        </div>

                        {/* Bio */}
                        {profile.bio && (
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{profile.bio}</p>
                        )}
                    </div>
                </div>

                {/* Extra Details */}
                <div className="flex flex-col gap-2" style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--glass-border)' }}>
                    {profile.designation && (
                        <div className="flex items-center gap-2 text-sm text-muted">
                            <Briefcase size={14} /> {profile.designation}
                        </div>
                    )}
                    {profile.current_organization && (
                        <div className="flex items-center gap-2 text-sm text-muted">
                            <Building size={14} /> {profile.current_organization}
                            {profile.current_position ? ` — ${profile.current_position}` : ''}
                        </div>
                    )}
                    {profile.department && !profile.designation && (
                        <div className="flex items-center gap-2 text-sm text-muted">
                            <Building size={14} /> {profile.department}
                        </div>
                    )}
                    {profile.batch && (
                        <div className="flex items-center gap-2 text-sm text-muted">
                            <GraduationCap size={14} /> Batch {profile.batch}
                        </div>
                    )}
                    {profile.linkedin_url && (
                        <a href={profile.linkedin_url} target="_blank" rel="noopener" className="flex items-center gap-2 text-sm" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>
                            <Linkedin size={14} /> LinkedIn Profile
                        </a>
                    )}
                </div>
            </div>

            {/* Posts Section */}
            <div className="flex items-center justify-between mb-4">
                <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Posts</h2>
                <div className="flex gap-1">
                    <button
                        className={`btn btn-ghost btn-sm ${viewMode === 'grid' ? 'btn-active' : ''}`}
                        onClick={() => setViewMode('grid')}
                        style={{ color: viewMode === 'grid' ? 'var(--accent-primary)' : undefined }}
                    >
                        <Grid size={16} />
                    </button>
                    <button
                        className={`btn btn-ghost btn-sm ${viewMode === 'list' ? 'btn-active' : ''}`}
                        onClick={() => setViewMode('list')}
                        style={{ color: viewMode === 'list' ? 'var(--accent-primary)' : undefined }}
                    >
                        <List size={16} />
                    </button>
                </div>
            </div>

            {posts.length === 0 ? (
                <div className="glass-card-static empty-state">
                    <MapPin size={40} />
                    <h3>No Posts Yet</h3>
                    <p>{isOwnProfile ? 'Share something with the community!' : 'This user has not posted yet.'}</p>
                </div>
            ) : viewMode === 'grid' ? (
                /* Instagram-style grid */
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
                    {posts.map(post => {
                        const imgUrl = post.media_urls?.[0]
                        return (
                            <Link key={post.id} href={`/posts/${post.id}`} className="no-underline">
                                <div style={{
                                    aspectRatio: '1',
                                    background: imgUrl ? 'black' : 'var(--bg-tertiary)',
                                    borderRadius: 6,
                                    overflow: 'hidden',
                                    position: 'relative',
                                    cursor: 'pointer',
                                }}>
                                    {imgUrl ? (
                                        <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.2s' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', padding: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textAlign: 'center', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }}>
                                                {post.content}
                                            </p>
                                        </div>
                                    )}
                                    {/* Hover overlay */}
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        background: 'rgba(0,0,0,0)',
                                        transition: 'background 0.2s',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
                                        color: 'white', fontSize: '0.85rem', fontWeight: 600,
                                    }}
                                        className="grid-hover-overlay">
                                        <span className="flex items-center gap-1"><Heart size={14} fill="white" /> {post.like_count}</span>
                                        <span className="flex items-center gap-1"><MessageCircle size={14} fill="white" /> {post.comment_count}</span>
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            ) : (
                /* List view */
                <div className="flex flex-col gap-4">
                    {posts.map(post => {
                        const hasMultiple = (post.media_urls?.length ?? 0) > 1
                        const carouselIdx = activeCarousel[post.id] ?? 0
                        return (
                            <Link key={post.id} href={`/posts/${post.id}`} className="no-underline">
                                <div className="glass-card animate-fade-in-up" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }}>
                                    {post.media_urls && post.media_urls.length > 0 && (
                                        <div style={{ position: 'relative' }}>
                                            <div style={{ aspectRatio: '16/9', overflow: 'hidden' }}>
                                                <img src={post.media_urls[carouselIdx]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                            {hasMultiple && (
                                                <>
                                                    <button onClick={e => { e.preventDefault(); changeCarousel(post.id, -1, post.media_urls!.length) }}
                                                        style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: '50%', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                                                        <ChevronLeft size={16} />
                                                    </button>
                                                    <button onClick={e => { e.preventDefault(); changeCarousel(post.id, 1, post.media_urls!.length) }}
                                                        style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: '50%', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                                                        <ChevronRight size={16} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                    <div style={{ padding: '12px 16px' }}>
                                        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 10 }}>{post.content}</p>
                                        <div className="flex items-center gap-4 text-xs text-muted">
                                            <span className="flex items-center gap-1"><Heart size={12} /> {post.like_count}</span>
                                            <span className="flex items-center gap-1"><MessageCircle size={12} /> {post.comment_count}</span>
                                            <span className="flex items-center gap-1"><Calendar size={12} /> {format(new Date(post.created_at), 'MMM d, yyyy')}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            )}

            <style jsx>{`
                .grid-hover-overlay:hover {
                    background: rgba(0,0,0,0.45) !important;
                }
            `}</style>
        </div>
    )
}
