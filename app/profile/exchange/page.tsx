'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, ArrowRightLeft, Clock, Server, Copy, CheckCircle2, AlertCircle,
  Wifi, WifiOff, Tag, Wallet, RefreshCw, AlertTriangle, ChevronRight,
  ArrowRight, Shield, Sparkles, Zap, Globe
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────
interface VpnOrder {
  id: string
  clientUUID: string
  remark: string
  subId: string
  vlessLink: string
  packageType: string
  price: number
  duration: number
  expiryTime: string
  isActive: boolean
  createdAt: string
  server: {
    id: string
    name: string
    flag: string
    isActive: boolean
    host: string
    clientPort: number
  }
}

interface ServerOption {
  id: string
  name: string
  flag: string
  host: string
  clientPort: number
  status: string
}

interface UserInfo {
  id: string
  name: string
  balance: number
}

// ─── Helpers ─────────────────────────────────────────────────────
function getTimeRemaining(expiryTime: string): {
  days: number; hours: number; mins: number; secs: number
  text: string; expired: boolean
} {
  const diff = new Date(expiryTime).getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0, text: 'หมดอายุแล้ว', expired: true }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const secs = Math.floor((diff % (1000 * 60)) / 1000)

  if (days > 0) return { days, hours, mins, secs, text: `${days}วัน ${hours}ชม. ${mins}น.`, expired: false }
  if (hours > 0) return { days, hours, mins, secs, text: `${hours}ชม. ${mins}น. ${secs}วิ.`, expired: false }
  return { days, hours, mins, secs, text: `${mins}น. ${secs}วิ.`, expired: false }
}

// ─── Countdown Timer ─────────────────────────────────────────────
function CountdownTimer({ expiryTime }: { expiryTime: string }) {
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => forceUpdate(n => n + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  const remaining = getTimeRemaining(expiryTime)

  return (
    <span className={`font-mono text-xs font-bold ${remaining.expired ? 'text-red-400' : 'text-emerald-400'}`}>
      {remaining.text}
    </span>
  )
}

// ─── Success Overlay ─────────────────────────────────────────────
function SuccessOverlay({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-orange-400/60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative text-center px-8 py-10 space-y-6 animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
        {/* Success icon */}
        <div className="relative inline-flex">
          <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-orange-500/30">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <div className="absolute -inset-3 bg-orange-500/20 rounded-[2rem] blur-xl animate-pulse" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white">สำเร็จ!</h2>
          <p className="text-sm text-zinc-400 max-w-xs mx-auto leading-relaxed">{message}</p>
        </div>

        <button
          onClick={onClose}
          className="px-8 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl text-sm font-bold text-white transition-all active:scale-95"
        >
          ตกลง
        </button>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
          50% { transform: translateY(-20px) scale(1.5); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────
export default function ExchangePage() {
  const router = useRouter()
  const [orders, setOrders] = useState<VpnOrder[]>([])
  const [servers, setServers] = useState<ServerOption[]>([])
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [exchangeFee, setExchangeFee] = useState(2)
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<VpnOrder | null>(null)
  const [selectedServer, setSelectedServer] = useState<ServerOption | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [step, setStep] = useState<1 | 2>(1)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => { fetchData() }, [])

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  async function fetchData() {
    try {
      const res = await fetch('/api/vpn/exchange')
      if (res.status === 401) { router.push('/login'); return }
      const data = await res.json()
      if (data.vpnOrders) {
        setOrders(data.vpnOrders)
        setUserInfo(data.user)
        setServers(data.servers || [])
        setExchangeFee(data.exchangeFee || 2)
      }
    } catch {
      console.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  async function handleExchange() {
    if (!selectedOrder || !selectedServer) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/vpn/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          newServerId: selectedServer.id
        })
      })
      const data = await res.json()
      if (data.success) {
        setSuccessMsg(`${data.message} (หักเงิน ${data.deducted} ฿)`)
        setSelectedOrder(null)
        setSelectedServer(null)
        setStep(1)
        setShowConfirm(false)
        fetchData()
      } else {
        setMessage({ type: 'error', text: data.error || 'แลกเปลี่ยนไม่สำเร็จ' })
        setShowConfirm(false)
      }
    } catch {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' })
      setShowConfirm(false)
    } finally {
      setSubmitting(false)
    }
  }

  function copyLink(link: string, id: string) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(link)
      } else {
        const textArea = document.createElement('textarea')
        textArea.value = link
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      alert('คัดลอกไม่สำเร็จ')
    }
  }

  function isExpired(expiryTime: string): boolean {
    return new Date(expiryTime) < new Date()
  }

  const activeOrders = orders.filter(o => !isExpired(o.expiryTime))
  const availableServers = selectedOrder
    ? servers.filter(s => s.id !== selectedOrder.server.id)
    : servers
  const canAfford = userInfo ? userInfo.balance >= exchangeFee : false

  // ─── Loading State ───
  if (loading) {
    return (
      <div className="min-h-dvh bg-black text-white">
        <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="flex items-center h-14">
              <Link href="/profile/orders" className="p-2 -ml-2 hover:bg-white/5 rounded-xl transition-all active:scale-95">
                <ArrowLeft className="w-5 h-5 text-zinc-400" />
              </Link>
              <div className="ml-3">
                <h1 className="text-sm font-bold text-white">แลกเปลี่ยนเซิร์ฟเวอร์</h1>
                <p className="text-[10px] text-zinc-500">กำลังโหลด...</p>
              </div>
            </div>
          </div>
        </header>
        <div className="flex flex-col items-center justify-center py-32 gap-5">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-[3px] border-orange-500/10 rounded-full" />
            <div className="absolute inset-0 border-[3px] border-orange-500 border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-2 border-[3px] border-amber-500/10 rounded-full" />
            <div className="absolute inset-2 border-[3px] border-amber-500 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
          </div>
          <div className="text-center space-y-1">
            <p className="text-xs font-bold text-zinc-400">กำลังโหลดข้อมูล</p>
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
        <div className="absolute top-[-20%] left-[-15%] w-[70%] h-[50%] bg-orange-600/[0.04] rounded-full blur-[180px]" />
        <div className="absolute bottom-[-20%] right-[-15%] w-[60%] h-[50%] bg-amber-600/[0.03] rounded-full blur-[180px]" />
      </div>

      {/* Success Overlay */}
      {successMsg && (
        <SuccessOverlay message={successMsg} onClose={() => setSuccessMsg(null)} />
      )}

      {/* Toast Notification */}
      {message.text && (
        <div className={`fixed bottom-4 left-4 right-4 sm:left-auto sm:right-8 sm:bottom-8 sm:max-w-sm z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl backdrop-blur-xl transition-all animate-in slide-in-from-bottom-5 ${
          message.type === 'success'
            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
            : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span className="font-bold text-sm">{message.text}</span>
        </div>
      )}

      {/* ─── Header ─── */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-3">
              <Link
                href="/profile/orders"
                className="p-2 -ml-2 hover:bg-white/5 rounded-xl transition-all active:scale-95"
              >
                <ArrowLeft className="w-5 h-5 text-zinc-400" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-bold text-white">แลกเปลี่ยนเซิร์ฟเวอร์</h1>
                </div>
                <p className="text-[10px] text-zinc-500">ย้าย VPN ไปเซิร์ฟเวอร์อื่น</p>
              </div>
            </div>
            {userInfo && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded-xl">
                <Wallet className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-cyan-400 font-bold text-sm">{userInfo.balance.toLocaleString()} ฿</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-5 sm:space-y-6">
        {/* ─── Hero Banner ─── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-orange-500/[0.08] via-zinc-900/50 to-amber-500/[0.05] border border-white/[0.06] rounded-2xl sm:rounded-3xl p-5 sm:p-7">
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-amber-500/8 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex items-center gap-4 sm:gap-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/25 shrink-0">
              <ArrowRightLeft className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-black text-white">แลกเปลี่ยนเซิร์ฟเวอร์</h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">ย้ายบัญชี VPN ไปเซิร์ฟเวอร์อื่นได้ทันที</p>
            </div>
          </div>

          {/* Quick info pills */}
          <div className="relative flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <Zap className="w-3 h-3 text-orange-400" />
              <span className="text-[10px] font-bold text-orange-400">ย้ายทันที</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] font-bold text-emerald-400">เวลา/GB คงเดิม</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span className="text-[10px] font-bold text-amber-400">{exchangeFee} เครดิต/ครั้ง</span>
            </div>
          </div>
        </div>

        {/* ─── Warning Notes ─── */}
        <div className="flex items-start gap-3 p-4 bg-white/[0.02] border border-white/[0.04] rounded-xl sm:rounded-2xl">
          <AlertTriangle className="w-4 h-4 text-zinc-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-[11px] sm:text-xs font-bold text-zinc-500">หมายเหตุ</p>
            <ul className="text-[10px] sm:text-[11px] text-zinc-600 leading-relaxed space-y-0.5">
              <li>โค้ดเดิมจะถูกลบทันทีจากเซิร์ฟเวอร์เดิม</li>
              <li>โค้ดใหม่จะมีเวลาเหลือเท่าเดิมทุกประการ</li>
              <li>ข้อมูล GB, IP Limit ตรงกับอันเดิม</li>
            </ul>
          </div>
        </div>

        {/* ─── Empty State ─── */}
        {activeOrders.length === 0 ? (
          <div className="relative overflow-hidden bg-zinc-900/30 border border-white/5 border-dashed rounded-2xl sm:rounded-3xl p-10 sm:p-16 text-center space-y-5">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/[0.02] to-amber-500/[0.02]" />
            <div className="relative">
              <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mx-auto">
                <WifiOff className="w-10 h-10 text-zinc-700" />
              </div>
              <h3 className="text-lg font-bold text-white mt-5">ไม่มีโค้ด VPN ที่ใช้งานได้</h3>
              <p className="text-xs text-zinc-500 mt-1.5 max-w-xs mx-auto">ซื้อ VPN ก่อนเพื่อใช้ฟีเจอร์แลกเปลี่ยนเซิร์ฟเวอร์</p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 rounded-xl text-sm font-bold text-white transition-all active:scale-95 shadow-lg shadow-orange-500/20"
              >
                <Sparkles className="w-4 h-4" />
                ไปซื้อ VPN
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* ─── Step Indicator ─── */}
            <div className="flex items-center gap-2 sm:gap-3 px-1">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                  step === 1
                    ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20'
                    : selectedOrder
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                      : 'bg-white/5 border border-white/10 text-zinc-500'
                }`}>
                  {selectedOrder && step === 2 ? <CheckCircle2 className="w-4 h-4" /> : '1'}
                </div>
                <span className={`text-xs sm:text-sm font-bold transition-colors ${step === 1 ? 'text-white' : 'text-zinc-600'}`}>
                  เลือกบัญชี
                </span>
              </div>

              <div className="flex-1 h-px bg-white/10 mx-1" />

              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                  step === 2
                    ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20'
                    : 'bg-white/5 border border-white/10 text-zinc-500'
                }`}>
                  2
                </div>
                <span className={`text-xs sm:text-sm font-bold transition-colors ${step === 2 ? 'text-white' : 'text-zinc-600'}`}>
                  เลือกเซิร์ฟเวอร์
                </span>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════ */}
            {/* ─── STEP 1: Select Account ─── */}
            {/* ═══════════════════════════════════════════════════ */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-[10px] sm:text-[11px] font-black text-zinc-500 uppercase tracking-widest">
                    เลือกบัญชีที่ต้องการย้าย ({activeOrders.length})
                  </h2>
                  <button
                    onClick={() => { setLoading(true); fetchData() }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 rounded-lg text-xs font-bold text-zinc-500 hover:text-zinc-300 transition-all active:scale-95"
                  >
                    <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">รีเฟรช</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {activeOrders.map((order) => {
                    const remaining = getTimeRemaining(order.expiryTime)
                    return (
                      <button
                        key={order.id}
                        type="button"
                        onClick={() => {
                          setSelectedOrder(order)
                          setSelectedServer(null)
                          setStep(2)
                        }}
                        className="w-full text-left relative overflow-hidden bg-white/[0.015] border border-white/5 hover:border-orange-500/20 rounded-2xl sm:rounded-3xl transition-all group active:scale-[0.98]"
                      >
                        {/* Top accent */}
                        <div className="h-[2px] bg-gradient-to-r from-orange-500/40 via-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="p-4 sm:p-5 space-y-3">
                          {/* Card Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="relative flex-shrink-0">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/5 border border-white/[0.08] rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl">
                                  {order.server.flag}
                                </div>
                                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-black bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                              </div>
                              <div className="min-w-0">
                                <h3 className="text-sm sm:text-base font-bold text-white truncate">{order.remark}</h3>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold border bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    ใช้งานได้
                                  </span>
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold border bg-orange-500/10 border-orange-500/20 text-orange-400">
                                    {order.packageType === 'TRIAL' ? 'ทดลอง' : order.packageType === 'CUSTOM' ? `${order.duration} วัน` : order.packageType}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-zinc-600 group-hover:text-orange-400 transition-colors flex-shrink-0 mt-2">
                              <span className="text-[10px] font-bold hidden sm:inline">เลือก</span>
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          </div>

                          {/* Info Row */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-zinc-500">
                            <span className="flex items-center gap-1.5">
                              <Server className="w-3 h-3" />
                              {order.server.name}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3 h-3" />
                              <CountdownTimer expiryTime={order.expiryTime} />
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Globe className="w-3 h-3" />
                              {order.server.host}
                            </span>
                          </div>

                          {/* VLESS Link */}
                          <div className="flex items-center gap-2">
                            <div className="flex-1 min-w-0 p-2.5 bg-black/40 border border-white/[0.04] rounded-xl overflow-hidden">
                              <p className="text-[10px] font-mono text-zinc-600 truncate">{order.vlessLink}</p>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); copyLink(order.vlessLink, order.id) }}
                              className="p-2.5 bg-white/[0.03] hover:bg-orange-500/10 border border-white/[0.06] hover:border-orange-500/20 rounded-xl transition-all flex-shrink-0 active:scale-95"
                            >
                              {copiedId === order.id ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5 text-zinc-500" />
                              )}
                            </button>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════ */}
            {/* ─── STEP 2: Select Destination Server ─── */}
            {/* ═══════════════════════════════════════════════════ */}
            {step === 2 && selectedOrder && (
              <div className="space-y-5">
                {/* Selected Order Summary Card */}
                <div className="relative overflow-hidden bg-orange-500/[0.04] border border-orange-500/15 rounded-2xl sm:rounded-3xl">
                  <div className="h-[2px] bg-gradient-to-r from-orange-500/60 via-amber-500/30 to-transparent" />
                  <div className="p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 sm:w-12 sm:h-12 bg-white/5 border border-white/[0.08] rounded-xl flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
                          {selectedOrder.server.flag}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] sm:text-[10px] font-black text-zinc-600 uppercase tracking-widest">บัญชีที่เลือก</p>
                          <p className="text-sm sm:text-base font-bold text-white truncate">{selectedOrder.remark}</p>
                          <p className="text-[11px] text-zinc-500">{selectedOrder.server.name}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => { setStep(1); setSelectedOrder(null); setSelectedServer(null); setShowConfirm(false) }}
                        className="px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-[10px] sm:text-xs font-bold text-zinc-400 hover:text-white transition-all active:scale-95 flex-shrink-0"
                      >
                        เปลี่ยน
                      </button>
                    </div>
                  </div>
                </div>

                {/* Server List */}
                <div className="space-y-3">
                  <h2 className="text-[10px] sm:text-[11px] font-black text-zinc-500 uppercase tracking-widest px-1">
                    เลือกเซิร์ฟเวอร์ปลายทาง ({availableServers.length})
                  </h2>

                  {availableServers.length === 0 ? (
                    <div className="relative overflow-hidden bg-zinc-900/30 border border-white/5 border-dashed rounded-2xl p-10 text-center">
                      <Server className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                      <p className="text-sm font-bold text-zinc-400">ไม่มีเซิร์ฟเวอร์อื่นให้เลือก</p>
                      <p className="text-xs text-zinc-600 mt-1">มีเซิร์ฟเวอร์เดียวในระบบ</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {availableServers.map((server) => {
                        const isSelected = selectedServer?.id === server.id
                        return (
                          <button
                            key={server.id}
                            type="button"
                            onClick={() => {
                              setSelectedServer(isSelected ? null : server)
                              setShowConfirm(false)
                            }}
                            className={`relative overflow-hidden text-left rounded-2xl border transition-all active:scale-[0.98] ${
                              isSelected
                                ? 'bg-orange-500/[0.06] border-orange-500/25 ring-1 ring-orange-500/10 shadow-lg shadow-orange-500/5'
                                : 'bg-white/[0.015] border-white/5 hover:border-white/10 hover:bg-white/[0.03]'
                            }`}
                          >
                            {isSelected && (
                              <div className="h-[2px] bg-gradient-to-r from-orange-500/60 via-amber-500/40 to-transparent" />
                            )}
                            <div className="p-4 sm:p-5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border transition-all ${
                                    isSelected ? 'bg-orange-500/10 border-orange-500/20' : 'bg-white/5 border-white/[0.08]'
                                  }`}>
                                    {server.flag}
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-white">{server.name}</p>
                                    <p className="text-[11px] text-zinc-500 font-mono">{server.host}</p>
                                  </div>
                                </div>
                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                  isSelected ? 'border-orange-400 bg-orange-400 shadow-lg shadow-orange-500/30' : 'border-white/15'
                                }`}>
                                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-black" />}
                                </div>
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* ─── Confirm Button (shows after selecting server) ─── */}
                {selectedServer && !showConfirm && (
                  <button
                    onClick={() => setShowConfirm(true)}
                    className="w-full py-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 rounded-2xl text-sm font-black text-white uppercase tracking-wider transition-all shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    ดำเนินการแลกเปลี่ยน
                  </button>
                )}

                {/* ─── Confirmation Panel ─── */}
                {selectedServer && showConfirm && (
                  <div className="relative overflow-hidden bg-[#0a0a0a] border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/50 animate-in slide-in-from-bottom-3 duration-300">
                    <div className="h-[2px] bg-gradient-to-r from-orange-500/60 via-amber-500/40 to-transparent" />
                    <div className="p-5 sm:p-6 space-y-5">
                      <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                        <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
                          <ArrowRightLeft className="w-4 h-4 text-orange-400" />
                        </div>
                        ยืนยันการแลกเปลี่ยน
                      </h3>

                      {/* Transfer Visualization */}
                      <div className="relative bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 sm:p-6">
                        <div className="flex items-center justify-between gap-3 sm:gap-6">
                          {/* From */}
                          <div className="flex-1 text-center space-y-2">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-500/[0.06] border border-red-500/15 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl mx-auto">
                              {selectedOrder.server.flag}
                            </div>
                            <div>
                              <p className="text-[9px] font-black text-red-400/60 uppercase tracking-widest">จาก</p>
                              <p className="text-xs sm:text-sm font-bold text-white truncate">{selectedOrder.server.name}</p>
                            </div>
                          </div>

                          {/* Arrow */}
                          <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <span className="text-[10px] font-black text-orange-400">{exchangeFee} ฿</span>
                          </div>

                          {/* To */}
                          <div className="flex-1 text-center space-y-2">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-emerald-500/[0.06] border border-emerald-500/15 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl mx-auto">
                              {selectedServer.flag}
                            </div>
                            <div>
                              <p className="text-[9px] font-black text-emerald-400/60 uppercase tracking-widest">ไป</p>
                              <p className="text-xs sm:text-sm font-bold text-white truncate">{selectedServer.name}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Price Summary */}
                      <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4 space-y-2.5">
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-500">ค่าบริการแลกเปลี่ยน</span>
                          <span className="text-orange-400 font-bold">{exchangeFee} ฿</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-500">ยอดเงินคงเหลือ</span>
                          <span className="text-white font-bold">{userInfo?.balance.toLocaleString()} ฿</span>
                        </div>
                        <div className="border-t border-white/5 pt-2.5 flex justify-between items-end">
                          <span className="text-white font-bold">หลังหักเงิน</span>
                          <span className="text-cyan-400 font-black text-xl">{((userInfo?.balance || 0) - exchangeFee).toLocaleString()} ฿</span>
                        </div>
                      </div>

                      {/* Balance Warning */}
                      {!canAfford && (
                        <div className="flex items-center gap-3 p-4 bg-red-500/[0.06] border border-red-500/15 rounded-xl">
                          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-red-400 text-xs font-bold">เครดิตไม่เพียงพอ</p>
                            <p className="text-red-400/60 text-[10px]">มี {userInfo?.balance || 0} ฿ ต้องการ {exchangeFee} ฿</p>
                          </div>
                          <Link
                            href="/topup"
                            className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-[10px] font-bold hover:bg-red-500/20 transition-colors flex-shrink-0"
                          >
                            เติมเงิน
                          </Link>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowConfirm(false)}
                          className="flex-1 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl text-sm font-bold text-zinc-400 transition-all active:scale-[0.98]"
                        >
                          ยกเลิก
                        </button>
                        <button
                          type="button"
                          onClick={handleExchange}
                          disabled={submitting || !canAfford}
                          className="flex-[2] py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 rounded-2xl text-sm font-black text-white uppercase tracking-wider transition-all shadow-lg shadow-orange-600/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                          {submitting ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <>
                              <ArrowRightLeft className="w-4 h-4" />
                              ยืนยัน — {exchangeFee} ฿
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
