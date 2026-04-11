'use client'

import { useEffect, useState, useMemo } from 'react'
import {
  Shield,
  Lock,
  Unlock,
  Server,
  TrendingUp,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  ShoppingCart,
  Eye,
  EyeOff,
  Percent,
  Edit3,
  Check,
  X,
  Loader2,
  Crown,
  ServerOff,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

interface ServerRevenueData {
  id: string
  name: string
  host: string
  flag: string
  isActive: boolean
  grossRevenue: number
  commissionPercent: number
  commissionAmount: number
  netRevenue: number
  actualRevenue: number
  actualOrders: number
  isLocked: boolean
  lockedRevenue: number
  lockedOrders: number
  lockedAt: string | null
  displayRevenue: number
  displayOrders: number
}

type SortKey = 'grossRevenue' | 'netRevenue' | 'commissionAmount' | 'actualOrders'

export default function SuperRevenuePage() {
  const [servers, setServers] = useState<ServerRevenueData[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [editingCommission, setEditingCommission] = useState<string | null>(null)
  const [commissionInput, setCommissionInput] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('grossRevenue')
  const [sortAsc, setSortAsc] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  async function fetchData() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/super-revenue')
      if (res.status === 403) {
        window.location.href = '/'
        return
      }
      const data = await res.json()
      if (data.servers) {
        setServers(data.servers)
      }
    } catch (error) {
      console.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  async function handleLockToggle(serverId: string, currentlyLocked: boolean) {
    try {
      setActionLoading(serverId)
      const res = await fetch('/api/admin/super-revenue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serverId,
          action: currentlyLocked ? 'unlock' : 'lock',
        }),
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: data.message })
        await fetchData()
      } else {
        setMessage({ type: 'error', text: data.error || 'เกิดข้อผิดพลาด' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' })
    } finally {
      setActionLoading(null)
    }
  }

  function startEditCommission(serverId: string, currentPercent: number) {
    setEditingCommission(serverId)
    setCommissionInput(String(currentPercent))
  }

  function cancelEditCommission() {
    setEditingCommission(null)
    setCommissionInput('')
  }

  async function saveCommission(serverId: string) {
    const value = parseFloat(commissionInput)
    if (isNaN(value) || value < 0 || value > 100) {
      setMessage({ type: 'error', text: 'ค่าหัก% ต้องอยู่ระหว่าง 0-100' })
      return
    }
    try {
      setActionLoading(serverId)
      const res = await fetch('/api/admin/super-revenue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serverId,
          action: 'set-commission',
          commissionPercent: value,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: data.message })
        setEditingCommission(null)
        setCommissionInput('')
        await fetchData()
      } else {
        setMessage({ type: 'error', text: data.error || 'เกิดข้อผิดพลาด' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' })
    } finally {
      setActionLoading(null)
    }
  }

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc)
    } else {
      setSortKey(key)
      setSortAsc(false)
    }
  }

  function SortIcon({ column }: { column: SortKey }) {
    if (sortKey !== column)
      return <ChevronDown className="w-3 h-3 inline ml-0.5 opacity-0 group-hover/th:opacity-30" />
    return sortAsc ? (
      <ChevronUp className="w-3 h-3 inline ml-0.5 text-amber-400" />
    ) : (
      <ChevronDown className="w-3 h-3 inline ml-0.5 text-amber-400" />
    )
  }

  const sortedServers = useMemo(() => {
    return [...servers].sort((a, b) => {
      const diff = a[sortKey] - b[sortKey]
      return sortAsc ? diff : -diff
    })
  }, [servers, sortKey, sortAsc])

  const lockedCount = servers.filter((s) => s.isLocked).length
  const totalGrossRevenue = servers.reduce((sum, s) => sum + s.grossRevenue, 0)
  const totalCommission = servers.reduce((sum, s) => sum + s.commissionAmount, 0)
  const totalNetRevenue = servers.reduce((sum, s) => sum + s.netRevenue, 0)
  const totalDisplayRevenue = servers.reduce((sum, s) => sum + s.displayRevenue, 0)
  const maxGross = sortedServers.length > 0 ? Math.max(...servers.map((s) => s.grossRevenue)) : 0

  return (
    <div className="space-y-5 sm:space-y-6 pb-12">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white truncate">
                จัดการรายได้เซิฟ
              </h1>
              <p className="text-[11px] text-zinc-500 hidden sm:block">
                Super Admin Only - ล็อก/ปลดล็อกรายได้แต่ละเซิร์ฟเวอร์
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

      {/* ── Toast ── */}
      {message && (
        <div
          className={`fixed top-4 right-4 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
          <span className="font-bold text-sm">{message.text}</span>
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/[0.08] to-transparent border border-amber-500/10 rounded-2xl p-4 sm:p-5 hover:border-amber-500/20 transition-all">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">เซิฟที่ล็อก</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-amber-400 tracking-tight tabular-nums">{lockedCount}</p>
          <p className="text-[10px] text-zinc-600 mt-1">จาก {servers.length} เซิร์ฟเวอร์</p>
          <div className="absolute -right-3 -bottom-3 w-16 h-16 bg-amber-500/[0.03] rounded-full" />
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500/[0.08] to-transparent border border-emerald-500/10 rounded-2xl p-4 sm:p-5 hover:border-emerald-500/20 transition-all">
          <div className="flex items-center gap-1.5 mb-2.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">รายได้รวม</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-emerald-400 tracking-tight tabular-nums">
            ฿{totalGrossRevenue.toLocaleString()}
          </p>
          <p className="text-[10px] text-zinc-600 mt-1">ก่อนหักค่าฝากขาย</p>
          <div className="absolute -right-3 -bottom-3 w-16 h-16 bg-emerald-500/[0.03] rounded-full" />
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-red-500/[0.08] to-transparent border border-red-500/10 rounded-2xl p-4 sm:p-5 hover:border-red-500/20 transition-all">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Percent className="w-3.5 h-3.5 text-red-400" />
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">ยอดหัก</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-red-400 tracking-tight tabular-nums">
            ฿{totalCommission.toLocaleString()}
          </p>
          <p className="text-[10px] text-zinc-600 mt-1">ค่าฝากขายรวม</p>
          <div className="absolute -right-3 -bottom-3 w-16 h-16 bg-red-500/[0.03] rounded-full" />
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-cyan-500/[0.08] to-transparent border border-cyan-500/10 rounded-2xl p-4 sm:p-5 hover:border-cyan-500/20 transition-all">
          <div className="flex items-center gap-1.5 mb-2.5">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">กำไรสุทธิ</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-cyan-400 tracking-tight tabular-nums">
            ฿{totalNetRevenue.toLocaleString()}
          </p>
          <p className="text-[10px] text-zinc-600 mt-1">หลังหักค่าฝากขาย</p>
          <div className="absolute -right-3 -bottom-3 w-16 h-16 bg-cyan-500/[0.03] rounded-full" />
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-purple-500/[0.08] to-transparent border border-purple-500/10 rounded-2xl p-4 sm:p-5 hover:border-purple-500/20 transition-all col-span-2 lg:col-span-1">
          <div className="flex items-center gap-1.5 mb-2.5">
            <EyeOff className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">ส่วนต่าง</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-purple-400 tracking-tight tabular-nums">
            ฿{(totalNetRevenue - totalDisplayRevenue).toLocaleString()}
          </p>
          <p className="text-[10px] text-zinc-600 mt-1">รายได้ที่ซ่อนอยู่</p>
          <div className="absolute -right-3 -bottom-3 w-16 h-16 bg-purple-500/[0.03] rounded-full" />
        </div>
      </div>

      {/* ── Server List ── */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
        <div className="px-4 sm:px-5 py-3.5 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-amber-400" />
            รายได้แต่ละเซิร์ฟเวอร์
          </h3>
          <div className="flex items-center gap-2 px-2.5 py-1 bg-amber-500/5 rounded-full border border-amber-500/10">
            <Lock className="w-3 h-3 text-amber-500" />
            <span className="text-[9px] sm:text-[10px] font-bold text-amber-500/70 uppercase tracking-widest">
              ล็อก = หยุดอัพเดท
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-7 h-7 animate-spin text-amber-500" />
            <p className="text-[11px] text-zinc-500">กำลังโหลดข้อมูล...</p>
          </div>
        ) : sortedServers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center">
              <ServerOff className="w-7 h-7 text-zinc-700" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-white">ไม่พบเซิร์ฟเวอร์</p>
              <p className="text-[11px] text-zinc-500 mt-1">ยังไม่มีเซิร์ฟเวอร์ในระบบ</p>
            </div>
          </div>
        ) : (
          <>
            {/* ── Desktop Table ── */}
            <div className="hidden xl:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="py-3 px-5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                      เซิร์ฟเวอร์
                    </th>
                    <th className="py-3 px-4 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider text-center">
                      สถานะ
                    </th>
                    <th
                      className="group/th py-3 px-4 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider text-right cursor-pointer hover:text-zinc-300 transition-colors select-none"
                      onClick={() => handleSort('grossRevenue')}
                    >
                      รายได้รวม <SortIcon column="grossRevenue" />
                    </th>
                    <th className="py-3 px-4 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider text-center">
                      หัก%
                    </th>
                    <th
                      className="group/th py-3 px-4 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider text-right cursor-pointer hover:text-zinc-300 transition-colors select-none"
                      onClick={() => handleSort('commissionAmount')}
                    >
                      ยอดหัก <SortIcon column="commissionAmount" />
                    </th>
                    <th
                      className="group/th py-3 px-4 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider text-right cursor-pointer hover:text-zinc-300 transition-colors select-none"
                      onClick={() => handleSort('netRevenue')}
                    >
                      กำไรสุทธิ <SortIcon column="netRevenue" />
                    </th>
                    <th className="py-3 px-4 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider text-right">
                      ที่แสดง
                    </th>
                    <th
                      className="group/th py-3 px-4 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider text-right cursor-pointer hover:text-zinc-300 transition-colors select-none"
                      onClick={() => handleSort('actualOrders')}
                    >
                      ออเดอร์ <SortIcon column="actualOrders" />
                    </th>
                    <th className="py-3 px-5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider text-center">
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {sortedServers.map((server, i) => (
                    <tr
                      key={server.id}
                      className={`group hover:bg-white/[0.02] transition-colors ${server.isLocked ? 'bg-amber-500/[0.015]' : ''}`}
                    >
                      {/* Server info */}
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div
                              className={`w-9 h-9 border rounded-xl flex items-center justify-center text-lg shrink-0 ${
                                server.isLocked
                                  ? 'bg-amber-500/10 border-amber-500/20'
                                  : 'bg-zinc-800/80 border-white/5'
                              }`}
                            >
                              {server.flag}
                            </div>
                            {i === 0 && sortKey === 'grossRevenue' && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                                <Crown className="w-2.5 h-2.5 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">{server.name}</p>
                            <p className="text-[10px] text-zinc-600 truncate">{server.host}</p>
                          </div>
                        </div>
                      </td>
                      {/* Lock status */}
                      <td className="py-3 px-4 text-center">
                        {server.isLocked ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/15 rounded-lg">
                            <Lock className="w-3 h-3 text-amber-500" />
                            <span className="text-[10px] font-bold text-amber-400">ล็อก</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/15 rounded-lg">
                            <Unlock className="w-3 h-3 text-emerald-500" />
                            <span className="text-[10px] font-bold text-emerald-400">ปกติ</span>
                          </div>
                        )}
                      </td>
                      {/* Gross revenue */}
                      <td className="py-3 px-4 text-right">
                        <span className="text-sm font-semibold text-emerald-400 tabular-nums">
                          ฿{server.grossRevenue.toLocaleString()}
                        </span>
                      </td>
                      {/* Commission % */}
                      <td className="py-3 px-4 text-center">
                        {editingCommission === server.id ? (
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="1"
                              value={commissionInput}
                              onChange={(e) => setCommissionInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveCommission(server.id)
                                if (e.key === 'Escape') cancelEditCommission()
                              }}
                              className="w-14 px-2 py-1 text-xs font-bold text-center bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-amber-500/50"
                              autoFocus
                            />
                            <button
                              onClick={() => saveCommission(server.id)}
                              disabled={actionLoading === server.id}
                              className="p-1 text-emerald-400 hover:text-emerald-300 transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={cancelEditCommission}
                              className="p-1 text-red-400 hover:text-red-300 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditCommission(server.id, server.commissionPercent)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all hover:bg-white/5 group/edit"
                          >
                            <span className={server.commissionPercent > 0 ? 'text-red-400' : 'text-zinc-600'}>
                              {server.commissionPercent}%
                            </span>
                            <Edit3 className="w-3 h-3 text-zinc-600 opacity-0 group-hover/edit:opacity-100 transition-opacity" />
                          </button>
                        )}
                      </td>
                      {/* Commission amount */}
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`text-sm font-semibold tabular-nums ${server.commissionAmount > 0 ? 'text-red-400' : 'text-zinc-600'}`}
                        >
                          {server.commissionAmount > 0 ? `-฿${server.commissionAmount.toLocaleString()}` : '฿0'}
                        </span>
                      </td>
                      {/* Net revenue */}
                      <td className="py-3 px-4 text-right">
                        <span className="text-sm font-bold text-cyan-400 tabular-nums">
                          ฿{server.netRevenue.toLocaleString()}
                        </span>
                      </td>
                      {/* Display revenue */}
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`text-sm font-semibold tabular-nums ${server.isLocked ? 'text-amber-400' : 'text-zinc-400'}`}
                        >
                          ฿{server.displayRevenue.toLocaleString()}
                        </span>
                        {server.isLocked && server.netRevenue !== server.lockedRevenue && (
                          <p className="text-[9px] text-red-400/70 mt-0.5 tabular-nums">
                            ต่าง ฿{(server.netRevenue - server.lockedRevenue).toLocaleString()}
                          </p>
                        )}
                      </td>
                      {/* Orders */}
                      <td className="py-3 px-4 text-right">
                        <span className="text-sm font-semibold text-white tabular-nums">
                          {server.actualOrders.toLocaleString()}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="py-3 px-5 text-center">
                        <button
                          onClick={() => handleLockToggle(server.id, server.isLocked)}
                          disabled={actionLoading === server.id}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                            server.isLocked
                              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                              : 'bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
                          }`}
                        >
                          {actionLoading === server.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : server.isLocked ? (
                            <>
                              <Unlock className="w-3.5 h-3.5" />
                              ปลดล็อก
                            </>
                          ) : (
                            <>
                              <Lock className="w-3.5 h-3.5" />
                              ล็อก
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-white/10 bg-white/[0.015]">
                    <td className="py-3 px-5">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">รวมทั้งหมด</span>
                    </td>
                    <td className="py-3 px-4" />
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm font-bold text-emerald-400 tabular-nums">
                        ฿{totalGrossRevenue.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4" />
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm font-bold text-red-400 tabular-nums">
                        -฿{totalCommission.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-base font-bold text-cyan-400 tabular-nums">
                        ฿{totalNetRevenue.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm font-bold text-zinc-400 tabular-nums">
                        ฿{totalDisplayRevenue.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm font-bold text-white tabular-nums">
                        {servers.reduce((sum, s) => sum + s.actualOrders, 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-5" />
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* ── Mobile Cards ── */}
            <div className="xl:hidden">
              {/* Sort tabs */}
              <div className="px-4 pt-3 pb-1 flex gap-1.5 overflow-x-auto no-scrollbar">
                {(
                  [
                    { key: 'grossRevenue' as SortKey, label: 'รายได้' },
                    { key: 'netRevenue' as SortKey, label: 'กำไร' },
                    { key: 'commissionAmount' as SortKey, label: 'ยอดหัก' },
                    { key: 'actualOrders' as SortKey, label: 'ออเดอร์' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handleSort(item.key)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all active:scale-95 ${
                      sortKey === item.key
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                        : 'bg-zinc-800/50 text-zinc-500 border border-transparent'
                    }`}
                  >
                    {item.label}
                    {sortKey === item.key && (sortAsc ? ' ↑' : ' ↓')}
                  </button>
                ))}
              </div>

              <div className="p-3 space-y-2">
                {sortedServers.map((server, i) => (
                  <div
                    key={server.id}
                    className={`border rounded-xl p-3.5 space-y-3 transition-all ${
                      server.isLocked
                        ? 'bg-amber-500/[0.03] border-amber-500/10 hover:border-amber-500/20'
                        : 'bg-zinc-800/30 border-white/[0.04] hover:border-white/[0.08]'
                    }`}
                  >
                    {/* Server info + lock button row */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative shrink-0">
                          <div
                            className={`w-9 h-9 border rounded-xl flex items-center justify-center text-lg ${
                              server.isLocked
                                ? 'bg-amber-500/10 border-amber-500/20'
                                : 'bg-zinc-800 border-white/5'
                            }`}
                          >
                            {server.flag}
                          </div>
                          {i === 0 && sortKey === 'grossRevenue' && (
                            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 rounded-full flex items-center justify-center">
                              <Crown className="w-2 h-2 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium text-white truncate">{server.name}</p>
                            {server.isLocked && <Lock className="w-3 h-3 text-amber-500 shrink-0" />}
                          </div>
                          <p className="text-[10px] text-zinc-600">{server.actualOrders} ออเดอร์</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Commission edit */}
                        {editingCommission === server.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="1"
                              value={commissionInput}
                              onChange={(e) => setCommissionInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveCommission(server.id)
                                if (e.key === 'Escape') cancelEditCommission()
                              }}
                              className="w-12 px-1.5 py-1 text-[11px] font-bold text-center bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-amber-500/50"
                              autoFocus
                            />
                            <button
                              onClick={() => saveCommission(server.id)}
                              disabled={actionLoading === server.id}
                              className="p-1 text-emerald-400"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={cancelEditCommission} className="p-1 text-red-400">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditCommission(server.id, server.commissionPercent)}
                            className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all active:scale-95 ${
                              server.commissionPercent > 0
                                ? 'bg-red-500/10 border border-red-500/15 text-red-400'
                                : 'bg-zinc-800/50 border border-white/5 text-zinc-500'
                            }`}
                          >
                            {server.commissionPercent}%
                          </button>
                        )}
                        {/* Lock/unlock button */}
                        <button
                          onClick={() => handleLockToggle(server.id, server.isLocked)}
                          disabled={actionLoading === server.id}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all active:scale-95 disabled:opacity-50 ${
                            server.isLocked
                              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                              : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                          }`}
                        >
                          {actionLoading === server.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : server.isLocked ? (
                            <>
                              <Unlock className="w-3.5 h-3.5" />
                              ปลด
                            </>
                          ) : (
                            <>
                              <Lock className="w-3.5 h-3.5" />
                              ล็อก
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Revenue bar */}
                    <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${maxGross > 0 ? (server.grossRevenue / maxGross) * 100 : 0}%` }}
                      />
                    </div>

                    {/* Detail grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-zinc-900/60 rounded-lg px-3 py-2">
                        <p className="text-[9px] text-zinc-600 uppercase tracking-wider mb-0.5">รายได้รวม</p>
                        <p className="text-sm font-bold text-emerald-400 tabular-nums">
                          ฿{server.grossRevenue.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-zinc-900/60 rounded-lg px-3 py-2">
                        <p className="text-[9px] text-zinc-600 uppercase tracking-wider mb-0.5">ยอดหัก</p>
                        <p
                          className={`text-sm font-bold tabular-nums ${server.commissionAmount > 0 ? 'text-red-400' : 'text-zinc-600'}`}
                        >
                          {server.commissionAmount > 0 ? `-฿${server.commissionAmount.toLocaleString()}` : '฿0'}
                        </p>
                      </div>
                      <div className="bg-zinc-900/60 rounded-lg px-3 py-2">
                        <p className="text-[9px] text-zinc-600 uppercase tracking-wider mb-0.5">กำไรสุทธิ</p>
                        <p className="text-sm font-bold text-cyan-400 tabular-nums">
                          ฿{server.netRevenue.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-zinc-900/60 rounded-lg px-3 py-2">
                        <p className="text-[9px] text-zinc-600 uppercase tracking-wider mb-0.5">ที่แสดง</p>
                        <p
                          className={`text-sm font-bold tabular-nums ${server.isLocked ? 'text-amber-400' : 'text-zinc-400'}`}
                        >
                          ฿{server.displayRevenue.toLocaleString()}
                        </p>
                        {server.isLocked && server.netRevenue !== server.lockedRevenue && (
                          <p className="text-[9px] text-red-400/70 tabular-nums">
                            ต่าง ฿{(server.netRevenue - server.lockedRevenue).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Locked date */}
                    {server.isLocked && server.lockedAt && (
                      <p className="text-[9px] text-amber-500/50 text-right">
                        ล็อกเมื่อ{' '}
                        {new Date(server.lockedAt).toLocaleDateString('th-TH', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                  </div>
                ))}

                {/* Mobile Total */}
                <div className="bg-gradient-to-r from-amber-500/[0.08] to-cyan-500/[0.08] border border-amber-500/10 rounded-xl p-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[9px] text-zinc-500 uppercase tracking-wider mb-0.5">รายได้รวม</p>
                      <p className="text-base font-bold text-emerald-400 tabular-nums">
                        ฿{totalGrossRevenue.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] text-zinc-500 uppercase tracking-wider mb-0.5">ยอดหัก</p>
                      <p className="text-base font-bold text-red-400 tabular-nums">
                        -฿{totalCommission.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] text-zinc-500 uppercase tracking-wider mb-0.5">กำไรสุทธิ</p>
                      <p className="text-lg font-bold text-cyan-400 tabular-nums">
                        ฿{totalNetRevenue.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] text-zinc-500 uppercase tracking-wider mb-0.5">ส่วนต่าง</p>
                      <p className="text-base font-bold text-purple-400 tabular-nums">
                        ฿{(totalNetRevenue - totalDisplayRevenue).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Info Section ── */}
      <div className="bg-zinc-900/50 border border-amber-500/10 rounded-2xl p-5 sm:p-6 space-y-4">
        <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> คำอธิบายการทำงาน
        </h3>
        <div className="space-y-3 text-xs text-zinc-400">
          <div className="flex items-start gap-3">
            <Lock className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
            <p>
              <span className="font-bold text-amber-400">ล็อกรายได้</span> - เมื่อล็อกเซิร์ฟเวอร์
              รายได้ในหน้า &quot;รายได้เซิร์ฟเวอร์&quot; จะหยุดอัพเดทและแสดงเฉพาะยอดที่ล็อกไว้ ณ ขณะนั้น
              แม้จะมีคนซื้อเพิ่มก็ตาม
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Unlock className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
            <p>
              <span className="font-bold text-emerald-400">ปลดล็อก</span> - กลับมาแสดงรายได้จริงตามปกติ
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Percent className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" />
            <p>
              <span className="font-bold text-red-400">หัก% (ค่าฝากขาย)</span> - ตั้งค่าเปอร์เซ็นต์ที่จะหักจากรายได้
              เช่น ตั้ง 90% หมายถึงหักค่าฝากขาย 90% กำไรสุทธิจะเหลือ 10%
              คลิกที่ตัวเลข% เพื่อแก้ไข
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Eye className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
            <p>
              <span className="font-bold text-blue-400">หน้านี้</span> - เฉพาะ Super Admin เท่านั้นที่เห็นหน้านี้
              และสามารถเห็นรายได้จริงทั้งหมด
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
