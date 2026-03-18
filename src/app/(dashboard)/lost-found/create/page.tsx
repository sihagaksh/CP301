import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { ItemForm } from '@/components/features/lost-found/ItemForm'

export const metadata = {
  title: 'Report Item - Lost & Found',
  description: 'Report a lost or found item',
}

export default async function CreateItemPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Report Lost or Found Item
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Help reunite lost items with their owners
        </p>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <ItemForm userId={user.id} />
      </div>
    </div>
  )
}
