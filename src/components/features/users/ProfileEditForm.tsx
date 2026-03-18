'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { updateProfile } from '@/lib/db/users'
import type { Profile } from '@/lib/types'

const profileUpdateSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  avatar_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  department: z.string().optional(),
  year: z.string().optional(),
  interests: z.array(z.string()).optional(),
})

type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>

interface ProfileEditFormProps {
  profile: Profile
}

const DEPARTMENTS = [
  'Computer Science',
  'Engineering',
  'Business',
  'Arts',
  'Science',
  'Medicine',
]

const YEARS = ['1', '2', '3', '4', 'Graduate']

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      full_name: profile.full_name,
      bio: profile.bio || '',
      avatar_url: profile.avatar_url || '',
      department: profile.department || '',
      year: profile.year || '',
      interests: profile.interests || [],
    },
  })

  const onSubmit = async (data: ProfileUpdateInput) => {
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      await updateProfile(profile.id, {
        ...data,
        avatar_url: data.avatar_url || undefined,
        bio: data.bio || undefined,
        department: data.department || undefined,
        year: data.year || undefined,
      })
      setSuccess(true)
      setTimeout(() => {
        router.push(`/users/${profile.id}`)
        router.refresh()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-sm text-green-600 dark:text-green-400">
            Profile updated successfully! Redirecting...
          </p>
        </div>
      )}

      {/* Full Name */}
      <div>
        <label
          htmlFor="full_name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Full Name *
        </label>
        <input
          id="full_name"
          type="text"
          {...register('full_name')}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent"
          placeholder="John Doe"
        />
        {errors.full_name && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            {errors.full_name.message}
          </p>
        )}
      </div>

      {/* Department & Year */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="department"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Department
          </label>
          <select
            id="department"
            {...register('department')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent"
          >
            <option value="">Select department</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          {errors.department && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {errors.department.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="year"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Year
          </label>
          <select
            id="year"
            {...register('year')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent"
          >
            <option value="">Select year</option>
            {YEARS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          {errors.year && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {errors.year.message}
            </p>
          )}
        </div>
      </div>

      {/* Avatar URL */}
      <div>
        <label
          htmlFor="avatar_url"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Avatar URL
        </label>
        <input
          id="avatar_url"
          type="text"
          {...register('avatar_url')}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent"
          placeholder="https://example.com/avatar.jpg"
        />
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          Enter a URL to your profile picture
        </p>
        {errors.avatar_url && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            {errors.avatar_url.message}
          </p>
        )}
      </div>

      {/* Bio */}
      <div>
        <label
          htmlFor="bio"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Bio
        </label>
        <textarea
          id="bio"
          {...register('bio')}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent resize-none"
          placeholder="Tell us about yourself..."
        />
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          Maximum 500 characters
        </p>
        {errors.bio && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            {errors.bio.message}
          </p>
        )}
      </div>

      {/* Interests */}
      <div>
        <label
          htmlFor="interests"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Interests (comma-separated)
        </label>
        <input
          id="interests"
          type="text"
          {...register('interests', {
            setValueAs: (value) =>
              value ? value.split(',').map((item: string) => item.trim()) : [],
          })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent"
          placeholder="e.g., Programming, Music, Sports"
        />
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          Separate interests with commas
        </p>
        {errors.interests && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            {errors.interests.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => router.push(`/users/${profile.id}`)}
          className="px-6 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || success}
          className="flex-1 px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : success ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}
