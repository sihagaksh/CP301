import Link from 'next/link'
import { listBlogs } from '@/lib/db/blogs'
import { BlogList } from '@/components/features/blogs/BlogList'

export const metadata = {
  title: 'Blogs | DEP Campus Platform',
  description: 'Read and explore blog posts from campus community',
}

interface PageProps {
  searchParams: Promise<{
    page?: string
    category?: string
    search?: string
  }>
}

export default async function BlogsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = parseInt(params.page || '1', 10)
  const category = params.category
  const search = params.search

  const { data: blogs, count } = await listBlogs({
    page,
    limit: 20,
    published: true,
    category,
    search,
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Blogs</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Discover {count} blog posts from the campus community
          </p>
        </div>

        <Link
          href="/dashboard/blogs/create"
          className="px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold transition-colors"
        >
          Write Blog
        </Link>
      </div>

      {/* Blog List */}
      <BlogList
        initialBlogs={blogs}
        totalCount={count}
        initialPage={page}
        pageSize={20}
      />
    </div>
  )
}
