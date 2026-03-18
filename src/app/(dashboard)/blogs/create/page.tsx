import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { BlogForm } from '@/components/features/blogs/BlogForm'

export const metadata: Metadata = {
  title: 'Write Blog | DEP Campus Platform',
  description: 'Create a new blog post',
}

export default async function CreateBlogPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Write Blog</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Share your thoughts, ideas, and knowledge with the campus community
        </p>
      </div>

      <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-8">
        <BlogForm userId={user.id} />
      </div>
    </div>
  )
}
