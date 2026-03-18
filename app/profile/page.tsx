export const dynamic = 'force-dynamic'

import ProfileClient from './ProfileClient'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const session = await getSession()
  
  if (!session?.isLoggedIn) {
    redirect('/login')
  }

  return <ProfileClient userId={session.userId!} />
}
