'use client'

import { useEffect, useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import {
  TrendingUp,
  Users,
  Calendar,
  Clock,
  Wallet,
  BarChart3,
  RefreshCw,
  Search,
  Download,
  Activity,
  History,
  List as ListIcon,
  ChevronLeft,
  ChevronRight,
  Banknote,
  Smartphone,
  CreditCard,
  FileText,
  Loader2,
} from 'lucide-react'

const RechartsChart = dynamic(() => import('./TopupChart'), { ssr: false })

interface Topup {
  id: string
  amount: number
  method: string
  note: string
  status: string
  createdAt: string
  user: {
    name: string
    email: string
  }
}

interface Stats {
  totalToday: number
  totalMonth: number
  totalAllTime: number
  countToday: number
  countMonth: number
  countAllTime: number
  uniqueUsersToday: number
  uniqueUsersMonth: number
}

type MethodFilter = 'all' | 'wallet' | 'slip' | 'admin'

const METHOD_CONFIG: Record<string, { label: string; icon: typeof Wallet; color: string }> = {
  wallet: { label: 'TrueMoney', icon: Smartphone, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  slip: { label: 'Bank Slip', icon: CreditCard, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  admin: { label: 'แอดมิน', icon: FileText, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
}

/** Normalize method string from DB (e.g. "SLIP" -> "slip", "WALLET" -> "wallet") */
function normalizeMethod(method: string): string {
  const lower = method?.toLowerCase() ?? 'admin'
  if (lower === 'slip') return 'slip'
  if (lower === 'wallet' || lower === 'truemoney') return 'wallet'
  return 'admin'
}

const PAGE_SIZE = 15

export default function AdminTopupsPage() {
  const [topups, setTopups] = useState<Topup[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'chart'>('list')
  const [search, setSearch] = useState('')
  const [methodFilter, setMethodFilter] = useState<MethodFilter>('all')
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      const [topupsRes, statsRes] = await Promise.all([
        fetch('/api/admin/topups'),
        fetch('/api/admin/topups/stats'),
      ])

      const topupsData = await topupsRes.json()
      const statsData = await statsRes.json()

      if (topupsData.topups) setTopups(topupsData.topups)
      if (statsData.stats) setStats(statsData.stats)
    } catch {
      console.error('Failed to fetch financial data')
    } finally {
      setLoading(false)
    }
  }

  // Chart data aggregated by date
  const chartData = useMemo(() => {
    return topups
      .slice(0, 50)
      .reduce((acc: { date: string; amount: number }[], t) => {
        const date = new Date(t.createdAt).toLocaleDateString('th-TH', {
          month: 'short',
          day: 'numeric',
        })
        const existing = acc.find((item) => item.date === date)
        if (existing) {
          existing.amount += t.amount
        } else {
          acc.push({ date, amount: t.amount })
        }
        return acc
      }, [])
      .reverse()
      .slice(-10)
  }, [topups])

  // Filtered + searched topups
  const filteredTopups = useMemo(() => {
    let result = topups

    if (methodFilter !== 'all') {
      result = result.filter((t) => normalizeMethod(t.method) === methodFilter)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (t) =>
          t.user.name.toLowerCase().includes(q) ||
          t.user.email.toLowerCase().includes(q) ||
          t.note?.toLowerCase().includes(q)
      )
    }

    return result
  }, [topups, methodFilter, search])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredTopups.length / PAGE_SIZE))
  const paginatedTopups = filteredTopups.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [methodFilter, search])

  // Method counts for filter badges
  const methodCounts = useMemo(() => {
    const counts: Record<string, number> = { all: topups.length, wallet: 0, slip: 0, admin: 0 }
    topups.forEach((t) => {
      const norm = normalizeMethod(t.method)
      counts[norm]++
    })
    return counts
  }, [topups])

  // Average topup amount
  const avgAmount = stats && stats.countAllTime > 0 ? stats.totalAllTime / stats.countAllTime : 0

  function getMethodBadge(method: string) {
    const norm = normalizeMethod(method)
    const config = METHOD_CONFIG[norm]
    const Icon = config.icon
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    )
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  return (
    <div className="space-y-6 pb-12">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <Wallet className="w-5 h-5 text-emerald-400" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              ธุรกรรมการเงิน
            </h1>
          </div>
          <p className="text-zinc-500 text-sm">ตรวจสอบการเติมเงินและรายได้ทั้งหมดในระบบ</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2.5 bg-zinc-900 border border-white/5 rounded-xl text-zinc-400 hover:text-white hover:border-white/10 transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex bg-zinc-900 border border-white/5 rounded-xl p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg text-sm transition-all ${
                viewMode === 'list'
                  ? 'bg-white/10 text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`p-2 rounded-lg text-sm transition-all ${
                viewMode === 'chart'
                  ? 'bg-white/10 text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="วันนี้"
          value={`฿${(stats?.totalToday ?? 0).toLocaleString()}`}
          sub={`${stats?.countToday ?? 0} รายการ`}
          icon={Calendar}
          color="emerald"
        />
        <StatCard
          label="เดือนนี้"
          value={`฿${(stats?.totalMonth ?? 0).toLocaleString()}`}
          sub={`${stats?.countMonth ?? 0} รายการ`}
          icon={Clock}
          color="blue"
        />
        <StatCard
          label="ทั้งหมด"
          value={`฿${(stats?.totalAllTime ?? 0).toLocaleString()}`}
          sub={`${stats?.countAllTime ?? 0} รายการ`}
          icon={TrendingUp}
          color="purple"
        />
        <StatCard
          label="ผู้ใช้วันนี้"
          value={`${stats?.uniqueUsersToday ?? 0}`}
          sub={`เดือนนี้ ${stats?.uniqueUsersMonth ?? 0} คน`}
          icon={Users}
          color="amber"
        />
      </div>

      {/* ── Chart View ── */}
      {viewMode === 'chart' && chartData.length > 0 && (
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              แนวโน้มรายได้
            </h3>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800 rounded-full border border-white/5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                Live
              </span>
            </div>
          </div>
          <RechartsChart data={chartData} />
        </div>
      )}

      {/* ── Main Content ── */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Transactions - 3 cols on xl */}
        <div className="xl:col-span-3 space-y-4">
          {/* Search + Filter Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="ค้นหาชื่อ, อีเมล, บันทึก..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-zinc-900 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            {/* Method filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 -mx-1 px-1">
              {(
                [
                  { key: 'all', label: 'ทั้งหมด' },
                  { key: 'wallet', label: 'Wallet' },
                  { key: 'slip', label: 'Slip' },
                  { key: 'admin', label: 'แอดมิน' },
                ] as const
              ).map((f) => (
                <button
                  key={f.key}
                  onClick={() => setMethodFilter(f.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    methodFilter === f.key
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-zinc-900 text-zinc-500 border border-white/5 hover:text-zinc-300 hover:border-white/10'
                  }`}
                >
                  {f.label}
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                      methodFilter === f.key ? 'bg-emerald-500/20' : 'bg-zinc-800'
                    }`}
                  >
                    {methodCounts[f.key] ?? 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Transaction List */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
            <div className="p-4 sm:px-6 sm:py-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-zinc-500" />
                ประวัติรายการ
              </h3>
              <span className="text-xs text-zinc-600">
                {filteredTopups.length} รายการ
              </span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                <p className="text-xs text-zinc-500">กำลังโหลดข้อมูล...</p>
              </div>
            ) : paginatedTopups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center">
                  <Wallet className="w-8 h-8 text-zinc-700" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-white">ไม่พบรายการ</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {search || methodFilter !== 'all'
                      ? 'ลองเปลี่ยนคำค้นหาหรือตัวกรอง'
                      : 'ยังไม่มีประวัติการเติมเงินในระบบ'}
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="py-3 px-6 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                          ผู้ใช้
                        </th>
                        <th className="py-3 px-6 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                          วันเวลา
                        </th>
                        <th className="py-3 px-6 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                          ช่องทาง
                        </th>
                        <th className="py-3 px-6 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider text-right">
                          จำนวนเงิน
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {paginatedTopups.map((topup) => (
                        <tr
                          key={topup.id}
                          className="group hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="py-3.5 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-zinc-800 border border-white/5 rounded-lg flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0">
                                {topup.user.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                  {topup.user.name}
                                </p>
                                <p className="text-[11px] text-zinc-500 truncate">
                                  {topup.user.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-6">
                            <p className="text-sm text-zinc-300">{formatDate(topup.createdAt)}</p>
                            <p className="text-[11px] text-zinc-600">{formatTime(topup.createdAt)}</p>
                          </td>
                          <td className="py-3.5 px-6">
                            {getMethodBadge(topup.method)}
                            {topup.note && (
                              <p className="text-[11px] text-zinc-600 mt-1 truncate max-w-[140px]">
                                {topup.note}
                              </p>
                            )}
                          </td>
                          <td className="py-3.5 px-6 text-right">
                            <span className="text-base font-bold text-emerald-400">
                              +฿{topup.amount.toLocaleString()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card List */}
                <div className="md:hidden divide-y divide-white/5">
                  {paginatedTopups.map((topup) => (
                    <div key={topup.id} className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-9 h-9 bg-zinc-800 border border-white/5 rounded-lg flex items-center justify-center text-emerald-400 font-bold text-sm shrink-0">
                            {topup.user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {topup.user.name}
                            </p>
                            <p className="text-[11px] text-zinc-500 truncate">
                              {topup.user.email}
                            </p>
                          </div>
                        </div>
                        <span className="text-base font-bold text-emerald-400 shrink-0 ml-3">
                          +฿{topup.amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getMethodBadge(topup.method)}
                          {topup.note && (
                            <span className="text-[11px] text-zinc-600 truncate max-w-[100px]">
                              {topup.note}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-zinc-500">
                          {formatDate(topup.createdAt)} {formatTime(topup.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-t border-white/5">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs text-zinc-400 hover:text-white bg-zinc-800 border border-white/5 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">ก่อนหน้า</span>
                    </button>
                    <span className="text-xs text-zinc-500">
                      หน้า {page} / {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs text-zinc-400 hover:text-white bg-zinc-800 border border-white/5 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <span className="hidden sm:inline">ถัดไป</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="xl:col-span-1 space-y-4">
          {/* Quick Stats Card */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 space-y-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Banknote className="w-4 h-4 text-emerald-400" />
              สรุปภาพรวม
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">เฉลี่ย/รายการ</span>
                <span className="text-sm font-bold text-white">฿{avgAmount.toFixed(0)}</span>
              </div>
              <div className="h-px bg-white/5" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">รายการวันนี้</span>
                <span className="text-sm font-bold text-white">{stats?.countToday ?? 0}</span>
              </div>
              <div className="h-px bg-white/5" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">รายการเดือนนี้</span>
                <span className="text-sm font-bold text-white">{stats?.countMonth ?? 0}</span>
              </div>
              <div className="h-px bg-white/5" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">ผู้ใช้ (เดือน)</span>
                <span className="text-sm font-bold text-white">{stats?.uniqueUsersMonth ?? 0} คน</span>
              </div>
            </div>
          </div>

          {/* Monthly Target */}
          <div className="bg-gradient-to-br from-emerald-500/5 to-transparent border border-emerald-500/10 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              เป้าหมายรายเดือน
            </h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">฿{(stats?.totalMonth ?? 0).toLocaleString()}</span>
                <span className="text-emerald-400 font-semibold">
                  {stats?.totalMonth
                    ? `${Math.min(100, Math.round((stats.totalMonth / 50000) * 100))}%`
                    : '0%'}
                </span>
              </div>
              <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(100, ((stats?.totalMonth ?? 0) / 50000) * 100)}%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-zinc-600">เป้าหมาย: ฿50,000</p>
            </div>
          </div>

          {/* Top Methods */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white">ช่องทางยอดนิยม</h3>
            <div className="space-y-3">
              {Object.entries(METHOD_CONFIG).map(([key, config]) => {
                const count = methodCounts[key] ?? 0
                const pct = topups.length > 0 ? (count / topups.length) * 100 : 0
                const Icon = config.icon
                return (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-3.5 h-3.5 ${config.color.split(' ')[0]}`} />
                        <span className="text-xs text-zinc-400">{config.label}</span>
                      </div>
                      <span className="text-xs font-medium text-zinc-300">{count}</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 bg-zinc-600"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Export */}
          <button className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-900 border border-white/5 rounded-2xl text-xs font-medium text-zinc-400 hover:text-white hover:border-white/10 transition-all active:scale-[0.98]">
            <Download className="w-4 h-4" />
            ส่งออกรายงาน
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Stat Card Component ── */
function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string
  value: string
  sub: string
  icon: typeof Calendar
  color: 'emerald' | 'blue' | 'purple' | 'amber'
}) {
  const colors = {
    emerald: {
      icon: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
    blue: {
      icon: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
    purple: {
      icon: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
    },
    amber: {
      icon: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
  }

  const c = colors[color]

  return (
    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5 space-y-3 hover:border-white/10 transition-all">
      <div className="flex items-center justify-between">
        <div className={`p-2 ${c.bg} border ${c.border} rounded-lg`}>
          <Icon className={`w-4 h-4 ${c.icon}`} />
        </div>
        <span className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div>
        <p className="text-lg sm:text-2xl font-bold text-white tracking-tight">{value}</p>
        <p className="text-[11px] text-zinc-500 mt-0.5">{sub}</p>
      </div>
    </div>
  )
}
