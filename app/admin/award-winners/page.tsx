'use client'

import { useState, useEffect } from 'react'
import {
  Trophy, Loader2, Search, Crown, Wallet, ShoppingCart,
  Calendar, ChevronDown, Medal, Star, User
} from 'lucide-react'

interface Winner {
  user: {
    id: string
    name: string
    email: string
    avatar: string | null
  }
  totalTopup: number
  totalVpnSpend: number
  vpnOrders: { serverName: string; serverFlag: string; price: number; createdAt: string }[]
  topupCount: number
  lastActive: string
}

interface EventServer {
  id: string
  name: string
  flag: string
}

const PERIODS = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'today', label: 'วันนี้' },
  { value: 'week', label: '7 วันล่าสุด' },
  { value: 'month', label: 'เดือนนี้' },
]

export default function AdminAwardWinnersPage() {
  const [winners, setWinners] = useState<Winner[]>([])
  const [eventServers, setEventServers] = useState<EventServer[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('all')
  const [search, setSearch] = useState('')
  const [minTopup, setMinTopup] = useState('')

  useEffect(() => {
    fetchWinners()
  }, [period, minTopup])

  async function fetchWinners() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('period', period)
      if (minTopup) params.set('minTopup', minTopup)
      const res = await fetch(`/api/admin/award-winners?${params}`)
      const data = await res.json()
      if (data.success) {
        setWinners(data.winners)
        setEventServers(data.eventServers)
      }
    } catch (error) {
      console.error('Failed to fetch winners:', error)
    } finally {
      setLoading(false)
    }
  }

  const filtered = winners.filter(w => {
    if (!search) return true
    const q = search.toLowerCase()
    return w.user.name.toLowerCase().includes(q) || w.user.email.toLowerCase().includes(q)
  })

  const totalTopup = winners.reduce((sum, w) => sum + w.totalTopup, 0)
  const totalVpn = winners.reduce((sum, w) => sum + w.totalVpnSpend, 0)

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/20 rounded-xl flex items-center justify-center">
              <Trophy className="w-4.5 h-4.5 text-amber-400" />
            </div>
            ผู้ได้รับรางวัล
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1 ml-[46px]">
            รายชื่อผู้ใช้ที่เติมเงินหรือซื้อจากเซิร์ฟเวอร์กิจกรรม
          </p>
        </div>
      </div>

      {/* Event Servers */}
      {eventServers.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-[11px] font-bold text-zinc-500">เซิร์ฟเวอร์กิจกรรม:</span>
          {eventServers.map(s => (
            <span key={s.id} className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[10px] font-bold text-amber-400">
              <span>{s.flag}</span>
              {s.name}
            </span>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="px-4 py-3 rounded-xl bg-zinc-900/50 border border-white/5">
          <p className="text-[10px] text-zinc-500 uppercase font-bold">ผู้เข้าร่วม</p>
          <p className="text-xl font-black text-white mt-0.5">{winners.length}</p>
        </div>
        <div className="px-4 py-3 rounded-xl bg-zinc-900/50 border border-white/5">
          <p className="text-[10px] text-emerald-500 uppercase font-bold">เติมเงินรวม</p>
          <p className="text-xl font-black text-emerald-400 mt-0.5">{totalTopup.toLocaleString()} ฿</p>
        </div>
        <div className="px-4 py-3 rounded-xl bg-zinc-900/50 border border-white/5">
          <p className="text-[10px] text-violet-500 uppercase font-bold">ซื้อ VPN รวม</p>
          <p className="text-xl font-black text-violet-400 mt-0.5">{totalVpn.toLocaleString()} ฿</p>
        </div>
        <div className="px-4 py-3 rounded-xl bg-zinc-900/50 border border-white/5">
          <p className="text-[10px] text-amber-500 uppercase font-bold">ยอดรวม</p>
          <p className="text-xl font-black text-amber-400 mt-0.5">{(totalTopup + totalVpn).toLocaleString()} ฿</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อหรืออีเมล..."
            className="w-full pl-9 pr-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-600 outline-none focus:border-amber-500/30 transition-colors"
          />
        </div>
        <select
          value={period}
          onChange={e => setPeriod(e.target.value)}
          className="px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-sm text-zinc-400 outline-none focus:border-amber-500/30 transition-colors"
        >
          {PERIODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
        <input
          type="number"
          value={minTopup}
          onChange={e => setMinTopup(e.target.value)}
          placeholder="เติมเงินขั้นต่ำ"
          className="w-32 px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-600 outline-none focus:border-amber-500/30 transition-colors"
        />
      </div>

      {/* Winners List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          <p className="text-xs text-zinc-600 font-medium">กำลังโหลด...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Trophy className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 text-sm">ไม่พบข้อมูลผู้ได้รับรางวัล</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((winner, idx) => (
            <div
              key={winner.user.id}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.01] overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-start gap-4">
                  {/* Rank */}
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                      idx === 0 ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' :
                      idx === 1 ? 'bg-zinc-400/10 border border-zinc-400/20 text-zinc-300' :
                      idx === 2 ? 'bg-orange-500/10 border border-orange-500/20 text-orange-400' :
                      'bg-zinc-900 border border-white/5 text-zinc-500'
                    }`}>
                      {idx < 3 ? <Crown className="w-4 h-4" /> : idx + 1}
                    </div>
                  </div>

                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0 overflow-hidden">
                    {winner.user.avatar ? (
                      <img src={winner.user.avatar} alt={winner.user.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-zinc-600" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-white">{winner.user.name}</h3>
                        <p className="text-[11px] text-zinc-500">{winner.user.email}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-black text-amber-400">
                          {(winner.totalTopup + winner.totalVpnSpend).toLocaleString()} ฿
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      {winner.totalTopup > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2 py-1">
                          <Wallet className="w-3 h-3" />
                          เติม {winner.totalTopup.toLocaleString()} ฿ ({winner.topupCount} ครั้ง)
                        </span>
                      )}
                      {winner.totalVpnSpend > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded-lg px-2 py-1">
                          <ShoppingCart className="w-3 h-3" />
                          ซื้อ VPN {winner.totalVpnSpend.toLocaleString()} ฿
                        </span>
                      )}
                      <span className="text-[10px] text-zinc-600 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(winner.lastActive).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
                      </span>
                    </div>

                    {/* VPN Orders detail */}
                    {winner.vpnOrders.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-white/5">
                        <p className="text-[10px] font-bold text-zinc-500 mb-1.5">รายการซื้อ VPN จากเซิร์ฟเวอร์กิจกรรม</p>
                        <div className="flex flex-wrap gap-1.5">
                          {winner.vpnOrders.slice(0, 5).map((order, i) => (
                            <span key={i} className="inline-flex items-center gap-1 text-[9px] text-zinc-400 bg-zinc-900 border border-white/5 rounded-lg px-2 py-1">
                              <span>{order.serverFlag}</span>
                              {order.serverName}
                              <span className="text-violet-400 font-bold">{order.price.toLocaleString()} ฿</span>
                            </span>
                          ))}
                          {winner.vpnOrders.length > 5 && (
                            <span className="text-[9px] text-zinc-600">+{winner.vpnOrders.length - 5} อื่นๆ</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
