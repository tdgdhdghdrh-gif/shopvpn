'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { 
  Users, Wallet, Globe, Activity, TrendingUp, TrendingDown,
  ShoppingBag, CreditCard, Server, ArrowUpRight, ArrowDownRight,
  Clock, Zap, RefreshCw, Eye, ChevronRight, Banknote,
  UserPlus, ShieldCheck, Wifi, BarChart3, DollarSign, Package,
  AlertTriangle, Star, MessageSquare, Gift, TestTube, Layers,
  Signal, Crown, Shield, ArrowRight
} from 'lucide-react'

const DashboardChart = dynamic(() => import('@/components/admin/DashboardChart'), { ssr: false })
const DonutChartDynamic = dynamic(() => import('@/components/admin/DashboardChart').then(mod => ({ default: mod.DonutChart })), { ssr: false })

interface DashboardData {
  isSuperAdmin?: boolean
  overview: {
    totalUsers: number
    onlineUsers: number
    newUsersToday: number
    newUsersMonth: number
    userGrowthToday: number
    totalServers: number
    activeServers: number
    totalOrders: number
    activeOrders: number
    ordersToday: number
    ordersMonth: number
    totalBalance: number
    openTickets: number
    totalTickets: number
    totalReviews: number
    avgRating: number
    slowReportsToday: number
    trialOrdersToday: number
    trialOrdersMonth: number
  }
  revenue: {
    topups: {
      today: number
      todayCount: number
      month: number
      monthCount: number
      allTime: number
      allTimeCount: number
      growthToday: number
      growthMonth: number
    }
    vpn: {
      today: number
      month: number
      allTime: number
    }
  }
  charts: {
    topupsByDay: { date: string; amount: number; count: number }[]
    ordersByDay: { date: string; amount: number; count: number }[]
    newUsersByDay: { date: string; count: number }[]
  }
  topupMethods: { method: string; amount: number; count: number }[]
  topServers: { id: string; name: string; flag: string; revenue: number; orders: number; activeClients: number; maxClients: number }[]
  recent: {
    topups: {
      id: string
      amount: number
      method: string
      userName: string
      createdAt: string
    }[]
    orders: {
      id: string
      price: number
      duration: number
      packageType: string
      userName: string
      serverName: string
      serverFlag: string
      createdAt: string
    }[]
  }
}

function formatRelativeTime(dateStr: string) {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / (1000 * 60))
  const diffHour = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDay = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMin < 1) return 'เมื่อสักครู่'
  if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`
  if (diffHour < 24) return `${diffHour} ชม.ที่แล้ว`
  if (diffDay < 7) return `${diffDay} วันที่แล้ว`
  return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
}

function getMethodLabel(method: string) {
  switch (method) {
    case 'truemoney': return 'TrueMoney'
    case 'slip': return 'สลิป'
    case 'admin': return 'แอดมิน'
    case 'referral': return 'แนะนำเพื่อน'
    default: return method
  }
}

function getMethodIcon(method: string) {
  switch (method) {
    case 'truemoney': return '🟠'
    case 'slip': return '🏦'
    case 'admin': return '👑'
    case 'referral': return '🎁'
    default: return '💳'
  }
}

const METHOD_COLORS: Record<string, string> = {
  truemoney: '#f97316',
  slip: '#3b82f6',
  admin: '#eab308',
  referral: '#a855f7',
}

function GrowthBadge({ value }: { value: number }) {
  if (value === 0) return <span className="text-[10px] font-bold text-zinc-600 tabular-nums">0%</span>
  const isPositive = value > 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold tabular-nums ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
      {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      {Math.abs(value)}%
    </span>
  )
}

// Animated counter
function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  return <span className="tabular-nums">{value.toLocaleString()}{suffix}</span>
}

// Progress bar
function ProgressBar({ value, max, color = 'bg-blue-500' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

export default function AdminPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)
  const [chartView, setChartView] = useState<'topups' | 'orders' | 'users'>('topups')
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    fetchData()
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  async function fetchData() {
    try {
      const res = await fetch('/api/admin/dashboard')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'API error')
      setData(json)
    } catch (err) {
      console.error('Error fetching dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-blue-500/10 rounded-full" />
          <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-xs font-bold text-zinc-600 tracking-widest uppercase animate-pulse">Loading Dashboard...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-red-400" />
        </div>
        <p className="text-sm text-zinc-400 font-medium">โหลดข้อมูลไม่สำเร็จ</p>
        <button onClick={() => { setLoading(true); fetchData() }} className="px-5 py-2.5 bg-white/5 rounded-xl text-xs font-bold text-white hover:bg-white/10 transition-all border border-white/5">
          ลองใหม่
        </button>
      </div>
    )
  }

  const { overview, revenue, charts, recent, topupMethods, topServers } = data
  const chartData = chartView === 'topups' ? charts.topupsByDay : chartView === 'orders' ? charts.ordersByDay : charts.newUsersByDay

  // Donut chart data for topup methods
  const donutData = topupMethods.map(m => ({
    name: getMethodLabel(m.method),
    value: m.amount,
    color: METHOD_COLORS[m.method] || '#6b7280',
  }))
  const totalMethodAmount = donutData.reduce((s, d) => s + d.value, 0)

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Dashboard</h2>
          <p className="text-[11px] text-zinc-600 mt-0.5 font-medium">
            {currentTime.toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchData() }}
          className="flex items-center gap-2 px-3.5 py-2 bg-zinc-900 border border-white/[0.06] rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:border-white/10 transition-all active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">รีเฟรช</span>
        </button>
      </div>

      {/* ========== ROW 1: Revenue Hero Cards ========== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Today Revenue */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500/[0.08] to-transparent border border-emerald-500/10 rounded-2xl p-4 sm:p-5 group hover:border-emerald-500/20 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/[0.04] rounded-full -translate-y-8 translate-x-8" />
          <div className="flex items-center justify-between mb-2.5">
            <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/15 rounded-xl flex items-center justify-center">
              <Banknote className="w-4 h-4 text-emerald-400" />
            </div>
            <GrowthBadge value={revenue.topups.growthToday} />
          </div>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">รายได้วันนี้</p>
          <p className="text-xl sm:text-2xl font-black text-emerald-400 tracking-tight leading-none">
            <AnimatedNumber value={revenue.topups.today} suffix=" ฿" />
          </p>
          <p className="text-[10px] text-zinc-600 mt-1.5">{revenue.topups.todayCount} รายการ</p>
        </div>

        {/* Month Revenue */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-500/[0.08] to-transparent border border-blue-500/10 rounded-2xl p-4 sm:p-5 group hover:border-blue-500/20 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/[0.04] rounded-full -translate-y-8 translate-x-8" />
          <div className="flex items-center justify-between mb-2.5">
            <div className="w-9 h-9 bg-blue-500/10 border border-blue-500/15 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <GrowthBadge value={revenue.topups.growthMonth} />
          </div>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">รายได้เดือนนี้</p>
          <p className="text-xl sm:text-2xl font-black text-blue-400 tracking-tight leading-none">
            <AnimatedNumber value={revenue.topups.month} suffix=" ฿" />
          </p>
          <p className="text-[10px] text-zinc-600 mt-1.5">{revenue.topups.monthCount} รายการ</p>
        </div>

        {/* Online Users */}
        <div className="relative overflow-hidden bg-gradient-to-br from-cyan-500/[0.06] to-transparent border border-white/[0.06] rounded-2xl p-4 sm:p-5 group hover:border-white/10 transition-all">
          <div className="flex items-center justify-between mb-2.5">
            <div className="w-9 h-9 bg-cyan-500/10 border border-cyan-500/15 rounded-xl flex items-center justify-center">
              <Signal className="w-4 h-4 text-cyan-400" />
            </div>
            {overview.onlineUsers > 0 && (
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            )}
          </div>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">ออนไลน์ตอนนี้</p>
          <p className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">
            <AnimatedNumber value={overview.onlineUsers} />
          </p>
          <p className="text-[10px] text-zinc-600 mt-1.5">จากทั้งหมด {overview.totalUsers.toLocaleString()} คน</p>
        </div>

        {/* VPN Revenue Today */}
        <div className="relative overflow-hidden bg-gradient-to-br from-violet-500/[0.06] to-transparent border border-white/[0.06] rounded-2xl p-4 sm:p-5 group hover:border-white/10 transition-all">
          <div className="flex items-center justify-between mb-2.5">
            <div className="w-9 h-9 bg-violet-500/10 border border-violet-500/15 rounded-xl flex items-center justify-center">
              <Shield className="w-4 h-4 text-violet-400" />
            </div>
          </div>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">ขาย VPN วันนี้</p>
          <p className="text-xl sm:text-2xl font-black text-violet-400 tracking-tight leading-none">
            <AnimatedNumber value={revenue.vpn.today} suffix=" ฿" />
          </p>
          <p className="text-[10px] text-zinc-600 mt-1.5">{overview.ordersToday} ออเดอร์</p>
        </div>
      </div>

      {/* ========== ROW 2: Mini Stat Pills ========== */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
        {[
          { icon: Globe, label: 'เซิร์ฟเวอร์', value: `${overview.activeServers}/${overview.totalServers}`, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { icon: Wifi, label: 'VPN ใช้งาน', value: overview.activeOrders.toLocaleString(), color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
          { icon: UserPlus, label: 'สมัครวันนี้', value: overview.newUsersToday.toString(), color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { icon: TestTube, label: 'ทดลองวันนี้', value: overview.trialOrdersToday.toString(), color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { icon: MessageSquare, label: 'ตั๋วเปิดอยู่', value: overview.openTickets.toString(), color: overview.openTickets > 0 ? 'text-red-400' : 'text-zinc-500', bg: overview.openTickets > 0 ? 'bg-red-500/10' : 'bg-zinc-500/10' },
          { icon: Wallet, label: 'ยอดคงเหลือ', value: `${overview.totalBalance.toLocaleString()}฿`, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        ].map((s, i) => (
          <div key={i} className="bg-zinc-900/40 border border-white/[0.04] rounded-xl p-2.5 sm:p-3 flex items-center gap-2.5">
            <div className={`w-7 h-7 ${s.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-sm sm:text-base font-black text-white leading-none truncate">{s.value}</p>
              <p className="text-[9px] sm:text-[10px] text-zinc-600 font-bold truncate">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ========== ROW 3: Main Chart + Topup Method Breakdown ========== */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5">
        {/* Main Chart */}
        <div className="xl:col-span-2">
          <div className="bg-zinc-900/40 border border-white/[0.06] rounded-2xl p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">กราฟรายได้ / สถิติ</h3>
                <p className="text-[10px] text-zinc-600 mt-0.5">ย้อนหลัง 14 วัน</p>
              </div>
              <div className="flex bg-black/40 border border-white/[0.04] rounded-xl p-0.5 w-fit">
                {([
                  { key: 'topups', label: 'เติมเงิน' },
                  { key: 'orders', label: 'ออเดอร์' },
                  { key: 'users', label: 'สมัครใหม่' },
                ] as const).map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setChartView(tab.key)}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${chartView === tab.key ? 'bg-zinc-800 text-white shadow' : 'text-zinc-600 hover:text-zinc-400'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {chartData.length > 0 ? (
              <DashboardChart
                data={chartData}
                title=""
                type={chartView === 'users' ? 'bar' : 'area'}
                color={chartView === 'topups' ? '#10b981' : chartView === 'orders' ? '#3b82f6' : '#a855f7'}
                dataKey={chartView === 'users' ? 'count' : 'amount'}
                height={300}
              />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-xs text-zinc-700">
                ยังไม่มีข้อมูลกราฟ
              </div>
            )}
          </div>
        </div>

        {/* Topup Method Breakdown */}
        <div className="xl:col-span-1">
          <div className="bg-zinc-900/40 border border-white/[0.06] rounded-2xl p-4 sm:p-5 h-full">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-white">ช่องทางเติมเงิน</h3>
                <p className="text-[10px] text-zinc-600 mt-0.5">เดือนนี้</p>
              </div>
              <div className="w-8 h-8 bg-orange-500/10 border border-orange-500/15 rounded-lg flex items-center justify-center">
                <CreditCard className="w-3.5 h-3.5 text-orange-400" />
              </div>
            </div>

            {donutData.length > 0 ? (
              <>
                <DonutChartDynamic data={donutData} height={180} />
                <div className="space-y-2 mt-3">
                  {donutData.map((d, i) => {
                    const pct = totalMethodAmount > 0 ? Math.round((d.value / totalMethodAmount) * 100) : 0
                    return (
                      <div key={i} className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                        <span className="text-[11px] text-zinc-400 flex-1 truncate">{d.name}</span>
                        <span className="text-[11px] font-bold text-white tabular-nums">{d.value.toLocaleString()} ฿</span>
                        <span className="text-[10px] text-zinc-600 tabular-nums w-8 text-right">{pct}%</span>
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (
              <div className="h-[180px] flex items-center justify-center text-xs text-zinc-700">ไม่มีข้อมูล</div>
            )}
          </div>
        </div>
      </div>

      {/* ========== ROW 4: Top Servers + Revenue Summary ========== */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5">
        {/* Top Servers */}
        <div className="bg-zinc-900/40 border border-white/[0.06] rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-500/10 border border-purple-500/15 rounded-lg flex items-center justify-center">
                <Crown className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">เซิร์ฟเวอร์ยอดนิยม</h3>
                <p className="text-[10px] text-zinc-600">รายได้สูงสุดเดือนนี้</p>
              </div>
            </div>
            <Link href="/admin/vpn" className="text-[10px] font-bold text-zinc-600 hover:text-white flex items-center gap-1 transition-colors">
              ดูทั้งหมด <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {topServers.length === 0 ? (
            <p className="text-xs text-zinc-700 text-center py-8">ยังไม่มีข้อมูล</p>
          ) : (
            <div className="space-y-2.5">
              {topServers.map((sv, i) => {
                const maxRev = topServers[0]?.revenue || 1
                return (
                  <div key={sv.id} className="group">
                    <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.02] transition-colors">
                      <div className="w-8 h-8 bg-white/[0.04] border border-white/[0.06] rounded-lg flex items-center justify-center text-base flex-shrink-0">
                        {sv.flag || `#${i + 1}`}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-bold text-white truncate">{sv.name}</p>
                          <span className="text-xs font-black text-emerald-400 tabular-nums flex-shrink-0 ml-2">{sv.revenue.toLocaleString()} ฿</span>
                        </div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] text-zinc-600">{sv.orders} ออเดอร์ {sv.maxClients > 0 ? `| ${sv.activeClients}/${sv.maxClients} คน` : ''}</span>
                        </div>
                        <ProgressBar value={sv.revenue} max={maxRev} color={i === 0 ? 'bg-emerald-500' : i === 1 ? 'bg-blue-500' : 'bg-zinc-600'} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Revenue Summary */}
        <div className="bg-zinc-900/40 border border-white/[0.06] rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-pink-500/10 border border-pink-500/15 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-3.5 h-3.5 text-pink-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">สรุปรายได้</h3>
              <p className="text-[10px] text-zinc-600">เปรียบเทียบตามช่วงเวลา</p>
            </div>
          </div>
          
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-left min-w-[360px]">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  <th className="pb-3 pl-1 text-[10px] font-black text-zinc-600 uppercase tracking-wider">ประเภท</th>
                  <th className="pb-3 text-[10px] font-black text-zinc-600 uppercase tracking-wider text-right">วันนี้</th>
                  <th className="pb-3 text-[10px] font-black text-zinc-600 uppercase tracking-wider text-right">เดือนนี้</th>
                  <th className="pb-3 pr-1 text-[10px] font-black text-zinc-600 uppercase tracking-wider text-right">ทั้งหมด</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { dot: 'bg-emerald-400', label: 'เติมเงิน', today: `${revenue.topups.today.toLocaleString()} ฿`, month: `${revenue.topups.month.toLocaleString()} ฿`, all: `${revenue.topups.allTime.toLocaleString()} ฿`, todayColor: 'text-emerald-400' },
                  { dot: 'bg-blue-400', label: 'ขาย VPN', today: `${revenue.vpn.today.toLocaleString()} ฿`, month: `${revenue.vpn.month.toLocaleString()} ฿`, all: `${revenue.vpn.allTime.toLocaleString()} ฿`, todayColor: 'text-blue-400' },
                  { dot: 'bg-violet-400', label: 'ออเดอร์', today: overview.ordersToday.toString(), month: overview.ordersMonth.toString(), all: overview.totalOrders.toLocaleString(), todayColor: 'text-violet-400' },
                  { dot: 'bg-cyan-400', label: 'สมัครใหม่', today: overview.newUsersToday.toString(), month: overview.newUsersMonth.toString(), all: overview.totalUsers.toLocaleString(), todayColor: 'text-cyan-400' },
                  { dot: 'bg-amber-400', label: 'ทดลองฟรี', today: overview.trialOrdersToday.toString(), month: overview.trialOrdersMonth.toString(), all: '-', todayColor: 'text-amber-400' },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-white/[0.02] last:border-0">
                    <td className="py-2.5 pl-1 flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${row.dot}`} />
                      <span className="font-bold text-zinc-300 text-[11px]">{row.label}</span>
                    </td>
                    <td className={`py-2.5 text-right font-bold text-[11px] tabular-nums ${row.todayColor}`}>{row.today}</td>
                    <td className="py-2.5 text-right font-bold text-zinc-300 text-[11px] tabular-nums">{row.month}</td>
                    <td className="py-2.5 pr-1 text-right font-bold text-zinc-500 text-[11px] tabular-nums">{row.all}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ========== ROW 5: Recent Activity (side by side) ========== */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5">
        {/* Recent Topups */}
        <div className="bg-zinc-900/40 border border-white/[0.06] rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-500/10 border border-emerald-500/15 rounded-lg flex items-center justify-center">
                <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <h3 className="text-sm font-bold text-white">เติมเงินล่าสุด</h3>
            </div>
            <Link href="/admin/topups" className="text-[10px] font-bold text-zinc-600 hover:text-white flex items-center gap-1 transition-colors">
              ดูทั้งหมด <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="space-y-0.5">
            {recent.topups.length === 0 ? (
              <p className="text-xs text-zinc-700 text-center py-8">ยังไม่มีรายการ</p>
            ) : (
              recent.topups.slice(0, 6).map((t) => (
                <div key={t.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.02] transition-colors">
                  <div className="w-8 h-8 bg-white/[0.03] border border-white/[0.05] rounded-lg flex items-center justify-center text-sm flex-shrink-0">
                    {getMethodIcon(t.method)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-white truncate">{t.userName}</p>
                    <p className="text-[10px] text-zinc-600">{getMethodLabel(t.method)} &middot; {formatRelativeTime(t.createdAt)}</p>
                  </div>
                  <span className="text-xs font-black text-emerald-400 tabular-nums flex-shrink-0">+{t.amount.toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-zinc-900/40 border border-white/[0.06] rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500/10 border border-blue-500/15 rounded-lg flex items-center justify-center">
                <Package className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <h3 className="text-sm font-bold text-white">ซื้อ VPN ล่าสุด</h3>
            </div>
            <Link href="/admin/users" className="text-[10px] font-bold text-zinc-600 hover:text-white flex items-center gap-1 transition-colors">
              ดูทั้งหมด <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="space-y-0.5">
            {recent.orders.length === 0 ? (
              <p className="text-xs text-zinc-700 text-center py-8">ยังไม่มีรายการ</p>
            ) : (
              recent.orders.slice(0, 6).map((o) => (
                <div key={o.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.02] transition-colors">
                  <div className="w-8 h-8 bg-white/[0.03] border border-white/[0.05] rounded-lg flex items-center justify-center text-sm flex-shrink-0">
                    {o.serverFlag}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-white truncate">{o.userName}</p>
                    <p className="text-[10px] text-zinc-600">{o.serverName} &middot; {o.packageType === 'TRIAL' ? 'ทดลอง' : `${o.duration} วัน`} &middot; {formatRelativeTime(o.createdAt)}</p>
                  </div>
                  <span className={`text-xs font-black tabular-nums flex-shrink-0 ${o.packageType === 'TRIAL' ? 'text-amber-400' : 'text-blue-400'}`}>
                    {o.packageType === 'TRIAL' ? 'FREE' : `${o.price.toLocaleString()}฿`}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ========== ROW 6: Extra Stats + Quick Links ========== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Rating */}
        <div className="bg-zinc-900/30 border border-white/[0.04] rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] font-bold text-zinc-500 uppercase">คะแนนรีวิว</span>
          </div>
          <p className="text-lg font-black text-white leading-none">
            {overview.avgRating > 0 ? overview.avgRating.toFixed(1) : '-'}
            <span className="text-xs text-zinc-600 font-bold ml-1">/ 5</span>
          </p>
          <p className="text-[10px] text-zinc-700 mt-1">{overview.totalReviews} รีวิว</p>
        </div>

        {/* Slow Reports */}
        <div className="bg-zinc-900/30 border border-white/[0.04] rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className={`w-4 h-4 ${overview.slowReportsToday > 0 ? 'text-red-400' : 'text-zinc-600'}`} />
            <span className="text-[10px] font-bold text-zinc-500 uppercase">แจ้งช้าวันนี้</span>
          </div>
          <p className={`text-lg font-black leading-none ${overview.slowReportsToday > 0 ? 'text-red-400' : 'text-white'}`}>
            {overview.slowReportsToday}
          </p>
          <Link href="/admin/slow-reports" className="text-[10px] text-zinc-700 hover:text-zinc-400 mt-1 inline-flex items-center gap-1 transition-colors">
            ดูรายงาน <ArrowRight className="w-2.5 h-2.5" />
          </Link>
        </div>

        {/* Tickets */}
        <div className="bg-zinc-900/30 border border-white/[0.04] rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className={`w-4 h-4 ${overview.openTickets > 0 ? 'text-orange-400' : 'text-zinc-600'}`} />
            <span className="text-[10px] font-bold text-zinc-500 uppercase">ตั๋วสนับสนุน</span>
          </div>
          <p className="text-lg font-black text-white leading-none">
            {overview.openTickets}
            <span className="text-xs text-zinc-600 font-bold ml-1">เปิด</span>
          </p>
          <Link href="/admin/tickets" className="text-[10px] text-zinc-700 hover:text-zinc-400 mt-1 inline-flex items-center gap-1 transition-colors">
            จัดการ <ArrowRight className="w-2.5 h-2.5" />
          </Link>
        </div>

        {/* All-time Revenue */}
        <div className="bg-zinc-900/30 border border-white/[0.04] rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-bold text-zinc-500 uppercase">รายได้ทั้งหมด</span>
          </div>
          <p className="text-lg font-black text-emerald-400 leading-none tabular-nums">
            {revenue.topups.allTime.toLocaleString()}
            <span className="text-xs ml-0.5">฿</span>
          </p>
          <p className="text-[10px] text-zinc-700 mt-1">{revenue.topups.allTimeCount.toLocaleString()} รายการ</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: '/admin/vpn', icon: Globe, label: 'จัดการเซิร์ฟเวอร์', desc: `${overview.activeServers} เซิร์ฟเวอร์`, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/10 hover:border-purple-500/20' },
          { href: '/admin/users', icon: Users, label: 'จัดการผู้ใช้', desc: `${overview.totalUsers.toLocaleString()} คน`, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/10 hover:border-cyan-500/20' },
          { href: '/admin/topups', icon: CreditCard, label: 'ธุรกรรมเงิน', desc: `${revenue.topups.todayCount} วันนี้`, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/10 hover:border-emerald-500/20' },
          ...(data?.isSuperAdmin ? [{ href: '/admin/settings', icon: Activity, label: 'ตั้งค่าระบบ', desc: 'System', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/10 hover:border-amber-500/20' }] : []),
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl border transition-all active:scale-[0.98] ${link.border}`}
          >
            <div className={`w-9 h-9 ${link.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <link.icon className={`w-4 h-4 ${link.color}`} />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-white block truncate">{link.label}</span>
              <span className="text-[10px] text-zinc-600">{link.desc}</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-700 flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  )
}
