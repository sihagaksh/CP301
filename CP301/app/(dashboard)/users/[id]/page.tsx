'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import {
  User, Mail, Building, GraduationCap, Briefcase, Linkedin, Award,
  MessageCircle, Loader2, Grid3X3, Heart, Settings
} from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  department?: string;
  branch?: string;
  batch?: string;
  enrollment_number?: string;
  designation?: string;
  current_organization?: string;
  bio?: string;
  linkedin_url?: string;
  profile_picture_url?: string;
  is_verified?: boolean;
}

interface PostItem {
  id: string;
  content: string;
  media_urls?: string[];
  like_count: number;
  comment_count: number;
  created_at: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface UserPosition { id: string; title: string; por_type: string; organization?: any; }

function getInitials(name?: string) {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
}

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user: currentUser } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [positions, setPositions] = useState<UserPosition[]>([]);
  const [postCount, setPostCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<PostItem | null>(null);

  useEffect(() => { fetchAll(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchAll() {
    const [{ data: profileData }, { data: postsData }, { data: posData }] = await Promise.all([
      db.from('users').select('*').eq('id', id).single(),
      db.from('feed_posts').select('id, content, media_urls, like_count, comment_count, created_at')
        .eq('author_id', id).order('created_at', { ascending: false }).limit(30),
      db.from('user_positions').select('id, title, por_type, organization:organizations(name, slug)')
        .eq('user_id', id).eq('is_active', true),
    ]);
    if (profileData) setProfile(profileData);
    const fetchedPosts = postsData || [];
    setPosts(fetchedPosts);
    setPostCount(fetchedPosts.length);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setPositions((posData || []) as any);
    setLoading(false);
  }

  async function startConversation() {
    if (!currentUser || !profile) return;
    const { data: existing } = await db
      .from('conversations')
      .select('id')
      .or(`and(participant1_id.eq.${currentUser.id},participant2_id.eq.${profile.id}),and(participant1_id.eq.${profile.id},participant2_id.eq.${currentUser.id})`)
      .maybeSingle();
    if (!existing) {
      await db.from('conversations').insert({ participant1_id: currentUser.id, participant2_id: profile.id });
    }
    router.push('/messages');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={36} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <User size={48} className="mx-auto mb-4 text-muted-foreground/40" />
          <h3 className="font-semibold">User Not Found</h3>
          <p className="text-sm text-muted-foreground">This profile doesn&apos;t exist.</p>
          <Link href="/" className="text-sm text-amber-500 hover:underline mt-2 inline-block">← Back to Feed</Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profile.id;

  // Split posts into those with media and text-only
  const mediaPosts = posts.filter(p => p.media_urls && p.media_urls.length > 0);
  const textPosts = posts.filter(p => !p.media_urls?.length);

  return (
    <div className="max-w-3xl mx-auto">

      {/* ─── Instagram-style Profile Header ─── */}
      <div className="bg-card border border-border rounded-xl p-6 mb-5">
        <div className="flex items-start gap-6 md:gap-10">
          {/* Avatar */}
          <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-muted flex items-center justify-center text-2xl md:text-3xl font-bold overflow-hidden flex-shrink-0 ring-2 ring-amber-500/30">
            {profile.profile_picture_url
              ? <img src={profile.profile_picture_url} alt={profile.full_name} className="w-full h-full object-cover" />
              : getInitials(profile.full_name)}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {/* Name row */}
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h1 className="font-bold text-xl text-foreground">{profile.full_name}</h1>
              {profile.is_verified && (
                <span className="text-xs bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">✓ Verified</span>
              )}
              {isOwnProfile
                ? (
                  <Link href="/profile" className="flex items-center gap-1.5 border border-border text-sm font-medium px-3.5 py-1.5 rounded-lg hover:bg-accent transition-colors no-underline text-foreground">
                    <Settings size={13} /> Edit Profile
                  </Link>
                )
                : currentUser && (
                  <button
                    onClick={startConversation}
                    className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-3.5 py-1.5 rounded-lg transition-colors"
                  >
                    <MessageCircle size={13} /> Message
                  </button>
                )}
            </div>

            {/* Stats row */}
            <div className="flex gap-6 mb-3 text-sm">
              <div className="text-center">
                <p className="font-bold text-foreground text-base">{postCount}</p>
                <p className="text-muted-foreground text-xs">Posts</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-foreground text-base">{positions.length}</p>
                <p className="text-muted-foreground text-xs">PORs</p>
              </div>
              {profile.batch && (
                <div className="text-center">
                  <p className="font-bold text-foreground text-base">{profile.batch}</p>
                  <p className="text-muted-foreground text-xs">Batch</p>
                </div>
              )}
            </div>

            {/* Bio & details */}
            <div className="space-y-0.5">
              <div className="flex flex-wrap gap-2 mb-1.5">
                <span className="bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-medium px-2 py-0.5 rounded-full capitalize">{profile.role}</span>
                {profile.department && <span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">{profile.department}</span>}
                {profile.branch && <span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">{profile.branch}</span>}
              </div>
              {profile.designation && <p className="text-sm font-semibold text-foreground">{profile.designation}{profile.current_organization ? ` · ${profile.current_organization}` : ''}</p>}
              {profile.bio && <p className="text-sm text-foreground/80 leading-relaxed mt-1">{profile.bio}</p>}
              {profile.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-amber-500 hover:underline mt-1">
                  <Linkedin size={12} /> LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Positions badge strip */}
        {positions.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-2">
            {positions.map(pos => (
              <div key={pos.id} className="flex items-center gap-1.5 bg-muted text-muted-foreground text-xs px-2.5 py-1 rounded-full">
                <Award size={11} className="text-amber-500" />
                {pos.title}{pos.organization?.name ? `, ${pos.organization.name}` : ''}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Post Grid (Instagram style) ─── */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <Grid3X3 size={15} className="text-muted-foreground" />
          <span className="text-sm font-semibold">Posts</span>
          {postCount > 0 && <span className="text-xs text-muted-foreground ml-auto">{postCount} total</span>}
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Grid3X3 size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No posts yet</p>
            {isOwnProfile && <Link href="/" className="text-xs text-amber-500 hover:underline mt-1 inline-block">Share your first post →</Link>}
          </div>
        ) : (
          <>
            {/* Media grid */}
            {mediaPosts.length > 0 && (
              <div className="grid grid-cols-3 gap-0.5 p-0.5">
                {mediaPosts.map(post => (
                  <button
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    className="relative aspect-square bg-muted overflow-hidden group"
                  >
                    <img
                      src={post.media_urls![0]}
                      alt="Post"
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white">
                      <span className="flex items-center gap-1 font-semibold text-sm">
                        <Heart size={16} fill="white" /> {post.like_count}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-sm">
                        <MessageCircle size={16} fill="white" /> {post.comment_count}
                      </span>
                    </div>
                    {post.media_urls!.length > 1 && (
                      <div className="absolute top-1.5 right-1.5 bg-black/50 text-white rounded text-[10px] px-1 py-0.5 font-semibold">
                        +{post.media_urls!.length - 1}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Text-only posts */}
            {textPosts.length > 0 && (
              <div className="border-t border-border">
                {mediaPosts.length > 0 && (
                  <p className="text-xs text-muted-foreground px-4 pt-3 pb-1 font-medium">Text Posts</p>
                )}
                <div className="divide-y divide-border">
                  {textPosts.map(post => (
                    <Link
                      key={post.id}
                      href={`/posts/${post.id}`}
                      className="block px-4 py-3.5 hover:bg-accent transition-colors no-underline"
                    >
                      <p className="text-sm text-foreground/85 line-clamp-2 mb-2 leading-relaxed">{post.content}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{format(new Date(post.created_at), 'MMM d, yyyy')}</span>
                        <span className="flex items-center gap-1"><Heart size={11} /> {post.like_count}</span>
                        <span className="flex items-center gap-1"><MessageCircle size={11} /> {post.comment_count}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ─── About Section ─── */}
      <div className="bg-card border border-border rounded-xl p-5 mt-5">
        <h2 className="font-semibold text-sm mb-4">About</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { icon: Mail, label: 'Email', value: profile.email },
            { icon: Building, label: 'Department', value: profile.department },
            { icon: GraduationCap, label: 'Branch', value: profile.branch },
            { icon: GraduationCap, label: 'Batch', value: profile.batch },
            { icon: GraduationCap, label: 'Enrollment', value: profile.enrollment_number },
            { icon: Briefcase, label: 'Designation', value: profile.designation },
            { icon: Building, label: 'Organization', value: profile.current_organization },
          ].filter(r => r.value).map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-2.5">
              <Icon size={14} className="text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-[11px] text-muted-foreground leading-none mb-0.5">{label}</p>
                <p className="text-sm text-foreground">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Post Modal (click on grid item) ─── */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="bg-card border border-border rounded-xl max-w-lg w-full overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {selectedPost.media_urls?.[0] && (
              <img src={selectedPost.media_urls[0]} alt="Post" className="w-full object-cover max-h-96" />
            )}
            <div className="p-4">
              <p className="text-sm text-foreground/85 leading-relaxed mb-3 line-clamp-4">{selectedPost.content}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                <span className="flex items-center gap-1"><Heart size={14} /> {selectedPost.like_count}</span>
                <span className="flex items-center gap-1"><MessageCircle size={14} /> {selectedPost.comment_count}</span>
                <span className="ml-auto text-xs">{format(new Date(selectedPost.created_at), 'MMM d, yyyy')}</span>
              </div>
              <Link
                href={`/posts/${selectedPost.id}`}
                className="block w-full text-center bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium py-2 rounded-lg transition-colors no-underline"
              >
                View Full Post →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
