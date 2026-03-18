import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { ListingForm } from '@/components/features/marketplace/ListingForm'

export const metadata = {
  title: 'Sell Item - Marketplace',
  description: 'List an item for sale on the marketplace',
}

export default async function CreateListingPage() {
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
          Sell an Item
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          List an item for sale on the marketplace
        </p>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <ListingForm userId={user.id} />
      </div>
    </div>
  )
}
