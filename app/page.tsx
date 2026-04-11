import { getSession } from '@/lib/session'
import { getVpnServers } from '@/lib/vpn-api'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { getSiteUrl } from '@/lib/server-utils'
import Navbar from '@/components/Navbar'
import PushNotificationPrompt from '@/components/PushNotificationPrompt'
import PromoBannerCarousel from '@/components/PromoBannerCarousel'
import AdsSection from '@/components/AdsSection'
import PromoPopup from '@/components/PromoPopup'
import LandingClassic from '@/components/landing/LandingClassic'
import LandingMinimal from '@/components/landing/LandingMinimal'
import LandingGaming from '@/components/landing/LandingGaming'
import LandingCorporate from '@/components/landing/LandingCorporate'
import LandingPremium from '@/components/landing/LandingPremium'
import {
  OrganizationJsonLd,
  WebSiteJsonLd,
  FAQPageJsonLd,
  SoftwareApplicationJsonLd,
  LocalBusinessJsonLd,
  ProductJsonLd,
  BreadcrumbJsonLd,
} from '@/components/JsonLd'

import ServerCard from '@/components/ServerCard'
import RecentOrders from '@/components/RecentOrders'
import Link from 'next/link'
import { 
  Wifi, Shield, Server, 
  Zap, Globe, Lock, Heart,
  Wallet, ShoppingBag, Users, Clock, ChevronRight,
  CreditCard, Ticket, BookOpen, UserPlus,
  Star, AlertTriangle, Bell, Gift, Trophy,
  Palette, Monitor, Smartphone, BarChart3, Eye,
  Settings as SettingsIcon, Sparkles, RefreshCw,
  Package,
} from 'lucide-react'

// Icon mapping สำหรับ dynamic rendering
const ICON_MAP: Record<string, any> = {
  Shield, Clock, Globe, UserPlus, CreditCard, ShoppingBag, Ticket,
  BookOpen, Zap, Heart, Star, AlertTriangle, Bell, Gift, Trophy,
  Palette, Monitor, Smartphone, BarChart3, Eye, Sparkles, RefreshCw,
  Wallet, Users, Server, Wifi, Lock, Package,
}

// Color mapping สำหรับ dynamic rendering
function getColorClasses(color: string) {
  const map: Record<string, { icon: string; bg: string; border: string; text: string }> = {
    cyan: { icon: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400' },
    emerald: { icon: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
    amber: { icon: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400' },
    pink: { icon: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20', text: 'text-pink-400' },
    blue: { icon: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400' },
    violet: { icon: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400' },
    red: { icon: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400' },
    orange: { icon: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400' },
  }
  return map[color] || map.cyan
}

// Default sections/quick actions/stats ถ้ายังไม่มีใน DB
const DEFAULT_SECTIONS = [
  { type: 'hero', sortOrder: 0, isVisible: true },
  { type: 'stats', sortOrder: 1, isVisible: true },
  { type: 'quick_actions', sortOrder: 2, isVisible: true },
  { type: 'banners', sortOrder: 3, isVisible: true },
  { type: 'ads', sortOrder: 4, isVisible: true },
  { type: 'expiry_warning', sortOrder: 5, isVisible: true },
  { type: 'recent_orders', sortOrder: 6, isVisible: true },
  { type: 'servers', sortOrder: 7, isVisible: true },
]

const DEFAULT_QUICK_ACTIONS = [
  { label: 'เติมเงิน', href: '/topup', icon: 'CreditCard', color: 'cyan', sortOrder: 0, isVisible: true },
  { label: 'คำสั่งซื้อ', href: '/profile/orders', icon: 'ShoppingBag', color: 'emerald', sortOrder: 1, isVisible: true },
  { label: 'แจ้งปัญหา', href: '/tickets', icon: 'Ticket', color: 'amber', sortOrder: 2, isVisible: true },
  { label: 'วิธีใช้', href: '/setup-guide', icon: 'BookOpen', color: 'pink', sortOrder: 3, isVisible: true },
]

const DEFAULT_STAT_CARDS = [
  { type: 'active_vpn', label: 'VPN ที่ใช้อยู่', icon: 'Shield', color: 'emerald', sortOrder: 0, isVisible: true },
  { type: 'nearest_expiry', label: 'หมดอายุเร็วสุด', icon: 'Clock', color: 'amber', sortOrder: 1, isVisible: true },
  { type: 'servers', label: 'เซิร์ฟเวอร์', icon: 'Globe', color: 'blue', sortOrder: 2, isVisible: true },
  { type: 'referrals', label: 'แนะนำเพื่อน', icon: 'UserPlus', color: 'violet', sortOrder: 3, isVisible: true },
]

export default async function HomePage() {
  const session = await getSession()

  // ถ้าผู้ใช้ล็อกอินอยู่ และแอดมินตั้งหน้าแรกไว้ไม่ใช่ / → redirect ไปหน้าที่ตั้งไว้
  if (session.isLoggedIn) {
    const settings = await prisma.settings.findFirst({
      select: { defaultHomePage: true }
    })
    const homePage = settings?.defaultHomePage || '/'
    if (homePage !== '/') {
      redirect(homePage)
    }
  }

  const servers = await getVpnServers()
  
  const user = session.isLoggedIn ? {
    name: session.name || '',
    email: session.email || '',
    balance: session.balance || 0
  } : null
  
  // ดึงข้อมูล user จาก DB (admin check + stats)
  const dbUser = user ? await prisma.user.findFirst({
    where: { id: session.userId },
    select: {
      balance: true,
      isSuperAdmin: true,
      isAdmin: true,
      isRevenueAdmin: true,
      isAgent: true,
      avatar: true,
      referralCount: true,
      createdAt: true,
      _count: {
        select: {
          vpnOrders: { where: { isActive: true, expiryTime: { gt: new Date() } } },
        }
      }
    }
  }) : null

  // ใช้ balance จาก DB (ค่าล่าสุด) แทน session (ค่าเก่าตอน login)
  if (user && dbUser?.balance !== undefined) {
    user.balance = dbUser.balance
  }

  const isAdmin = dbUser ? (dbUser.isSuperAdmin || dbUser.isAdmin || dbUser.isRevenueAdmin || dbUser.isAgent) : false
  const activeVpnCount = dbUser?._count?.vpnOrders ?? 0
  const userAvatar = dbUser?.avatar || null
  const referralCount = dbUser?.referralCount ?? 0
  const memberSince = dbUser?.createdAt ? dbUser.createdAt.toLocaleDateString('th-TH', { month: 'short', year: 'numeric' }) : null

  // ดึง VPN ที่ใกล้หมดอายุสุด
  const nearestExpiry = user ? await prisma.vpnOrder.findFirst({
    where: { userId: session.userId, isActive: true, expiryTime: { gt: new Date() } },
    orderBy: { expiryTime: 'asc' },
    select: { expiryTime: true, server: { select: { name: true, flag: true } } },
  }) : null

  function getDaysLeft(expiry: Date) {
    const diff = expiry.getTime() - Date.now()
    const days = Math.ceil(diff / 86400000)
    return days
  }

  const nearestDaysLeft = nearestExpiry?.expiryTime ? getDaysLeft(nearestExpiry.expiryTime) : null

  // ดึงรายการซื้อล่าสุด 10 รายการ
  const recentOrders = user ? await prisma.vpnOrder.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      id: true,
      price: true,
      duration: true,
      createdAt: true,
      user: { select: { name: true } },
      server: { select: { name: true, flag: true } },
    }
  }) : []

  // ========== ดึง Homepage Config จาก DB ==========
  let sections: any[] = []
  let quickActions: any[] = []
  let statCards: any[] = []

  if (user) {
    const [dbSections, dbQA, dbStats] = await Promise.all([
      prisma.homepageSection.findMany({ orderBy: { sortOrder: 'asc' } }),
      prisma.homepageQuickAction.findMany({ orderBy: { sortOrder: 'asc' } }),
      prisma.homepageStatCard.findMany({ orderBy: { sortOrder: 'asc' } }),
    ])

    // ใช้ defaults ถ้ายังไม่มีข้อมูลใน DB
    sections = dbSections.length > 0 ? dbSections : DEFAULT_SECTIONS as any[]
    quickActions = dbQA.length > 0 ? dbQA : DEFAULT_QUICK_ACTIONS as any[]
    statCards = dbStats.length > 0 ? dbStats : DEFAULT_STAT_CARDS as any[]
  }

  // ========== ดึงข้อมูลสถิติระบบ (สำหรับ stat cards 20 ประเภท) ==========
  // เช็คว่ามี stat type ไหนที่ต้องใช้ data จริง — query เฉพาะที่จำเป็น
  const statTypes = new Set(statCards.filter((s: any) => s.isVisible).map((s: any) => s.type))
  
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  // System-wide queries (only run if relevant stat types are active)
  const [
    systemTotalUsers,
    systemTotalTopupsAgg,
    systemTotalSalesAgg,
    systemProductStockAgg,
    systemActiveVpnAll,
    systemTotalOrders,
    systemNewUsersToday,
    systemNewUsersMonth,
    systemTotalBalanceAgg,
    systemRevenueTodayAgg,
    systemRevenueMonthAgg,
    systemActiveServers,
    systemTotalTickets,
    systemOpenTickets,
    systemTotalBlogPosts,
    systemTotalReviews,
  ] = await Promise.all([
    statTypes.has('total_users') ? prisma.user.count() : Promise.resolve(0),
    statTypes.has('total_topups_amount') ? prisma.topUp.aggregate({ where: { status: 'SUCCESS' }, _sum: { amount: true } }) : Promise.resolve({ _sum: { amount: null } }),
    statTypes.has('total_sales') ? prisma.vpnOrder.aggregate({ _sum: { price: true } }) : Promise.resolve({ _sum: { price: null } }),
    statTypes.has('product_stock') ? prisma.product.aggregate({ _sum: { stock: true } }) : Promise.resolve({ _sum: { stock: null } }),
    statTypes.has('active_vpn_all') ? prisma.vpnOrder.count({ where: { isActive: true, expiryTime: { gt: now } } }) : Promise.resolve(0),
    statTypes.has('total_orders') ? prisma.vpnOrder.count() : Promise.resolve(0),
    statTypes.has('new_users_today') ? prisma.user.count({ where: { createdAt: { gte: todayStart } } }) : Promise.resolve(0),
    statTypes.has('new_users_month') ? prisma.user.count({ where: { createdAt: { gte: monthStart } } }) : Promise.resolve(0),
    statTypes.has('total_balance') ? prisma.user.aggregate({ _sum: { balance: true } }) : Promise.resolve({ _sum: { balance: null } }),
    statTypes.has('revenue_today') ? prisma.topUp.aggregate({ where: { status: 'SUCCESS', createdAt: { gte: todayStart } }, _sum: { amount: true } }) : Promise.resolve({ _sum: { amount: null } }),
    statTypes.has('revenue_month') ? prisma.topUp.aggregate({ where: { status: 'SUCCESS', createdAt: { gte: monthStart } }, _sum: { amount: true } }) : Promise.resolve({ _sum: { amount: null } }),
    statTypes.has('active_servers') ? prisma.vpnServer.count({ where: { isActive: true } }) : Promise.resolve(0),
    statTypes.has('total_tickets') ? prisma.ticket.count() : Promise.resolve(0),
    statTypes.has('open_tickets') ? prisma.ticket.count({ where: { status: { in: ['open', 'pending'] } } }) : Promise.resolve(0),
    statTypes.has('total_blog_posts') ? prisma.blogPost.count() : Promise.resolve(0),
    statTypes.has('total_reviews') ? prisma.review.count() : Promise.resolve(0),
  ])

  // ========================================
  // LOGGED-IN DASHBOARD — Data-driven layout
  // ========================================
  if (user) {
    // Filter only visible sections
    const visibleSections = sections.filter((s: any) => s.isVisible)

    // Helper: render a single section by type
    function renderSection(section: any) {
      switch (section.type) {
        // ===== Welcome Hero Card =====
        case 'hero':
          return (
            <div key={section.id || 'hero'} className="relative mb-5 rounded-2xl overflow-hidden border border-white/[0.06] bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-cyan-500/[0.04] to-transparent pointer-events-none" />
              <div className="relative p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="relative shrink-0">
                      {userAvatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={userAvatar} alt={user.name} className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border-2 border-white/10" />
                      ) : (
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border-2 border-white/10 flex items-center justify-center">
                          <span className="text-lg sm:text-xl font-black text-white/80">{user.name.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-zinc-900 flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h1 className="text-lg sm:text-xl font-black text-white truncate">{user.name}</h1>
                      </div>
                      <p className="text-[11px] sm:text-xs text-zinc-500 mt-0.5">
                        {memberSince ? `สมาชิกตั้งแต่ ${memberSince}` : 'เลือกเซิร์ฟเวอร์แล้วเริ่มเชื่อมต่อได้เลย'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Link href="/topup" className="flex items-center gap-2.5 px-3.5 py-2.5 sm:px-4 sm:py-3 bg-black/40 border border-white/[0.06] rounded-xl hover:border-cyan-500/20 transition-all group">
                      <div className="w-8 h-8 bg-cyan-500/10 border border-cyan-500/20 rounded-lg flex items-center justify-center shrink-0">
                        <Wallet className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] text-zinc-500 font-medium uppercase tracking-wider">ยอดเงินคงเหลือ</p>
                        <p className="text-sm sm:text-base font-black text-white leading-tight">
                          {user.balance.toLocaleString('th-TH')} <span className="text-[10px] text-zinc-500 font-medium">฿</span>
                        </p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-cyan-400 transition-colors ml-1 shrink-0" />
                    </Link>
                    {isAdmin && (
                      <Link 
                        href="/admin/vpn" 
                        className="hidden sm:inline-flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-500/20"
                      >
                        <Server size={14} />
                        จัดการเซิร์ฟเวอร์
                      </Link>
                    )}
                  </div>
                </div>
                {isAdmin && (
                  <Link 
                    href="/admin/vpn" 
                    className="sm:hidden mt-3 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-500/20"
                  >
                    <Server size={14} />
                    จัดการเซิร์ฟเวอร์
                  </Link>
                )}
              </div>
            </div>
          )

        // ===== Stats Grid (Dynamic) =====
        case 'stats': {
          const visibleStats = statCards.filter((s: any) => s.isVisible)
          if (visibleStats.length === 0) return null

          return (
            <div key={section.id || 'stats'} className={`grid gap-3 mb-5 ${
              visibleStats.length <= 2 ? 'grid-cols-2' :
              visibleStats.length === 3 ? 'grid-cols-3' :
              'grid-cols-2 lg:grid-cols-4'
            }`}>
              {visibleStats.map((stat: any) => {
                const cc = getColorClasses(stat.color)
                const IconComp = ICON_MAP[stat.icon] || Shield

                // Data based on type
                let value: string | number = '--'
                let unit = ''
                let extraClass = ''
                let dotPulse = false

                switch (stat.type) {
                  case 'active_vpn':
                    value = activeVpnCount
                    unit = 'รายการ'
                    break
                  case 'nearest_expiry':
                    if (nearestDaysLeft !== null) {
                      value = nearestDaysLeft
                      unit = 'วัน'
                      extraClass = nearestDaysLeft <= 3 ? 'text-red-400' : nearestDaysLeft <= 7 ? 'text-amber-400' : ''
                    } else {
                      value = '-'
                    }
                    break
                  case 'servers':
                    value = servers.length
                    unit = 'แห่ง'
                    dotPulse = true
                    break
                  case 'referrals':
                    value = referralCount
                    unit = 'คน'
                    break
                  case 'total_users':
                    value = systemTotalUsers.toLocaleString()
                    unit = 'คน'
                    break
                  case 'total_topups_amount':
                    value = (systemTotalTopupsAgg._sum?.amount ?? 0).toLocaleString()
                    unit = '฿'
                    break
                  case 'total_sales':
                    value = (systemTotalSalesAgg._sum?.price ?? 0).toLocaleString()
                    unit = '฿'
                    break
                  case 'product_stock':
                    value = (systemProductStockAgg._sum?.stock ?? 0).toLocaleString()
                    unit = 'ชิ้น'
                    break
                  case 'active_vpn_all':
                    value = systemActiveVpnAll.toLocaleString()
                    unit = 'รายการ'
                    dotPulse = true
                    break
                  case 'total_orders':
                    value = systemTotalOrders.toLocaleString()
                    unit = 'รายการ'
                    break
                  case 'new_users_today':
                    value = systemNewUsersToday.toLocaleString()
                    unit = 'คน'
                    break
                  case 'new_users_month':
                    value = systemNewUsersMonth.toLocaleString()
                    unit = 'คน'
                    break
                  case 'total_balance':
                    value = (systemTotalBalanceAgg._sum?.balance ?? 0).toLocaleString()
                    unit = '฿'
                    break
                  case 'revenue_today':
                    value = (systemRevenueTodayAgg._sum?.amount ?? 0).toLocaleString()
                    unit = '฿'
                    break
                  case 'revenue_month':
                    value = (systemRevenueMonthAgg._sum?.amount ?? 0).toLocaleString()
                    unit = '฿'
                    break
                  case 'active_servers':
                    value = systemActiveServers
                    unit = 'เครื่อง'
                    dotPulse = true
                    break
                  case 'total_tickets':
                    value = systemTotalTickets.toLocaleString()
                    unit = 'ตั๋ว'
                    break
                  case 'open_tickets':
                    value = systemOpenTickets.toLocaleString()
                    unit = 'ตั๋ว'
                    extraClass = systemOpenTickets > 0 ? 'text-amber-400' : ''
                    break
                  case 'total_blog_posts':
                    value = systemTotalBlogPosts.toLocaleString()
                    unit = 'บทความ'
                    break
                  case 'total_reviews':
                    value = systemTotalReviews.toLocaleString()
                    unit = 'รีวิว'
                    break
                }

                return (
                  <div key={stat.id || stat.type} className="bg-zinc-900/80 border border-white/[0.06] rounded-2xl p-4 flex items-center gap-3">
                    <div className={`w-10 h-10 ${cc.bg} border ${cc.border} ${cc.icon} rounded-xl flex items-center justify-center shrink-0`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-zinc-500 font-medium">{stat.label}</p>
                      <p className={`text-sm font-bold ${extraClass || 'text-white'} flex items-center gap-1.5`}>
                        {value} {unit && <span className="text-[10px] text-zinc-500 font-normal">{unit}</span>}
                        {dotPulse && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        }

        // ===== Quick Actions (Dynamic) =====
        case 'quick_actions': {
          const visibleQA = quickActions.filter((q: any) => q.isVisible)
          if (visibleQA.length === 0) return null

          // Determine grid columns based on count
          const cols = visibleQA.length <= 3 ? 3 : visibleQA.length <= 4 ? 4 : visibleQA.length <= 5 ? 5 : 4

          return (
            <div key={section.id || 'qa'} className={`grid gap-2 sm:gap-3 mb-5`} style={{ gridTemplateColumns: `repeat(${Math.min(cols, visibleQA.length)}, minmax(0, 1fr))` }}>
              {visibleQA.map((item: any) => {
                const cc = getColorClasses(item.color)
                const IconComp = ICON_MAP[item.icon] || Zap

                return (
                  <Link
                    key={item.id || item.href}
                    href={item.href}
                    className="flex flex-col items-center gap-1.5 sm:gap-2 py-3 sm:py-4 rounded-2xl bg-zinc-900/80 border border-white/[0.06] hover:border-white/10 transition-all group"
                  >
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 ${cc.bg} ${cc.border} border rounded-xl flex items-center justify-center`}>
                      <IconComp className={`w-4 h-4 sm:w-[18px] sm:h-[18px] ${cc.icon}`} />
                    </div>
                    <span className="text-[10px] sm:text-[11px] text-zinc-400 font-medium group-hover:text-white transition-colors">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          )
        }

        // ===== Promo Banners =====
        case 'banners':
          return <div key={section.id || 'banners'}><PromoBannerCarousel /></div>

        // ===== Ads Section =====
        case 'ads':
          return <div key={section.id || 'ads'}><AdsSection /></div>

        // ===== VPN Expiry Warning =====
        case 'expiry_warning':
          if (!nearestExpiry || nearestDaysLeft === null || nearestDaysLeft > 7) return null
          return (
            <div key={section.id || 'expiry'} className={`mb-5 flex items-center gap-3 px-4 py-3 rounded-2xl border ${
              nearestDaysLeft <= 3
                ? 'bg-red-500/5 border-red-500/20'
                : 'bg-amber-500/5 border-amber-500/20'
            }`}>
              <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${
                nearestDaysLeft <= 3
                  ? 'bg-red-500/10 border-red-500/20 text-red-400'
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
              }`}>
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold ${nearestDaysLeft <= 3 ? 'text-red-400' : 'text-amber-400'}`}>
                  {nearestExpiry.server.flag} {nearestExpiry.server.name} จะหมดอายุใน {nearestDaysLeft} วัน
                </p>
                <p className="text-[10px] text-zinc-500 mt-0.5">ต่ออายุเพื่อใช้งานต่อเนื่อง</p>
              </div>
              <Link href="/profile/renew" className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all shrink-0 ${
                nearestDaysLeft <= 3
                  ? 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20'
                  : 'bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
              }`}>
                ต่ออายุ
              </Link>
            </div>
          )

        // ===== Recent Orders =====
        case 'recent_orders':
          if (recentOrders.length === 0) return null
          return (
            <div key={section.id || 'recent'}>
              <RecentOrders orders={recentOrders.map(o => ({
                id: o.id,
                userName: o.user.name,
                serverName: o.server.name,
                serverFlag: o.server.flag,
                price: o.price,
                duration: o.duration,
                createdAt: o.createdAt.toISOString(),
              }))} />
            </div>
          )

        // ===== Server Section =====
        case 'servers':
          return (
            <div key={section.id || 'servers'}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 rounded-full bg-gradient-to-b from-cyan-400 to-blue-500" />
                  <h2 className="text-sm font-bold text-white">เลือกเซิร์ฟเวอร์</h2>
                  <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-white/5 text-[10px] text-zinc-500 font-medium">{servers.length} รายการ</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {servers.length === 0 ? (
                  <div className="col-span-full py-20 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/50">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center mx-auto mb-4">
                      <Wifi className="w-6 h-6 text-zinc-600" />
                    </div>
                    <p className="text-sm text-zinc-400 font-medium">ยังไม่มีเซิร์ฟเวอร์</p>
                    <p className="text-xs text-zinc-600 mt-1">กรุณาติดต่อแอดมินเพื่อเพิ่มเซิร์ฟเวอร์</p>
                  </div>
                ) : (
                  servers.map((server) => (
                    <ServerCard key={server.id} server={{ 
                      ...server, 
                      userCount: server._count.orders,
                    }} user={user} totalServers={servers.length} />
                  ))
                )}
              </div>
            </div>
          )

        // ===== Custom Text Section =====
        case 'custom_text':
          return (
            <div
              key={section.id}
              className="mb-5 rounded-2xl border border-white/[0.06] overflow-hidden"
              style={{
                backgroundColor: section.bgColor || undefined,
                borderColor: section.borderColor || undefined,
              }}
            >
              {section.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={section.imageUrl} alt={section.title || ''} className="w-full h-auto" />
              )}
              <div className="p-4 sm:p-5">
                {section.title && (
                  <h3 className="text-sm font-bold mb-2" style={{ color: section.textColor || '#ffffff' }}>
                    {section.title}
                  </h3>
                )}
                {section.content && (
                  <p className="text-xs leading-relaxed" style={{ color: section.textColor || '#a1a1aa' }}>
                    {section.content}
                  </p>
                )}
              </div>
            </div>
          )

        // ===== Custom Image Section =====
        case 'custom_image':
          if (!section.imageUrl) return null
          return (
            <div key={section.id} className="mb-5">
              {section.linkUrl ? (
                <Link href={section.linkUrl} className="block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={section.imageUrl}
                    alt={section.title || ''}
                    className="w-full h-auto rounded-2xl border border-white/[0.06] hover:border-white/10 transition-all"
                  />
                </Link>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={section.imageUrl}
                  alt={section.title || ''}
                  className="w-full h-auto rounded-2xl border border-white/[0.06]"
                />
              )}
            </div>
          )

        // ===== Custom HTML Section =====
        case 'custom_html':
          if (!section.content) return null
          return (
            <div
              key={section.id}
              className="mb-5 rounded-2xl border border-white/[0.06] overflow-hidden p-4"
              style={{
                backgroundColor: section.bgColor || undefined,
                borderColor: section.borderColor || undefined,
              }}
              dangerouslySetInnerHTML={{ __html: section.content }}
            />
          )

        // ===== Custom Link Section =====
        case 'custom_link':
          if (!section.linkUrl) return null
          return (
            <Link
              key={section.id}
              href={section.linkUrl}
              className="mb-5 flex items-center gap-3 p-4 rounded-2xl border border-white/[0.06] bg-zinc-900/80 hover:border-white/10 transition-all group"
              style={{
                backgroundColor: section.bgColor || undefined,
                borderColor: section.borderColor || undefined,
              }}
            >
              {section.icon && ICON_MAP[section.icon] && (() => {
                const IconComp = ICON_MAP[section.icon!]
                return (
                  <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <IconComp className="w-5 h-5 text-blue-400" />
                  </div>
                )
              })()}
              {section.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={section.imageUrl} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                {section.title && (
                  <span className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors block truncate" style={{ color: section.textColor || undefined }}>
                    {section.title}
                  </span>
                )}
                {section.content && (
                  <span className="text-[10px] text-zinc-500 block truncate">{section.content}</span>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-cyan-400 transition-colors shrink-0" />
            </Link>
          )

        default:
          return null
      }
    }

    return (
      <div className="min-h-screen bg-transparent text-white font-sans">
        <Navbar user={user} isAdmin={isAdmin} />
        <PushNotificationPrompt />
        <PromoPopup />
          
        <main className="pt-4 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {visibleSections.map(section => renderSection(section))}
          </div>
        </main>
      </div>
    )
  }

  // =============================================
  // LANDING PAGE - สำหรับผู้เยี่ยมชมที่ยังไม่ล็อกอิน
  // ดึง template จาก settings
  // =============================================
  const siteSettings = await prisma.settings.findFirst({
    select: { landingTemplate: true, landingCustomHtml: true, siteName: true, siteLogo: true }
  })
  const landingTemplate = siteSettings?.landingTemplate || 'classic'
  const footerSiteName = siteSettings?.siteName || ''
  const siteUrl = await getSiteUrl()

  // Render landing template ตาม setting
  const landingTemplateContent = (() => {
    switch (landingTemplate) {
      case 'minimal':
        return <LandingMinimal />
      case 'gaming':
        return <LandingGaming />
      case 'corporate':
        return <LandingCorporate />
      case 'premium':
        return <LandingPremium />
      case 'customHtml':
        if (siteSettings?.landingCustomHtml) {
          return <div dangerouslySetInnerHTML={{ __html: siteSettings.landingCustomHtml }} />
        }
        return <LandingClassic />
      case 'classic':
      default:
        return <LandingClassic />
    }
  })()

  return (
    <div className="min-h-screen bg-transparent text-white font-sans">
      <Navbar user={null} isAdmin={false} />
      <PromoPopup />

      {/* JSON-LD Structured Data สำหรับ SEO */}
      <OrganizationJsonLd siteUrl={siteUrl} siteName={footerSiteName} siteLogo={siteSettings?.siteLogo || undefined} />
      <WebSiteJsonLd siteUrl={siteUrl} siteName={footerSiteName} siteLogo={siteSettings?.siteLogo || undefined} />
      <SoftwareApplicationJsonLd siteName={footerSiteName} />
      <LocalBusinessJsonLd siteUrl={siteUrl} siteName={footerSiteName} siteLogo={siteSettings?.siteLogo || undefined} />
      <BreadcrumbJsonLd items={[
        { name: 'หน้าแรก', url: siteUrl },
      ]} />
      <FAQPageJsonLd faqs={[
        { question: 'VPN คืออะไร?', answer: 'VPN คือบริการ VPN (Virtual Private Network) ที่ช่วยเข้ารหัสการเชื่อมต่อของคุณ ทำให้ท่องเว็บได้ปลอดภัย เล่นเกมได้ลื่นไหล และเข้าถึงเนื้อหาที่ถูกบล็อกได้จากทั่วโลก ใช้โปรโตคอล VLESS + XTLS Reality ที่เร็วและปลอดภัยที่สุดในปัจจุบัน' },
        { question: 'ใช้งานยังไง ยากไหม?', answer: 'ง่ายมาก แค่ 3 ขั้นตอน: 1) สมัครสมาชิก 2) เติมเงินและซื้อแพ็กเกจ 3) ดาวน์โหลดแอพ V2Box (iOS) หรือ v2rayNG (Android) แล้วกดเชื่อมต่อเลย มีคู่มือให้พร้อม' },
        { question: 'รองรับค่ายไหนบ้าง?', answer: 'รองรับ AIS 5G/4G, TRUE 5G/4G และ DTAC ทุกเซิร์ฟเวอร์จะแสดงว่ารองรับค่ายไหนบ้าง เลือกใช้ได้ตามค่ายที่คุณใช้' },
        { question: 'ปลอดภัยไหม? เก็บข้อมูลไหม?', answer: 'ปลอดภัย 100% ใช้การเข้ารหัส AES-256-GCM ระดับเดียวกับธนาคาร และมีนโยบาย Zero-Log ไม่เก็บข้อมูลการใช้งาน ไม่เก็บ IP Address ไม่เก็บประวัติการเข้าเว็บ' },
        { question: 'เล่นเกมได้ลื่นจริงไหม?', answer: 'ลื่นจริง เซิร์ฟเวอร์ไทยปิงต่ำกว่า 5ms เหมาะสำหรับเล่น ROV, PUBG, Mobile Legends และเกมออนไลน์ทุกเกม ไม่มีอาการแลค ดีเลย์ หรือกระตุก' },
        { question: 'ชำระเงินยังไง?', answer: 'รองรับการชำระเงินผ่าน TrueMoney Wallet และ PromptPay เติมเงินเข้าระบบแล้วเลือกซื้อแพ็กเกจได้เลย ระบบเป็นอัตโนมัติทั้งหมด' },
        { question: 'ใช้ได้กี่อุปกรณ์?', answer: 'ขึ้นอยู่กับแพ็กเกจที่เลือก Starter ใช้ได้ 1 อุปกรณ์, Pro ใช้ได้ 3 อุปกรณ์, Ultimate ใช้ได้ไม่จำกัดอุปกรณ์ รองรับทั้ง iOS, Android, Windows และ macOS' },
        { question: 'มีทดลองใช้ฟรีไหม?', answer: 'มี เรามี VLESS ฟรีให้ทดลองใช้ สามารถทดสอบความเร็วและความเสถียรได้ก่อนตัดสินใจซื้อ กดที่ปุ่ม ทดลองใช้ฟรี ได้เลย' },
      ]} />
      <ProductJsonLd name="VPN Starter" description="แพ็กเกจ VPN เริ่มต้น ใช้งานได้ 1 อุปกรณ์ เซิร์ฟเวอร์ไทย ความเร็ว 100Mbps" price="50" />
      <ProductJsonLd name="VPN Pro" description="แพ็กเกจ VPN สำหรับผู้ใช้งานจริงจัง ใช้งานได้ 3 อุปกรณ์ เซิร์ฟเวอร์ทุกโลเคชั่น ความเร็ว 1Gbps" price="100" />
      <ProductJsonLd name="VPN Ultimate" description="แพ็กเกจ VPN ไม่จำกัด ใช้งานได้ไม่จำกัดอุปกรณ์ เซิร์ฟเวอร์ทุกโลเคชั่น ความเร็ว 10Gbps เซิร์ฟเวอร์ Private" price="200" />

      {/* Landing Template */}
      {landingTemplateContent}

      {/* Footer v9.0 */}
      <footer className="relative py-16 bg-transparent overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-800 p-0.5">
                  <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
                    <Shield className="w-5 h-5 text-zinc-400" />
                  </div>
                </div>
                <div>
                  <span className="text-xl font-black tracking-tighter">
                    {footerSiteName || 'VPN'}
                  </span>
                  <span className="text-[9px] text-zinc-600 block -mt-0.5">PREMIUM VPN SERVICE</span>
                </div>
              </div>
              <p className="text-sm text-zinc-500 max-w-md leading-relaxed mb-4">
                บริการ VPN ความเร็วสูงอันดับ 1 ในไทย เข้ารหัสข้อมูลระดับทหาร 
                รองรับทุกอุปกรณ์ เล่นเกมลื่น ดูหนัง 4K ไม่กระตุก
              </p>
              <div className="flex items-center gap-2 text-xs text-zinc-600">
                <Lock size={12} />
                <span>เข้ารหัส AES-256 | Zero-Log Policy | 24/7 Support</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-bold text-white mb-4">ลิงก์</h4>
              <div className="space-y-2.5">
                {[
                  { label: 'หน้าแรก', href: '/' },
                  { label: 'ทดลองใช้ฟรี', href: '/public-vless' },
                  { label: 'สมัครสมาชิก', href: '/register' },
                  { label: 'เข้าสู่ระบบ', href: '/login' },
                ].map((link) => (
                  <Link 
                    key={link.href}
                    href={link.href}
                    className="block text-sm text-zinc-500 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-sm font-bold text-white mb-4">ช่วยเหลือ</h4>
              <div className="space-y-2.5">
                {[
                  { label: 'วิธีใช้งาน', href: '/setup-guide' },
                  { label: 'บทความ & เคล็ดลับ', href: '/blog' },
                  { label: 'นโยบายความเป็นส่วนตัว', href: '#' },
                  { label: 'เงื่อนไขการใช้งาน', href: '#' },
                ].map((link) => (
                  <Link 
                    key={link.label}
                    href={link.href}
                    className="block text-sm text-zinc-500 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="pt-8 border-t border-zinc-800">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-sm text-zinc-600">
                &copy; {new Date().getFullYear()} {footerSiteName || 'VPN'}. All rights reserved.
              </div>
              <div className="flex items-center gap-1 text-xs text-zinc-600">
                Made with <Heart size={12} className="text-red-500 mx-0.5" /> in Thailand
              </div>
            </div>
          </div>
        </div>
      </footer>
      
    </div>
  )
}
