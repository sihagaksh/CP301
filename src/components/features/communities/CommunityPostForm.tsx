'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createPost } from '@/lib/db/communities'
import { communityPostSchema } from '@/lib/validators'
import type { z } from 'zod'

type PostFormData = z.infer<typeof communityPostSchema>

interface CommunityPostFormProps {
  communityId: string
  userId: string
  onSuccess?: () => void
}

export function CommunityPostForm({ communityId, userId, onSuccess }: CommunityPostFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<PostFormData>({
    resolver: zodResolver(communityPostSchema),
    defaultValues: {
      content: '',
      image_url: '',
    },
  })

  async function onSubmit(data: PostFormData) {
    setIsLoading(true)
    setError(null)

    try {
      await createPost({
        community_id: communityId,
        author_id: userId,
        content: data.content,
        image_url: data.image_url,
      })

      form.reset()
      router.refresh()
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800">
          <p className="text-red-700 dark:text-red-300 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Content */}
      <div>
        <textarea
          {...form.register('content')}
          rows={4}
          placeholder="Share something with the community..."
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
        />
        {form.formState.errors.content && (
          <p className="mt-1 text-sm text-red-500">{form.formState.errors.content.message}</p>
        )}
      </div>

      {/* Image URL (Optional) */}
      <div>
        <input
          type="url"
          {...form.register('image_url')}
          placeholder="Image URL (optional)"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
        />
        {form.formState.errors.image_url && (
          <p className="mt-1 text-sm text-red-500">{form.formState.errors.image_url.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Posting...' : 'Post'}
      </button>
    </form>
  )
}
