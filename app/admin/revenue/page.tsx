'use client'

import { useEffect, useState, useMemo } from 'react'
import {
  Server,
  TrendingUp,
  Wallet,
  Calendar,
  ShoppingCart,
  Activity,
  RefreshCw,
  Globe,
  BarChart3,
  ServerOff,
  Loader2,
  ChevronDown,
  ChevronUp,
  Crown,
} from 'lucide-react'

interface ServerRevenue {
  id: string
  name: string
  host: string
  flag: string
  isActive: boolean
  totalOrders: number
  totalRevenue: number
  todayRevenue: number
  monthRevenue: number
}

interface Summary {
  totalRevenue: number
  todayRevenue: number
  monthRevenue: number
  totalOrders: number
  activeServers: number
  totalServers: number
}

type SortKey = 'totalRevenue' | 'todayRevenue' | 'monthRevenue' | 'totalOrders'

export default function AdminRevenuePage() {
  const [servers, setServers] = useState<ServerRevenue[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState<SortKey>('totalRevenue')
  const [sortAsc, setSortAsc] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/revenue')
      const data = await res.json()
      if (data.servers) setServers(data.servers)
      if (data.summary) setSummary(data.summary)
    } catch {
      console.error('Failed to fetch revenue data')
    } finally {
      setLoading(false)
    }
  }

  const sortedServers = useMemo(() => {
    return [...servers].sort((a, b) => {
      const diff = a[sortKey] - b[sortKey]
      return sortAsc ? diff : -diff
    })
  }, [servers, sortKey, sortAsc])

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc)
    } else {
      setSortKey(key)
      setSortAsc(false)
    }
  }

  function SortIcon({ column }: { column: SortKey }) {
    if (sortKey !== column) return <ChevronDown className="w-3 h-3 inline ml-0.5 opacity-0 group-hover/th:opacity-30" />
    return sortAsc ? (
      <ChevronUp className="w-3 h-3 inline ml-0.5 text-blue-400" />
    ) : (
      <ChevronDown className="w-3 h-3 inline ml-0.5 text-blue-400" />
    )
  }

  const topServer = sortedServers[0] ?? null
  const maxRevenue = sortedServers.length > 0 ? sortedServers[0].totalRevenue : 0

  return (
    <div className="space-y-5 sm:space-y-6 pb-12">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white truncate">
                รายได้เซิร์ฟเวอร์
              </h1>
              <p className="text-[11px] text-zinc-500 hidden sm:block">
                สถิติรายได้และยอดขายของแต่ละเครื่อง
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="p-2.5 bg-zinc-900 border border-white/5 rounded-xl text-zinc-400 hover:text-white hover:border-white/10 transition-all active:scale-95 disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500/[0.08] to-transparent border border-emerald-500/10 rounded-2xl p-4 sm:p-5 group hover:border-emerald-500/20 transition-all">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">วันนี้</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            ฿{(summary?.todayRevenue ?? 0).toLocaleString()}
          </p>
          <p className="text-[10px] text-zinc-600 mt-1">ยอดขายรวมวันนี้</p>
          <div className="absolute -right-3 -bottom-3 w-16 h-16 bg-emerald-500/[0.03] rounded-full" />
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-blue-500/[0.08] to-transparent border border-blue-500/10 rounded-2xl p-4 sm:p-5 group hover:border-blue-500/20 transition-all">
          <div className="flex items-center gap-1.5 mb-2.5">
            <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">เดือนนี้</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            ฿{(summary?.monthRevenue ?? 0).toLocaleString()}
          </p>
          <p className="text-[10px] text-zinc-600 mt-1">สะสมเดือนนี้</p>
          <div className="absolute -right-3 -bottom-3 w-16 h-16 bg-blue-500/[0.03] rounded-full" />
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-purple-500/[0.08] to-transparent border border-purple-500/10 rounded-2xl p-4 sm:p-5 group hover:border-purple-500/20 transition-all">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Wallet className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">ทั้งหมด</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            ฿{(summary?.totalRevenue ?? 0).toLocaleString()}
          </p>
          <p className="text-[10px] text-zinc-600 mt-1">รายได้ตลอดกาล</p>
          <div className="absolute -right-3 -bottom-3 w-16 h-16 bg-purple-500/[0.03] rounded-full" />
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/[0.08] to-transparent border border-amber-500/10 rounded-2xl p-4 sm:p-5 group hover:border-amber-500/20 transition-all">
          <div className="flex items-center gap-1.5 mb-2.5">
            <ShoppingCart className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">คำสั่งซื้อ</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {(summary?.totalOrders ?? 0).toLocaleString()}
          </p>
          <p className="text-[10px] text-zinc-600 mt-1">
            {summary?.activeServers ?? 0}/{summary?.totalServers ?? 0} เซิร์ฟเวอร์ออนไลน์
          </p>
          <div className="absolute -right-3 -bottom-3 w-16 h-16 bg-amber-500/[0.03] rounded-full" />
        </div>
      </div>

      {/* ── Server List ── */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
        <div className="px-4 sm:px-5 py-3.5 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-400" />
            รายได้แยกตามเซิร์ฟเวอร์
          </h3>
          <span className="text-[10px] text-zinc-600 font-medium">
            {servers.length} เซิร์ฟเวอร์
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-7 h-7 animate-spin text-blue-500" />
            <p className="text-[11px] text-zinc-500">กำลังโหลดข้อมูล...</p>
          </div>
        ) : sortedServers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center">
              <ServerOff className="w-7 h-7 text-zinc-700" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-white">ไม่พบเซิร์ฟเวอร์</p>
              <p className="text-[11px] text-zinc-500 mt-1">ยังไม่มีเซิร์ฟเวอร์หรือคำสั่งซื้อ</p>
            </div>
          </div>
        ) : (
          <>
            {/* ── Desktop Table ── */}
            <div className="hidden lg:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="py-3 px-5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                      เซิร์ฟเวอร์
                    </th>
                    <th
                      className="group/th py-3 px-4 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider text-right cursor-pointer hover:text-zinc-300 transition-colors select-none"
                      onClick={() => handleSort('totalOrders')}
                    >
                      ออเดอร์ <SortIcon column="totalOrders" />
                    </th>
                    <th
                      className="group/th py-3 px-4 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider text-right cursor-pointer hover:text-zinc-300 transition-colors select-none"
                      onClick={() => handleSort('todayRevenue')}
                    >
                      วันนี้ <SortIcon column="todayRevenue" />
                    </th>
                    <th
                      className="group/th py-3 px-4 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider text-right cursor-pointer hover:text-zinc-300 transition-colors select-none"
                      onClick={() => handleSort('monthRevenue')}
                    >
                      เดือนนี้ <SortIcon column="monthRevenue" />
                    </th>
                    <th
                      className="group/th py-3 px-4 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider text-right cursor-pointer hover:text-zinc-300 transition-colors select-none"
                      onClick={() => handleSort('totalRevenue')}
                    >
                      รวมทั้งหมด <SortIcon column="totalRevenue" />
                    </th>
                    <th className="py-3 px-5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider w-[140px]">
                      สัดส่วน
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {sortedServers.map((s, i) => {
                    const pct = maxRevenue > 0 ? (s.totalRevenue / maxRevenue) * 100 : 0
                    return (
                      <tr key={s.id} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-9 h-9 bg-zinc-800/80 border border-white/5 rounded-xl flex items-center justify-center text-lg shrink-0">
                                {s.flag}
                              </div>
                              {i === 0 && sortKey === 'totalRevenue' && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                                  <Crown className="w-2.5 h-2.5 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-white truncate">{s.name}</p>
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                              </div>
                              <p className="text-[10px] text-zinc-600 truncate">{s.host}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm font-semibold text-white tabular-nums">
                            {s.totalOrders.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`text-sm font-semibold tabular-nums ${s.todayRevenue > 0 ? 'text-emerald-400' : 'text-zinc-600'}`}>
                            ฿{s.todayRevenue.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`text-sm font-semibold tabular-nums ${s.monthRevenue > 0 ? 'text-blue-400' : 'text-zinc-600'}`}>
                            ฿{s.monthRevenue.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm font-bold text-purple-400 tabular-nums">
                            ฿{s.totalRevenue.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-700"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-zinc-500 tabular-nums w-10 text-right">
                              {summary && summary.totalRevenue > 0 ? ((s.totalRevenue / summary.totalRevenue) * 100).toFixed(1) : '0'}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t border-white/10 bg-white/[0.015]">
                    <td className="py-3 px-5">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                        รวมทั้งหมด
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm font-bold text-white tabular-nums">
                        {(summary?.totalOrders ?? 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm font-bold text-emerald-400 tabular-nums">
                        ฿{(summary?.todayRevenue ?? 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm font-bold text-blue-400 tabular-nums">
                        ฿{(summary?.monthRevenue ?? 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-base font-bold text-purple-400 tabular-nums">
                        ฿{(summary?.totalRevenue ?? 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-5" />
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* ── Mobile Cards ── */}
            <div className="lg:hidden">
              {/* Sort tabs */}
              <div className="px-4 pt-3 pb-1 flex gap-1.5 overflow-x-auto no-scrollbar">
                {([
                  { key: 'totalRevenue' as SortKey, label: 'รวม' },
                  { key: 'todayRevenue' as SortKey, label: 'วันนี้' },
                  { key: 'monthRevenue' as SortKey, label: 'เดือนนี้' },
                  { key: 'totalOrders' as SortKey, label: 'ออเดอร์' },
                ]).map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handleSort(item.key)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all active:scale-95 ${
                      sortKey === item.key
                        ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                        : 'bg-zinc-800/50 text-zinc-500 border border-transparent'
                    }`}
                  >
                    {item.label}
                    {sortKey === item.key && (sortAsc ? ' ↑' : ' ↓')}
                  </button>
                ))}
              </div>

              <div className="p-3 space-y-2">
                {sortedServers.map((s, i) => {
                  const pct = summary && summary.totalRevenue > 0 ? (s.totalRevenue / summary.totalRevenue) * 100 : 0
                  return (
                    <div
                      key={s.id}
                      className="bg-zinc-800/30 border border-white/[0.04] rounded-xl p-3.5 space-y-3 hover:border-white/[0.08] transition-all"
                    >
                      {/* Server info row */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="relative shrink-0">
                            <div className="w-9 h-9 bg-zinc-800 border border-white/5 rounded-xl flex items-center justify-center text-lg">
                              {s.flag}
                            </div>
                            {i === 0 && sortKey === 'totalRevenue' && (
                              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 rounded-full flex items-center justify-center">
                                <Crown className="w-2 h-2 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-medium text-white truncate">{s.name}</p>
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            </div>
                            <p className="text-[10px] text-zinc-600">{s.totalOrders} ออเดอร์</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-base font-bold text-purple-400 tabular-nums">
                            ฿{s.totalRevenue.toLocaleString()}
                          </p>
                          <p className="text-[10px] text-zinc-600 tabular-nums">{pct.toFixed(1)}%</p>
                        </div>
                      </div>

                      {/* Revenue bar */}
                      <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                          style={{ width: `${maxRevenue > 0 ? (s.totalRevenue / maxRevenue) * 100 : 0}%` }}
                        />
                      </div>

                      {/* Detail grid */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-zinc-900/60 rounded-lg px-3 py-2">
                          <p className="text-[9px] text-zinc-600 uppercase tracking-wider mb-0.5">วันนี้</p>
                          <p className={`text-sm font-bold tabular-nums ${s.todayRevenue > 0 ? 'text-emerald-400' : 'text-zinc-600'}`}>
                            ฿{s.todayRevenue.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-zinc-900/60 rounded-lg px-3 py-2">
                          <p className="text-[9px] text-zinc-600 uppercase tracking-wider mb-0.5">เดือนนี้</p>
                          <p className={`text-sm font-bold tabular-nums ${s.monthRevenue > 0 ? 'text-blue-400' : 'text-zinc-600'}`}>
                            ฿{s.monthRevenue.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {/* Mobile Total */}
                <div className="bg-gradient-to-r from-purple-500/[0.08] to-blue-500/[0.08] border border-purple-500/10 rounded-xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-zinc-400">รวมทั้งหมด</span>
                  </div>
                  <span className="text-lg font-bold text-purple-400 tabular-nums">
                    ฿{(summary?.totalRevenue ?? 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Stats Grid (below table on mobile, sidebar on xl) ── */}
      {!loading && sortedServers.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-3.5 space-y-1">
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">เซิร์ฟทั้งหมด</span>
            </div>
            <p className="text-xl font-bold text-white">{summary?.totalServers ?? 0}</p>
          </div>
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-3.5 space-y-1">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">ออนไลน์</span>
            </div>
            <p className="text-xl font-bold text-emerald-400">{summary?.activeServers ?? 0}</p>
          </div>
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-3.5 space-y-1">
            <div className="flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">เฉลี่ย/เซิร์ฟ</span>
            </div>
            <p className="text-xl font-bold text-white">
              ฿{summary && summary.totalServers > 0 ? Math.round(summary.totalRevenue / summary.totalServers).toLocaleString() : 0}
            </p>
          </div>
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-3.5 space-y-1">
            <div className="flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">เซิร์ฟอันดับ 1</span>
            </div>
            <p className="text-sm font-bold text-amber-400 truncate">
              {topServer ? `${topServer.flag} ${topServer.name}` : '-'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
