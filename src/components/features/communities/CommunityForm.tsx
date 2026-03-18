'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createCommunity, updateCommunity } from '@/lib/db/communities'
import { communityCreateSchema } from '@/lib/validators'
import { generateSlug } from '@/lib/utils'
import type { Community } from '@/lib/types'
import type { z } from 'zod'

type CommunityFormData = z.infer<typeof communityCreateSchema>

interface CommunityFormProps {
  community?: Community
  onSuccess?: () => void
  userId: string
}

export function CommunityForm({ community, onSuccess, userId }: CommunityFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<CommunityFormData>({
    resolver: zodResolver(communityCreateSchema),
    defaultValues: community
      ? {
          name: community.name,
          slug: community.slug,
          description: community.description || '',
          is_public: community.is_public,
        }
      : {
          name: '',
          slug: '',
          description: '',
          is_public: true,
        },
  })

  const handleNameChange = (name: string) => {
    form.setValue('name', name)
    if (!community) {
      const newSlug = generateSlug(name)
      form.setValue('slug', newSlug)
    }
  }

  async function onSubmit(data: CommunityFormData) {
    setIsLoading(true)
    setError(null)

    try {
      if (community) {
        await updateCommunity(community.id, data)
        router.push(`/dashboard/communities/${community.slug}`)
      } else {
        const newCommunity = await createCommunity({
          ...data,
          created_by: userId,
        })
        router.push(`/dashboard/communities/${newCommunity.slug}`)
      }

      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save community')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      {error && (
        <div className="p-4 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800">
          <p className="text-red-700 dark:text-red-300 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Community Name */}
      <div>
        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
          Community Name *
        </label>
        <input
          type="text"
          value={form.watch('name')}
          onChange={(e) => handleNameChange(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          placeholder="e.g., Computer Science Club"
        />
        {form.formState.errors.name && (
          <p className="mt-1 text-sm text-red-500">{form.formState.errors.name.message}</p>
        )}
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
          URL Slug *
        </label>
        <div className="p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <code className="text-sm text-gray-700 dark:text-gray-300">
            /dashboard/communities/{form.watch('slug')}
          </code>
        </div>
        <input type="hidden" {...form.register('slug')} />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
          Description <span className="text-gray-500 font-normal">(optional)</span>
        </label>
        <textarea
          {...form.register('description')}
          rows={3}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
          placeholder="What is your community about?"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
          {form.watch('description').length}/500 characters
        </p>
      </div>

      {/* Privacy */}
      <div>
        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
          Privacy
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              checked={form.watch('is_public') === true}
              onChange={() => form.setValue('is_public', true)}
              className="w-4 h-4 border-gray-300 text-amber-500 focus:ring-amber-500"
            />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Public</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Anyone can discover and join this community
              </p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              checked={form.watch('is_public') === false}
              onChange={() => form.setValue('is_public', false)}
              className="w-4 h-4 border-gray-300 text-amber-500 focus:ring-amber-500"
            />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Private</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Only invited members can join
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : community ? 'Update Community' : 'Create Community'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
