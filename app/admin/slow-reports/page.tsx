'use client'

import { useState, useEffect } from 'react'
import { 
  AlertTriangle, RefreshCw, Loader2,
  TrendingDown, Activity, WifiOff, Zap, Wifi,
  Users, BarChart3, AlertCircle, CheckCircle2,
  Clock, ChevronDown, ChevronUp, User
} from 'lucide-react'

const REASONS: Record<string, { label: string; icon: typeof TrendingDown; color: string; bg: string; border: string }> = {
  slow: { label: 'เน็ตช้า', icon: TrendingDown, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  unstable: { label: 'ไม่เสถียร', icon: Activity, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  disconnect: { label: 'หลุดบ่อย', icon: WifiOff, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  high_load: { label: 'โหลดสูง', icon: Zap, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
}

interface ServerReport {
  id: string
  name: string
  flag: string
  status: string
  category: string
  totalReports: number
  uniqueVoters: number
  onlineVoters: number
  reasons: Record<string, number>
}

interface RecentReport {
  id: string
  serverId: string
  reason: string
  createdAt: string
  userName: string
  userEmail: string
  isOnline: boolean
}

interface Stats {
  totalReports: number
  totalVoters: number
  onlineVoters: number
  serversWithIssues: number
  criticalServers: number
  totalServers: number
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

export default function AdminSlowReportsPage() {
  const [top5Servers, setTop5Servers] = useState<ServerReport[]>([])
  const [normalServers, setNormalServers] = useState<ServerReport[]>([])
  const [recentReports, setRecentReports] = useState<RecentReport[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [clearing, setClearing] = useState<string | null>(null)
  const [expandedServer, setExpandedServer] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/slow-reports')
      const data = await res.json()
      if (data.success) {
        setTop5Servers(data.top5Servers)
        setNormalServers(data.normalServers)
        setRecentReports(data.recentReports)
        setStats(data.stats)
      }
    } catch (err) {
      console.error('Error fetching slow reports:', err)
    }
    setLoading(false)
  }

  async function handleClear(serverId: string, serverName: string) {
    if (!confirm(`ยืนยันเคลียร์โหวตทั้งหมดของ "${serverName}"?\nดำเนินการนี้เมื่อแก้ไขปัญหาเซิร์ฟเวอร์แล้ว`)) return

    setClearing(serverId)
    try {
      const res = await fetch('/api/admin/slow-reports', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serverId }),
      })
      const data = await res.json()
      if (data.success) {
        await fetchData()
      }
    } catch (err) {
      console.error('Error clearing reports:', err)
    }
    setClearing(null)
  }

  const getReportLevel = (total: number) => {
    if (total >= 10) return { text: 'วิกฤต', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', dotColor: 'bg-red-400' }
    if (total >= 5) return { text: 'ปัญหาเยอะ', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', dotColor: 'bg-orange-400' }
    if (total >= 1) return { text: 'มีปัญหา', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', dotColor: 'bg-amber-400' }
    return { text: 'ปกติ', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dotColor: 'bg-emerald-400' }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-rose-500/10 rounded-full" />
          <div className="absolute inset-0 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-xs font-bold text-zinc-600 tracking-widest uppercase animate-pulse">กำลังโหลดข้อมูล...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            รายงานเน็ตช้า
          </h2>
          <p className="text-xs text-zinc-500 mt-1">Top 5 เซิร์ฟเวอร์ที่มีปัญหามากสุด (7 วันล่าสุด)</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-white/5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:border-white/10 transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">รีเฟรช</span>
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-rose-400" />
              </div>
            </div>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">โหวตทั้งหมด</p>
            <p className="text-2xl font-black text-white">{stats.totalReports}</p>
          </div>

          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              {stats.onlineVoters > 0 && (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              )}
            </div>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">ผู้โหวตออนไลน์</p>
            <p className="text-2xl font-black text-emerald-400">{stats.onlineVoters}<span className="text-sm text-zinc-500">/{stats.totalVoters}</span></p>
          </div>

          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-amber-400" />
              </div>
            </div>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">เซิร์ฟมีปัญหา</p>
            <p className="text-2xl font-black text-white">{stats.serversWithIssues}<span className="text-sm text-zinc-500">/{stats.totalServers}</span></p>
          </div>

          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
            </div>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">วิกฤต</p>
            <p className="text-2xl font-black text-red-400">{stats.criticalServers}</p>
          </div>
        </div>
      )}

      {/* Top 5 Problematic Servers */}
      {top5Servers.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            Top 5 เซิร์ฟเวอร์ที่มีรายงานเยอะสุด
          </h3>
          <div className="space-y-3">
            {top5Servers.map((server, index) => {
              const level = getReportLevel(server.totalReports)
              const isExpanded = expandedServer === server.id
              const serverRecent = recentReports.filter(r => r.serverId === server.id)

              return (
                <div key={server.id} className={`rounded-2xl bg-zinc-900/50 border overflow-hidden transition-all ${level.border}`}>
                  {/* Server Header */}
                  <div className="px-4 sm:px-5 py-4 flex items-center gap-3">
                    {/* Rank */}
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                      index === 0 ? 'bg-red-500/20 text-red-400' : index === 1 ? 'bg-orange-500/20 text-orange-400' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      #{index + 1}
                    </div>
                    <div className="text-2xl leading-none shrink-0">{server.flag}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-white truncate">{server.name}</h4>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold ${level.bg} ${level.border} border ${level.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${level.dotColor} ${server.totalReports >= 10 ? 'animate-pulse' : ''}`} />
                          {level.text}
                        </span>
                        <span className="text-[10px] flex items-center gap-1">
                          {server.onlineVoters > 0 ? (
                            <>
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                              </span>
                              <span className="text-emerald-400 font-bold">{server.onlineVoters} ออนไลน์</span>
                              <span className="text-zinc-600">/ {server.uniqueVoters} คนโหวต</span>
                            </>
                          ) : (
                            <span className="text-zinc-600">
                              <Users className="w-3 h-3 inline mr-1" />
                              {server.uniqueVoters} คนโหวต (0 ออนไลน์)
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Total votes */}
                    <div className="shrink-0 text-right mr-2">
                      <div className={`text-2xl font-extrabold tabular-nums leading-none ${level.color}`}>{server.totalReports}</div>
                      <div className="text-[8px] text-zinc-600 mt-0.5">โหวต</div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleClear(server.id, server.name)}
                        disabled={clearing === server.id}
                        className="p-2 rounded-xl bg-zinc-800 border border-white/5 text-zinc-500 hover:text-emerald-400 hover:border-emerald-500/20 hover:bg-emerald-500/10 transition-all disabled:opacity-50"
                        title="เคลียร์โหวต (แก้ไขแล้ว)"
                      >
                        {clearing === server.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => setExpandedServer(isExpanded ? null : server.id)}
                        className="p-2 rounded-xl bg-zinc-800 border border-white/5 text-zinc-500 hover:text-white hover:border-white/10 transition-all"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Reason breakdown */}
                  <div className="px-4 sm:px-5 pb-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {Object.entries(REASONS).map(([key, reason]) => {
                        const count = server.reasons[key] || 0
                        const Icon = reason.icon
                        const percentage = server.totalReports > 0 ? Math.round((count / server.totalReports) * 100) : 0

                        return (
                          <div
                            key={key}
                            className={`flex items-center gap-2 py-2 px-3 rounded-xl border transition-all ${
                              count > 0 ? `${reason.bg} ${reason.border}` : 'bg-zinc-900/30 border-white/[0.03]'
                            }`}
                          >
                            <Icon className={`w-3.5 h-3.5 shrink-0 ${count > 0 ? reason.color : 'text-zinc-700'}`} />
                            <div className="flex-1 min-w-0">
                              <span className={`text-[10px] font-bold block ${count > 0 ? reason.color : 'text-zinc-600'}`}>
                                {reason.label}
                              </span>
                            </div>
                            <span className={`text-xs font-black tabular-nums ${count > 0 ? 'text-white' : 'text-zinc-700'}`}>
                              {count}
                            </span>
                            {count > 0 && (
                              <span className="text-[9px] text-zinc-500">{percentage}%</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Expanded: Recent voters */}
                  {isExpanded && serverRecent.length > 0 && (
                    <div className="px-4 sm:px-5 pb-4 border-t border-white/[0.03]">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-3 mb-2">โหวตล่าสุด</p>
                      <div className="space-y-1">
                        {serverRecent.slice(0, 10).map((report) => {
                          const reason = REASONS[report.reason]
                          const ReasonIcon = reason?.icon || AlertTriangle
                          return (
                            <div key={report.id} className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-white/[0.02] transition-colors">
                              <div className="relative w-7 h-7 bg-white/5 border border-white/5 rounded-lg flex items-center justify-center shrink-0">
                                <User className="w-3.5 h-3.5 text-zinc-500" />
                                {report.isOnline && (
                                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-zinc-900" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                                  {report.userName}
                                  {report.isOnline && (
                                    <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded">ONLINE</span>
                                  )}
                                </p>
                                <p className="text-[10px] text-zinc-600 truncate">{report.userEmail}</p>
                              </div>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold ${reason?.bg || ''} ${reason?.border || ''} border ${reason?.color || 'text-zinc-500'}`}>
                                <ReasonIcon className="w-3 h-3" />
                                {reason?.label || report.reason}
                              </span>
                              <span className="text-[10px] text-zinc-600 shrink-0 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatRelativeTime(report.createdAt)}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Normal Servers */}
      {normalServers.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            เซิร์ฟเวอร์ปกติ ({normalServers.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {normalServers.map((server) => (
              <div
                key={server.id}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900/30 border border-white/[0.03] hover:border-white/[0.06] transition-all"
              >
                <span className="text-lg leading-none">{server.flag}</span>
                <span className="text-xs font-bold text-white truncate flex-1">{server.name}</span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Wifi className="w-3 h-3" />
                  ปกติ
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {top5Servers.length === 0 && normalServers.length === 0 && (
        <div className="text-center py-20">
          <Wifi className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-sm text-zinc-500">ไม่พบเซิร์ฟเวอร์</p>
        </div>
      )}

      {top5Servers.length === 0 && normalServers.length > 0 && (
        <div className="rounded-2xl bg-emerald-500/[0.05] border border-emerald-500/10 p-6 text-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <p className="text-sm font-bold text-emerald-400">ไม่มีรายงานปัญหา</p>
          <p className="text-[11px] text-zinc-500 mt-1">เซิร์ฟเวอร์ทั้งหมดทำงานปกติ</p>
        </div>
      )}

      {/* Footer note */}
      <p className="text-center text-[10px] text-zinc-700">
        ข้อมูลรีเซ็ตอัตโนมัติทุก 7 วัน &bull; กดปุ่ม <CheckCircle2 className="w-3 h-3 inline text-emerald-400" /> เพื่อเคลียร์โหวตเมื่อแก้ไขปัญหาแล้ว
      </p>
    </div>
  )
}
