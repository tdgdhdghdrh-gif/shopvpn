import { getSession } from '@/lib/session'
import { getVpnServers } from '@/lib/vpn-api'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import VpnBuyClient from './VpnBuyClient'
import { ArrowLeft, Shield, Zap, Globe, Clock, Server, Wifi, Lock } from 'lucide-react'

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
    select: { discountExpiry: true, isAdmin: true, isSuperAdmin: true, isRevenueAdmin: true, promoDiscountPercent: true }
  })

  const user = {
    name: session.name || '',
    email: session.email || '',
    balance: session.balance || 0,
    hasDiscount: userData?.discountExpiry ? new Date(userData.discountExpiry) > new Date() : false
  }
  
  const isAdmin = !!(userData?.isSuperAdmin || userData?.isAdmin || userData?.isRevenueAdmin)

  return (
    <div className="min-h-screen bg-transparent text-white font-sans">
      <Navbar user={{ name: user.name, email: user.email, balance: user.balance }} isAdmin={isAdmin} />
      
      <main className="pt-4 pb-16 sm:pt-8 sm:pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <div className="mb-5 sm:mb-6">
            <Link 
              href="/" 
              className="group inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-xs font-medium tracking-wide uppercase"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
              เลือกเซิร์ฟเวอร์
            </Link>
          </div>

          {/* 2-column on desktop, stack on mobile */}
          <div className="lg:grid lg:grid-cols-5 lg:gap-10">
            
            {/* Left Column - Server Info (sticky on desktop) */}
            <div className="lg:col-span-2 mb-6 lg:mb-0">
              <div className="lg:sticky lg:top-24 space-y-4">
                
                {/* Server Hero Card */}
                <div className="relative rounded-2xl border border-zinc-800/80 bg-zinc-950 overflow-hidden">
                  {/* Animated gradient top bar */}
                  <div className="h-1 bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500" />
                  
                  {/* Subtle background glow */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="relative p-5 sm:p-6">
                    {/* Server flag & name */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/50 flex items-center justify-center text-4xl shadow-lg shadow-black/50">
                        {preSelectedServer.flag}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold text-white truncate leading-tight">{preSelectedServer.name}</h1>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50 animate-pulse" />
                          <span className="text-xs text-emerald-400 font-medium">Online</span>
                          {preSelectedServer.badge && (
                            <span className="ml-1.5 px-2 py-0.5 text-[10px] font-bold rounded-md bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/20">
                              {preSelectedServer.badge}
                            </span>
                          )}
                        </div>
                        {preSelectedServer.description && (
                          <p className="text-[11px] text-zinc-500 mt-1.5 line-clamp-2">{preSelectedServer.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Price & stock info */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className="flex-1 flex items-baseline gap-1.5">
                        <span className="text-2xl font-bold text-white">{preSelectedServer.pricePerDay}</span>
                        <span className="text-sm text-zinc-500">฿/วัน</span>
                      </div>
                      {preSelectedServer.maxClients > 0 && (
                        <div className="text-right">
                          <span className={`text-xs font-medium ${
                            preSelectedServer._count.orders >= preSelectedServer.maxClients ? 'text-red-400' : 'text-zinc-500'
                          }`}>
                            {preSelectedServer._count.orders}/{preSelectedServer.maxClients} คน
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Server specs grid */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="group flex items-center gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60 hover:border-zinc-700/60 transition-colors">
                        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center">
                          <Shield className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Protocol</p>
                          <p className="text-xs font-semibold text-white">{preSelectedServer.protocol || 'VLESS'}</p>
                        </div>
                      </div>
                      <div className="group flex items-center gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60 hover:border-zinc-700/60 transition-colors">
                        <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/10 flex items-center justify-center">
                          <Zap className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div>
                          <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Speed</p>
                          <p className="text-xs font-semibold text-white">{preSelectedServer.speed || 10} Gbps</p>
                        </div>
                      </div>
                      <div className="group flex items-center gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60 hover:border-zinc-700/60 transition-colors">
                        <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/10 flex items-center justify-center">
                          <Globe className="w-4 h-4 text-violet-400" />
                        </div>
                        <div>
                          <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Ping</p>
                          <p className="text-xs font-semibold text-white">{preSelectedServer.ping || '< 10'} ms</p>
                        </div>
                      </div>
                      <div className="group flex items-center gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60 hover:border-zinc-700/60 transition-colors">
                        <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/10 flex items-center justify-center">
                          <Clock className="w-4 h-4 text-amber-400" />
                        </div>
                        <div>
                          <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Uptime</p>
                          <p className="text-xs font-semibold text-white">99.9%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Features list - desktop only */}
                <div className="hidden lg:block rounded-2xl border border-zinc-800/80 bg-zinc-950 overflow-hidden">
                  <div className="p-5 space-y-3.5">
                    <h3 className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold">Features</h3>
                    <div className="space-y-2.5">
                      {[
                        { icon: Lock, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'AES-256 Encryption' },
                        { icon: Shield, color: 'text-cyan-400', bg: 'bg-cyan-500/10', label: 'Zero-Log Policy' },
                        { icon: Wifi, color: 'text-violet-400', bg: 'bg-violet-500/10', label: 'Unlimited Bandwidth' },
                        { icon: Server, color: 'text-amber-400', bg: 'bg-amber-500/10', label: '24/7 Support' },
                      ].map((feat, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-lg ${feat.bg} flex items-center justify-center flex-shrink-0`}>
                            <feat.icon className={`w-3.5 h-3.5 ${feat.color}`} />
                          </div>
                          <span className="text-xs text-zinc-400 font-medium">{feat.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Purchase Form */}
            <div className="lg:col-span-3">
              <VpnBuyClient 
                serverId={preSelectedServer.id}
                server={{
                  flag: preSelectedServer.flag,
                  name: preSelectedServer.name,
                  pricePerDay: preSelectedServer.pricePerDay,
                  priceWeekly: preSelectedServer.priceWeekly,
                  priceMonthly: preSelectedServer.priceMonthly,
                  description: preSelectedServer.description,
                  badge: preSelectedServer.badge,
                  defaultIpLimit: preSelectedServer.defaultIpLimit,
                  maxClients: preSelectedServer.maxClients,
                  activeClients: preSelectedServer._count.orders,
                }}
                user={{
                  name: user.name,
                  balance: user.balance,
                  hasDiscount: user.hasDiscount,
                  promoDiscountPercent: userData?.promoDiscountPercent || 0
                }}
                inboundOptions={(() => {
                  const configs = preSelectedServer.inboundConfigs as any[] | null
                  if (configs && configs.length > 0) {
                    return configs
                      .filter((c: any) => c.enable !== false)
                      .map((c: any) => ({
                        inboundId: c.inboundId,
                        carrier: c.carrier || '',
                        remark: c.remark || '',
                      }))
                  }
                  return []
                })()}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
