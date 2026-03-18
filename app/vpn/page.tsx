import { getSession } from '@/lib/session'
import { getVpnServers } from '@/lib/vpn-api'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import VpnBuyClient from './VpnBuyClient'
import { ArrowLeft, Server } from 'lucide-react'

interface PageProps {
  searchParams: Promise<{ 
    server?: string
  }>
}

export default async function VpnPage({ searchParams }: PageProps) {
  const session = await getSession()
  
  if (!session.isLoggedIn) {
    redirect('/login')
  }
  
  const [servers, params] = await Promise.all([
    getVpnServers(),
    searchParams
  ])
  
  const selectedServerId = params.server

  const preSelectedServer = servers.find(s => s.id === selectedServerId)
  
  if (!preSelectedServer) {
    redirect('/')
  }

  // Get user data
  const userData = await prisma.user.findUnique({
    where: { id: session.userId! },
    select: { discountExpiry: true, isAdmin: true }
  })

  const user = {
    name: session.name || '',
    email: session.email || '',
    balance: session.balance || 0,
    hasDiscount: userData?.discountExpiry ? new Date(userData.discountExpiry) > new Date() : false
  }
  
  const isAdmin = !!userData?.isAdmin

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Navbar user={{ name: user.name, email: user.email, balance: user.balance }} isAdmin={isAdmin} />
      
      <main className="pt-2 pb-12">
        <div className="max-w-lg mx-auto px-4 sm:px-6">
          {/* Back Button */}
          <div className="mb-4">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              กลับไปเลือกเซิร์ฟเวอร์
            </Link>
          </div>

          {/* Header */}
          <div className="mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Server className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h1 className="text-xl font-medium text-white">สั่งซื้อ VPN</h1>
              <p className="text-xs text-zinc-500">กำหนดค่าแพ็คเกจของคุณ</p>
            </div>
          </div>

          <VpnBuyClient 
            serverId={preSelectedServer.id}
            server={{
              flag: preSelectedServer.flag,
              name: preSelectedServer.name,
              host: preSelectedServer.host
            }}
            user={{
              name: user.name,
              balance: user.balance,
              hasDiscount: user.hasDiscount
            }}
          />
        </div>
      </main>
    </div>
  )
}
