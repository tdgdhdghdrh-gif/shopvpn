'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { 
  AlertTriangle, Wifi, WifiOff, Zap, Activity,
  ThumbsUp, ArrowLeft, RefreshCw, TrendingDown,
  Signal, Loader2, ChevronRight
} from 'lucide-react'

const REASONS = [
  { key: 'slow', label: 'เน็ตช้า', icon: TrendingDown, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', activeBg: 'bg-amber-500', activeText: 'text-black' },
  { key: 'unstable', label: 'ไม่เสถียร', icon: Activity, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', activeBg: 'bg-orange-500', activeText: 'text-black' },
  { key: 'disconnect', label: 'หลุดบ่อย', icon: WifiOff, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', activeBg: 'bg-rose-500', activeText: 'text-white' },
  { key: 'high_load', label: 'โหลดสูง', icon: Zap, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', activeBg: 'bg-red-500', activeText: 'text-white' },
]

interface ServerReport {
  id: string
  name: string
  flag: string
  status: string
  category: string
  totalReports: number
  reasons: Record<string, number>
  myVotes: string[]
}

export default function ReportSlowPage() {
  const [servers, setServers] = useState<ServerReport[]>([])
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetchUser()
    fetchReports()
  }, [])

  async function fetchUser() {
    try {
      const res = await fetch('/api/user/me')
      const data = await res.json()
      if (data.user) setUser(data.user)
    } catch {}
  }

  async function fetchReports() {
    setLoading(true)
    try {
      const res = await fetch('/api/reports/slow')
      const data = await res.json()
      if (data.success) {
        setServers(data.servers)
      }
    } catch {}
    setLoading(false)
  }

  async function handleVote(serverId: string, reason: string) {
    const key = `${serverId}-${reason}`
    setVoting(key)
    try {
      const res = await fetch('/api/reports/slow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serverId, reason })
      })
      const data = await res.json()
      if (data.success) {
        // Update local state
        setServers(prev => prev.map(s => {
          if (s.id !== serverId) return s
          const newReasons = { ...s.reasons }
          const newMyVotes = [...s.myVotes]

          if (data.action === 'added') {
            newReasons[reason] = (newReasons[reason] || 0) + 1
            newMyVotes.push(reason)
            return { ...s, totalReports: s.totalReports + 1, reasons: newReasons, myVotes: newMyVotes }
          } else {
            newReasons[reason] = Math.max(0, (newReasons[reason] || 0) - 1)
            return { ...s, totalReports: Math.max(0, s.totalReports - 1), reasons: newReasons, myVotes: newMyVotes.filter(v => v !== reason) }
          }
        }))
      }
    } catch {}
    setVoting(null)
  }

  const getReportLevel = (total: number) => {
    if (total >= 10) return { text: 'วิกฤต', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' }
    if (total >= 5) return { text: 'ปัญหาเยอะ', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' }
    if (total >= 1) return { text: 'มีปัญหา', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' }
    return { text: 'ปกติ', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' }
  }

  return (
    <div className="min-h-screen bg-transparent text-white font-sans">
      <Navbar user={user ? { name: user.name, email: user.email, balance: user.balance } : null} />

      <main className="pt-4 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">

          {/* Header */}
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-white text-xs mb-4 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              กลับหน้าหลัก
            </Link>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                  </div>
                  แจ้งปัญหาเน็ตช้า
                </h1>
                <p className="text-xs sm:text-sm text-zinc-500 mt-1">โหวตเซิร์ฟเวอร์ที่มีปัญหา เพื่อให้แอดมินรับทราบและแก้ไข</p>
              </div>
              <button
                onClick={fetchReports}
                disabled={loading}
                className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 text-zinc-400 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Info banner */}
          <div className="mb-5 flex items-start gap-3 p-3.5 rounded-2xl bg-cyan-500/[0.05] border border-cyan-500/10">
            <Signal className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-[11px] sm:text-xs text-cyan-400/80">
              <p>กดปุ่มเพื่อโหวตปัญหาที่คุณพบ กดอีกครั้งเพื่อถอนโหวต</p>
              <p className="text-zinc-600 mt-0.5">ข้อมูลรีเซ็ตทุก 7 วัน</p>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
            </div>
          )}

          {/* Server list */}
          {!loading && servers.length === 0 && (
            <div className="text-center py-20">
              <Wifi className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-sm text-zinc-500">ไม่พบเซิร์ฟเวอร์</p>
            </div>
          )}

          {!loading && servers.length > 0 && (
            <div className="space-y-3">
              {servers.map((server) => {
                const level = getReportLevel(server.totalReports)
                return (
                  <div key={server.id} className="rounded-2xl bg-zinc-900/50 border border-white/[0.05] overflow-hidden">
                    {/* Server header */}
                    <div className="px-4 sm:px-5 py-3.5 flex items-center gap-3">
                      <div className="text-2xl leading-none shrink-0">{server.flag}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-white truncate">{server.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-semibold ${level.bg} ${level.border} border ${level.color}`}>
                            {level.text}
                          </span>
                          {server.totalReports > 0 && (
                            <span className="text-[10px] text-zinc-600">{server.totalReports} รายงาน</span>
                          )}
                        </div>
                      </div>
                      {/* Total reports badge */}
                      {server.totalReports > 0 && (
                        <div className="shrink-0 text-right">
                          <div className="text-2xl font-extrabold text-rose-400 tabular-nums leading-none">{server.totalReports}</div>
                          <div className="text-[8px] text-zinc-600 mt-0.5">โหวต</div>
                        </div>
                      )}
                    </div>

                    {/* Vote buttons */}
                    <div className="px-4 sm:px-5 pb-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {REASONS.map(reason => {
                        const isVoted = server.myVotes.includes(reason.key)
                        const count = server.reasons[reason.key] || 0
                        const isVoting = voting === `${server.id}-${reason.key}`
                        const Icon = reason.icon

                        return (
                          <button
                            key={reason.key}
                            onClick={() => handleVote(server.id, reason.key)}
                            disabled={isVoting}
                            className={`relative flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl border transition-all active:scale-95 disabled:opacity-60 ${
                              isVoted
                                ? `${reason.activeBg} ${reason.activeText} border-transparent shadow-lg`
                                : `${reason.bg} ${reason.border} ${reason.color} hover:brightness-125`
                            }`}
                          >
                            {isVoting ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Icon className="w-4 h-4" />
                            )}
                            <span className="text-[10px] sm:text-[11px] font-semibold">{reason.label}</span>
                            {count > 0 && (
                              <span className={`absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[9px] font-bold ${
                                isVoted ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-300 border border-white/10'
                              }`}>
                                {count}
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Footer text */}
          <p className="text-center text-[10px] sm:text-[11px] text-zinc-700 mt-6">
            แอดมินจะตรวจสอบเซิร์ฟเวอร์ที่มีรายงานเยอะเป็นลำดับแรก
          </p>
        </div>
      </main>
    </div>
  )
}
