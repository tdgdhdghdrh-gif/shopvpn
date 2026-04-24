import { getSession } from '@/lib/session'
import { getVpnServers } from '@/lib/vpn-api'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import VpnBuyClient from './VpnBuyClient'
import {
  ArrowLeft, Shield, Zap, Globe, Clock, Server, Wifi, Lock,
  Gamepad2, Crown, Building2, Droplets, Sun, Signal, Activity,
  Target, Award, Star, ChevronRight, Cpu, Radio,
} from 'lucide-react'

type VpnThemeId = 'classic' | 'minimal' | 'gaming' | 'corporate' | 'premium' | 'songkran'
const validThemes: VpnThemeId[] = ['classic', 'minimal', 'gaming', 'corporate', 'premium', 'songkran']

interface PageProps {
  searchParams: Promise<{ server?: string }>
}

export default async function VpnPage({ searchParams }: PageProps) {
  const session = await getSession()
  if (!session.isLoggedIn) redirect('/login')

  const [servers, params] = await Promise.all([getVpnServers(), searchParams])
  const preSelectedServer = servers.find(s => s.id === params.server)
  if (!preSelectedServer) redirect('/')

  const [userData, settings] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.userId! },
      select: { balance: true, discountExpiry: true, isAdmin: true, isSuperAdmin: true, isRevenueAdmin: true, promoDiscountPercent: true }
    }),
    prisma.settings.findFirst()
  ])

  const user = {
    name: session.name || '',
    email: session.email || '',
    balance: userData?.balance ?? session.balance ?? 0,
    hasDiscount: userData?.discountExpiry ? new Date(userData.discountExpiry) > new Date() : false
  }
  const isAdmin = !!(userData?.isSuperAdmin || userData?.isAdmin || userData?.isRevenueAdmin)

  const rawTheme = (settings?.vpnTemplate || 'classic') as VpnThemeId
  const themeId = validThemes.includes(rawTheme) ? rawTheme : 'classic'

  // Common data
  const sv = preSelectedServer
  const specData = [
    { label: 'Protocol', value: sv.protocol || 'VLESS' },
    { label: 'Speed', value: `${sv.speed || 10} Gbps` },
    { label: 'Ping', value: `${sv.ping || '< 10'} ms` },
    { label: 'Uptime', value: '99.9%' },
  ]

  // VpnBuyClient shared props
  const clientProps = {
    serverId: sv.id,
    server: {
      flag: sv.flag,
      name: sv.name,
      pricePerDay: sv.pricePerDay,
      priceWeekly: sv.priceWeekly,
      priceMonthly: sv.priceMonthly,
      customPackages: (sv.customPackages as any[] || []) as { days: number; price: number; label: string }[],
      description: sv.description,
      badge: sv.badge,
      defaultIpLimit: sv.defaultIpLimit,
      maxClients: sv.maxClients,
      activeClients: sv._count.orders,
      features: sv.features || [],
    },
    user: {
      name: user.name,
      balance: user.balance,
      hasDiscount: user.hasDiscount,
      promoDiscountPercent: userData?.promoDiscountPercent || 0
    },
    inboundOptions: (() => {
      const configs = sv.inboundConfigs as any[] | null
      if (configs && configs.length > 0) {
        return configs
          .filter((c: any) => c.enable !== false)
          .map((c: any) => ({ inboundId: c.inboundId, carrier: c.carrier || '', remark: c.remark || '' }))
      }
      return []
    })(),
  }

  return (
    <div className="min-h-screen bg-transparent text-white font-sans">
      <Navbar user={{ name: user.name, email: user.email, balance: user.balance }} isAdmin={isAdmin} />

      <main className="pt-4 pb-16 sm:pt-8 sm:pb-20 relative z-10">
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

          <div className="lg:grid lg:grid-cols-5 lg:gap-10">
            {/* ====== LEFT COLUMN: THEMED SERVER INFO ====== */}
            <div className="lg:col-span-2 mb-6 lg:mb-0">
              <div className="lg:sticky lg:top-24 space-y-4">

                {/* ---------- CLASSIC ---------- */}
                {themeId === 'classic' && (
                  <>
                    <div className="relative rounded-2xl border border-zinc-800/80 bg-zinc-950 overflow-hidden">
                      <div className="h-1 bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500" />
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
                      <div className="relative p-5 sm:p-6">
                        {/* Server flag & name */}
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/50 flex items-center justify-center text-4xl shadow-lg shadow-black/50">
                            {sv.flag}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h1 className="text-xl font-bold text-white truncate">{sv.name}</h1>
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50 animate-pulse" />
                              <span className="text-xs text-emerald-400 font-medium">Online</span>
                              {sv.badge && (
                                <span className="ml-1.5 px-2 py-0.5 text-[10px] font-bold rounded-md bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/20">
                                  {sv.badge}
                                </span>
                              )}
                            </div>
                            {sv.description && <p className="text-[11px] text-zinc-500 mt-1.5 line-clamp-2">{sv.description}</p>}
                          </div>
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-3 mb-6">
                          <div className="flex-1 flex items-baseline gap-1.5">
                            <span className="text-2xl font-bold text-white">{sv.pricePerDay}</span>
                            <span className="text-sm text-zinc-500">฿/วัน</span>
                          </div>
                          {sv.maxClients > 0 && (
                            <span className={`text-xs font-medium ${sv._count.orders >= sv.maxClients ? 'text-red-400' : 'text-zinc-500'}`}>
                              {sv._count.orders}/{sv.maxClients} คน
                            </span>
                          )}
                        </div>

                        {/* Specs 2x2 */}
                        <div className="grid grid-cols-2 gap-2.5">
                          {[
                            { Icon: Shield, bg: 'bg-emerald-500/10', border: 'border-emerald-500/10', text: 'text-emerald-400' },
                            { Icon: Zap, bg: 'bg-cyan-500/10', border: 'border-cyan-500/10', text: 'text-cyan-400' },
                            { Icon: Globe, bg: 'bg-violet-500/10', border: 'border-violet-500/10', text: 'text-violet-400' },
                            { Icon: Clock, bg: 'bg-amber-500/10', border: 'border-amber-500/10', text: 'text-amber-400' },
                          ].map((s, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60 hover:border-zinc-700/60 transition-colors">
                              <div className={`w-9 h-9 rounded-lg ${s.bg} border ${s.border} flex items-center justify-center`}>
                                <s.Icon className={`w-4 h-4 ${s.text}`} />
                              </div>
                              <div>
                                <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">{specData[i].label}</p>
                                <p className="text-xs font-semibold text-white">{specData[i].value}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="hidden lg:block rounded-2xl border border-zinc-800/80 bg-zinc-950 overflow-hidden">
                      <div className="p-5 space-y-3.5">
                        <h3 className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold">Features</h3>
                        <div className="space-y-2.5">
                          {sv.features && sv.features.length > 0 ? (
                            sv.features.map((feat: string, i: number) => (
                              <div key={i} className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                                </div>
                                <span className="text-xs text-zinc-400 font-medium">{feat}</span>
                              </div>
                            ))
                          ) : (
                            [
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
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* ---------- MINIMAL ---------- */}
                {themeId === 'minimal' && (
                  <>
                    <div className="relative rounded-xl border border-zinc-800/40 bg-zinc-950/80 overflow-hidden">
                      {/* Thin subtle line */}
                      <div className="h-px bg-zinc-700/50" />
                      <div className="p-5 sm:p-6">
                        {/* Minimal header: just flag + name in one line */}
                        <div className="flex items-center gap-3 mb-5">
                          <span className="text-3xl">{sv.flag}</span>
                          <div className="flex-1 min-w-0">
                            <h1 className="text-lg font-semibold text-zinc-100 truncate">{sv.name}</h1>
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              <span className="text-[11px] text-zinc-500">Online</span>
                              {sv.badge && (
                                <span className="px-1.5 py-0.5 text-[9px] font-medium rounded bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                                  {sv.badge}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {sv.description && <p className="text-[11px] text-zinc-600 mb-4 leading-relaxed">{sv.description}</p>}

                        {/* Price: large, clean */}
                        <div className="mb-5 pb-5 border-b border-zinc-800/30">
                          <span className="text-3xl font-light text-white tracking-tight">{sv.pricePerDay}</span>
                          <span className="text-sm text-zinc-600 ml-1">฿ / วัน</span>
                          {sv.maxClients > 0 && (
                            <span className={`ml-4 text-xs ${sv._count.orders >= sv.maxClients ? 'text-red-400' : 'text-zinc-600'}`}>
                              {sv._count.orders}/{sv.maxClients}
                            </span>
                          )}
                        </div>

                        {/* Specs as horizontal text rows */}
                        <div className="space-y-2.5">
                          {[Shield, Zap, Globe, Clock].map((Icon, i) => (
                            <div key={i} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Icon className="w-3.5 h-3.5 text-zinc-600" />
                                <span className="text-xs text-zinc-500">{specData[i].label}</span>
                              </div>
                              <span className="text-xs font-medium text-zinc-300">{specData[i].value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Minimal features: just text list */}
                    <div className="hidden lg:block rounded-xl border border-zinc-800/40 bg-zinc-950/80 overflow-hidden">
                      <div className="p-5">
                        <div className="space-y-2">
                          {(sv.features && sv.features.length > 0
                            ? sv.features
                            : ['AES-256 Encryption', 'Zero-Log Policy', 'Unlimited Bandwidth', '24/7 Support']
                          ).map((label: string, i: number) => (
                            <div key={i} className="flex items-center gap-2">
                              <div className="w-1 h-1 rounded-full bg-zinc-600" />
                              <span className="text-[11px] text-zinc-500">{label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* ---------- GAMING ---------- */}
                {themeId === 'gaming' && (
                  <>
                    {/* Gaming grid overlay */}
                    <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]" style={{
                      backgroundImage: 'linear-gradient(rgba(34,197,94,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.4) 1px, transparent 1px)',
                      backgroundSize: '30px 30px',
                    }} />

                    <div className="relative rounded-2xl border border-green-500/20 bg-[#0a0f0a] overflow-hidden shadow-lg shadow-green-500/5">
                      {/* Neon top bar with scanline */}
                      <div className="h-1.5 bg-gradient-to-r from-green-500 via-emerald-400 to-lime-500 relative">
                        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,rgba(0,0,0,0.3)_1px,rgba(0,0,0,0.3)_2px)]" />
                      </div>

                      <div className="relative p-5 sm:p-6">
                        {/* HUD-style header */}
                        <div className="flex items-center gap-1.5 mb-4">
                          <Target className="w-3 h-3 text-green-500/60" />
                          <span className="text-[9px] text-green-500/60 font-mono uppercase tracking-[3px]">Server Intel</span>
                          <div className="flex-1 h-px bg-green-500/10" />
                          <Activity className="w-3 h-3 text-green-400 animate-pulse" />
                        </div>

                        {/* Server identity */}
                        <div className="flex items-center gap-4 mb-5">
                          <div className="w-16 h-16 rounded-xl bg-green-500/5 border-2 border-green-500/20 flex items-center justify-center text-4xl relative">
                            {sv.flag}
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                              <Zap className="w-2.5 h-2.5 text-black" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h1 className="text-xl font-black text-green-400 truncate font-mono tracking-tight">{sv.name}</h1>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-green-400 shadow-md shadow-green-400/50 animate-pulse" />
                                <span className="text-[10px] text-green-400 font-mono font-bold">ONLINE</span>
                              </div>
                              {sv.badge && (
                                <span className="px-2 py-0.5 text-[9px] font-black rounded bg-green-500/15 text-green-400 border border-green-500/25 font-mono uppercase">
                                  {sv.badge}
                                </span>
                              )}
                            </div>
                            {sv.description && <p className="text-[10px] text-green-500/40 mt-1 font-mono line-clamp-1">{sv.description}</p>}
                          </div>
                        </div>

                        {/* Price with gaming flair */}
                        <div className="flex items-center justify-between mb-5 p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                          <div className="flex items-center gap-2">
                            <Gamepad2 className="w-4 h-4 text-green-400" />
                            <span className="text-[10px] text-green-500/60 font-mono uppercase">Cost / Day</span>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-green-400 font-mono">{sv.pricePerDay}</span>
                            <span className="text-xs text-green-500/50 font-mono">฿</span>
                          </div>
                        </div>

                        {/* Specs as gaming stat bars */}
                        <div className="space-y-3">
                          {[
                            { Icon: Shield, color: 'bg-green-500', label: specData[0].label, value: specData[0].value, pct: 90 },
                            { Icon: Zap, color: 'bg-emerald-400', label: specData[1].label, value: specData[1].value, pct: 95 },
                            { Icon: Globe, color: 'bg-lime-400', label: specData[2].label, value: specData[2].value, pct: 98 },
                            { Icon: Clock, color: 'bg-green-400', label: specData[3].label, value: specData[3].value, pct: 99 },
                          ].map((s, i) => (
                            <div key={i}>
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-1.5">
                                  <s.Icon className="w-3 h-3 text-green-400" />
                                  <span className="text-[10px] text-green-500/60 font-mono uppercase">{s.label}</span>
                                </div>
                                <span className="text-[11px] text-green-300 font-mono font-bold">{s.value}</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-green-950/50 overflow-hidden">
                                <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.pct}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Capacity */}
                        {sv.maxClients > 0 && (
                          <div className="mt-4 pt-4 border-t border-green-500/10 flex items-center justify-between">
                            <span className="text-[10px] text-green-500/50 font-mono uppercase">Players</span>
                            <span className={`text-xs font-mono font-bold ${sv._count.orders >= sv.maxClients ? 'text-red-400' : 'text-green-400'}`}>
                              {sv._count.orders}/{sv.maxClients}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Gaming features */}
                    <div className="hidden lg:block rounded-2xl border border-green-500/15 bg-[#0a0f0a] overflow-hidden">
                      <div className="p-5 space-y-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Gamepad2 className="w-3 h-3 text-green-500/50" />
                          <span className="text-[9px] text-green-500/50 font-mono uppercase tracking-[2px]">Perks</span>
                        </div>
                        {sv.features && sv.features.length > 0 ? (
                          sv.features.map((feat: string, i: number) => (
                            <div key={i} className="flex items-center gap-2.5 p-2 rounded-lg bg-green-500/5 border border-green-500/10">
                              <Zap className="w-3.5 h-3.5 text-green-400" />
                              <span className="text-[11px] text-green-300/70 font-mono">{feat}</span>
                            </div>
                          ))
                        ) : (
                          [
                            { icon: Gamepad2, label: 'Low Ping Gaming' },
                            { icon: Zap, label: 'Anti-Lag Technology' },
                            { icon: Shield, label: 'Anti-DDoS Protection' },
                            { icon: Globe, label: 'Gaming Servers' },
                          ].map((feat, i) => (
                            <div key={i} className="flex items-center gap-2.5 p-2 rounded-lg bg-green-500/5 border border-green-500/10">
                              <feat.icon className="w-3.5 h-3.5 text-green-400" />
                              <span className="text-[11px] text-green-300/70 font-mono">{feat.label}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* ---------- CORPORATE ---------- */}
                {themeId === 'corporate' && (
                  <>
                    <div className="relative rounded-2xl border border-blue-500/15 bg-slate-950 overflow-hidden">
                      {/* Formal blue header */}
                      <div className="bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 px-5 py-3.5 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center text-2xl">
                          {sv.flag}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h1 className="text-base font-bold text-white truncate">{sv.name}</h1>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                            <span className="text-[10px] text-blue-100/80">Active</span>
                            {sv.badge && (
                              <span className="px-1.5 py-0.5 text-[9px] font-semibold rounded bg-white/15 text-white/90">
                                {sv.badge}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-bold text-white">{sv.pricePerDay}</span>
                          <span className="text-xs text-blue-200/60 ml-0.5">฿/d</span>
                        </div>
                      </div>

                      <div className="p-5 sm:p-6">
                        {sv.description && <p className="text-[11px] text-zinc-500 mb-5 leading-relaxed">{sv.description}</p>}

                        {/* Table-style specs */}
                        <div className="rounded-xl border border-blue-500/10 overflow-hidden">
                          <div className="bg-blue-500/5 px-4 py-2 border-b border-blue-500/10">
                            <span className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider">Server Specifications</span>
                          </div>
                          {[Shield, Zap, Globe, Clock].map((Icon, i) => (
                            <div key={i} className={`flex items-center gap-3 px-4 py-3 ${i < 3 ? 'border-b border-blue-500/5' : ''}`}>
                              <div className="w-8 h-8 rounded-lg bg-blue-500/8 border border-blue-500/10 flex items-center justify-center">
                                <Icon className="w-4 h-4 text-blue-400" />
                              </div>
                              <span className="text-xs text-zinc-500 flex-1">{specData[i].label}</span>
                              <span className="text-xs font-semibold text-zinc-200">{specData[i].value}</span>
                            </div>
                          ))}
                        </div>

                        {/* Capacity */}
                        {sv.maxClients > 0 && (
                          <div className="mt-4 flex items-center justify-between px-1">
                            <span className="text-[11px] text-zinc-600">Capacity</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                                <div className="h-full rounded-full bg-blue-500" style={{ width: `${Math.min(100, (sv._count.orders / sv.maxClients) * 100)}%` }} />
                              </div>
                              <span className={`text-[11px] font-medium ${sv._count.orders >= sv.maxClients ? 'text-red-400' : 'text-zinc-400'}`}>
                                {sv._count.orders}/{sv.maxClients}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Corporate features */}
                    <div className="hidden lg:block rounded-2xl border border-blue-500/15 bg-slate-950 overflow-hidden">
                      <div className="p-5 space-y-3.5">
                        <h3 className="text-[10px] text-blue-400/60 uppercase tracking-wider font-semibold">Enterprise Features</h3>
                        <div className="space-y-2">
                          {sv.features && sv.features.length > 0 ? (
                            sv.features.map((feat: string, i: number) => (
                              <div key={i} className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-lg bg-blue-500/8 border border-blue-500/10 flex items-center justify-center flex-shrink-0">
                                  <Zap className="w-3.5 h-3.5 text-blue-400" />
                                </div>
                                <span className="text-xs text-zinc-400 font-medium">{feat}</span>
                              </div>
                            ))
                          ) : (
                            [
                              { icon: Building2, label: 'Enterprise Security' },
                              { icon: Shield, label: 'Compliance Ready' },
                              { icon: Lock, label: 'End-to-End Encryption' },
                              { icon: Server, label: 'Dedicated Support' },
                            ].map((feat, i) => (
                              <div key={i} className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-lg bg-blue-500/8 border border-blue-500/10 flex items-center justify-center flex-shrink-0">
                                  <feat.icon className="w-3.5 h-3.5 text-blue-400" />
                                </div>
                                <span className="text-xs text-zinc-400 font-medium">{feat.label}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* ---------- PREMIUM ---------- */}
                {themeId === 'premium' && (
                  <>
                    <div className="relative rounded-2xl border border-amber-500/15 bg-[#0f0d08] overflow-hidden">
                      {/* Gold shimmer top */}
                      <div className="h-1.5 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" style={{ animation: 'shimmer 3s ease-in-out infinite' }} />
                      </div>

                      {/* Ambient glow */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

                      <div className="relative p-5 sm:p-6">
                        {/* Crown badge */}
                        <div className="flex items-center gap-2 mb-4">
                          <Crown className="w-4 h-4 text-amber-400" />
                          <span className="text-[10px] text-amber-400/60 font-bold uppercase tracking-[2px]">Premium Server</span>
                        </div>

                        {/* Server info with gold frame */}
                        <div className="flex items-center gap-4 mb-5">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border-2 border-amber-500/20 flex items-center justify-center text-4xl relative">
                            {sv.flag}
                            <div className="absolute -top-1.5 -right-1.5">
                              <Crown className="w-4 h-4 text-amber-400 drop-shadow-lg" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h1 className="text-xl font-bold text-white truncate">{sv.name}</h1>
                            <div className="flex items-center gap-1.5 mt-1">
                              <div className="w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50 animate-pulse" />
                              <span className="text-xs text-amber-400 font-medium">Online</span>
                              {sv.badge && (
                                <span className="ml-1.5 px-2 py-0.5 text-[10px] font-bold rounded-md bg-gradient-to-r from-amber-500/25 to-yellow-500/25 text-amber-400 border border-amber-500/25">
                                  {sv.badge}
                                </span>
                              )}
                            </div>
                            {sv.description && <p className="text-[10px] text-amber-500/30 mt-1 line-clamp-2">{sv.description}</p>}
                          </div>
                        </div>

                        {/* Price in gold card */}
                        <div className="mb-5 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/5 border border-amber-500/15">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-amber-400/50 uppercase tracking-wider block mb-1">Price</span>
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-3xl font-black text-amber-400">{sv.pricePerDay}</span>
                                <span className="text-sm text-amber-500/50">฿/วัน</span>
                              </div>
                            </div>
                            {sv.maxClients > 0 && (
                              <div className="text-right">
                                <span className="text-[10px] text-amber-400/50 uppercase block mb-1">Slots</span>
                                <span className={`text-sm font-bold ${sv._count.orders >= sv.maxClients ? 'text-red-400' : 'text-amber-400'}`}>
                                  {sv._count.orders}/{sv.maxClients}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Specs as horizontal pills */}
                        <div className="flex flex-wrap gap-2">
                          {[Shield, Zap, Globe, Clock].map((Icon, i) => (
                            <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-full bg-amber-500/8 border border-amber-500/10">
                              <Icon className="w-3.5 h-3.5 text-amber-400" />
                              <div>
                                <span className="text-[9px] text-amber-500/40 block">{specData[i].label}</span>
                                <span className="text-[11px] font-semibold text-amber-200">{specData[i].value}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Premium features */}
                    <div className="hidden lg:block rounded-2xl border border-amber-500/15 bg-[#0f0d08] overflow-hidden">
                      <div className="p-5 space-y-3.5">
                        <div className="flex items-center gap-2">
                          <Award className="w-3.5 h-3.5 text-amber-400" />
                          <h3 className="text-[10px] text-amber-400/60 uppercase tracking-wider font-semibold">VIP Benefits</h3>
                        </div>
                        <div className="space-y-2.5">
                          {sv.features && sv.features.length > 0 ? (
                            sv.features.map((feat: string, i: number) => (
                              <div key={i} className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/10 flex items-center justify-center flex-shrink-0">
                                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                                </div>
                                <span className="text-xs text-zinc-400 font-medium">{feat}</span>
                              </div>
                            ))
                          ) : (
                            [
                              { icon: Crown, label: 'VIP Priority Access' },
                              { icon: Shield, label: 'Premium Protection' },
                              { icon: Zap, label: 'Ultra-Fast Speed' },
                              { icon: Star, label: 'Premium Support 24/7' },
                            ].map((feat, i) => (
                              <div key={i} className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/10 flex items-center justify-center flex-shrink-0">
                                  <feat.icon className="w-3.5 h-3.5 text-amber-400" />
                                </div>
                                <span className="text-xs text-zinc-400 font-medium">{feat.label}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Shimmer animation */}
                    <style dangerouslySetInnerHTML={{ __html: `
                      @keyframes shimmer {
                        0% { transform: translateX(-100%); }
                        50% { transform: translateX(100%); }
                        100% { transform: translateX(100%); }
                      }
                    `}} />
                  </>
                )}

                {/* ---------- SONGKRAN ---------- */}
                {themeId === 'songkran' && (
                  <>
                    {/* Floating emojis background */}
                    <div className="fixed top-20 right-4 text-2xl opacity-10 pointer-events-none z-0 select-none animate-pulse">
                      💦🌸🐘🌊
                    </div>

                    <div className="relative rounded-2xl border border-sky-500/20 bg-[#060e1f] overflow-hidden">
                      {/* Water wave top */}
                      <div className="relative h-14 bg-gradient-to-b from-sky-500/20 to-transparent overflow-hidden">
                        <div className="absolute bottom-0 left-0 right-0 h-5" style={{
                          background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1200 60\'%3E%3Cpath d=\'M0,30 Q150,0 300,30 Q450,60 600,30 Q750,0 900,30 Q1050,60 1200,30 L1200,60 L0,60Z\' fill=\'%23060e1f\'/%3E%3C/svg%3E") repeat-x bottom/600px 100%',
                        }} />
                        <div className="absolute top-2 left-4 text-base opacity-50 select-none">💧</div>
                        <div className="absolute top-1 right-6 text-sm opacity-40 select-none">🌸</div>
                        <div className="absolute top-3 left-1/3 text-xs opacity-30 select-none">☀️</div>
                        <div className="absolute top-1 right-1/3 text-base opacity-35 select-none">💦</div>
                      </div>

                      <div className="relative p-5 sm:p-6 -mt-2">
                        {/* Server identity with water theme */}
                        <div className="flex items-center gap-4 mb-5">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500/15 to-cyan-500/10 border-2 border-sky-500/15 flex items-center justify-center text-4xl relative">
                            {sv.flag}
                            <div className="absolute -bottom-1 -right-1 text-sm">💧</div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h1 className="text-xl font-bold text-white truncate">{sv.name}</h1>
                            <div className="flex items-center gap-1.5 mt-1">
                              <div className="w-2 h-2 rounded-full bg-sky-400 shadow-sm shadow-sky-400/50 animate-pulse" />
                              <span className="text-xs text-sky-400 font-medium">Online</span>
                              {sv.badge && (
                                <span className="ml-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-sky-500/15 text-sky-400 border border-sky-500/20">
                                  {sv.badge}
                                </span>
                              )}
                            </div>
                            {sv.description && <p className="text-[10px] text-sky-500/40 mt-1 line-clamp-2">{sv.description}</p>}
                          </div>
                        </div>

                        {/* Price in water bubble */}
                        <div className="flex items-center gap-3 mb-5">
                          <div className="flex-1 flex items-center gap-3 p-3 rounded-xl bg-sky-500/8 border border-sky-500/12">
                            <Droplets className="w-5 h-5 text-sky-400" />
                            <div>
                              <span className="text-[10px] text-sky-400/50 block">ราคา / วัน</span>
                              <span className="text-xl font-bold text-white">{sv.pricePerDay} <span className="text-sm text-sky-400/50">฿</span></span>
                            </div>
                          </div>
                          {sv.maxClients > 0 && (
                            <div className="p-3 rounded-xl bg-sky-500/8 border border-sky-500/12 text-center">
                              <span className="text-[10px] text-sky-400/50 block">ผู้ใช้</span>
                              <span className={`text-sm font-bold ${sv._count.orders >= sv.maxClients ? 'text-red-400' : 'text-sky-300'}`}>
                                {sv._count.orders}/{sv.maxClients}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Specs as bubble shapes */}
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { Icon: Shield, color: 'from-sky-500/15 to-sky-500/5', border: 'border-sky-500/12' },
                            { Icon: Zap, color: 'from-cyan-500/15 to-cyan-500/5', border: 'border-cyan-500/12' },
                            { Icon: Globe, color: 'from-sky-500/15 to-sky-500/5', border: 'border-sky-500/12' },
                            { Icon: Clock, color: 'from-cyan-500/15 to-cyan-500/5', border: 'border-cyan-500/12' },
                          ].map((s, i) => (
                            <div key={i} className={`flex items-center gap-2.5 p-3 rounded-2xl bg-gradient-to-br ${s.color} border ${s.border}`}>
                              <div className="w-8 h-8 rounded-full bg-sky-500/10 flex items-center justify-center">
                                <s.Icon className="w-4 h-4 text-sky-400" />
                              </div>
                              <div>
                                <p className="text-[9px] text-sky-500/50 uppercase">{specData[i].label}</p>
                                <p className="text-xs font-semibold text-white">{specData[i].value}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Songkran features */}
                    <div className="hidden lg:block rounded-2xl border border-sky-500/15 bg-[#060e1f] overflow-hidden">
                      <div className="p-5 space-y-3.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">🎉</span>
                          <h3 className="text-[10px] text-sky-400/60 uppercase tracking-wider font-semibold">Features</h3>
                        </div>
                        <div className="space-y-2.5">
                          {sv.features && sv.features.length > 0 ? (
                            sv.features.map((feat: string, i: number) => (
                              <div key={i} className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-full bg-sky-500/10 border border-sky-500/10 flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs">✨</span>
                                </div>
                                <span className="text-xs text-zinc-400 font-medium">{feat}</span>
                              </div>
                            ))
                          ) : (
                            [
                              { emoji: '💦', label: 'Splash Protection' },
                              { emoji: '🛡️', label: 'Festival Security' },
                              { emoji: '⚡', label: 'Cool Speed' },
                              { emoji: '🌏', label: 'Summer Servers' },
                            ].map((feat, i) => (
                              <div key={i} className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-full bg-sky-500/10 border border-sky-500/10 flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs">{feat.emoji}</span>
                                </div>
                                <span className="text-xs text-zinc-400 font-medium">{feat.label}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}

              </div>
            </div>

            {/* ====== RIGHT COLUMN: PURCHASE FORM (shared) ====== */}
            <div className="lg:col-span-3">
              <VpnBuyClient {...clientProps} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
