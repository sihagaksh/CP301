import { notFound, redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { getListingById } from '@/lib/db/marketplace'
import { ListingForm } from '@/components/features/marketplace/ListingForm'

interface EditListingPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: EditListingPageProps) {
  const { id } = await params
  const listing = await getListingById(id)

  if (!listing) {
    return {
      title: 'Edit Listing - Not Found',
    }
  }

  return {
    title: `Edit ${listing.title} - Marketplace`,
  }
}

export default async function EditListingPage({ params }: EditListingPageProps) {
  const { id } = await params
  const listing = await getListingById(id)

  if (!listing) {
    notFound()
  }

  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  if (user.id !== listing.created_by) {
    redirect(`/marketplace/${listing.id}`)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Edit Listing
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Update your listing details
        </p>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <ListingForm userId={user.id} listing={listing} />
      </div>
    </div>
  )
}
