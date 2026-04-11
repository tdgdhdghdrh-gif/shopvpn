'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { 
  Users, Wallet, Globe, Activity, TrendingUp, TrendingDown,
  ShoppingBag, CreditCard, Server, ArrowUpRight, ArrowDownRight,
  Clock, Zap, RefreshCw, Eye, ChevronRight, Banknote,
  UserPlus, ShieldCheck, Wifi, BarChart3, DollarSign, Package
} from 'lucide-react'

const DashboardChart = dynamic(() => import('@/components/admin/DashboardChart'), { ssr: false })

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
  }
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

function GrowthBadge({ value }: { value: number }) {
  if (value === 0) return <span className="text-[10px] font-bold text-zinc-500">- 0%</span>
  const isPositive = value > 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
      {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      {Math.abs(value)}%
    </span>
  )
}

// Mini sparkline-style bar chart
function MiniBar({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1)
  return (
    <div className="flex items-end gap-[2px] h-8">
      {data.map((val, i) => (
        <div
          key={i}
          className={`w-1.5 rounded-full ${color} transition-all`}
          style={{ height: `${Math.max(4, (val / max) * 100)}%`, opacity: 0.3 + (i / data.length) * 0.7 }}
        />
      ))}
    </div>
  )
}

export default function AdminPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)
  const [chartView, setChartView] = useState<'topups' | 'orders'>('topups')

  useEffect(() => {
    fetchData()
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
        <p className="text-xs font-bold text-zinc-600 tracking-widest uppercase animate-pulse">กำลังโหลดข้อมูล...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-sm text-red-400">โหลดข้อมูลไม่สำเร็จ</p>
        <button onClick={() => { setLoading(true); fetchData() }} className="px-4 py-2 bg-white/5 rounded-xl text-sm text-white hover:bg-white/10 transition-all">
          ลองใหม่
        </button>
      </div>
    )
  }

  const { overview, revenue, charts, recent } = data
  const chartData = chartView === 'topups' ? charts.topupsByDay : charts.ordersByDay

  return (
    <div className="space-y-6">
      {/* Top: Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">ภาพรวมระบบ</h2>
          <p className="text-xs text-zinc-500 mt-0.5">ข้อมูลสรุปแบบเรียลไทม์</p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchData() }}
          className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-white/5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:border-white/10 transition-all active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">รีเฟรช</span>
        </button>
      </div>

      {/* Revenue Highlight Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Today Revenue */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/10 rounded-2xl p-4 sm:p-5 group hover:border-emerald-500/20 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center">
              <Banknote className="w-4 h-4 text-emerald-400" />
            </div>
            <GrowthBadge value={revenue.topups.growthToday} />
          </div>
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">รายได้วันนี้</p>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">{revenue.topups.today.toLocaleString()}<span className="text-sm ml-1">฿</span></p>
          <p className="text-[10px] text-zinc-600 mt-1">{revenue.topups.todayCount} รายการ</p>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-emerald-500/5 rounded-full" />
        </div>

        {/* Month Revenue */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/10 rounded-2xl p-4 sm:p-5 group hover:border-blue-500/20 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <GrowthBadge value={revenue.topups.growthMonth} />
          </div>
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">รายได้เดือนนี้</p>
          <p className="text-2xl sm:text-3xl font-black text-blue-400 tracking-tight">{revenue.topups.month.toLocaleString()}<span className="text-sm ml-1">฿</span></p>
          <p className="text-[10px] text-zinc-600 mt-1">{revenue.topups.monthCount} รายการ</p>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-blue-500/5 rounded-full" />
        </div>

        {/* Online Users */}
        <div className="relative overflow-hidden bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5 group hover:border-white/10 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center">
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            {overview.onlineUsers > 0 && (
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            )}
          </div>
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">ออนไลน์ตอนนี้</p>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">{overview.onlineUsers.toLocaleString()}</p>
          <p className="text-[10px] text-zinc-600 mt-1">จากทั้งหมด {overview.totalUsers.toLocaleString()} คน</p>
        </div>

        {/* System Balance */}
        <div className="relative overflow-hidden bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5 group hover:border-white/10 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center">
              <Wallet className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">ยอดคงเหลือทั้งระบบ</p>
          <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">{overview.totalBalance.toLocaleString()}<span className="text-sm ml-1 text-zinc-500">฿</span></p>
          <p className="text-[10px] text-zinc-600 mt-1">เงินในบัญชีผู้ใช้ทั้งหมด</p>
        </div>
      </div>

      {/* Second Row: Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-3 sm:p-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Globe className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <p className="text-lg font-black text-white">{overview.activeServers}<span className="text-xs text-zinc-500">/{overview.totalServers}</span></p>
            <p className="text-[10px] text-zinc-500 font-bold">เซิร์ฟเวอร์ออนไลน์</p>
          </div>
        </div>

        <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-3 sm:p-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-cyan-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Wifi className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <p className="text-lg font-black text-white">{overview.activeOrders.toLocaleString()}</p>
            <p className="text-[10px] text-zinc-500 font-bold">โค้ดที่ใช้งานได้</p>
          </div>
        </div>

        <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-3 sm:p-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-lg font-black text-white">{overview.ordersToday}</p>
            <p className="text-[10px] text-zinc-500 font-bold">ออเดอร์วันนี้</p>
          </div>
        </div>

        <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-3 sm:p-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-pink-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-4 h-4 text-pink-400" />
          </div>
          <div>
            <p className="text-lg font-black text-white">{revenue.vpn.today.toLocaleString()}<span className="text-xs text-zinc-500">฿</span></p>
            <p className="text-[10px] text-zinc-500 font-bold">รายได้ VPN วันนี้</p>
          </div>
        </div>
      </div>

      {/* Chart + Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 sm:gap-6">
        {/* Chart - 3 cols */}
        <div className="xl:col-span-3">
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">กราฟรายได้</h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">ย้อนหลัง 14 วัน</p>
              </div>
              <div className="flex bg-zinc-950 border border-white/5 rounded-xl p-1 w-fit">
                <button 
                  onClick={() => setChartView('topups')}
                  className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${chartView === 'topups' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  เติมเงิน
                </button>
                <button 
                  onClick={() => setChartView('orders')}
                  className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${chartView === 'orders' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  ออเดอร์ VPN
                </button>
              </div>
            </div>

            {chartData.length > 0 ? (
              <DashboardChart 
                data={chartData} 
                title="" 
              />
            ) : (
              <div className="h-[250px] flex items-center justify-center text-sm text-zinc-600">
                ยังไม่มีข้อมูลกราฟ
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity - 2 cols */}
        <div className="xl:col-span-2 space-y-4">
          {/* Recent Topups */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                เติมเงินล่าสุด
              </h3>
              <Link href="/admin/topups" className="text-[10px] font-bold text-zinc-500 hover:text-white flex items-center gap-1 transition-colors">
                ดูทั้งหมด <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            
            <div className="space-y-1">
              {recent.topups.length === 0 ? (
                <p className="text-xs text-zinc-600 text-center py-6">ยังไม่มีรายการ</p>
              ) : (
                recent.topups.slice(0, 5).map((t) => (
                  <div key={t.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.03] transition-colors">
                    <div className="w-8 h-8 bg-white/5 border border-white/5 rounded-lg flex items-center justify-center text-sm flex-shrink-0">
                      {getMethodIcon(t.method)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{t.userName}</p>
                      <p className="text-[10px] text-zinc-600">{getMethodLabel(t.method)} &middot; {formatRelativeTime(t.createdAt)}</p>
                    </div>
                    <span className="text-sm font-black text-emerald-400 flex-shrink-0">+{t.amount.toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-400" />
                ซื้อ VPN ล่าสุด
              </h3>
              <Link href="/admin/users" className="text-[10px] font-bold text-zinc-500 hover:text-white flex items-center gap-1 transition-colors">
                ดูทั้งหมด <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            
            <div className="space-y-1">
              {recent.orders.length === 0 ? (
                <p className="text-xs text-zinc-600 text-center py-6">ยังไม่มีรายการ</p>
              ) : (
                recent.orders.slice(0, 5).map((o) => (
                  <div key={o.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.03] transition-colors">
                    <div className="w-8 h-8 bg-white/5 border border-white/5 rounded-lg flex items-center justify-center text-sm flex-shrink-0">
                      {o.serverFlag}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{o.userName}</p>
                      <p className="text-[10px] text-zinc-600">{o.serverName} &middot; {o.duration}วัน &middot; {formatRelativeTime(o.createdAt)}</p>
                    </div>
                    <span className="text-sm font-black text-blue-400 flex-shrink-0">{o.price.toLocaleString()}฿</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Summary Table */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-6">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-purple-400" />
          สรุปรายได้
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="pb-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest">ประเภท</th>
                <th className="pb-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">วันนี้</th>
                <th className="pb-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">เดือนนี้</th>
                <th className="pb-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right hidden sm:table-cell">ทั้งหมด</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-white/[0.03]">
                <td className="py-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="font-bold text-white text-xs">เติมเงิน</span>
                </td>
                <td className="py-3 text-right font-bold text-emerald-400">{revenue.topups.today.toLocaleString()} ฿</td>
                <td className="py-3 text-right font-bold text-white">{revenue.topups.month.toLocaleString()} ฿</td>
                <td className="py-3 text-right font-bold text-zinc-400 hidden sm:table-cell">{revenue.topups.allTime.toLocaleString()} ฿</td>
              </tr>
              <tr className="border-b border-white/[0.03]">
                <td className="py-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  <span className="font-bold text-white text-xs">ขาย VPN</span>
                </td>
                <td className="py-3 text-right font-bold text-blue-400">{revenue.vpn.today.toLocaleString()} ฿</td>
                <td className="py-3 text-right font-bold text-white">{revenue.vpn.month.toLocaleString()} ฿</td>
                <td className="py-3 text-right font-bold text-zinc-400 hidden sm:table-cell">{revenue.vpn.allTime.toLocaleString()} ฿</td>
              </tr>
              <tr>
                <td className="py-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400" />
                  <span className="font-bold text-white text-xs">ออเดอร์ทั้งหมด</span>
                </td>
                <td className="py-3 text-right font-bold text-purple-400">{overview.ordersToday}</td>
                <td className="py-3 text-right font-bold text-white">{overview.ordersMonth}</td>
                <td className="py-3 text-right font-bold text-zinc-400 hidden sm:table-cell">{overview.totalOrders.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: '/admin/vpn', icon: Globe, label: 'จัดการเซิร์ฟเวอร์', color: 'text-purple-400 bg-purple-500/10 border-purple-500/10 hover:border-purple-500/20' },
          { href: '/admin/users', icon: Users, label: 'จัดการผู้ใช้', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/10 hover:border-cyan-500/20' },
          { href: '/admin/topups', icon: CreditCard, label: 'ธุรกรรมเงิน', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/10 hover:border-emerald-500/20' },
          ...(data?.isSuperAdmin ? [{ href: '/admin/settings', icon: Activity, label: 'ตั้งค่าระบบ', color: 'text-amber-400 bg-amber-500/10 border-amber-500/10 hover:border-amber-500/20' }] : []),
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl border transition-all active:scale-[0.98] ${link.color}`}
          >
            <link.icon className="w-5 h-5 flex-shrink-0" />
            <span className="text-xs font-bold text-white truncate">{link.label}</span>
            <ChevronRight className="w-3.5 h-3.5 ml-auto text-zinc-600 flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  )
}
