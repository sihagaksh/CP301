import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Edit, Mail, Users, Calendar, MessageSquare } from 'lucide-react'
import { getUserProfile, getFollowerCount, getFollowingCount, isFollowing } from '@/lib/db/users'
import { createServerClient } from '@/lib/supabase/server'
import { FollowButton } from '@/components/features/users/FollowButton'

interface UserProfilePageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: UserProfilePageProps) {
  const { id } = await params
  const profile = await getUserProfile(id)

  if (!profile) {
    return {
      title: 'User Not Found',
    }
  }

  return {
    title: `${profile.full_name} - User Directory`,
    description: profile.bio || `View ${profile.full_name}'s profile`,
  }
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { id } = await params
  const profile = await getUserProfile(id)

  if (!profile) {
    notFound()
  }

  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isOwnProfile = user && user.id === profile.id

  // Get follow stats
  const [followerCount, followingCount, userIsFollowing] = await Promise.all([
    getFollowerCount(profile.id),
    getFollowingCount(profile.id),
    user && !isOwnProfile ? isFollowing(user.id, profile.id) : Promise.resolve(false),
  ])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                className="w-32 h-32 rounded-full object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-5xl font-bold text-gray-500 dark:text-gray-400">
                  {profile.full_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {profile.full_name}
                </h1>
                {profile.email && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mt-2">
                    <Mail className="w-4 h-4" />
                    <span>{profile.email}</span>
                  </div>
                )}
              </div>

              {isOwnProfile && (
                <Link
                  href="/settings"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg font-medium transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </Link>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-6 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {followerCount}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {followingCount}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Following</div>
              </div>
            </div>

            {/* Department & Year */}
            {(profile.department || profile.year) && (
              <div className="flex flex-wrap gap-4 text-sm text-gray-700 dark:text-gray-300">
                {profile.department && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{profile.department}</span>
                  </div>
                )}
                {profile.year && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>Year {profile.year}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bio Section */}
      {profile.bio && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            About
          </h2>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {profile.bio}
          </p>
        </div>
      )}

      {/* Interests Section */}
      {profile.interests && profile.interests.length > 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Interests
          </h2>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest, index) => (
              <span
                key={index}
                className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons (for other users) */}
      {!isOwnProfile && user && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 space-y-3">
          <Link
            href={`/messages/${profile.id}`}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
          >
            <MessageSquare className="w-5 h-5" />
            Send Message
          </Link>
          <FollowButton
            userId={user.id}
            targetUserId={profile.id}
            initialIsFollowing={userIsFollowing}
          />
        </div>
      )}

      {/* Login Prompt (Non-authenticated Users) */}
      {!user && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 text-center">
          <p className="text-amber-800 dark:text-amber-200 mb-4">
            Sign in to follow {profile.full_name}
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
          >
            Sign In
          </Link>
        </div>
      )}
    </div>
  )
}
