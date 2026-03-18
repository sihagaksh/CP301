import { notFound, redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { getLostFoundItemById } from '@/lib/db/lost-found'
import { ItemForm } from '@/components/features/lost-found/ItemForm'

interface EditItemPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: EditItemPageProps) {
  const { id } = await params
  const item = await getLostFoundItemById(id)

  if (!item) {
    return {
      title: 'Edit Item - Not Found',
    }
  }

  return {
    title: `Edit ${item.item_name} - Lost & Found`,
  }
}

export default async function EditItemPage({ params }: EditItemPageProps) {
  const { id } = await params
  const item = await getLostFoundItemById(id)

  if (!item) {
    notFound()
  }

  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  if (user.id !== item.reported_by) {
    redirect(`/lost-found/${item.id}`)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Edit Report
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Update your lost/found item report
        </p>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <ItemForm userId={user.id} item={item} />
      </div>
    </div>
  )
}
