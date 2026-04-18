'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Heart, MessageCircle, Share2, TrendingUp,
  BookOpen, Calendar, Megaphone,
  Sparkles, Send, ChevronDown,
  ImageIcon, X, ChevronLeft, ChevronRight, Check, Loader2, Eye
} from 'lucide-react';
import { db } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { incrementFeedViewsRPC } from '@/lib/db/blogEngagement';

interface FeedComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: { id: string; full_name: string; profile_picture_url?: string };
}

interface FeedItem {
  id: string;
  content: string;
  media_urls?: string[];
  source_type?: string;
  source_id?: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  created_at: string;
  posting_identity_id?: string;
  author?: {
    id: string; full_name: string; role: string;
    profile_picture_url?: string; department?: string;
  };
  posting_identity?: {
    id: string; title: string;
    organization?: { name: string; slug: string };
  };
  likedByMe?: boolean;
  commentsOpen?: boolean;
  comments?: FeedComment[];
  commentsLoading?: boolean;
  shareTooltip?: boolean;
  carouselIndex?: number;
}

function FeedPhotoCarousel({ item }: { item: FeedItem }) {
  const [aspectRatio, setAspectRatio] = useState<string>('16/9'); // fallback
  const [carouselIdx, setCarouselIdx] = useState(0);
  const touchStartXRef = useRef<number | null>(null);

  useEffect(() => {
    if (!item.media_urls || item.media_urls.length === 0) return;
    
    let isMounted = true;
    Promise.all(item.media_urls.map(url => new Promise<{w:number, h:number}>((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ w: img.width, h: img.height });
      img.onerror = () => resolve({ w: 0, h: 0 });
      img.src = url;
    }))).then(dimensions => {
      if (!isMounted) return;
      let maxW = 0;
      let maxH = 0;
      dimensions.forEach(d => {
        if (d.w > maxW) maxW = d.w;
        if (d.h > maxH) maxH = d.h;
      });
      if (maxW > 0 && maxH > 0) {
        // Clamp aspect ratio between 4:5 (tallest) and 1.91:1 (widest) - Instagram standard
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
  }, [item.media_urls]);
  
  if (!item.media_urls || item.media_urls.length === 0) return null;
  const hasMultipleImages = item.media_urls.length > 1;

  const changeSlide = (dir: number) => {
    setCarouselIdx(prev => {
      let next = prev + dir;
      if (next < 0) next = item.media_urls!.length - 1;
      if (next >= item.media_urls!.length) next = 0;
      return next;
    });
  };

  return (
    <div className="relative px-4 pb-4">
      <div
        className="relative w-full max-h-[600px] mx-auto rounded-xl overflow-hidden border border-border select-none bg-white dark:bg-black flex items-center justify-center"
        style={{ aspectRatio }}
        onTouchStart={(e) => { touchStartXRef.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          if (touchStartXRef.current === null) return;
          const delta = e.changedTouches[0].clientX - touchStartXRef.current;
          touchStartXRef.current = null;
          if (Math.abs(delta) < 40) return; // too small to register swipe
          changeSlide(delta < 0 ? 1 : -1);
        }}
      >
        <img
          src={item.media_urls[carouselIdx]}
          alt={`Photo ${carouselIdx + 1}`}
          className="w-full h-full object-contain"
        />
        {hasMultipleImages && (
          <>
            <button onClick={() => changeSlide(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors z-10">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => changeSlide(1)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors z-10">
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>
      {hasMultipleImages && (
        <div className="flex justify-center gap-1.5 mt-2">
          {item.media_urls.map((_, dotIdx) => (
            <button
              key={dotIdx}
              onClick={() => setCarouselIdx(dotIdx)}
              className="rounded-full transition-all"
              style={{
                width: dotIdx === carouselIdx ? 18 : 7,
                height: 7,
                background: dotIdx === carouselIdx ? 'rgb(245,158,11)' : 'var(--muted-foreground, #888)',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FeedPage() {
  const { user, postingIdentities, activeIdentity, setActiveIdentity } = useAuth();
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const [showIdentityPicker, setShowIdentityPicker] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const touchStartXRef = useRef<number | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<string | null>(null);
  const [stats, setStats] = useState({ members: 0, blogs: 0, items: 0, events: 0 });
  const [trendingItems, setTrendingItems] = useState<{id: string, title: string, type: string, slug?: string}[]>([]);
  const viewedPosts = useRef(new Set<string>());

  useEffect(() => { 
    loadFeed(); 
    loadTrending();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Observer to track feed views
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const postId = entry.target.getAttribute('data-feed-id');
          if (postId && !viewedPosts.current.has(postId)) {
            viewedPosts.current.add(postId);
            incrementFeedViewsRPC(postId);
            setFeedItems(prev => prev.map(p => p.id === postId ? { ...p, view_count: (p.view_count || 0) + 1 } : p));
          }
        }
      });
    }, { threshold: 0.5 });

    const items = document.querySelectorAll('[data-feed-id]');
    items.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [feedItems.length]); // Re-attach when new items are added

  async function loadFeed() {
    const { data: posts } = await db
      .from('feed_posts')
      .select(
        'id, author_id, posting_identity_id, content, media_urls, source_type, source_id, like_count, comment_count, view_count, is_public, target_roles, created_at, updated_at, author:users!feed_posts_author_id_fkey(id, full_name, role, profile_picture_url, department), posting_identity:user_positions(id, title, organization:organizations(name, slug))'
      )
      .order('created_at', { ascending: false })
      .limit(20);

    // Fetch live community stats simultaneously
    const [membersRes, blogsRes, itemsRes, eventsRes] = await Promise.all([
      db.from('users').select('id', { count: 'exact', head: true }),
      db.from('blog_posts').select('id', { count: 'exact', head: true }),
      db.from('marketplace_items').select('id', { count: 'exact', head: true }).eq('status', 'available'),
      db.from('events').select('id', { count: 'exact', head: true }).gte('start_date', new Date().toISOString()),
    ]);

    setStats({
      members: membersRes.count || 0,
      blogs: blogsRes.count || 0,
      items: itemsRes.count || 0,
      events: eventsRes.count || 0,
    });

    if (!posts) { setLoading(false); return; }

    // Fetch user directly to avoid race conditions with React context on initial mount
    const { data: { user: dbUser } } = await db.auth.getUser();

    let likedSet = new Set<string>();
    if (dbUser) {
      const { data: likes } = await db
        .from('feed_likes')
        .select('post_id')
        .eq('user_id', dbUser.id)
        .in('post_id', posts.map((p: { id: string }) => p.id));
      likedSet = new Set((likes || []).map((l: { post_id: string }) => l.post_id));
    }

    const normalizedPosts = (posts || []).map((p: any) => ({
      ...p,
      author: p.author && Array.isArray(p.author) ? p.author[0] : p.author,
      posting_identity: p.posting_identity && Array.isArray(p.posting_identity) ? p.posting_identity[0] : p.posting_identity,
    }));

    setFeedItems(normalizedPosts.map((p: any) => ({
      ...p,
      likedByMe: likedSet.has(p.id),
      commentsOpen: false,
      comments: [],
      commentsLoading: false,
      shareTooltip: false,
      carouselIndex: 0,
    })));
    setLoading(false);
  }

  async function loadTrending() {
    const { data } = await db.rpc('get_trending_items', { limit_count: 5 });
    if (data) setTrendingItems(data);
  }

  async function handleLike(postId: string) {
    if (!user) return;
    const post = feedItems.find(p => p.id === postId);
    if (!post) return;
    const wasLiked = post.likedByMe;
    // Optimistic UI toggle
    setFeedItems(prev => prev.map(p =>
      p.id === postId ? { ...p, likedByMe: !wasLiked, like_count: wasLiked ? p.like_count - 1 : p.like_count + 1 } : p
    ));
    if (wasLiked) {
      await db.from('feed_likes').delete().eq('post_id', postId).eq('user_id', user.id);
    } else {
      await db.from('feed_likes').insert({ post_id: postId, user_id: user.id });
      // Notify post author (skip own posts)
      if (post.author?.id && post.author.id !== user.id) {
        await db.from('notifications').insert({
          user_id: post.author.id,
          title: `${user.fullName} liked your post`,
          message: post.content?.slice(0, 80) || 'Check out the activity on your post.',
          type: 'like',
          entity_type: 'post',
          entity_id: postId,
          action_url: `/posts/${postId}`,
          is_read: false,
        });
      }
    }
    // Re-read true count from DB (trigger has already updated it)
    const { data: fresh } = await db.from('feed_posts').select('like_count').eq('id', postId).single();
    if (fresh) setFeedItems(prev => prev.map(p => p.id === postId ? { ...p, like_count: fresh.like_count } : p));
  }

  async function toggleComments(postId: string) {
    const post = feedItems.find(p => p.id === postId);
    if (!post) return;
    if (post.commentsOpen) {
      setFeedItems(prev => prev.map(p => p.id === postId ? { ...p, commentsOpen: false } : p));
      return;
    }
    setFeedItems(prev => prev.map(p => p.id === postId ? { ...p, commentsOpen: true, commentsLoading: true } : p));
    const { data } = await db
      .from('feed_comments')
      .select('id, post_id, user_id, content, created_at, user:users(id, full_name, profile_picture_url)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    const normalizedComments = (data || []).map((c: any) => ({
      ...c,
      user: c.user && Array.isArray(c.user) ? c.user[0] : c.user,
    }));

    setFeedItems(prev => prev.map(p =>
      p.id === postId ? { ...p, comments: normalizedComments, commentsLoading: false } : p
    ));
  }

  async function submitComment(postId: string) {
    const content = (commentInputs[postId] || '').trim();
    if (!content || !user) return;
    setSubmittingComment(postId);
    const post = feedItems.find(p => p.id === postId);
    const { data: newComment } = await db
      .from('feed_comments')
      .insert({ post_id: postId, user_id: user.id, content })
      .select('id, post_id, user_id, content, created_at, user:users(id, full_name, profile_picture_url)')
      .single();
    if (newComment) {
      const normalizedNew = { ...newComment, user: newComment.user && Array.isArray(newComment.user) ? newComment.user[0] : newComment.user };
      setFeedItems(prev => prev.map(p =>
        p.id === postId ? { ...p, comments: [...(p.comments || []), normalizedNew] } : p
      ));
    }
    // Re-read true comment_count from DB (trigger has already incremented it)
    const { data: fresh } = await db.from('feed_posts').select('comment_count').eq('id', postId).single();
    if (fresh) setFeedItems(prev => prev.map(p => p.id === postId ? { ...p, comment_count: fresh.comment_count } : p));
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    setSubmittingComment(null);
    // Notify the post author (skip if commenting on own post)
    if (post?.author?.id && post.author.id !== user.id) {
      await db.from('notifications').insert({
        user_id: post.author.id,
        title: `${user.fullName} commented on your post`,
        message: content.slice(0, 100),
        type: 'comment',
        entity_type: 'post',
        entity_id: postId,
        action_url: `/posts/${postId}`,
        is_read: false,
      });
    }
  }

  async function handleShare(postId: string) {
    const url = `${window.location.origin}/posts/${postId}`;
    try { await navigator.clipboard.writeText(url); } catch { /* silent */ }
    setFeedItems(prev => prev.map(p => p.id === postId ? { ...p, shareTooltip: true } : p));
    setTimeout(() => {
      setFeedItems(prev => prev.map(p => p.id === postId ? { ...p, shareTooltip: false } : p));
    }, 2500);
    const post = feedItems.find(p => p.id === postId);
    if (post) {
      await db.from('feed_posts').update({ share_count: ((post as unknown as { share_count: number }).share_count || 0) + 1 }).eq('id', postId);
    }
  }



  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []).slice(0, 10);
    setSelectedFiles(files);
    setPreviewUrls(files.map(f => URL.createObjectURL(f)));
  }

  function removeSelectedFile(index: number) {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    setPreviewUrls(previewUrls.filter((_, i) => i !== index));
  }

  async function uploadImages(): Promise<{ urls: string[]; failed: boolean }> {
    if (selectedFiles.length === 0) return { urls: [], failed: false };
    setUploadingImages(true);
    setUploadError(null);
    const uploadedUrls: string[] = [];
    let anyFailed = false;

    for (const file of selectedFiles) {
      const ext = file.name.split('.').pop();
      const path = `${user!.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { data: uploadData, error } = await db.storage.from('feed-media').upload(path, file, { cacheControl: '3600', upsert: false });
      if (error || !uploadData) {
        anyFailed = true;
      } else {
        const { data: { publicUrl } } = db.storage.from('feed-media').getPublicUrl(path);
        uploadedUrls.push(publicUrl);
      }
    }

    setUploadingImages(false);
    if (anyFailed && uploadedUrls.length === 0) {
      setUploadError('Image upload failed. Make sure the "feed-media" bucket exists and is Public in your Supabase project.');
      return { urls: [], failed: true };
    }
    if (anyFailed) setUploadError('Some images failed to upload. Only successful ones will be posted.');
    return { urls: uploadedUrls, failed: false };
  }

  async function handlePost() {
    if (!newPost.trim() || !user) return;
    setPosting(true);
    setUploadError(null);
    const { urls: mediaUrls, failed } = await uploadImages();
    if (failed) { setPosting(false); return; }
    await db.from('feed_posts').insert({
      author_id: user.id,
      content: newPost.trim(),
      posting_identity_id: activeIdentity?.id || null,
      media_urls: mediaUrls.length > 0 ? mediaUrls : null,
    });
    setNewPost('');
    setSelectedFiles([]);
    setPreviewUrls([]);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setPosting(false);
    loadFeed();
  }


  const getSourceIcon = (type?: string) => {
    switch (type) {
      case 'blog': return <BookOpen size={14} />;
      case 'event': return <Calendar size={14} />;
      case 'notice': return <Megaphone size={14} />;
      default: return <Sparkles size={14} />;
    }
  };

  const getInitials = (name?: string) =>
    name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  const getIdentityLabel = (item: FeedItem) => {
    if (item.posting_identity?.title) {
      const orgName = (item.posting_identity.organization as unknown as { name: string })?.name;
      return orgName ? `${item.posting_identity.title}, ${orgName}` : item.posting_identity.title;
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <h1 className="font-serif font-bold text-2xl md:text-3xl text-foreground">
          Welcome back{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}! 👋
        </h1>
        <p className="text-sm text-muted-foreground hidden md:block">Stay connected with the IIT Ropar community</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-8">
          {/* Create Post */}
          <div className="bg-card border border-border rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center font-semibold text-sm flex-shrink-0 overflow-hidden">
                {user?.profilePictureUrl
                  ? <img src={user.profilePictureUrl} alt={user.fullName} className="w-full h-full object-cover rounded-full" />
                  : getInitials(user?.fullName)}
              </div>
              <div className="flex-1">
                <textarea
                  className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 min-h-[70px]"
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="Share something with the community..."
                />
              </div>
            </div>

            {uploadError && (
              <div className="mb-3 p-2.5 bg-red-100 dark:bg-red-500/20 border border-red-300 dark:border-red-500/30 rounded-lg text-sm text-red-700 dark:text-red-300">
                ⚠️ {uploadError}
              </div>
            )}

            {previewUrls.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-3">
                {previewUrls.map((url, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeSelectedFile(i)}
                      className="absolute top-1 right-1 bg-black/70 border-none rounded-full w-5 h-5 flex items-center justify-center cursor-pointer text-white"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-amber-500 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon size={16} />
                  {selectedFiles.length > 0 ? `${selectedFiles.length} photo(s)` : 'Photo'}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFileSelect} />

                {postingIdentities.length > 1 && (
                  <div className="relative">
                    <button
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setShowIdentityPicker(!showIdentityPicker)}
                    >
                      Posting as: <strong className="text-amber-500">{activeIdentity?.label}</strong>
                      <ChevronDown size={12} />
                    </button>
                    {showIdentityPicker && (
                      <div className="absolute top-full left-0 mt-1 bg-popover border border-border rounded-lg p-1.5 z-10 min-w-[200px] shadow-lg">
                        {postingIdentities.map((identity, i) => (
                          <button
                            key={i}
                            className="block w-full text-left text-sm px-3 py-1.5 rounded hover:bg-accent transition-colors"
                            onClick={() => { setActiveIdentity(identity); setShowIdentityPicker(false); }}
                          >
                            {identity.label}{identity.org_name ? ` — ${identity.org_name}` : ''}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handlePost}
                disabled={!newPost.trim() || posting || uploadingImages}
              >
                {(posting || uploadingImages) ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                {posting || uploadingImages ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-base flex items-center gap-2">
              <TrendingUp size={18} className="text-amber-500" /> Activity Feed
            </h2>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse">
                  <div className="flex gap-3 mb-3">
                    <div className="w-10 h-10 bg-muted rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded w-2/5 mb-2" />
                      <div className="h-3 bg-muted rounded w-1/4" />
                    </div>
                  </div>
                  <div className="h-3 bg-muted rounded mb-2" />
                  <div className="h-3 bg-muted rounded w-4/5" />
                </div>
              ))}
            </div>
          ) : feedItems.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-10 text-center">
              <Sparkles size={48} className="mx-auto mb-4 text-muted-foreground/40" />
              <h3 className="font-semibold text-lg mb-1">Your Feed is Empty</h3>
              <p className="text-muted-foreground text-sm mb-4">Join communities, follow events, and connect with your peers to see activity here.</p>
              <Link href="/communities" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                Explore Communities
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {feedItems.map((item) => {
                const identityLabel = getIdentityLabel(item);
                const hasMultipleImages = item.media_urls && item.media_urls.length > 1;
                const carouselIdx = item.carouselIndex ?? 0;

                return (
                  <div key={item.id} data-feed-id={item.id} className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="p-4 pb-0">
                      <div className="flex gap-3 mb-3">
                        <Link href={`/users/${item.author?.id}`} className="no-underline">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-semibold text-sm overflow-hidden flex-shrink-0">
                            {item.author?.profile_picture_url
                              ? <img src={item.author.profile_picture_url} alt={item.author.full_name} className="w-full h-full object-cover" />
                              : getInitials(item.author?.full_name)}
                          </div>
                        </Link>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link href={`/users/${item.author?.id}`} className="font-semibold text-sm text-foreground hover:underline">
                              {item.author?.full_name || 'Unknown User'}
                            </Link>
                            {identityLabel ? (
                              <span className="text-xs bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full">{identityLabel}</span>
                            ) : (
                              <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">{item.author?.role}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                            {getSourceIcon(item.source_type)}
                            <span>{item.source_type || 'post'}</span>
                            <span>•</span>
                            <span>{format(new Date(item.created_at), 'MMM d, yyyy')}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed mb-3">{item.content}</p>
                    </div>

                    {item.media_urls && item.media_urls.length > 0 && (
                      <FeedPhotoCarousel item={item} />
                    )}

                    <div className="px-4 py-2.5 border-t border-border flex items-center gap-1">
                      <button
                        className={`flex items-center gap-1.5 text-sm px-2.5 py-1.5 rounded-lg transition-colors ${item.likedByMe ? 'text-amber-500 font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                        onClick={() => handleLike(item.id)}
                      >
                        <Heart size={16} fill={item.likedByMe ? 'currentColor' : 'none'} />
                        {item.like_count}
                      </button>

                      <button
                        className={`flex items-center gap-1.5 text-sm px-2.5 py-1.5 rounded-lg transition-colors ${item.commentsOpen ? 'text-amber-500' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                        onClick={() => toggleComments(item.id)}
                      >
                        <MessageCircle size={16} /> {item.comment_count}
                      </button>

                      <div className="relative">
                        <button
                          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent px-2.5 py-1.5 rounded-lg transition-colors"
                          onClick={() => handleShare(item.id)}
                        >
                          <Share2 size={16} /> Share
                        </button>
                        {item.shareTooltip && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 bg-popover border border-border rounded-lg px-2.5 py-1 text-xs text-amber-500 flex items-center gap-1 whitespace-nowrap shadow-lg z-10">
                            <Check size={12} /> Link copied!
                          </div>
                        )}
                      </div>
                    </div>

                    {item.commentsOpen && (
                      <div className="px-4 pb-3 border-t border-border">
                        {item.commentsLoading ? (
                          <div className="text-center py-4 text-muted-foreground text-sm">
                            <Loader2 size={18} className="animate-spin mx-auto" />
                          </div>
                        ) : (
                          <>
                            {(item.comments || []).length === 0 && (
                              <p className="text-xs text-muted-foreground text-center py-3">No comments yet. Be the first!</p>
                            )}
                            <div className="space-y-2 mt-3">
                              {(item.comments || []).map(comment => (
                                <div key={comment.id} className="flex gap-2 items-start">
                                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-semibold flex-shrink-0 overflow-hidden">
                                    {comment.user?.profile_picture_url
                                      ? <img src={comment.user.profile_picture_url} alt={comment.user.full_name} className="w-full h-full object-cover" />
                                      : getInitials(comment.user?.full_name)}
                                  </div>
                                  <div className="bg-muted rounded-xl px-3 py-1.5 flex-1">
                                    <span className="font-semibold text-xs text-foreground">{comment.user?.full_name || 'User'}</span>{' '}
                                    <span className="text-xs text-foreground/80">{comment.content}</span>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {user && (
                              <div className="flex gap-2 mt-3 items-center">
                                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-semibold flex-shrink-0 overflow-hidden">
                                  {user.profilePictureUrl
                                    ? <img src={user.profilePictureUrl} alt={user.fullName} className="w-full h-full object-cover" />
                                    : getInitials(user.fullName)}
                                </div>
                                <input
                                  type="text"
                                  value={commentInputs[item.id] || ''}
                                  onChange={e => setCommentInputs(prev => ({ ...prev, [item.id]: e.target.value }))}
                                  onKeyDown={e => { if (e.key === 'Enter') submitComment(item.id); }}
                                  placeholder="Write a comment…"
                                  className="flex-1 bg-muted border border-border rounded-full px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-amber-400"
                                />
                                <button
                                  onClick={() => submitComment(item.id)}
                                  disabled={!commentInputs[item.id]?.trim() || submittingComment === item.id}
                                  className="w-8 h-8 rounded-full bg-amber-500 hover:bg-amber-600 flex items-center justify-center text-white disabled:opacity-50 transition-colors"
                                >
                                  {submittingComment === item.id ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Sidebar — sticky, does NOT scroll with feed */}
        <div className="lg:col-span-4">
          <div className="sticky top-4 space-y-4">
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="font-semibold text-sm mb-3">🔥 Trending</h3>
              <div className="space-y-2.5">
                {trendingItems.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No trending items yet...</p>
                ) : (
                  trendingItems.map((item, i) => (
                    <Link href={item.type === 'blog' ? `/blogs/${item.slug || item.id}` : `/posts/${item.id}`} key={item.id} className="flex items-start gap-2.5 text-sm group">
                      <span className="text-muted-foreground font-semibold text-xs mt-0.5">#{i + 1}</span>
                      <span className="text-foreground/80 group-hover:text-amber-500 group-hover:underline transition-colors line-clamp-2">
                        {item.type === 'blog' ? '📝 ' : ''}{item.title}
                      </span>
                    </Link>
                  ))
                )}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="font-semibold text-sm mb-3">📊 Community Stats</h3>
              <div className="space-y-2.5">
                {[
                  { label: 'Active Members', value: stats.members },
                  { label: 'Blogs Published', value: stats.blogs },
                  { label: 'Items Listed', value: stats.items },
                  { label: 'Upcoming Events', value: stats.events },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{stat.label}</span>
                    <span className="font-semibold text-amber-500">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
