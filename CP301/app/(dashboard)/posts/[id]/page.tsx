'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { Heart, MessageCircle, Share2, ArrowLeft, Loader2, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

interface Post {
  id: string;
  content: string;
  media_urls?: string[];
  like_count: number;
  comment_count: number;
  created_at: string;
  author?: { id: string; full_name: string; role: string; profile_picture_url?: string; department?: string };
  posting_identity?: { title: string; organization?: { name: string } };
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user?: { id: string; full_name: string; profile_picture_url?: string };
}

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [likedByMe, setLikedByMe] = useState(false);
  const [loading, setLoading] = useState(true);
  const [commentInput, setCommentInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [shareTooltip, setShareTooltip] = useState(false);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [aspectRatio, setAspectRatio] = useState<string>('16/9');

  useEffect(() => {
    if (!post?.media_urls || post.media_urls.length === 0) return;
    let isMounted = true;
    Promise.all(post.media_urls.map(url => new Promise<{w:number, h:number}>((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ w: img.width, h: img.height });
      img.onerror = () => resolve({ w: 0, h: 0 });
      img.src = url;
    }))).then(dimensions => {
      if (!isMounted) return;
      let maxW = 0, maxH = 0;
      dimensions.forEach(d => {
        if (d.w > maxW) maxW = d.w;
        if (d.h > maxH) maxH = d.h;
      });
      if (maxW > 0 && maxH > 0) {
        const ratio = maxW / maxH;
        let finalRatioStr = `${maxW}/${maxH}`;
        if (ratio < 0.8) {
          finalRatioStr = '4/5';
        } else if (ratio > 1.91) {
          finalRatioStr = '1.91/1';
        }
        setAspectRatio(finalRatioStr);
      }
    });
    return () => { isMounted = false; };
  }, [post?.media_urls]);

  useEffect(() => { fetchPost(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchPost() {
    const { data: postData } = await db.from('feed_posts').select('id, author_id, posting_identity_id, content, media_urls, like_count, comment_count, created_at, author:users!feed_posts_author_id_fkey(id, full_name, role, profile_picture_url, department), posting_identity:user_positions(title, organization:organizations(name))').eq('id', id).single();
    if (!postData) { setLoading(false); return; }

    let normalizedPostingIdentity: any = undefined;
    if (postData.posting_identity) {
      const rawPi = Array.isArray(postData.posting_identity) ? postData.posting_identity[0] : postData.posting_identity;
      normalizedPostingIdentity = {
        title: rawPi.title,
        organization: rawPi.organization && Array.isArray(rawPi.organization) ? rawPi.organization[0] : rawPi.organization,
      };
    }

    const normalizedPost = {
      ...postData,
      author: postData.author && Array.isArray(postData.author) ? postData.author[0] : postData.author,
      posting_identity: normalizedPostingIdentity,
    };

    setPost(normalizedPost);

    const { data: commentsData } = await db.from('feed_comments').select('id, post_id, user_id, content, created_at, user:users(id, full_name, profile_picture_url)').eq('post_id', id).order('created_at', { ascending: true });
    const normalizedComments = (commentsData || []).map((c: any) => ({ ...c, user: c.user && Array.isArray(c.user) ? c.user[0] : c.user }));
    setComments(normalizedComments);

    if (user) {
      const { data: like } = await db.from('feed_likes').select('id').eq('post_id', id).eq('user_id', user.id).maybeSingle();
      setLikedByMe(!!like);
    }
    setLoading(false);
  }

  async function handleLike() {
    if (!user || !post) return;
    if (likedByMe) {
      await db.from('feed_likes').delete().eq('post_id', id).eq('user_id', user.id);
    } else {
      await db.from('feed_likes').insert({ post_id: id, user_id: user.id });
      // Notify post author (skip own posts)
      if (post.author?.id && post.author.id !== user.id) {
        await db.from('notifications').insert({
          user_id: post.author.id,
          title: `${user.fullName} liked your post`,
          message: post.content?.slice(0, 80) || '',
          type: 'like',
          entity_type: 'post',
          entity_id: id,
          action_url: `/posts/${id}`,
          is_read: false,
        });
      }
    }
    // Re-read true like_count from DB (trigger has already updated it)
    const { data: fresh } = await db.from('feed_posts').select('like_count').eq('id', id).single();
    if (fresh) setPost(p => p ? { ...p, like_count: fresh.like_count } : null);
    setLikedByMe(!likedByMe);
  }

  async function submitComment() {
    if (!commentInput.trim() || !user) return;
    setSubmitting(true);
    const content = commentInput.trim();
    const { data } = await db.from('feed_comments').insert({ post_id: id, user_id: user.id, content }).select('id, post_id, user_id, content, created_at, user:users(id, full_name, profile_picture_url)').single();
    if (data) {
      const normalized = { ...data, user: data.user && Array.isArray(data.user) ? data.user[0] : data.user };
      setComments(prev => [...prev, normalized]);
    }
    // Re-read true comment_count from DB (trigger has already incremented it)
    const { data: fresh } = await db.from('feed_posts').select('comment_count').eq('id', id).single();
    if (fresh) setPost(p => p ? { ...p, comment_count: fresh.comment_count } : null);
    setCommentInput('');
    setSubmitting(false);
    // Notify post author (skip own posts)
    if (post?.author?.id && post.author.id !== user.id) {
      await db.from('notifications').insert({
        user_id: post.author.id,
        title: `${user.fullName} commented on your post`,
        message: content.slice(0, 100),
        type: 'comment',
        entity_type: 'post',
        entity_id: id,
        action_url: `/posts/${id}`,
        is_read: false,
      });
    }
  }

  async function handleShare() {
    try { await navigator.clipboard.writeText(window.location.href); } catch { /* silent */ }
    setShareTooltip(true);
    setTimeout(() => setShareTooltip(false), 2500);
  }

  const getInitials = (name?: string) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 size={36} className="animate-spin text-muted-foreground" /></div>;
  }

  if (!post) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="font-semibold">Post Not Found</p>
          <Link href="/" className="text-sm text-amber-500 hover:underline mt-2 inline-block">← Back to Feed</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Link href="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={15} /> Back to Feed
      </Link>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-5">
          <div className="flex gap-3 mb-4">
            <Link href={`/users/${post.author?.id}`} className="no-underline">
              <div className="w-11 h-11 rounded-full bg-muted flex items-center justify-center text-sm font-semibold overflow-hidden flex-shrink-0">
                {post.author?.profile_picture_url ? <img src={post.author.profile_picture_url} alt={post.author.full_name} className="w-full h-full object-cover" /> : getInitials(post.author?.full_name)}
              </div>
            </Link>
            <div>
              <Link href={`/users/${post.author?.id}`} className="font-semibold text-sm hover:underline">{post.author?.full_name}</Link>
              {post.posting_identity?.title && (
                <span className="ml-2 text-xs bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full">
                  {post.posting_identity.title}{post.posting_identity.organization ? `, ${(post.posting_identity.organization as unknown as { name: string }).name}` : ''}
                </span>
              )}
              <p className="text-xs text-muted-foreground">{format(new Date(post.created_at), 'MMMM d, yyyy • HH:mm')}</p>
            </div>
          </div>
          <p className="text-base text-foreground/85 leading-relaxed mb-4">{post.content}</p>
        </div>

        {post.media_urls && post.media_urls.length > 0 && (
          <div className="relative px-5 pb-5">
            <div className="relative w-full max-h-[700px] mx-auto rounded-xl overflow-hidden border border-border bg-white dark:bg-black flex items-center justify-center" style={{ aspectRatio }}>
              <img src={post.media_urls[carouselIdx]} alt={`Media ${carouselIdx + 1}`} className="w-full h-full object-contain" />
              {post.media_urls.length > 1 && (
                <>
                  <button onClick={() => setCarouselIdx((carouselIdx - 1 + post.media_urls!.length) % post.media_urls!.length)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8 flex items-center justify-center"><ChevronLeft size={18} /></button>
                  <button onClick={() => setCarouselIdx((carouselIdx + 1) % post.media_urls!.length)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8 flex items-center justify-center"><ChevronRight size={18} /></button>
                </>
              )}
            </div>
          </div>
        )}

        <div className="px-5 py-3 border-t border-border flex items-center gap-2">
          <button onClick={handleLike} className={`flex items-center gap-1.5 text-sm px-2.5 py-1.5 rounded-lg transition-colors ${likedByMe ? 'text-amber-500 font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}>
            <Heart size={16} fill={likedByMe ? 'currentColor' : 'none'} /> {post.like_count}
          </button>
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground px-2.5 py-1.5 rounded-lg">
            <MessageCircle size={16} /> {post.comment_count}
          </button>
          <div className="relative">
            <button onClick={handleShare} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent px-2.5 py-1.5 rounded-lg transition-colors">
              <Share2 size={16} /> Share
            </button>
            {shareTooltip && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 bg-popover border border-border rounded-lg px-2.5 py-1 text-xs text-amber-500 flex items-center gap-1 whitespace-nowrap shadow-lg z-10">
                <Check size={12} /> Copied!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-semibold mb-4">Comments ({comments.length})</h2>
        {comments.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No comments yet. Be the first!</p>}
        <div className="space-y-3 mb-4">
          {comments.map(c => (
            <div key={c.id} className="flex gap-2.5">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold flex-shrink-0 overflow-hidden">
                {c.user?.profile_picture_url ? <img src={c.user.profile_picture_url} alt={c.user.full_name} className="w-full h-full object-cover" /> : getInitials(c.user?.full_name)}
              </div>
              <div className="bg-muted rounded-xl px-3 py-2 flex-1">
                <span className="font-semibold text-xs text-foreground">{c.user?.full_name || 'User'}</span>{' '}
                <span className="text-sm text-foreground/80">{c.content}</span>
                <p className="text-[11px] text-muted-foreground mt-1">{format(new Date(c.created_at), 'MMM d, HH:mm')}</p>
              </div>
            </div>
          ))}
        </div>
        {user && (
          <div className="flex gap-2 items-center">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold flex-shrink-0 overflow-hidden">
              {user.profilePictureUrl ? <img src={user.profilePictureUrl} alt={user.fullName} className="w-full h-full object-cover" /> : getInitials(user.fullName)}
            </div>
            <input
              type="text"
              value={commentInput}
              onChange={e => setCommentInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') submitComment(); }}
              placeholder="Write a comment..."
              className="flex-1 bg-muted border border-border rounded-full px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button onClick={submitComment} disabled={!commentInput.trim() || submitting} className="w-9 h-9 rounded-full bg-amber-500 hover:bg-amber-600 flex items-center justify-center text-white disabled:opacity-50 transition-colors">
              {submitting ? <Loader2 size={15} className="animate-spin" /> : <MessageCircle size={15} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
