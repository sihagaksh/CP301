'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Heart, MessageCircle, Share2, Check, Send, Loader2, ChevronLeft, ChevronRight, Sparkles, BookOpen, Calendar, Megaphone } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'

interface PostComment {
    id: string
    post_id: string
    user_id: string
    content: string
    created_at: string
    user?: { id: string; full_name: string; profile_picture_url?: string }
}

interface PostDetail {
    id: string
    content: string
    media_urls?: string[]
    source_type?: string
    like_count: number
    comment_count: number
    share_count: number
    created_at: string
    author_id: string
    author?: { id: string; full_name: string; role: string; profile_picture_url?: string; department?: string }
    posting_identity?: { id: string; title: string; organization?: { name: string; slug: string } }
}

export default function PostDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { user } = useAuth()
    const postId = params.id as string

    const [post, setPost] = useState<PostDetail | null>(null)
    const [comments, setComments] = useState<PostComment[]>([])
    const [loading, setLoading] = useState(true)
    const [carouselIdx, setCarouselIdx] = useState(0)

    // Like
    const [likedByMe, setLikedByMe] = useState(false)
    const [likeCount, setLikeCount] = useState(0)
    const [likeLoading, setLikeLoading] = useState(false)

    // Comment
    const [commentInput, setCommentInput] = useState('')
    const [submitting, setSubmitting] = useState(false)

    // Share
    const [shareCopied, setShareCopied] = useState(false)
    const shareTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    const supabase = createClient()

    useEffect(() => {
        loadPost()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [postId])

    async function loadPost() {
        setLoading(true)
        const { data } = await supabase
            .from('feed_posts')
            .select('*, author:users(id, full_name, role, profile_picture_url, department), posting_identity:user_positions(id, title, organization:organizations(name, slug))')
            .eq('id', postId)
            .single()

        if (data) {
            setPost(data as PostDetail)
            setLikeCount(data.like_count ?? 0)
            loadComments()

            if (user) {
                const { data: likeRow } = await supabase
                    .from('feed_likes')
                    .select('id')
                    .eq('post_id', postId)
                    .eq('user_id', user.id)
                    .maybeSingle()
                setLikedByMe(!!likeRow)
            }
        }
        setLoading(false)
    }

    async function loadComments() {
        const { data } = await supabase
            .from('feed_comments')
            .select('*, user:users(id, full_name, profile_picture_url)')
            .eq('post_id', postId)
            .order('created_at', { ascending: true })
        setComments(data || [])
    }

    async function handleLike() {
        if (!user || !post || likeLoading) return
        setLikeLoading(true)

        if (likedByMe) {
            setLikedByMe(false)
            setLikeCount(c => c - 1)
            await supabase.from('feed_likes').delete().eq('post_id', postId).eq('user_id', user.id)
            await supabase.from('feed_posts').update({ like_count: Math.max(0, likeCount - 1) }).eq('id', postId)
        } else {
            setLikedByMe(true)
            setLikeCount(c => c + 1)
            await supabase.from('feed_likes').insert({ post_id: postId, user_id: user.id })
            await supabase.from('feed_posts').update({ like_count: likeCount + 1 }).eq('id', postId)
        }
        setLikeLoading(false)
    }

    async function submitComment() {
        if (!commentInput.trim() || !user || !post) return
        setSubmitting(true)

        const { data: newComment } = await supabase
            .from('feed_comments')
            .insert({ post_id: postId, user_id: user.id, content: commentInput.trim() })
            .select('*, user:users(id, full_name, profile_picture_url)')
            .single()

        if (newComment) {
            setComments(prev => [...prev, newComment as PostComment])
            setPost(p => p ? { ...p, comment_count: p.comment_count + 1 } : p)
        }
        setCommentInput('')
        setSubmitting(false)
    }

    async function handleShare() {
        const url = `${window.location.origin}/posts/${postId}`
        try { await navigator.clipboard.writeText(url) } catch { /* silent */ }
        setShareCopied(true)
        if (shareTimer.current) clearTimeout(shareTimer.current)
        shareTimer.current = setTimeout(() => setShareCopied(false), 2500)
        if (post) {
            await supabase.from('feed_posts')
                .update({ share_count: (post.share_count ?? 0) + 1 })
                .eq('id', postId)
        }
    }

    const getInitials = (name?: string) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'

    const getSourceIcon = (type?: string) => {
        switch (type) {
            case 'blog': return <BookOpen size={13} />
            case 'event': return <Calendar size={13} />
            case 'notice': return <Megaphone size={13} />
            default: return <Sparkles size={13} />
        }
    }

    if (loading) {
        return (
            <div className="page-container" style={{ maxWidth: 600, margin: '0 auto' }}>
                <div className="skeleton skeleton-avatar" style={{ marginBottom: 16 }} />
                <div className="skeleton skeleton-text" />
                <div className="skeleton skeleton-text" style={{ width: '70%' }} />
                <div className="skeleton" style={{ height: 300, borderRadius: 12, marginTop: 16 }} />
            </div>
        )
    }

    if (!post) {
        return (
            <div className="page-container">
                <div className="empty-state">
                    <h3>Post not found</h3>
                    <button className="btn btn-secondary" onClick={() => router.back()} style={{ marginTop: 16 }}>Go back</button>
                </div>
            </div>
        )
    }

    const author = post.author as unknown as { id: string; full_name: string; role: string; profile_picture_url?: string; department?: string } | undefined
    const identity = post.posting_identity as unknown as { title: string; organization?: { name: string } } | undefined
    const hasMultiple = (post.media_urls?.length ?? 0) > 1

    return (
        <div className="page-container" style={{ maxWidth: 600, margin: '0 auto' }}>
            {/* Back */}
            <button className="btn btn-ghost" onClick={() => router.back()} style={{ marginBottom: 20, marginLeft: -8 }}>
                <ArrowLeft size={18} /> Back
            </button>

            {/* Post Card */}
            <div className="glass-card-static" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
                {/* Author Row */}
                <div style={{ padding: '14px 16px 0' }}>
                    <Link href={`/users/${author?.id}`} className="no-underline" style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                        <div className="avatar" style={{ cursor: 'pointer' }}>
                            {author?.profile_picture_url
                                ? <img src={author.profile_picture_url} alt={author.full_name} />
                                : getInitials(author?.full_name)}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold" style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                                    {author?.full_name || 'Unknown User'}
                                </span>
                                {identity?.title ? (
                                    <span className="badge badge-gold" style={{ fontSize: '0.6rem' }}>
                                        {identity.title}{identity.organization?.name ? `, ${identity.organization.name}` : ''}
                                    </span>
                                ) : (
                                    <span className="badge badge-neutral" style={{ fontSize: '0.6rem' }}>{author?.role}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted" style={{ marginTop: 2 }}>
                                {getSourceIcon(post.source_type)}
                                <span>{post.source_type || 'post'}</span>
                                <span>•</span>
                                <span>{format(new Date(post.created_at), 'MMM d, yyyy · h:mm a')}</span>
                            </div>
                        </div>
                    </Link>

                    {/* Content */}
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 14, whiteSpace: 'pre-wrap' }}>
                        {post.content}
                    </p>
                </div>

                {/* Media Carousel */}
                {post.media_urls && post.media_urls.length > 0 && (
                    <div style={{ position: 'relative', background: 'black' }}>
                        <div style={{ aspectRatio: '1', overflow: 'hidden', maxHeight: 500 }}>
                            <img
                                src={post.media_urls[carouselIdx]}
                                alt={`Photo ${carouselIdx + 1}`}
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                        </div>
                        {hasMultiple && (
                            <>
                                <button onClick={() => setCarouselIdx(i => (i - 1 + post.media_urls!.length) % post.media_urls!.length)}
                                    style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                                    <ChevronLeft size={20} />
                                </button>
                                <button onClick={() => setCarouselIdx(i => (i + 1) % post.media_urls!.length)}
                                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                                    <ChevronRight size={20} />
                                </button>
                                {/* Dot indicators */}
                                <div style={{ display: 'flex', justifyContent: 'center', gap: 5, padding: '8px 0', background: 'black' }}>
                                    {post.media_urls.map((_, i) => (
                                        <button key={i} onClick={() => setCarouselIdx(i)}
                                            style={{ width: i === carouselIdx ? 18 : 7, height: 7, borderRadius: 99, background: i === carouselIdx ? 'var(--accent-primary)' : 'rgba(255,255,255,0.4)', border: 'none', cursor: 'pointer', transition: 'all 0.25s', padding: 0 }} />
                                    ))}
                                </div>
                                <div style={{ position: 'absolute', top: 10, right: 12, background: 'rgba(0,0,0,0.6)', borderRadius: 20, padding: '3px 10px', fontSize: '0.75rem', color: 'white' }}>
                                    {carouselIdx + 1} / {post.media_urls.length}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Action Bar */}
                <div style={{ padding: '10px 16px', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: 4, alignItems: 'center' }}>
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={handleLike}
                        disabled={!user || likeLoading}
                        style={{ color: likedByMe ? 'var(--accent-primary)' : undefined, fontWeight: likedByMe ? 600 : undefined }}
                    >
                        {likeLoading
                            ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                            : <Heart size={16} fill={likedByMe ? 'currentColor' : 'none'} />}
                        {likeCount}
                    </button>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--accent-primary)' }}>
                        <MessageCircle size={16} fill="currentColor" /> {comments.length}
                    </button>
                    <div style={{ position: 'relative', marginLeft: 'auto' }}>
                        <button className="btn btn-ghost btn-sm" onClick={handleShare}>
                            {shareCopied ? <Check size={16} /> : <Share2 size={16} />}
                            {shareCopied ? 'Copied!' : 'Share'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Comments Section */}
            <div className="glass-card-static">
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>
                    Comments ({comments.length})
                </h3>

                {/* Input */}
                {user ? (
                    <div className="flex gap-3" style={{ marginBottom: 20, alignItems: 'flex-start' }}>
                        <div className="avatar avatar-sm">
                            {user.profile_picture_url
                                ? <img src={user.profile_picture_url} alt={user.full_name} />
                                : getInitials(user.full_name)}
                        </div>
                        <div style={{ flex: 1 }}>
                            <textarea
                                className="textarea-field"
                                placeholder="Write a comment..."
                                value={commentInput}
                                onChange={e => setCommentInput(e.target.value)}
                                rows={2}
                                style={{ minHeight: 56 }}
                            />
                            <button
                                className="btn btn-primary btn-sm"
                                style={{ marginTop: 8 }}
                                onClick={submitComment}
                                disabled={!commentInput.trim() || submitting}
                            >
                                {submitting ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={14} />}
                                {' '}Post Comment
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-muted" style={{ marginBottom: 16 }}>Sign in to comment.</p>
                )}

                {/* List */}
                {comments.length === 0 ? (
                    <p className="text-sm text-muted text-center" style={{ padding: '16px 0' }}>No comments yet.</p>
                ) : (
                    <div className="flex flex-col gap-4">
                        {comments.map(c => {
                            const cu = c.user as unknown as { id: string; full_name: string; profile_picture_url?: string } | undefined
                            return (
                                <div key={c.id} className="flex gap-3">
                                    <Link href={`/users/${cu?.id}`} className="no-underline">
                                        <div className="avatar avatar-sm" style={{ cursor: 'pointer' }}>
                                            {cu?.profile_picture_url
                                                ? <img src={cu.profile_picture_url} alt={cu.full_name} />
                                                : getInitials(cu?.full_name)}
                                        </div>
                                    </Link>
                                    <div style={{ flex: 1, background: 'var(--bg-tertiary)', borderRadius: 10, padding: '8px 12px' }}>
                                        <div className="flex items-center gap-2">
                                            <Link href={`/users/${cu?.id}`} className="no-underline">
                                                <span className="font-semibold" style={{ fontSize: '0.83rem', color: 'var(--text-primary)' }}>{cu?.full_name}</span>
                                            </Link>
                                            <span className="text-xs text-muted">{format(new Date(c.created_at), 'MMM d, h:mm a')}</span>
                                        </div>
                                        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5 }}>{c.content}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    )
}
