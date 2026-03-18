import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/db/users'
import { ConversationPageClient } from '@/components/features/messages/ConversationPageClient'

interface ConversationPageProps {
  params: Promise<{ partnerId: string }>
}

export async function generateMetadata({ params }: ConversationPageProps) {
  const { partnerId } = await params
  const partner = await getUserProfile(partnerId)

  if (!partner) {
    return {
      title: 'User Not Found',
    }
  }

  return {
    title: `Chat with ${partner.full_name} - Messages`,
  }
}

export default async function ConversationPage({ params }: ConversationPageProps) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <ConversationPageClient params={params} currentUserId={user.id} />
}
