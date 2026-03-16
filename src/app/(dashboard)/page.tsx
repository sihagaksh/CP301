'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
    Heart, MessageCircle, Share2, TrendingUp, BookOpen, Calendar,
    Megaphone, ShoppingBag, Users, Sparkles, Send, ChevronDown,
    ImageIcon, X, ChevronLeft, ChevronRight, Check, Loader2
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'

interface FeedComment {
    id: string
    post_id: string
    user_id: string
    content: string
    created_at: string
    user?: {
        id: string
        full_name: string
        profile_picture_url?: string
    }
}

interface FeedItem {
    id: string
    content: string
    media_urls?: string[]
    source_type?: string
    source_id?: string
    like_count: number
    comment_count: number
    created_at: string
    posting_identity_id?: string
    author?: {
        id: string
        full_name: string
        role: string
        profile_picture_url?: string
        department?: string
    }
    posting_identity?: {
        id: string
        title: string
        organization?: { name: string; slug: string }
    }
    // Client-side state
    likedByMe?: boolean
    commentsOpen?: boolean
    comments?: FeedComment[]
    commentsLoading?: boolean
    shareTooltip?: boolean
    carouselIndex?: number
}

export default function FeedPage() {
    const { user, postingIdentities, activeIdentity, setActiveIdentity } = useAuth()
    const [feedItems, setFeedItems] = useState<FeedItem[]>([])
    const [loading, setLoading] = useState(true)
    const [newPost, setNewPost] = useState('')
    const [posting, setPosting] = useState(false)
    const [showIdentityPicker, setShowIdentityPicker] = useState(false)

    // Photo upload state
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [previewUrls, setPreviewUrls] = useState<string[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [uploadingImages, setUploadingImages] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)

    // Comment inputs per post
    const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})
    const [submittingComment, setSubmittingComment] = useState<string | null>(null)

    const supabase = createClient()

    useEffect(() => {
        loadFeed()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    async function loadFeed() {
        const { data: posts } = await supabase
            .from('feed_posts')
            .select('*, author:users(id, full_name, role, profile_picture_url, department), posting_identity:user_positions(id, title, organization:organizations(name, slug))')
            .order('created_at', { ascending: false })
            .limit(20)

        if (!posts) { setLoading(false); return }

        // Load likes by current user
        let likedSet = new Set<string>()
        if (user) {
            const { data: likes } = await supabase
                .from('feed_likes')
                .select('post_id')
                .eq('user_id', user.id)
                .in('post_id', posts.map(p => p.id))
            likedSet = new Set((likes || []).map((l: { post_id: string }) => l.post_id))
        }

        setFeedItems(posts.map(p => ({
            ...p,
            likedByMe: likedSet.has(p.id),
            commentsOpen: false,
            comments: [],
            commentsLoading: false,
            shareTooltip: false,
            carouselIndex: 0,
        })))
        setLoading(false)
    }

    // ─── Like / Unlike ───────────────────────────────────────────────────────
    async function handleLike(postId: string) {
        if (!user) return
        const post = feedItems.find(p => p.id === postId)
        if (!post) return

        const wasLiked = post.likedByMe

        // Optimistic update
        setFeedItems(prev => prev.map(p =>
            p.id === postId
                ? { ...p, likedByMe: !wasLiked, like_count: wasLiked ? p.like_count - 1 : p.like_count + 1 }
                : p
        ))

        if (wasLiked) {
            await supabase.from('feed_likes').delete().eq('post_id', postId).eq('user_id', user.id)
            await supabase.from('feed_posts').update({ like_count: post.like_count - 1 }).eq('id', postId)
        } else {
            await supabase.from('feed_likes').insert({ post_id: postId, user_id: user.id })
            await supabase.from('feed_posts').update({ like_count: post.like_count + 1 }).eq('id', postId)
        }
    }

    // ─── Comments ────────────────────────────────────────────────────────────
    async function toggleComments(postId: string) {
        const post = feedItems.find(p => p.id === postId)
        if (!post) return

        if (post.commentsOpen) {
            setFeedItems(prev => prev.map(p => p.id === postId ? { ...p, commentsOpen: false } : p))
            return
        }

        setFeedItems(prev => prev.map(p =>
            p.id === postId ? { ...p, commentsOpen: true, commentsLoading: true } : p
        ))

        const { data } = await supabase
            .from('feed_comments')
            .select('*, user:users(id, full_name, profile_picture_url)')
            .eq('post_id', postId)
            .order('created_at', { ascending: true })

        setFeedItems(prev => prev.map(p =>
            p.id === postId ? { ...p, comments: data || [], commentsLoading: false } : p
        ))
    }

    async function submitComment(postId: string) {
        const content = (commentInputs[postId] || '').trim()
        if (!content || !user) return

        setSubmittingComment(postId)

        const { data: newComment } = await supabase
            .from('feed_comments')
            .insert({ post_id: postId, user_id: user.id, content })
            .select('*, user:users(id, full_name, profile_picture_url)')
            .single()

        setFeedItems(prev => prev.map(p =>
            p.id === postId
                ? {
                    ...p,
                    comment_count: p.comment_count + 1,
                    comments: [...(p.comments || []), newComment],
                }
                : p
        ))
        setCommentInputs(prev => ({ ...prev, [postId]: '' }))
        setSubmittingComment(null)
    }

    // ─── Share ───────────────────────────────────────────────────────────────
    async function handleShare(postId: string) {
        // Each post has its own dedicated page at /posts/[id]
        const url = `${window.location.origin}/posts/${postId}`
        try {
            await navigator.clipboard.writeText(url)
        } catch {
            // clipboard API unavailable (e.g. non-https), silent fail
        }
        setFeedItems(prev => prev.map(p => p.id === postId ? { ...p, shareTooltip: true } : p))
        setTimeout(() => {
            setFeedItems(prev => prev.map(p => p.id === postId ? { ...p, shareTooltip: false } : p))
        }, 2500)
        // Increment share_count
        const post = feedItems.find(p => p.id === postId)
        if (post) {
            await supabase.from('feed_posts')
                .update({ share_count: (post as unknown as { share_count: number }).share_count + 1 })
                .eq('id', postId)
        }
    }

    // ─── Image Carousel ───────────────────────────────────────────────────────
    function changeCarousel(postId: string, direction: 1 | -1) {
        const post = feedItems.find(p => p.id === postId)
        if (!post?.media_urls) return
        const total = post.media_urls.length
        const current = post.carouselIndex ?? 0
        const next = (current + direction + total) % total
        setFeedItems(prev => prev.map(p => p.id === postId ? { ...p, carouselIndex: next } : p))
    }

    // ─── Photo selection ─────────────────────────────────────────────────────
    function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files || []).slice(0, 10)
        setSelectedFiles(files)
        const urls = files.map(f => URL.createObjectURL(f))
        setPreviewUrls(urls)
    }

    function removeSelectedFile(index: number) {
        const newFiles = selectedFiles.filter((_, i) => i !== index)
        const newUrls = previewUrls.filter((_, i) => i !== index)
        setSelectedFiles(newFiles)
        setPreviewUrls(newUrls)
    }

    // ─── Upload images to Supabase Storage ───────────────────────────────────
    async function uploadImages(): Promise<{ urls: string[]; failed: boolean }> {
        if (selectedFiles.length === 0) return { urls: [], failed: false }
        setUploadingImages(true)
        setUploadError(null)
        const uploadedUrls: string[] = []
        let anyFailed = false

        for (const file of selectedFiles) {
            const ext = file.name.split('.').pop()
            const path = `${user!.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
            const { data: uploadData, error } = await supabase.storage
                .from('feed-media')
                .upload(path, file, { cacheControl: '3600', upsert: false })
            console.log('[feed-media upload]', { path, uploadData, error })
            if (error) {
                console.error('[feed-media upload error]', error.message, error)
                anyFailed = true
            } else {
                const { data: { publicUrl } } = supabase.storage
                    .from('feed-media')
                    .getPublicUrl(path)
                console.log('[feed-media publicUrl]', publicUrl)
                uploadedUrls.push(publicUrl)
            }
        }

        setUploadingImages(false)

        if (anyFailed && uploadedUrls.length === 0) {
            setUploadError(
                'Image upload failed. Make sure the "feed-media" storage bucket exists in your Supabase project and is set to Public. Check the browser console for details.'
            )
            return { urls: [], failed: true }
        }

        if (anyFailed) {
            setUploadError('Some images failed to upload. Only the successful ones will be posted.')
        }

        return { urls: uploadedUrls, failed: false }
    }

    // ─── Create Post ──────────────────────────────────────────────────────────
    async function handlePost() {
        if (!newPost.trim() || !user) return
        setPosting(true)
        setUploadError(null)

        const { urls: mediaUrls, failed } = await uploadImages()

        // If ALL uploads failed but files were selected, abort posting with photos
        if (failed) {
            setPosting(false)
            return
        }

        await supabase.from('feed_posts').insert({
            author_id: user.id,
            content: newPost.trim(),
            posting_identity_id: activeIdentity?.id || null,
            media_urls: mediaUrls.length > 0 ? mediaUrls : null,
        })

        setNewPost('')
        setSelectedFiles([])
        setPreviewUrls([])
        setUploadError(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
        setPosting(false)
        loadFeed()
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────
    const quickActions = [
        { label: 'Write Blog', href: '/blogs/create', icon: BookOpen, color: 'gold' },
        { label: 'Sell Item', href: '/marketplace/create', icon: ShoppingBag, color: 'blue' },
        { label: 'Events', href: '/events', icon: Calendar, color: 'purple' },
        { label: 'Communities', href: '/communities', icon: Users, color: 'green' },
    ]

    const getSourceIcon = (type?: string) => {
        switch (type) {
            case 'blog': return <BookOpen size={14} />
            case 'event': return <Calendar size={14} />
            case 'notice': return <Megaphone size={14} />
            default: return <Sparkles size={14} />
        }
    }

    const getInitials = (name?: string) =>
        name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'

    const getIdentityLabel = (item: FeedItem) => {
        if (item.posting_identity?.title) {
            const orgName = (item.posting_identity.organization as unknown as { name: string })?.name
            return orgName ? `${item.posting_identity.title}, ${orgName}` : item.posting_identity.title
        }
        return null
    }

    return (
        <div className="page-container">
            {/* Welcome Header */}
            <div className="feed-welcome glass-card-static" style={{ marginBottom: 24, padding: 28, background: 'var(--gradient-card)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)' }} />
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>
                    Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}! 👋
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Stay connected with the IIT Ropar community
                </p>
            </div>

            {/* Quick Actions */}
            <div className="grid-4" style={{ marginBottom: 28 }}>
                {quickActions.map((action) => (
                    <Link key={action.href} href={action.href} className="no-underline">
                        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
                            <div className={`stat-icon ${action.color}`}>
                                <action.icon size={22} />
                            </div>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                                {action.label}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
                {/* Main Feed */}
                <div>
                    {/* Create Post */}
                    <div className="glass-card-static" style={{ marginBottom: 20 }}>
                        <div className="flex items-center gap-3" style={{ marginBottom: 12 }}>
                            <div className="avatar">
                                {user?.profile_picture_url ? (
                                    <img src={user.profile_picture_url} alt={user.full_name} />
                                ) : (
                                    getInitials(user?.full_name)
                                )}
                            </div>
                            <div style={{ flex: 1 }}>
                                <textarea
                                    value={newPost}
                                    onChange={(e) => setNewPost(e.target.value)}
                                    placeholder="Share something with the community..."
                                    style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', color: 'var(--text-primary)', fontSize: '0.9rem', resize: 'none', minHeight: 60, fontFamily: 'inherit' }}
                                />
                            </div>
                        </div>

                        {/* Upload Error */}
                        {uploadError && (
                            <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: 8, padding: '8px 12px', marginBottom: 10, fontSize: '0.82rem', color: '#f87171', lineHeight: 1.5 }}>
                                ⚠️ {uploadError}
                            </div>
                        )}

                        {/* Image Previews */}
                        {previewUrls.length > 0 && (
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                                {previewUrls.map((url, i) => (
                                    <div key={i} style={{ position: 'relative', width: 80, height: 80, borderRadius: 8, overflow: 'hidden', border: '2px solid var(--glass-border)' }}>
                                        <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <button
                                            onClick={() => removeSelectedFile(i)}
                                            style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            {/* Left: identity picker + photo button */}
                            <div className="flex items-center gap-2">
                                {/* Photo upload */}
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => fileInputRef.current?.click()}
                                    title="Add photos"
                                    style={{ color: 'var(--accent-primary)' }}
                                >
                                    <ImageIcon size={16} />
                                    {selectedFiles.length > 0 ? ` ${selectedFiles.length}` : ' Photo'}
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    style={{ display: 'none' }}
                                    onChange={handleFileSelect}
                                />

                                {postingIdentities.length > 1 && (
                                    <div style={{ position: 'relative' }}>
                                        <button className="btn btn-ghost btn-sm" onClick={() => setShowIdentityPicker(!showIdentityPicker)}>
                                            Posting as: <strong style={{ color: 'var(--accent-primary)' }}>{activeIdentity?.label}</strong>
                                            <ChevronDown size={14} />
                                        </button>
                                        {showIdentityPicker && (
                                            <div style={{ position: 'absolute', top: '100%', left: 0, background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: 6, zIndex: 10, minWidth: 200 }}>
                                                {postingIdentities.map((identity, i) => (
                                                    <button key={i} className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => { setActiveIdentity(identity); setShowIdentityPicker(false) }}>
                                                        {identity.label}{identity.org_name ? ` — ${identity.org_name}` : ''}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <button
                                className="btn btn-primary btn-sm"
                                onClick={handlePost}
                                disabled={!newPost.trim() || posting || uploadingImages}
                                style={{ marginLeft: 'auto' }}
                            >
                                {(posting || uploadingImages) ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={14} />}
                                {' '}{posting || uploadingImages ? 'Posting...' : 'Post'}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                        <h2 style={{ fontSize: '1.15rem', fontWeight: 600 }}>
                            <TrendingUp size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8, color: 'var(--accent-primary)' }} />
                            Activity Feed
                        </h2>
                    </div>

                    {loading ? (
                        <div className="flex flex-col gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="glass-card-static">
                                    <div className="flex gap-3 mb-4">
                                        <div className="skeleton skeleton-avatar" />
                                        <div style={{ flex: 1 }}>
                                            <div className="skeleton skeleton-text" style={{ width: '40%' }} />
                                            <div className="skeleton skeleton-text" style={{ width: '25%' }} />
                                        </div>
                                    </div>
                                    <div className="skeleton skeleton-text" />
                                    <div className="skeleton skeleton-text" style={{ width: '80%' }} />
                                </div>
                            ))}
                        </div>
                    ) : feedItems.length === 0 ? (
                        <div className="glass-card-static empty-state">
                            <Sparkles size={48} />
                            <h3>Your Feed is Empty</h3>
                            <p>Join communities, follow events, and connect with your peers to see activity here.</p>
                            <Link href="/communities" className="btn btn-primary" style={{ marginTop: 16 }}>
                                Explore Communities
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {feedItems.map((item) => {
                                const identityLabel = getIdentityLabel(item)
                                const hasMultipleImages = item.media_urls && item.media_urls.length > 1
                                const carouselIdx = item.carouselIndex ?? 0

                                return (
                                    <div key={item.id} id={`post-${item.id}`} className="glass-card animate-fade-in-up" style={{ padding: 0, overflow: 'hidden' }}>
                                        {/* Post Header & Content */}
                                        <div style={{ padding: '16px 18px 0' }}>
                                            <div className="flex gap-3" style={{ marginBottom: 12 }}>
                                                <Link href={`/users/${item.author?.id}`} className="no-underline">
                                                    <div className="avatar" style={{ cursor: 'pointer' }}>
                                                        {item.author?.profile_picture_url ? (
                                                            <img src={item.author.profile_picture_url} alt={item.author.full_name} />
                                                        ) : (
                                                            getInitials(item.author?.full_name)
                                                        )}
                                                    </div>
                                                </Link>
                                                <div style={{ flex: 1 }}>
                                                    <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
                                                        <Link href={`/users/${item.author?.id}`} className="no-underline">
                                                            <span className="font-semibold" style={{ fontSize: '0.9rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                                                                {item.author?.full_name || 'Unknown User'}
                                                            </span>
                                                        </Link>
                                                        {identityLabel ? (
                                                            <span className="badge badge-gold" style={{ fontSize: '0.6rem' }}>
                                                                {identityLabel}
                                                            </span>
                                                        ) : (
                                                            <span className="badge badge-neutral" style={{ fontSize: '0.6rem' }}>
                                                                {item.author?.role}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-muted" style={{ marginTop: 2 }}>
                                                        {getSourceIcon(item.source_type)}
                                                        <span>{item.source_type || 'post'}</span>
                                                        <span>•</span>
                                                        <span>{format(new Date(item.created_at), 'MMM d, yyyy')}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
                                                {item.content}
                                            </p>
                                        </div>

                                        {/* Media */}
                                        {item.media_urls && item.media_urls.length > 0 && (
                                            <div style={{ position: 'relative', background: 'var(--bg-tertiary)' }}>
                                                {/* Carousel image */}
                                                <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden' }}>
                                                    <img
                                                        src={item.media_urls[carouselIdx]}
                                                        alt={`Photo ${carouselIdx + 1}`}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                                    />

                                                    {/* Prev / Next arrows */}
                                                    {hasMultipleImages && (
                                                        <>
                                                            <button
                                                                onClick={() => changeCarousel(item.id, -1)}
                                                                style={{
                                                                    position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
                                                                    background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: '50%',
                                                                    width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                    cursor: 'pointer', color: 'white', zIndex: 2
                                                                }}
                                                            >
                                                                <ChevronLeft size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => changeCarousel(item.id, 1)}
                                                                style={{
                                                                    position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                                                                    background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: '50%',
                                                                    width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                    cursor: 'pointer', color: 'white', zIndex: 2
                                                                }}
                                                            >
                                                                <ChevronRight size={18} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>

                                                {/* Dot indicators */}
                                                {hasMultipleImages && (
                                                    <div style={{ display: 'flex', justifyContent: 'center', gap: 5, padding: '8px 0' }}>
                                                        {item.media_urls!.map((_, dotIdx) => (
                                                            <button
                                                                key={dotIdx}
                                                                onClick={() => setFeedItems(prev => prev.map(p => p.id === item.id ? { ...p, carouselIndex: dotIdx } : p))}
                                                                style={{
                                                                    width: dotIdx === carouselIdx ? 18 : 7,
                                                                    height: 7,
                                                                    borderRadius: 99,
                                                                    background: dotIdx === carouselIdx ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.25s ease',
                                                                    padding: 0,
                                                                }}
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div style={{ padding: '10px 18px', borderTop: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            {/* Like */}
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                onClick={() => handleLike(item.id)}
                                                style={{
                                                    color: item.likedByMe ? 'var(--accent-primary)' : undefined,
                                                    fontWeight: item.likedByMe ? 600 : undefined,
                                                    transition: 'color 0.15s ease',
                                                }}
                                            >
                                                <Heart size={16} fill={item.likedByMe ? 'currentColor' : 'none'} /> {item.like_count}
                                            </button>

                                            {/* Comment */}
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                onClick={() => toggleComments(item.id)}
                                                style={{ color: item.commentsOpen ? 'var(--accent-primary)' : undefined }}
                                            >
                                                <MessageCircle size={16} /> {item.comment_count}
                                            </button>

                                            {/* Share */}
                                            <div style={{ position: 'relative' }}>
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    onClick={() => handleShare(item.id)}
                                                >
                                                    <Share2 size={16} /> Share
                                                </button>
                                                {item.shareTooltip && (
                                                    <div style={{
                                                        position: 'absolute', bottom: '110%', left: '50%', transform: 'translateX(-50%)',
                                                        background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
                                                        borderRadius: 8, padding: '4px 10px', whiteSpace: 'nowrap',
                                                        fontSize: '0.75rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: 4,
                                                        zIndex: 10,
                                                    }}>
                                                        <Check size={12} /> Link copied!
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Comments Panel */}
                                        {item.commentsOpen && (
                                            <div style={{ padding: '0 18px 14px', borderTop: '1px solid var(--glass-border)' }}>
                                                {item.commentsLoading ? (
                                                    <div style={{ textAlign: 'center', padding: 16, color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                                                        <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                                                    </div>
                                                ) : (
                                                    <>
                                                        {(item.comments || []).length === 0 && (
                                                            <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', textAlign: 'center', padding: '10px 0' }}>
                                                                No comments yet. Be the first!
                                                            </p>
                                                        )}
                                                        <div className="flex flex-col gap-2" style={{ marginTop: 10 }}>
                                                            {(item.comments || []).map(comment => (
                                                                <div key={comment.id} className="flex gap-2" style={{ alignItems: 'flex-start' }}>
                                                                    <div className="avatar" style={{ width: 28, height: 28, minWidth: 28, fontSize: '0.65rem' }}>
                                                                        {comment.user?.profile_picture_url ? (
                                                                            <img src={comment.user.profile_picture_url} alt={comment.user.full_name} />
                                                                        ) : (
                                                                            getInitials(comment.user?.full_name)
                                                                        )}
                                                                    </div>
                                                                    <div style={{ background: 'var(--bg-tertiary)', borderRadius: 10, padding: '6px 10px', flex: 1 }}>
                                                                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                                                            {comment.user?.full_name || 'User'}
                                                                        </span>{' '}
                                                                        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                                                            {comment.content}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Comment input */}
                                                        {user && (
                                                            <div className="flex gap-2" style={{ marginTop: 10, alignItems: 'center' }}>
                                                                <div className="avatar" style={{ width: 28, height: 28, minWidth: 28, fontSize: '0.65rem' }}>
                                                                    {user.profile_picture_url ? (
                                                                        <img src={user.profile_picture_url} alt={user.full_name} />
                                                                    ) : (
                                                                        getInitials(user.full_name)
                                                                    )}
                                                                </div>
                                                                <input
                                                                    type="text"
                                                                    value={commentInputs[item.id] || ''}
                                                                    onChange={e => setCommentInputs(prev => ({ ...prev, [item.id]: e.target.value }))}
                                                                    onKeyDown={e => { if (e.key === 'Enter') submitComment(item.id) }}
                                                                    placeholder="Write a comment…"
                                                                    style={{
                                                                        flex: 1, background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)',
                                                                        borderRadius: 20, padding: '6px 14px', color: 'var(--text-primary)',
                                                                        fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none',
                                                                    }}
                                                                />
                                                                <button
                                                                    onClick={() => submitComment(item.id)}
                                                                    disabled={!commentInputs[item.id]?.trim() || submittingComment === item.id}
                                                                    className="btn btn-primary btn-sm"
                                                                    style={{ borderRadius: '50%', width: 32, height: 32, padding: 0, minWidth: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                                >
                                                                    {submittingComment === item.id
                                                                        ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                                                                        : <Send size={14} />}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="feed-sidebar">
                    {/* Trending Section */}
                    <div className="glass-card-static" style={{ marginBottom: 20 }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 14 }}>
                            🔥 Trending
                        </h3>
                        <div className="flex flex-col gap-3">
                            {['Placement Season Updates', 'Campus Map Expansion', 'New Club Registrations', 'Upcoming ISMP Events'].map((topic, i) => (
                                <div key={i} className="flex items-center gap-3" style={{ fontSize: '0.85rem' }}>
                                    <span style={{ color: 'var(--text-tertiary)', fontWeight: 600, fontSize: '0.75rem' }}>#{i + 1}</span>
                                    <span style={{ color: 'var(--text-secondary)' }}>{topic}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="glass-card-static">
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 14 }}>
                            📊 Community Stats
                        </h3>
                        <div className="flex flex-col gap-3">
                            {[
                                { label: 'Active Members', value: '2.5K+' },
                                { label: 'Blogs Published', value: '340+' },
                                { label: 'Items Listed', value: '128' },
                                { label: 'Events This Month', value: '12' },
                            ].map((stat, i) => (
                                <div key={i} className="flex items-center justify-between" style={{ fontSize: '0.85rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>{stat.label}</span>
                                    <span className="font-semibold text-gold">{stat.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 1024px) {
          .feed-sidebar { display: none; }
        }
      `}</style>
        </div>
    )
}
