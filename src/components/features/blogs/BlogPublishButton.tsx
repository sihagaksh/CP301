'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { publishBlog } from '@/lib/db/blogs'
import { CheckCircle } from 'lucide-react'

interface BlogPublishButtonProps {
  blogId: string
}

export function BlogPublishButton({ blogId }: BlogPublishButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePublish() {
    setIsLoading(true)
    setError(null)

    try {
      await publishBlog(blogId)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish blog')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <button
        onClick={handlePublish}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Publishing...
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4" />
            Publish
          </>
        )}
      </button>
    </div>
  )
}
