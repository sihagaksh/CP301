import { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { getBlogById } from '@/lib/db/blogs'
import { BlogForm } from '@/components/features/blogs/BlogForm'

interface EditBlogPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: EditBlogPageProps): Promise<Metadata> {
  const { slug } = await params
  const blog = await getBlogById(slug)

  if (!blog) {
    return { title: 'Blog Not Found' }
  }

  return {
    title: `Edit ${blog.title} | DEP Campus Platform`,
  }
}

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const { slug } = await params

  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const blog = await getBlogById(slug)

  if (!blog) {
    notFound()
  }

  // Check if user is the author
  if (blog.author_id !== user.id) {
    redirect('/dashboard/blogs')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Edit Blog</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Update your blog post</p>
      </div>

      <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-8">
        <BlogForm userId={user.id} blog={blog} />
      </div>
    </div>
  )
}
