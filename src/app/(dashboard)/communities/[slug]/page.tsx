'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users, Globe, Lock, Send, Heart, MessageCircle, Pin } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { Community, CommunityPost } from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'

export default function CommunityDetailPage() {
    const params = useParams()
    const { user } = useAuth()
    const [community, setCommunity] = useState<Community | null>(null)
    const [posts, setPosts] = useState<CommunityPost[]>([])
    const [loading, setLoading] = useState(true)
    const [newPost, setNewPost] = useState('')
    const supabase = createClient()

    useEffect(() => { load() }, [params.slug]) // eslint-disable-line react-hooks/exhaustive-deps

    async function load() {
        const { data: c } = await supabase.from('communities').select('*').eq('slug', params.slug).single()
        setCommunity(c as Community)
        if (c) {
            const { data: p } = await supabase.from('community_posts').select('*, author:users(id, full_name, profile_picture_url, role)').eq('community_id', c.id).order('is_pinned', { ascending: false }).order('created_at', { ascending: false }).limit(30)
            setPosts((p as CommunityPost[]) || [])
        }
        setLoading(false)
    }

    async function submitPost(e: React.FormEvent) {
        e.preventDefault()
        if (!newPost.trim() || !user || !community) return
        await supabase.from('community_posts').insert({ community_id: community.id, author_id: user.id, content: newPost.trim() })
        setNewPost('')
        load()
    }

    const getInitials = (name?: string) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'

    if (loading) return <div className="page-container"><div className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-lg)' }} /></div>
    if (!community) return <div className="page-container"><div className="empty-state"><h3>Community not found</h3><Link href="/communities" className="btn btn-secondary" style={{ marginTop: 16 }}>Back</Link></div></div>

    return (
        <div className="page-container" style={{ maxWidth: 800, margin: '0 auto' }}>
            <Link href="/communities" className="btn btn-ghost" style={{ marginBottom: 20, marginLeft: -8 }}><ArrowLeft size={18} /> Communities</Link>

            {/* Community Header */}
            <div className="glass-card-static" style={{ marginBottom: 24, padding: 28 }}>
                {community.cover_image_url && <div style={{ margin: '-28px -28px 20px -28px', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0', overflow: 'hidden', height: 160 }}><img src={community.cover_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
                <div className="flex items-center gap-4">
                    <div className="avatar avatar-lg" style={{ background: 'var(--gradient-blue)' }}>{community.name.charAt(0)}</div>
                    <div>
                        <h1 style={{ fontSize: '1.4rem', fontWeight: 700 }}>{community.name}</h1>
                        <div className="flex items-center gap-3 text-sm text-muted" style={{ marginTop: 4 }}>
                            {community.is_public ? <><Globe size={14} /> Public</> : <><Lock size={14} /> Private</>}
                            <span>•</span><Users size={14} /> <span>{community.member_count} members</span>
                            <span>•</span><span>{community.post_count} posts</span>
                        </div>
                    </div>
                </div>
                {community.description && <p style={{ marginTop: 14, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{community.description}</p>}
            </div>

            {/* New Post */}
            {user && (
                <form onSubmit={submitPost} className="glass-card-static" style={{ marginBottom: 20 }}>
                    <textarea className="textarea-field" rows={3} placeholder="Share something with the community..." value={newPost} onChange={e => setNewPost(e.target.value)} style={{ minHeight: 70 }} />
                    <button type="submit" className="btn btn-primary btn-sm" style={{ marginTop: 8 }}><Send size={14} /> Post</button>
                </form>
            )}

            {/* Posts */}
            {posts.length === 0 ? (
                <div className="glass-card-static empty-state"><MessageCircle size={40} /><h3>No posts yet</h3><p>Be the first to post in this community!</p></div>
            ) : (
                <div className="flex flex-col gap-4">
                    {posts.map(post => {
                        const author = post.author as unknown as { full_name: string; role: string } | undefined
                        return (
                            <div key={post.id} className="glass-card animate-fade-in-up">
                                {post.is_pinned && <div className="flex items-center gap-1 text-xs mb-2" style={{ color: 'var(--accent-primary)' }}><Pin size={12} /> Pinned</div>}
                                <div className="flex gap-3">
                                    <div className="avatar avatar-sm">{getInitials(author?.full_name)}</div>
                                    <div style={{ flex: 1 }}>
                                        <div className="flex items-center gap-2"><span className="font-semibold" style={{ fontSize: '0.85rem' }}>{author?.full_name}</span><span className="badge badge-neutral" style={{ fontSize: '0.6rem' }}>{author?.role}</span><span className="text-xs text-muted">{format(new Date(post.created_at), 'MMM d')}</span></div>
                                        {post.title && <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: 6 }}>{post.title}</h4>}
                                        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.6 }}>{post.content}</p>
                                        <div className="flex gap-4" style={{ marginTop: 10 }}>
                                            <button className="btn btn-ghost btn-sm"><Heart size={14} /> {post.like_count}</button>
                                            <button className="btn btn-ghost btn-sm"><MessageCircle size={14} /> {post.comment_count}</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
