'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Activity, Server, Users, Wifi, TrendingUp, ArrowUpRight, ArrowDownRight,
  Loader2, AlertTriangle, CheckCircle2, Clock, Cpu, HardDrive, MemoryStick
} from 'lucide-react'

interface ServerHealth {
  id: string
  name: string
  flag: string
  location: string
  isActive: boolean
  activeUsers: number
  cpuPercent: number | null
  memoryPercent: number | null
  diskPercent: number | null
  latencyMs: number | null
  isOnline: boolean
}

interface LocalStats {
  cpuPercent: number
  memoryPercent: number
  diskPercent: number
  uptime: number
  platform: string
  hostname: string
}

export default function AdminHealthPage() {
  const [data, setData] = useState<{
    servers: ServerHealth[]
    stats: any
    localStats: LocalStats
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchHealth = () => {
    setLoading(true)
    fetch('/api/admin/health')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setData(d)
        else setError(d.error)
      })
      .catch(() => setError('โหลดไม่ได้'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchHealth()
    const interval = setInterval(fetchHealth, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-24 text-red-400">
        <AlertTriangle className="w-8 h-8 mr-2" />
        {error}
      </div>
    )
  }

  const stats = data?.stats
  const local = data?.localStats

  const fmtUptime = (s: number) => {
    const h = Math.floor(s / 3600)
    const d = Math.floor(h / 24)
    const hr = h % 24
    return d > 0 ? `${d}d ${hr}h` : `${h}h`
  }

  return (
    <div className="px-3 sm:px-0 max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center">
            <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">System Health</h1>
            <p className="text-xs sm:text-sm text-zinc-500">
              {local?.hostname} • {local?.platform} • uptime {fmtUptime(local?.uptime || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'เซิร์ฟเวอร์ทั้งหมด', value: stats?.totalServers ?? 0, icon: Server, color: 'text-blue-400' },
          { label: 'ออนไลน์', value: stats?.onlineServers ?? 0, icon: CheckCircle2, color: 'text-emerald-400' },
          { label: 'ผู้ใช้งาน VPN', value: stats?.totalActiveUsers ?? 0, icon: Users, color: 'text-cyan-400' },
          { label: 'รายได้วันนี้', value: `${(stats?.todayRevenue ?? 0).toLocaleString('th-TH')} ฿`, icon: TrendingUp, color: 'text-amber-400' },
        ].map((s) => (
          <div key={s.label} className="bg-zinc-900/50 border border-white/[0.04] rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
              <span className="text-[11px] text-zinc-500 uppercase tracking-wider">{s.label}</span>
            </div>
            <span className="text-lg sm:text-xl font-bold text-white">{s.value}</span>
          </div>
        ))}
      </div>

      {/* Local Server Resources */}
      {local && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-950/40 border border-white/[0.04] rounded-2xl p-6 mb-6"
        >
          <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-zinc-400" />
            Web Server Resources ({local.hostname})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'CPU Load', val: local.cpuPercent, color: local.cpuPercent > 80 ? 'bg-red-500' : local.cpuPercent > 50 ? 'bg-amber-500' : 'bg-emerald-500', icon: Cpu },
              { label: 'RAM Usage', val: local.memoryPercent, color: local.memoryPercent > 80 ? 'bg-red-500' : local.memoryPercent > 50 ? 'bg-amber-500' : 'bg-blue-500', icon: MemoryStick },
              { label: 'Disk Usage', val: local.diskPercent, color: local.diskPercent > 80 ? 'bg-red-500' : local.diskPercent > 50 ? 'bg-amber-500' : 'bg-purple-500', icon: HardDrive },
            ].map((r) => (
              <div key={r.label} className="bg-black/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <r.icon className="w-4 h-4 text-zinc-400" />
                    <span className="text-xs text-zinc-400">{r.label}</span>
                  </div>
                  <span className="text-sm font-bold text-white">{r.val}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${r.val}%` }}
                    transition={{ duration: 1 }}
                    className={`h-full rounded-full ${r.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* VPN Servers Grid */}
      <h2 className="text-sm font-bold text-white mb-4">VPN Servers</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data?.servers.map((server, i) => (
          <motion.div
            key={server.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`bg-zinc-950/40 border rounded-2xl p-5 ${
              !server.isOnline ? 'border-red-500/20' : 'border-white/[0.04]'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{server.flag}</span>
                <div>
                  <p className="font-bold text-white">{server.name}</p>
                  <p className="text-[11px] text-zinc-500">{server.location}</p>
                </div>
              </div>
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold ${
                  server.isOnline
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                }`}
              >
                {server.isOnline ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                {server.isOnline ? 'ออนไลน์' : 'ออฟไลน์'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-black/30 rounded-xl p-3">
                <p className="text-[10px] text-zinc-500 mb-1">ผู้ใช้งาน</p>
                <p className="text-lg font-bold text-white">{server.activeUsers}</p>
              </div>
              <div className="bg-black/30 rounded-xl p-3">
                <p className="text-[10px] text-zinc-500 mb-1">Latency</p>
                <p className="text-lg font-bold text-white">
                  {server.latencyMs ? `${server.latencyMs}ms` : '-'}
                </p>
              </div>
            </div>

            {/* Resource bars */}
            {[
              { label: 'CPU', val: server.cpuPercent, color: 'bg-blue-500' },
              { label: 'RAM', val: server.memoryPercent, color: 'bg-purple-500' },
              { label: 'Disk', val: server.diskPercent, color: 'bg-amber-500' },
            ].map((r) => (
              <div key={r.label} className="mb-2">
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-zinc-500">{r.label}</span>
                  <span className="text-zinc-400">{r.val !== null ? `${r.val}%` : '-'}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${r.color} transition-all duration-500`}
                    style={{ width: `${r.val ?? 0}%` }}
                  />
                </div>
              </div>
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
