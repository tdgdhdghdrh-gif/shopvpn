import { getSession } from '@/lib/session'
import { getVpnServers } from '@/lib/vpn-api'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import VpnBuyClient from './VpnBuyClient'
import { ArrowLeft, Shield, Zap, Globe, Clock, Server, Wifi, Lock, Gamepad2, Crown, Building2, Droplets } from 'lucide-react'

// ═══════════════════════════════════════════
// Theme definitions for VPN Buy page
// ═══════════════════════════════════════════
type VpnThemeId = 'classic' | 'minimal' | 'gaming' | 'corporate' | 'premium' | 'songkran'

interface VpnTheme {
  // Page background
  pageBg: string
  // Top gradient bar
  topBar: string
  // Card styling
  cardBg: string
  cardBorder: string
  glowColor: string
  // Spec icon colors (4 specs)
  specColors: { bg: string; border: string; text: string }[]
  // Feature list
  features: { icon: any; color: string; bg: string; label: string }[]
  // Badge accent
  badgeBg: string
  badgeText: string
  badgeBorder: string
  // Back button hover
  backHover: string
  // Spec cell
  specCellBg: string
  specCellBorder: string
  // Feature card
  featureCardBg: string
  featureCardBorder: string
  // Extra decorations
  extraClass?: string
}

const vpnThemes: Record<VpnThemeId, VpnTheme> = {
  classic: {
    pageBg: 'bg-transparent',
    topBar: 'bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500',
    cardBg: 'bg-zinc-950',
    cardBorder: 'border-zinc-800/80',
    glowColor: 'bg-cyan-500/5',
    specColors: [
      { bg: 'bg-emerald-500/10', border: 'border-emerald-500/10', text: 'text-emerald-400' },
      { bg: 'bg-cyan-500/10', border: 'border-cyan-500/10', text: 'text-cyan-400' },
      { bg: 'bg-violet-500/10', border: 'border-violet-500/10', text: 'text-violet-400' },
      { bg: 'bg-amber-500/10', border: 'border-amber-500/10', text: 'text-amber-400' },
    ],
    features: [
      { icon: Lock, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'AES-256 Encryption' },
      { icon: Shield, color: 'text-cyan-400', bg: 'bg-cyan-500/10', label: 'Zero-Log Policy' },
      { icon: Wifi, color: 'text-violet-400', bg: 'bg-violet-500/10', label: 'Unlimited Bandwidth' },
      { icon: Server, color: 'text-amber-400', bg: 'bg-amber-500/10', label: '24/7 Support' },
    ],
    badgeBg: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20',
    badgeText: 'text-amber-400',
    badgeBorder: 'border-amber-500/20',
    backHover: 'hover:text-white',
    specCellBg: 'bg-zinc-900/60',
    specCellBorder: 'border-zinc-800/60 hover:border-zinc-700/60',
    featureCardBg: 'bg-zinc-950',
    featureCardBorder: 'border-zinc-800/80',
  },
  minimal: {
    pageBg: 'bg-transparent',
    topBar: 'bg-gradient-to-r from-zinc-500 via-zinc-400 to-zinc-500',
    cardBg: 'bg-zinc-950',
    cardBorder: 'border-zinc-800/60',
    glowColor: 'bg-zinc-500/3',
    specColors: [
      { bg: 'bg-zinc-800/50', border: 'border-zinc-700/30', text: 'text-zinc-300' },
      { bg: 'bg-zinc-800/50', border: 'border-zinc-700/30', text: 'text-zinc-300' },
      { bg: 'bg-zinc-800/50', border: 'border-zinc-700/30', text: 'text-zinc-300' },
      { bg: 'bg-zinc-800/50', border: 'border-zinc-700/30', text: 'text-zinc-300' },
    ],
    features: [
      { icon: Lock, color: 'text-zinc-300', bg: 'bg-zinc-800/50', label: 'AES-256 Encryption' },
      { icon: Shield, color: 'text-zinc-300', bg: 'bg-zinc-800/50', label: 'Zero-Log Policy' },
      { icon: Wifi, color: 'text-zinc-300', bg: 'bg-zinc-800/50', label: 'Unlimited Bandwidth' },
      { icon: Server, color: 'text-zinc-300', bg: 'bg-zinc-800/50', label: '24/7 Support' },
    ],
    badgeBg: 'bg-zinc-800/50',
    badgeText: 'text-zinc-300',
    badgeBorder: 'border-zinc-700/30',
    backHover: 'hover:text-zinc-200',
    specCellBg: 'bg-zinc-900/40',
    specCellBorder: 'border-zinc-800/40 hover:border-zinc-700/50',
    featureCardBg: 'bg-zinc-950',
    featureCardBorder: 'border-zinc-800/60',
  },
  gaming: {
    pageBg: 'bg-transparent',
    topBar: 'bg-gradient-to-r from-green-500 via-emerald-400 to-green-500',
    cardBg: 'bg-[#0a0f0a]',
    cardBorder: 'border-green-500/20',
    glowColor: 'bg-green-500/8',
    specColors: [
      { bg: 'bg-green-500/10', border: 'border-green-500/15', text: 'text-green-400' },
      { bg: 'bg-emerald-500/10', border: 'border-emerald-500/15', text: 'text-emerald-400' },
      { bg: 'bg-lime-500/10', border: 'border-lime-500/15', text: 'text-lime-400' },
      { bg: 'bg-green-500/10', border: 'border-green-500/15', text: 'text-green-400' },
    ],
    features: [
      { icon: Gamepad2, color: 'text-green-400', bg: 'bg-green-500/10', label: 'Low Ping Gaming' },
      { icon: Zap, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Anti-Lag Technology' },
      { icon: Shield, color: 'text-lime-400', bg: 'bg-lime-500/10', label: 'Anti-DDoS Protection' },
      { icon: Globe, color: 'text-green-400', bg: 'bg-green-500/10', label: 'Gaming Servers' },
    ],
    badgeBg: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20',
    badgeText: 'text-green-400',
    badgeBorder: 'border-green-500/20',
    backHover: 'hover:text-green-400',
    specCellBg: 'bg-green-950/30',
    specCellBorder: 'border-green-500/10 hover:border-green-500/25',
    featureCardBg: 'bg-[#0a0f0a]',
    featureCardBorder: 'border-green-500/20',
    extraClass: 'gaming-grid',
  },
  corporate: {
    pageBg: 'bg-transparent',
    topBar: 'bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600',
    cardBg: 'bg-slate-950',
    cardBorder: 'border-blue-500/15',
    glowColor: 'bg-blue-500/5',
    specColors: [
      { bg: 'bg-blue-500/10', border: 'border-blue-500/10', text: 'text-blue-400' },
      { bg: 'bg-indigo-500/10', border: 'border-indigo-500/10', text: 'text-indigo-400' },
      { bg: 'bg-blue-500/10', border: 'border-blue-500/10', text: 'text-blue-400' },
      { bg: 'bg-indigo-500/10', border: 'border-indigo-500/10', text: 'text-indigo-400' },
    ],
    features: [
      { icon: Building2, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Enterprise Security' },
      { icon: Shield, color: 'text-indigo-400', bg: 'bg-indigo-500/10', label: 'Compliance Ready' },
      { icon: Lock, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'End-to-End Encryption' },
      { icon: Server, color: 'text-indigo-400', bg: 'bg-indigo-500/10', label: 'Dedicated Support' },
    ],
    badgeBg: 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20',
    badgeText: 'text-blue-400',
    badgeBorder: 'border-blue-500/20',
    backHover: 'hover:text-blue-400',
    specCellBg: 'bg-slate-900/60',
    specCellBorder: 'border-blue-500/10 hover:border-blue-500/20',
    featureCardBg: 'bg-slate-950',
    featureCardBorder: 'border-blue-500/15',
  },
  premium: {
    pageBg: 'bg-transparent',
    topBar: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500',
    cardBg: 'bg-[#0f0d08]',
    cardBorder: 'border-amber-500/15',
    glowColor: 'bg-amber-500/6',
    specColors: [
      { bg: 'bg-amber-500/10', border: 'border-amber-500/10', text: 'text-amber-400' },
      { bg: 'bg-yellow-500/10', border: 'border-yellow-500/10', text: 'text-yellow-400' },
      { bg: 'bg-amber-500/10', border: 'border-amber-500/10', text: 'text-amber-400' },
      { bg: 'bg-yellow-500/10', border: 'border-yellow-500/10', text: 'text-yellow-400' },
    ],
    features: [
      { icon: Crown, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'VIP Priority Access' },
      { icon: Shield, color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Premium Protection' },
      { icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Ultra-Fast Speed' },
      { icon: Server, color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Premium Support' },
    ],
    badgeBg: 'bg-gradient-to-r from-amber-500/25 to-yellow-500/25',
    badgeText: 'text-amber-400',
    badgeBorder: 'border-amber-500/25',
    backHover: 'hover:text-amber-400',
    specCellBg: 'bg-amber-950/20',
    specCellBorder: 'border-amber-500/10 hover:border-amber-500/20',
    featureCardBg: 'bg-[#0f0d08]',
    featureCardBorder: 'border-amber-500/15',
  },
  songkran: {
    pageBg: 'bg-transparent',
    topBar: 'bg-gradient-to-r from-sky-400 via-cyan-400 to-sky-400',
    cardBg: 'bg-[#060e1f]',
    cardBorder: 'border-sky-500/20',
    glowColor: 'bg-sky-500/8',
    specColors: [
      { bg: 'bg-sky-500/10', border: 'border-sky-500/10', text: 'text-sky-400' },
      { bg: 'bg-cyan-500/10', border: 'border-cyan-500/10', text: 'text-cyan-400' },
      { bg: 'bg-sky-500/10', border: 'border-sky-500/10', text: 'text-sky-400' },
      { bg: 'bg-cyan-500/10', border: 'border-cyan-500/10', text: 'text-cyan-400' },
    ],
    features: [
      { icon: Droplets, color: 'text-sky-400', bg: 'bg-sky-500/10', label: 'Splash Protection' },
      { icon: Shield, color: 'text-cyan-400', bg: 'bg-cyan-500/10', label: 'Festival Security' },
      { icon: Zap, color: 'text-sky-400', bg: 'bg-sky-500/10', label: 'Cool Speed' },
      { icon: Globe, color: 'text-cyan-400', bg: 'bg-cyan-500/10', label: 'Summer Servers' },
    ],
    badgeBg: 'bg-gradient-to-r from-sky-500/20 to-cyan-500/20',
    badgeText: 'text-sky-400',
    badgeBorder: 'border-sky-500/20',
    backHover: 'hover:text-sky-400',
    specCellBg: 'bg-sky-950/30',
    specCellBorder: 'border-sky-500/10 hover:border-sky-500/25',
    featureCardBg: 'bg-[#060e1f]',
    featureCardBorder: 'border-sky-500/20',
  },
}

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

  // Get user data + settings in parallel
  const [userData, settings] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.userId! },
      select: { discountExpiry: true, isAdmin: true, isSuperAdmin: true, isRevenueAdmin: true, promoDiscountPercent: true }
    }),
    prisma.settings.findFirst()
  ])

  const user = {
    name: session.name || '',
    email: session.email || '',
    balance: session.balance || 0,
    hasDiscount: userData?.discountExpiry ? new Date(userData.discountExpiry) > new Date() : false
  }
  
  const isAdmin = !!(userData?.isSuperAdmin || userData?.isAdmin || userData?.isRevenueAdmin)

  // Get theme
  const themeId = ((settings?.vpnTemplate || 'classic') as VpnThemeId)
  const validThemes: VpnThemeId[] = ['classic', 'minimal', 'gaming', 'corporate', 'premium', 'songkran']
  const theme = vpnThemes[validThemes.includes(themeId) ? themeId : 'classic']

  const specIcons = [Shield, Zap, Globe, Clock]
  const specLabels = ['Protocol', 'Speed', 'Ping', 'Uptime']
  const specValues = [
    preSelectedServer.protocol || 'VLESS',
    `${preSelectedServer.speed || 10} Gbps`,
    `${preSelectedServer.ping || '< 10'} ms`,
    '99.9%',
  ]

  return (
    <div className={`min-h-screen ${theme.pageBg} text-white font-sans`}>
      <Navbar user={{ name: user.name, email: user.email, balance: user.balance }} isAdmin={isAdmin} />
      
      {/* Gaming grid pattern overlay */}
      {theme.extraClass === 'gaming-grid' && (
        <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(34,197,94,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.4) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }} />
      )}

      {/* Songkran emoji decorations */}
      {themeId === 'songkran' && (
        <div className="fixed top-20 right-4 text-2xl opacity-15 pointer-events-none z-0 select-none animate-pulse">
          💦🌸🐘🌊
        </div>
      )}
      
      <main className="pt-4 pb-16 sm:pt-8 sm:pb-20 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <div className="mb-5 sm:mb-6">
            <Link 
              href="/" 
              className={`group inline-flex items-center gap-2 text-zinc-500 ${theme.backHover} transition-colors text-xs font-medium tracking-wide uppercase`}
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
                <div className={`relative rounded-2xl border ${theme.cardBorder} ${theme.cardBg} overflow-hidden`}>
                  {/* Animated gradient top bar */}
                  <div className={`h-1 ${theme.topBar}`} />
                  
                  {/* Subtle background glow */}
                  <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 ${theme.glowColor} rounded-full blur-3xl pointer-events-none`} />
                  
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
                            <span className={`ml-1.5 px-2 py-0.5 text-[10px] font-bold rounded-md ${theme.badgeBg} ${theme.badgeText} border ${theme.badgeBorder}`}>
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
                      {specIcons.map((Icon, i) => (
                        <div key={i} className={`group flex items-center gap-3 p-3 rounded-xl ${theme.specCellBg} border ${theme.specCellBorder} transition-colors`}>
                          <div className={`w-9 h-9 rounded-lg ${theme.specColors[i].bg} border ${theme.specColors[i].border} flex items-center justify-center`}>
                            <Icon className={`w-4 h-4 ${theme.specColors[i].text}`} />
                          </div>
                          <div>
                            <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">{specLabels[i]}</p>
                            <p className="text-xs font-semibold text-white">{specValues[i]}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Features list - desktop only */}
                <div className={`hidden lg:block rounded-2xl border ${theme.featureCardBorder} ${theme.featureCardBg} overflow-hidden`}>
                  <div className="p-5 space-y-3.5">
                    <h3 className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold">Features</h3>
                    <div className="space-y-2.5">
                      {theme.features.map((feat, i) => (
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
