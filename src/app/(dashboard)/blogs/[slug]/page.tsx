'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Heart, MessageCircle, Share2, Eye, Calendar, Briefcase, Send, Check, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { BlogPost, BlogComment } from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'

export default function BlogDetailPage() {
    const params = useParams()
    const { user } = useAuth()
    const [blog, setBlog] = useState<BlogPost | null>(null)
    const [comments, setComments] = useState<BlogComment[]>([])
    const [newComment, setNewComment] = useState('')
    const [submittingComment, setSubmittingComment] = useState(false)
    const [loading, setLoading] = useState(true)

    // Like state
    const [likedByMe, setLikedByMe] = useState(false)
    const [likeCount, setLikeCount] = useState(0)
    const [likeLoading, setLikeLoading] = useState(false)

    // Share state
    const [shareCopied, setShareCopied] = useState(false)
    const shareCopiedRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // View count (track if we already incremented to avoid double-count)
    const viewIncrementedRef = useRef(false)

    const supabase = createClient()

    useEffect(() => {
        loadBlog()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.slug])

    async function loadBlog() {
        const { data } = await supabase
            .from('blog_posts')
            .select('*, author:users(id, full_name, role, profile_picture_url, department, bio), posting_identity:user_positions(id, title, organization:organizations(name, slug))')
            .eq('slug', params.slug)
            .single()

        if (data) {
            setBlog(data as BlogPost)
            setLikeCount(data.like_count ?? 0)
            loadComments(data.id)

            // Increment view count once per load
            if (!viewIncrementedRef.current) {
                viewIncrementedRef.current = true
                await supabase
                    .from('blog_posts')
                    .update({ view_count: (data.view_count ?? 0) + 1 })
                    .eq('id', data.id)
            }

            // Check if current user liked this post
            if (user) {
                const { data: likeRow } = await supabase
                    .from('blog_likes')
                    .select('id')
                    .eq('blog_post_id', data.id)
                    .eq('user_id', user.id)
                    .maybeSingle()
                setLikedByMe(!!likeRow)
            }
        }
        setLoading(false)
    }

    async function loadComments(blogId: string) {
        const { data } = await supabase
            .from('blog_comments')
            .select('*, user:users(id, full_name, profile_picture_url)')
            .eq('blog_post_id', blogId)
            .order('created_at', { ascending: true })

        setComments((data as BlogComment[]) || [])
    }

    async function submitComment() {
        if (!newComment.trim() || !user || !blog) return
        setSubmittingComment(true)
        await supabase.from('blog_comments').insert({
            blog_post_id: blog.id,
            user_id: user.id,
            content: newComment.trim(),
        })
        // Update comment_count
        await supabase
            .from('blog_posts')
            .update({ comment_count: (blog.comment_count ?? 0) + 1 })
            .eq('id', blog.id)

        setNewComment('')
        loadComments(blog.id)
        setSubmittingComment(false)
    }

    async function handleLike() {
        if (!user || !blog || likeLoading) return
        setLikeLoading(true)

        if (likedByMe) {
            // Unlike
            setLikedByMe(false)
            setLikeCount(c => c - 1)
            await supabase.from('blog_likes').delete()
                .eq('blog_post_id', blog.id).eq('user_id', user.id)
            await supabase.from('blog_posts')
                .update({ like_count: Math.max(0, likeCount - 1) })
                .eq('id', blog.id)
        } else {
            // Like
            setLikedByMe(true)
            setLikeCount(c => c + 1)
            await supabase.from('blog_likes').insert({ blog_post_id: blog.id, user_id: user.id })
            await supabase.from('blog_posts')
                .update({ like_count: likeCount + 1 })
                .eq('id', blog.id)
        }
        setLikeLoading(false)
    }

    async function handleShare() {
        const url = `${window.location.origin}/blogs/${blog?.slug}`
        try {
            await navigator.clipboard.writeText(url)
        } catch {
            // clipboard not available — ignore
        }
        setShareCopied(true)
        if (shareCopiedRef.current) clearTimeout(shareCopiedRef.current)
        shareCopiedRef.current = setTimeout(() => setShareCopied(false), 2500)

        // Also increment share_count
        if (blog) {
            await supabase.from('blog_posts')
                .update({ share_count: (blog.share_count ?? 0) + 1 })
                .eq('id', blog.id)
        }
    }

    const getInitials = (name?: string) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
    const author = blog?.author as unknown as { full_name: string; role: string; department?: string; bio?: string; profile_picture_url?: string } | undefined
    const postingIdentity = (blog as unknown as { posting_identity?: { title: string; organization?: { name: string } } })?.posting_identity

    if (loading) {
        return (
            <div className="page-container" style={{ maxWidth: 800, margin: '0 auto' }}>
                <div className="skeleton" style={{ height: 300, marginBottom: 24, borderRadius: 'var(--radius-lg)' }} />
                <div className="skeleton skeleton-title" style={{ width: '80%' }} />
                <div className="skeleton skeleton-text" />
                <div className="skeleton skeleton-text" />
                <div className="skeleton skeleton-text" style={{ width: '60%' }} />
            </div>
        )
    }

    if (!blog) {
        return (
            <div className="page-container">
                <div className="empty-state">
                    <h3>Blog not found</h3>
                    <Link href="/blogs" className="btn btn-secondary" style={{ marginTop: 16 }}>Back to Blogs</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="page-container" style={{ maxWidth: 800, margin: '0 auto' }}>
            {/* Back */}
            <Link href="/blogs" className="btn btn-ghost" style={{ marginBottom: 20, marginLeft: -8 }}>
                <ArrowLeft size={18} /> Back to Blogs
            </Link>

            {/* Hero Image */}
            {blog.featured_image_url && (
                <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 24, height: 320 }}>
                    <img src={blog.featured_image_url} alt={blog.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
            )}

            {/* Category & Meta */}
            <div className="flex items-center gap-2 mb-4">
                <span className="badge badge-gold">{blog.category.replace('_', ' ')}</span>
                {blog.is_featured && <span className="badge badge-purple">⭐ Featured</span>}
            </div>

            <h1 style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.3, marginBottom: 16 }}>{blog.title}</h1>

            {/* Company Info */}
            {blog.company_name && (
                <div className="glass-card-static" style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20, padding: 16 }}>
                    <Briefcase size={20} style={{ color: 'var(--accent-primary)' }} />
                    <div>
                        <p className="font-semibold" style={{ fontSize: '0.9rem' }}>{blog.company_name}</p>
                        {blog.role_applied && <p className="text-sm text-muted">{blog.role_applied}</p>}
                        {blog.interview_round && <p className="text-xs text-muted">Round: {blog.interview_round}</p>}
                    </div>
                </div>
            )}

            {/* Author Info */}
            <div className="flex items-center gap-3" style={{ marginBottom: 24 }}>
                <Link href={`/users/${blog.author_id}`} className="no-underline">
                    <div className="avatar" style={{ cursor: 'pointer' }}>
                        {author?.profile_picture_url
                            ? <img src={author.profile_picture_url} alt={author.full_name} />
                            : getInitials(author?.full_name)}
                    </div>
                </Link>
                <div>
                    <div className="flex items-center gap-2">
                        <Link href={`/users/${blog.author_id}`} className="no-underline">
                            <p className="font-semibold" style={{ fontSize: '0.9rem', color: 'var(--text-primary)', cursor: 'pointer' }}>{author?.full_name}</p>
                        </Link>
                        {postingIdentity?.title && (
                            <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>
                                {postingIdentity.title}{postingIdentity.organization?.name ? `, ${postingIdentity.organization.name}` : ''}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted">
                        <span>{author?.role} {author?.department ? `• ${author.department}` : ''}</span>
                        <span>•</span>
                        <Calendar size={12} />
                        <span>{blog.published_at ? format(new Date(blog.published_at), 'MMM d, yyyy') : format(new Date(blog.created_at), 'MMM d, yyyy')}</span>
                    </div>

                </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mb-6" style={{ paddingBottom: 20, borderBottom: '1px solid var(--glass-border)' }}>
                <span className="flex items-center gap-1 text-sm text-muted"><Eye size={16} /> {blog.view_count + 1} views</span>
                <span className="flex items-center gap-1 text-sm text-muted"><Heart size={16} /> {likeCount} likes</span>
                <span className="flex items-center gap-1 text-sm text-muted"><MessageCircle size={16} /> {comments.length} comments</span>
            </div>

            {/* Content */}
            <div style={{ fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--text-secondary)', marginBottom: 32, whiteSpace: 'pre-wrap' }}>
                {blog.content}
            </div>

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
                <div className="flex gap-2 mb-6" style={{ flexWrap: 'wrap' }}>
                    {blog.tags.map((tag, i) => (
                        <span key={i} className="tag">#{tag}</span>
                    ))}
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6" style={{ paddingTop: 16, borderTop: '1px solid var(--glass-border)', alignItems: 'center' }}>
                {/* Like */}
                <button
                    className="btn btn-secondary"
                    onClick={handleLike}
                    disabled={!user || likeLoading}
                    style={{
                        color: likedByMe ? 'var(--accent-primary)' : undefined,
                        borderColor: likedByMe ? 'var(--accent-primary)' : undefined,
                        fontWeight: likedByMe ? 600 : undefined,
                        transition: 'all 0.15s ease',
                    }}
                >
                    {likeLoading
                        ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                        : <Heart size={16} fill={likedByMe ? 'currentColor' : 'none'} />}
                    {likedByMe ? 'Liked' : 'Like'} · {likeCount}
                </button>

                {/* Share */}
                <div style={{ position: 'relative' }}>
                    <button className="btn btn-secondary" onClick={handleShare}>
                        {shareCopied ? <Check size={16} /> : <Share2 size={16} />}
                        {shareCopied ? 'Link Copied!' : 'Share'}
                    </button>
                </div>

                {!user && (
                    <span className="text-xs text-muted" style={{ marginLeft: 4 }}>Sign in to like</span>
                )}
            </div>

            {/* Comments */}
            <div className="glass-card-static" style={{ marginTop: 24 }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: 20 }}>
                    Comments ({comments.length})
                </h3>

                {/* Comment Input */}
                {user && (
                    <div className="flex gap-3" style={{ marginBottom: 24 }}>
                        <div className="avatar avatar-sm">
                            {user.profile_picture_url
                                ? <img src={user.profile_picture_url} alt={user.full_name} />
                                : getInitials(user.full_name)}
                        </div>
                        <div style={{ flex: 1 }}>
                            <textarea
                                className="textarea-field"
                                placeholder="Write a comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                rows={2}
                                style={{ minHeight: 60 }}
                            />
                            <button
                                className="btn btn-primary btn-sm"
                                style={{ marginTop: 8 }}
                                onClick={submitComment}
                                disabled={!newComment.trim() || submittingComment}
                            >
                                {submittingComment
                                    ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                                    : <Send size={14} />}
                                {' '}Post Comment
                            </button>
                        </div>
                    </div>
                )}

                {/* Comment List */}
                {comments.length === 0 ? (
                    <p className="text-sm text-muted text-center" style={{ padding: '20px 0' }}>No comments yet. Be the first!</p>
                ) : (
                    <div className="flex flex-col gap-4">
                        {comments.map((comment) => {
                            const cu = comment.user as unknown as { full_name: string; profile_picture_url?: string } | undefined
                            return (
                                <div key={comment.id} className="flex gap-3">
                                    <div className="avatar avatar-sm">
                                        {cu?.profile_picture_url
                                            ? <img src={cu.profile_picture_url} alt={cu.full_name} />
                                            : getInitials(cu?.full_name)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold" style={{ fontSize: '0.85rem' }}>{cu?.full_name}</span>
                                            <span className="text-xs text-muted">{format(new Date(comment.created_at), 'MMM d, yyyy')}</span>
                                        </div>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5 }}>{comment.content}</p>
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
