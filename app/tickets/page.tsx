import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import Navbar from '@/components/Navbar'
import TicketListClient from '@/components/TicketListClient'

export default async function TicketsPage() {
  const session = await getSession()

  const user = session.isLoggedIn ? {
    name: session.name || '',
    email: session.email || '',
    balance: session.balance || 0
  } : null

  const isAdmin = user ? await prisma.user.findFirst({
    where: { id: session.userId, OR: [{ isSuperAdmin: true }, { isAdmin: true }, { isRevenueAdmin: true }] }
  }).then(u => !!u) : false

  return (
    <div className="min-h-screen bg-transparent text-white">
      <Navbar user={user} isAdmin={isAdmin} />
      <TicketListClient />
    </div>
  )
}
