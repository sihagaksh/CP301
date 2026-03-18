import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Users, Lock, ArrowLeft } from 'lucide-react'
import { createServerClient } from '@/lib/supabase/server'
import { getCommunityBySlug, getCommunityPosts } from '@/lib/db/communities'
import { CommunityPostForm } from '@/components/features/communities/CommunityPostForm'
import { PostCard } from '@/components/features/communities/PostCard'

interface CommunityDetailPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: CommunityDetailPageProps) {
  const { slug } = await params
  const community = await getCommunityBySlug(slug)

  if (!community) {
    return { title: 'Community Not Found' }
  }

  return {
    title: `${community.name} | DEP Campus Platform`,
    description: community.description || 'Join this community',
  }
}

export default async function CommunityDetailPage({ params }: CommunityDetailPageProps) {
  const { slug } = await params
  const community = await getCommunityBySlug(slug)

  if (!community) {
    notFound()
  }

  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { posts } = await getCommunityPosts(community.id, { page: 1, limit: 50 })

  const isCreator = user && user.id === community.created_by
  const userPosts = user ? posts.filter((p) => p.author_id === user.id) : []

  const creatorInitials = community.creator
    ? (community.creator.full_name || 'Unknown')
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : '?'

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link
        href="/dashboard/communities"
        className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 font-bold"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Communities
      </Link>

      {/* Community Header */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {community.name}
            </h1>

            {!community.is_public && (
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium mb-4">
                <Lock className="w-4 h-4" />
                <span>Private Community</span>
              </div>
            )}

            {community.description && (
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
                {community.description}
              </p>
            )}
          </div>

          {isCreator && (
            <Link
              href={`/dashboard/communities/${slug}/edit`}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 font-bold transition-colors"
            >
              Edit
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200 dark:border-gray-800">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Members</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {community.member_count}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Posts</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{posts.length}</p>
          </div>

          <div className="col-span-2 md:col-span-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Admin</p>
            <div className="flex items-center gap-2 mt-1">
              {community.creator?.avatar_url ? (
                <img
                  src={community.creator.avatar_url}
                  alt={community.creator.full_name}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-xs font-bold text-amber-700 dark:text-amber-300">
                  {creatorInitials}
                </div>
              )}
              <span className="text-gray-900 dark:text-white font-bold">
                {community.creator?.full_name}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Community Activity</h2>

        {/* New Post Form */}
        {user && (
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Share Something</h3>
            <CommunityPostForm communityId={community.id} userId={user.id} />
          </div>
        )}

        {!user && (
          <div className="text-center rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-8">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Sign in to join the conversation
            </p>
            <Link
              href="/login"
              className="inline-block px-6 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold transition-colors"
            >
              Sign In
            </Link>
          </div>
        )}

        {/* Posts List */}
        {posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isAuthor={user && post.author_id === user.id}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              No posts yet in this community
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Be the first to share something!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
