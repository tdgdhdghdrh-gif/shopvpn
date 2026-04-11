'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Wifi, WifiOff, Monitor, Clock, RefreshCw,
  Eye, EyeOff, Copy, CheckCircle2, XCircle, ChevronDown,
  ChevronUp, Globe, Shield, Download, Upload,
  Server, ArrowLeft, AlertTriangle, Sparkles,
  Activity, Signal, Gauge, Timer, Zap, Radio
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────
interface ConnectionInfo {
  orderId: string
  serverId: string
  serverName: string
  serverFlag: string
  remark: string
  clientUUID: string
  inboundId: number
  packageType: string
  vlessLink: string
  expiryTime: string
  isActive: boolean
  createdAt: string
  ips: string[]
  traffic: any
  isOnline: boolean
  clientEnabled: boolean
  error?: string
}

// ─── Helpers ─────────────────────────────────────────────────────
function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function getTimeRemaining(expiryTime: string): {
  days: number; hours: number; mins: number; secs: number
  text: string; expired: boolean; urgency: 'normal' | 'warning' | 'danger'
  percent: number
} {
  const diff = new Date(expiryTime).getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0, text: 'หมดอายุแล้ว', expired: true, urgency: 'danger', percent: 0 }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const secs = Math.floor((diff % (1000 * 60)) / 1000)

  let urgency: 'normal' | 'warning' | 'danger' = 'normal'
  if (days === 0 && hours < 6) urgency = 'danger'
  else if (days <= 1) urgency = 'warning'

  // percent based on max 30 days
  const maxMs = 30 * 24 * 60 * 60 * 1000
  const percent = Math.min(100, (diff / maxMs) * 100)

  if (days > 0) return { days, hours, mins, secs, text: `${days}d ${hours}h ${mins}m`, expired: false, urgency, percent }
  if (hours > 0) return { days, hours, mins, secs, text: `${hours}h ${mins}m ${secs}s`, expired: false, urgency, percent }
  return { days, hours, mins, secs, text: `${mins}m ${secs}s`, expired: false, urgency, percent }
}

const packageLabels: Record<string, { label: string; color: string; bg: string }> = {
  TRIAL: { label: 'ทดลอง', color: 'text-gray-400', bg: 'bg-gray-500/10 border-gray-500/20' },
  DAILY: { label: 'รายวัน', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  WEEKLY: { label: 'รายสัปดาห์', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  MONTHLY: { label: 'รายเดือน', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
}

// ─── Countdown digit component ───────────────────────────────────
function CountdownDigit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-11 h-12 sm:w-14 sm:h-14 bg-black/60 border border-white/[0.08] rounded-xl flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent" />
        <span className="relative text-lg sm:text-2xl font-black font-mono tabular-nums text-white">
          {value.toString().padStart(2, '0')}
        </span>
      </div>
      <span className="text-[8px] sm:text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-1.5">{label}</span>
    </div>
  )
}

function CountdownSeparator() {
  return (
    <div className="flex flex-col items-center gap-1.5 pb-4">
      <div className="w-1 h-1 rounded-full bg-zinc-600" />
      <div className="w-1 h-1 rounded-full bg-zinc-600" />
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────
export default function ConnectionsPage() {
  const router = useRouter()
  const [connections, setConnections] = useState<ConnectionInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState<string | null>(null)
  const [, forceUpdate] = useState(0)

  // Live countdown
  useEffect(() => {
    const timer = setInterval(() => forceUpdate(n => n + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => { fetchConnections() }, [])

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 4000)
      return () => clearTimeout(timer)
    }
  }, [message])

  async function fetchConnections() {
    try {
      setLoading(true)
      const res = await fetch('/api/user/connections')
      if (res.status === 401) { router.push('/login'); return }
      const data = await res.json()
      if (data.success && data.connections) {
        setConnections(data.connections)
      } else {
        setMessage({ type: 'error', text: data.error || 'โหลดข้อมูลไม่สำเร็จ' })
      }
    } catch {
      setMessage({ type: 'error', text: 'เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ' })
    } finally {
      setLoading(false)
    }
  }

  async function toggleConnection(orderId: string, enable: boolean) {
    setToggling(orderId)
    try {
      const res = await fetch('/api/user/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, enable })
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: enable ? 'เปิดใช้งาน VPN สำเร็จ' : 'ปิดใช้งาน VPN สำเร็จ' })
        setConnections(prev => prev.map(c =>
          c.orderId === orderId ? { ...c, clientEnabled: enable } : c
        ))
      } else {
        setMessage({ type: 'error', text: data.error || 'ดำเนินการไม่สำเร็จ' })
      }
    } catch {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาด' })
    } finally {
      setToggling(null)
    }
  }

  function copyToClipboard(text: string, id: string) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text)
    } else {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  function toggleExpand(orderId: string) {
    setExpandedCards(prev => {
      const next = new Set(prev)
      if (next.has(orderId)) next.delete(orderId)
      else next.add(orderId)
      return next
    })
  }

  const onlineCount = connections.filter(c => c.isOnline).length
  const enabledCount = connections.filter(c => c.clientEnabled).length
  const totalUpload = connections.reduce((sum, c) => sum + (c.traffic?.up || 0), 0)
  const totalDownload = connections.reduce((sum, c) => sum + (c.traffic?.down || 0), 0)

  // ─── Loading State ───
  if (loading) {
    return (
      <div className="min-h-dvh bg-black text-white">
        <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="flex items-center h-14">
              <Link href="/" className="p-2 -ml-2 hover:bg-white/5 rounded-xl transition-all active:scale-95">
                <ArrowLeft className="w-5 h-5 text-zinc-400" />
              </Link>
              <div className="ml-3">
                <h1 className="text-sm font-bold text-white">การเชื่อมต่อ VPN</h1>
                <p className="text-[10px] text-zinc-500">กำลังโหลด...</p>
              </div>
            </div>
          </div>
        </header>
        <div className="flex flex-col items-center justify-center py-32 gap-5">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-[3px] border-violet-500/10 rounded-full" />
            <div className="absolute inset-0 border-[3px] border-violet-500 border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-2 border-[3px] border-cyan-500/10 rounded-full" />
            <div className="absolute inset-2 border-[3px] border-cyan-500 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
          </div>
          <div className="text-center space-y-1">
            <p className="text-xs font-bold text-zinc-400">กำลังเชื่อมต่อกับเซิร์ฟเวอร์</p>
            <p className="text-[10px] text-zinc-600">โปรดรอสักครู่...</p>
          </div>
        </div>
      </div>
    )
  }

  // ─── Main Render ───
  return (
    <div className="min-h-dvh bg-transparent text-white">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-20%] left-[-15%] w-[70%] h-[50%] bg-violet-600/[0.04] rounded-full blur-[180px]" />
        <div className="absolute bottom-[-20%] right-[-15%] w-[60%] h-[50%] bg-cyan-600/[0.03] rounded-full blur-[180px]" />
      </div>

      {/* Toast Notification */}
      {message.text && (
        <div className={`fixed bottom-4 left-4 right-4 sm:left-auto sm:right-8 sm:bottom-8 sm:max-w-sm z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl backdrop-blur-xl transition-all animate-in slide-in-from-bottom-5 ${
          message.type === 'success'
            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
            : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <XCircle className="w-5 h-5 flex-shrink-0" />}
          <span className="font-bold text-sm">{message.text}</span>
        </div>
      )}

      {/* ─── Header ─── */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-3">
              <Link href="/" className="p-2 -ml-2 hover:bg-white/5 rounded-xl transition-all active:scale-95">
                <ArrowLeft className="w-5 h-5 text-zinc-400" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-bold text-white">การเชื่อมต่อ VPN</h1>
                  <span className="px-1.5 py-0.5 bg-gradient-to-r from-violet-500/20 to-cyan-500/20 border border-violet-500/20 rounded-md text-[8px] font-black text-violet-300 uppercase tracking-wider">
                    Live
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500">ดูสถานะ, สถิติ Traffic และเปิด/ปิดการเชื่อมต่อ</p>
              </div>
            </div>
            <button
              onClick={fetchConnections}
              className="flex items-center gap-2 px-3 py-2 bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-all active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">รีเฟรช</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-5 sm:space-y-6">
        {/* ─── Hero Banner ─── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-violet-500/[0.08] via-zinc-900/50 to-cyan-500/[0.05] border border-white/[0.06] rounded-2xl sm:rounded-3xl p-5 sm:p-7">
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-500/8 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex items-center gap-4 sm:gap-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/25 shrink-0">
              <Signal className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-black text-white">ศูนย์ควบคุม VPN</h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">จัดการการเชื่อมต่อทั้งหมดได้จากที่นี่</p>
            </div>
          </div>

          {/* Quick info pills */}
          <div className="relative flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-violet-500/10 border border-violet-500/20 rounded-lg">
              <Activity className="w-3 h-3 text-violet-400" />
              <span className="text-[10px] font-bold text-violet-400">เรียลไทม์</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <Zap className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] font-bold text-emerald-400">เปิด/ปิดได้ทันที</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
              <Timer className="w-3 h-3 text-cyan-400" />
              <span className="text-[10px] font-bold text-cyan-400">นับถอยหลังสด</span>
            </div>
          </div>
        </div>

        {/* ─── Stats Grid ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3.5 sm:p-4 group hover:border-white/10 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
                <Server className="w-3.5 h-3.5 text-zinc-400" />
              </div>
              <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">ทั้งหมด</span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white">{connections.length}</p>
          </div>
          <div className="bg-emerald-500/[0.03] border border-emerald-500/10 rounded-2xl p-3.5 sm:p-4 group hover:border-emerald-500/20 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">ออนไลน์</span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-400">{onlineCount}</p>
          </div>
          <div className="bg-violet-500/[0.03] border border-violet-500/10 rounded-2xl p-3.5 sm:p-4 group hover:border-violet-500/20 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <Wifi className="w-3.5 h-3.5 text-violet-400" />
              </div>
              <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">เปิดใช้งาน</span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-violet-400">{enabledCount}</p>
          </div>
          <div className="bg-cyan-500/[0.03] border border-cyan-500/10 rounded-2xl p-3.5 sm:p-4 group hover:border-cyan-500/20 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Gauge className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Traffic</span>
            </div>
            <p className="text-sm sm:text-base font-black text-cyan-400">{formatBytes(totalUpload + totalDownload)}</p>
          </div>
        </div>

        {/* ─── Connection Cards ─── */}
        {connections.length === 0 ? (
          <div className="relative overflow-hidden bg-zinc-900/30 border border-white/5 border-dashed rounded-2xl sm:rounded-3xl p-10 sm:p-16 text-center space-y-5">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.02] to-cyan-500/[0.02]" />
            <div className="relative">
              <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mx-auto">
                <WifiOff className="w-10 h-10 text-zinc-700" />
              </div>
              <h3 className="text-lg font-bold text-white mt-5">ยังไม่มีการเชื่อมต่อ</h3>
              <p className="text-xs text-zinc-500 mt-1.5 max-w-xs mx-auto">คุณยังไม่มี VPN ที่ซื้อไว้ ซื้อแพ็คเกจเพื่อเริ่มต้นใช้งาน</p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 rounded-xl text-sm font-bold text-white transition-all active:scale-95 shadow-lg shadow-violet-500/20"
              >
                <Sparkles className="w-4 h-4" />
                ซื้อ VPN
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-5">
            {connections.map((conn) => {
              const remaining = getTimeRemaining(conn.expiryTime)
              const isExpanded = expandedCards.has(conn.orderId)
              const pkg = packageLabels[conn.packageType] || { label: conn.packageType, color: 'text-zinc-400', bg: 'bg-zinc-500/10 border-zinc-500/20' }

              return (
                <div
                  key={conn.orderId}
                  className={`relative overflow-hidden bg-white/[0.015] border rounded-2xl sm:rounded-3xl transition-all ${
                    !conn.clientEnabled ? 'border-red-500/10' :
                    remaining.expired ? 'border-amber-500/10' :
                    conn.isOnline ? 'border-emerald-500/10 hover:border-emerald-500/20' :
                    'border-white/5 hover:border-white/10'
                  }`}
                >
                  {/* Top accent gradient */}
                  <div className={`h-[2px] ${
                    !conn.clientEnabled ? 'bg-gradient-to-r from-red-500/50 via-red-500/20 to-transparent' :
                    remaining.expired ? 'bg-gradient-to-r from-amber-500/50 via-amber-500/20 to-transparent' :
                    conn.isOnline ? 'bg-gradient-to-r from-emerald-500/60 via-cyan-500/30 to-transparent' :
                    'bg-gradient-to-r from-violet-500/40 via-violet-500/10 to-transparent'
                  }`} />

                  <div className="p-4 sm:p-6">
                    {/* ── Card Header ── */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/5 border border-white/[0.08] rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl">
                            {conn.serverFlag}
                          </div>
                          {/* Online indicator dot */}
                          <div className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-black ${
                            !conn.clientEnabled ? 'bg-red-500' :
                            conn.isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                            'bg-zinc-600'
                          }`} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm sm:text-base font-bold text-white truncate">{conn.serverName}</h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold border ${
                              !conn.clientEnabled ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                              conn.isOnline ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                              'bg-zinc-500/10 border-zinc-500/20 text-zinc-500'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                !conn.clientEnabled ? 'bg-red-400' :
                                conn.isOnline ? 'bg-emerald-400 animate-pulse' :
                                'bg-zinc-500'
                              }`} />
                              {!conn.clientEnabled ? 'ปิดใช้งาน' : conn.isOnline ? 'ออนไลน์' : 'ออฟไลน์'}
                            </span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold border ${pkg.bg} ${pkg.color}`}>
                              {pkg.label}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Toggle Switch */}
                      <button
                        onClick={() => toggleConnection(conn.orderId, !conn.clientEnabled)}
                        disabled={toggling === conn.orderId || remaining.expired}
                        className={`relative flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 border rounded-xl sm:rounded-2xl text-xs font-bold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
                          conn.clientEnabled
                            ? 'bg-red-500/5 border-red-500/15 text-red-400 hover:bg-red-500/10 hover:border-red-500/25'
                            : 'bg-emerald-500/5 border-emerald-500/15 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/25'
                        }`}
                      >
                        {toggling === conn.orderId ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : conn.clientEnabled ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                        <span className="hidden sm:inline">{conn.clientEnabled ? 'ปิด VPN' : 'เปิด VPN'}</span>
                      </button>
                    </div>

                    {/* ── Countdown Timer ── */}
                    <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-5 mb-4 ${
                      remaining.expired ? 'bg-red-500/[0.06] border border-red-500/15' :
                      remaining.urgency === 'danger' ? 'bg-amber-500/[0.06] border border-amber-500/15' :
                      remaining.urgency === 'warning' ? 'bg-amber-500/[0.04] border border-amber-500/10' :
                      'bg-white/[0.02] border border-white/[0.05]'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Clock className={`w-3.5 h-3.5 ${
                            remaining.expired ? 'text-red-400' :
                            remaining.urgency === 'danger' ? 'text-amber-400' :
                            'text-zinc-500'
                          }`} />
                          <span className="text-[9px] sm:text-[10px] font-black text-zinc-500 uppercase tracking-widest">เวลาคงเหลือ</span>
                        </div>
                        {!conn.clientEnabled && !remaining.expired && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[8px] sm:text-[9px] font-bold text-amber-400">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            ปิดอยู่แต่เวลายังเดิน
                          </span>
                        )}
                      </div>

                      {remaining.expired ? (
                        <div className="flex items-center justify-center gap-3 py-2">
                          <WifiOff className="w-5 h-5 text-red-400" />
                          <span className="text-base sm:text-lg font-black text-red-400">หมดอายุแล้ว</span>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-center gap-2 sm:gap-3">
                            {remaining.days > 0 && (
                              <>
                                <CountdownDigit value={remaining.days} label="วัน" />
                                <CountdownSeparator />
                              </>
                            )}
                            <CountdownDigit value={remaining.hours} label="ชม." />
                            <CountdownSeparator />
                            <CountdownDigit value={remaining.mins} label="นาที" />
                            <CountdownSeparator />
                            <CountdownDigit value={remaining.secs} label="วินาที" />
                          </div>
                          {/* Progress bar */}
                          <div className="mt-4 w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-1000 ${
                                remaining.urgency === 'danger' ? 'bg-gradient-to-r from-red-500 to-amber-500' :
                                remaining.urgency === 'warning' ? 'bg-gradient-to-r from-amber-500 to-yellow-500' :
                                'bg-gradient-to-r from-violet-500 to-cyan-500'
                              }`}
                              style={{ width: `${remaining.percent}%` }}
                            />
                          </div>
                        </>
                      )}
                    </div>

                    {/* ── Traffic Stats ── */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
                      <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center group hover:border-emerald-500/10 transition-all">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
                          <Upload className="w-4 h-4 text-emerald-400" />
                        </div>
                        <p className="text-[8px] sm:text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-0.5">Upload</p>
                        <p className="text-xs sm:text-sm font-bold text-emerald-400">{formatBytes(conn.traffic?.up || 0)}</p>
                      </div>
                      <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center group hover:border-blue-500/10 transition-all">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center mx-auto mb-2">
                          <Download className="w-4 h-4 text-blue-400" />
                        </div>
                        <p className="text-[8px] sm:text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-0.5">Download</p>
                        <p className="text-xs sm:text-sm font-bold text-blue-400">{formatBytes(conn.traffic?.down || 0)}</p>
                      </div>
                      <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center group hover:border-amber-500/10 transition-all">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center mx-auto mb-2">
                          <Monitor className="w-4 h-4 text-amber-400" />
                        </div>
                        <p className="text-[8px] sm:text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-0.5">อุปกรณ์</p>
                        <p className="text-xs sm:text-sm font-bold text-amber-400">{conn.ips.length} เครื่อง</p>
                      </div>
                    </div>

                    {/* ── Connected IPs Preview ── */}
                    {conn.ips.length > 0 && !isExpanded && (
                      <div className="flex items-center gap-2 mb-4 px-3 py-2.5 bg-white/[0.02] border border-white/[0.04] rounded-xl">
                        <Monitor className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0 flex items-center gap-2 overflow-hidden">
                          {conn.ips.slice(0, 2).map((ip, i) => (
                            <span key={i} className="text-[10px] sm:text-xs font-mono text-zinc-400 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                              {ip}
                            </span>
                          ))}
                          {conn.ips.length > 2 && (
                            <span className="text-[10px] text-zinc-600">+{conn.ips.length - 2} อื่น</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ── Expand Button ── */}
                    <button
                      onClick={() => toggleExpand(conn.orderId)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] hover:border-white/[0.08] rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-bold text-zinc-500 hover:text-zinc-300 transition-all"
                    >
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      {isExpanded ? 'ซ่อนรายละเอียด' : 'ดูรายละเอียดเพิ่มเติม'}
                    </button>
                  </div>

                  {/* ── Expanded Section ── */}
                  {isExpanded && (
                    <div className="border-t border-white/[0.04] p-4 sm:p-6 space-y-5 bg-white/[0.01]">
                      {/* Connected IPs */}
                      <div>
                        <h4 className="text-[10px] sm:text-xs font-black text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-amber-500/10 flex items-center justify-center">
                            <Monitor className="w-3 h-3 text-amber-400" />
                          </div>
                          IP ที่เชื่อมต่อ
                          <span className="text-zinc-600">({conn.ips.length})</span>
                        </h4>
                        {conn.ips.length === 0 ? (
                          <div className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/[0.04] rounded-xl">
                            <WifiOff className="w-4 h-4 text-zinc-600" />
                            <p className="text-xs text-zinc-600">ไม่พบ IP ที่เชื่อมต่อในขณะนี้</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {conn.ips.map((ip, i) => (
                              <div key={i} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl hover:border-white/[0.08] transition-all">
                                <div className="flex items-center gap-2.5">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.3)]" />
                                  <span className="text-xs sm:text-sm font-mono font-bold text-zinc-300">{ip}</span>
                                </div>
                                <button
                                  onClick={() => copyToClipboard(ip, `ip-${conn.orderId}-${i}`)}
                                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                                >
                                  {copied === `ip-${conn.orderId}-${i}` ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5 text-zinc-600 hover:text-zinc-400" />
                                  )}
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* User Code */}
                      <div>
                        <h4 className="text-[10px] sm:text-xs font-black text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-violet-500/10 flex items-center justify-center">
                            <Shield className="w-3 h-3 text-violet-400" />
                          </div>
                          รหัสผู้ใช้ (Email)
                        </h4>
                        <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl">
                          <span className="text-xs sm:text-sm font-mono font-bold text-violet-400">{conn.remark}</span>
                          <button
                            onClick={() => copyToClipboard(conn.remark, `remark-${conn.orderId}`)}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                          >
                            {copied === `remark-${conn.orderId}` ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-zinc-600 hover:text-zinc-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* VLESS Link */}
                      <div>
                        <h4 className="text-[10px] sm:text-xs font-black text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-cyan-500/10 flex items-center justify-center">
                            <Globe className="w-3 h-3 text-cyan-400" />
                          </div>
                          VLESS Link
                        </h4>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 min-w-0 p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl overflow-hidden">
                            <p className="text-[10px] sm:text-xs font-mono text-zinc-500 truncate">{conn.vlessLink}</p>
                          </div>
                          <button
                            onClick={() => copyToClipboard(conn.vlessLink, `vless-${conn.orderId}`)}
                            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 rounded-xl text-[10px] sm:text-xs font-bold text-white transition-all active:scale-95 flex-shrink-0 shadow-lg shadow-violet-500/20"
                          >
                            {copied === `vless-${conn.orderId}` ? (
                              <><CheckCircle2 className="w-3.5 h-3.5" /> <span className="hidden sm:inline">คัดลอกแล้ว</span><span className="sm:hidden">OK</span></>
                            ) : (
                              <><Copy className="w-3.5 h-3.5" /> <span className="hidden sm:inline">คัดลอก</span><span className="sm:hidden">Copy</span></>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Order Info */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl">
                          <p className="text-[8px] sm:text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">วันที่ซื้อ</p>
                          <p className="text-[10px] sm:text-xs font-bold text-zinc-300">
                            {new Date(conn.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
                          </p>
                        </div>
                        <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl">
                          <p className="text-[8px] sm:text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">หมดอายุ</p>
                          <p className="text-[10px] sm:text-xs font-bold text-zinc-300">
                            {new Date(conn.expiryTime).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      {/* Error notice */}
                      {conn.error && (
                        <div className="flex items-start gap-3 p-4 bg-amber-500/[0.06] border border-amber-500/15 rounded-xl">
                          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-amber-400 mb-0.5">ข้อมูลบางส่วนอาจไม่ถูกต้อง</p>
                            <p className="text-[11px] text-amber-400/70">{conn.error}</p>
                          </div>
                        </div>
                      )}

                      {/* Quick Actions */}
                      <div className="flex items-center gap-2 pt-1">
                        <Link
                          href="/profile/renew"
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-cyan-500/5 border border-cyan-500/10 hover:bg-cyan-500/10 hover:border-cyan-500/20 rounded-xl text-cyan-400 text-xs font-bold transition-all active:scale-[0.98]"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          ต่ออายุ
                        </Link>
                        <Link
                          href="/profile/orders"
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 rounded-xl text-zinc-400 text-xs font-bold transition-all active:scale-[0.98]"
                        >
                          <Server className="w-3.5 h-3.5" />
                          ดูรายการสั่งซื้อ
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* ─── Footer Info ─── */}
        {connections.length > 0 && (
          <div className="flex items-start gap-3 p-4 bg-white/[0.02] border border-white/[0.04] rounded-xl sm:rounded-2xl">
            <AlertTriangle className="w-4 h-4 text-zinc-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-[11px] sm:text-xs font-bold text-zinc-500">หมายเหตุ</p>
              <p className="text-[10px] sm:text-[11px] text-zinc-600 leading-relaxed">
                การปิด/เปิด VPN ไม่มีผลต่อเวลาหมดอายุ นาฬิกานับถอยหลังจะเดินต่อเสมอไม่ว่าจะเปิดหรือปิดการเชื่อมต่อ
                ข้อมูล IP และ Traffic อาจมีการดีเลย์ 1-2 นาที
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
