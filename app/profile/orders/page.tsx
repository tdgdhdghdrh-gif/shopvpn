'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, ShoppingBag, Copy, CheckCircle2, Clock, Server, 
  Wifi, WifiOff, RefreshCw, ExternalLink, Filter, ChevronDown,
  Calendar, Tag, Zap
} from 'lucide-react'

interface VpnOrder {
  id: string
  packageType: string
  price: number
  duration: number
  clientUUID: string
  remark: string
  subId: string
  vlessLink: string
  isActive: boolean
  expiryTime: string
  createdAt: string
  server: {
    name: string
    flag: string
  }
}

type FilterType = 'all' | 'active' | 'expired'

// Countdown Timer Component
function CountdownTimer({ expiryTime, isActive }: { expiryTime: string; isActive: boolean }) {
  const [timeLeft, setTimeLeft] = useState('')
  const [isExpired, setIsExpired] = useState(false)
  const [percent, setPercent] = useState(0)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const expiry = new Date(expiryTime).getTime()
      const difference = expiry - now

      if (!isActive || difference <= 0) {
        setTimeLeft('หมดอายุแล้ว')
        setIsExpired(true)
        setPercent(0)
        return
      }

      setIsExpired(false)

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      // Calculate percentage (assume max 30 days)
      const maxMs = 30 * 24 * 60 * 60 * 1000
      setPercent(Math.min(100, (difference / maxMs) * 100))

      if (days > 0) {
        setTimeLeft(`${days}วัน ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
      } else {
        setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(timer)
  }, [expiryTime, isActive])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-1.5 text-sm font-mono font-bold ${
          isExpired ? 'text-red-400' : 'text-emerald-400'
        }`}>
          <Clock className="w-3.5 h-3.5" />
          <span>{timeLeft}</span>
        </div>
      </div>
      {!isExpired && (
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-emerald-500 to-cyan-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </div>
  )
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<VpnOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')
  const [showFilterMenu, setShowFilterMenu] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    try {
      const res = await fetch('/api/profile/orders')
      if (res.status === 401) {
        router.push('/login')
        return
      }
      const data = await res.json()
      if (data.orders) {
        setOrders(data.orders)
      }
    } catch (error) {
      console.error('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  async function copyLink(link: string, id: string) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(link)
      } else {
        const textArea = document.createElement('textarea')
        textArea.value = link
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        const successful = document.execCommand('copy')
        document.body.removeChild(textArea)
        if (!successful) throw new Error('execCommand failed')
      }
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Copy failed:', err)
      alert('คัดลอกไม่สำเร็จ กรุณาลองใหม่')
    }
  }

  function getPackageLabel(type: string) {
    switch (type) {
      case 'TRIAL': return 'ทดลองใช้'
      case 'DAILY': return 'รายวัน'
      case 'WEEKLY': return 'รายสัปดาห์'
      case 'MONTHLY': return 'รายเดือน'
      default: return type
    }
  }

  function getPackageColor(type: string) {
    switch (type) {
      case 'TRIAL': return 'text-gray-400 bg-gray-500/10 border-gray-500/20'
      case 'DAILY': return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
      case 'WEEKLY': return 'text-purple-400 bg-purple-500/10 border-purple-500/20'
      case 'MONTHLY': return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20'
    }
  }

  function isExpired(order: VpnOrder): boolean {
    return !order.isActive || new Date(order.expiryTime) < new Date()
  }

  const filteredOrders = orders.filter(order => {
    if (filter === 'active') return !isExpired(order)
    if (filter === 'expired') return isExpired(order)
    return true
  })

  const activeCount = orders.filter(o => !isExpired(o)).length
  const expiredCount = orders.filter(o => isExpired(o)).length

  const filterLabels: Record<FilterType, string> = {
    all: `ทั้งหมด (${orders.length})`,
    active: `ใช้งานได้ (${activeCount})`,
    expired: `หมดอายุ (${expiredCount})`,
  }

  return (
    <div className="min-h-screen bg-transparent text-white">
      {/* Copied Toast */}
      {copiedId && (
        <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:right-8 sm:bottom-8 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="font-semibold text-sm">คัดลอกลิงก์แล้ว</span>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link 
                href="/" 
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-lg font-bold tracking-tight">ประวัติการซื้อ</h1>
                <p className="text-[10px] text-gray-500 font-medium">VPN ทั้งหมดของคุณ</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/profile/renew"
                className="flex items-center gap-1.5 px-3 py-2 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 rounded-xl transition-colors"
              >
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-cyan-400 text-xs font-bold hidden sm:inline">ต่ออายุ</span>
              </Link>
              <button
                onClick={() => { setLoading(true); fetchOrders() }}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <RefreshCw className={`w-4 h-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-5 space-y-5">
        {/* Stats Summary */}
        {!loading && orders.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-3 sm:p-4 text-center">
              <p className="text-2xl sm:text-3xl font-black text-white">{orders.length}</p>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">ทั้งหมด</p>
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-3 sm:p-4 text-center">
              <p className="text-2xl sm:text-3xl font-black text-emerald-400">{activeCount}</p>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">ใช้งานได้</p>
            </div>
            <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-3 sm:p-4 text-center">
              <p className="text-2xl sm:text-3xl font-black text-red-400">{expiredCount}</p>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">หมดอายุ</p>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        {!loading && orders.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {(['all', 'active', 'expired'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  filter === f
                    ? f === 'active' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : f === 'expired'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : 'bg-white/10 text-white border border-white/10'
                    : 'bg-white/[0.03] text-gray-500 border border-transparent hover:bg-white/[0.06]'
                }`}
              >
                {filterLabels[f]}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-sm text-gray-500">กำลังโหลดประวัติการซื้อ...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center">
              <ShoppingBag className="w-10 h-10 text-gray-600" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-gray-400 font-medium">ยังไม่มีประวัติการซื้อ</p>
              <p className="text-gray-600 text-sm">ซื้อ VPN เพื่อเริ่มต้นใช้งาน</p>
            </div>
            <Link
              href="/"
              className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-bold text-white transition-all active:scale-95"
            >
              ไปซื้อ VPN
            </Link>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
              {filter === 'active' ? (
                <Wifi className="w-8 h-8 text-gray-600" />
              ) : (
                <WifiOff className="w-8 h-8 text-gray-600" />
              )}
            </div>
            <p className="text-gray-500 text-sm">
              {filter === 'active' ? 'ไม่มีโค้ดที่ใช้งานได้' : 'ไม่มีโค้ดที่หมดอายุ'}
            </p>
          </div>
        ) : (
          /* Orders Grid - 1 col mobile, 2 col desktop */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {filteredOrders.map((order) => {
              const expired = isExpired(order)
              return (
                <div 
                  key={order.id} 
                  className={`group relative rounded-2xl border transition-all overflow-hidden ${
                    expired 
                      ? 'bg-white/[0.01] border-white/5 opacity-70 hover:opacity-100' 
                      : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'
                  }`}
                >
                  {/* Top accent line */}
                  <div className={`h-0.5 ${expired ? 'bg-red-500/30' : 'bg-gradient-to-r from-emerald-500 to-cyan-500'}`} />

                  <div className="p-4 space-y-3">
                    {/* Header row: flag + name + status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg">
                          {order.server.flag}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white text-sm truncate">{order.remark}</p>
                          <p className="text-[11px] text-gray-500 flex items-center gap-1.5">
                            <Server className="w-3 h-3" />
                            {order.server.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${getPackageColor(order.packageType)}`}>
                          <Tag className="w-2.5 h-2.5" />
                          {getPackageLabel(order.packageType)}
                        </span>
                      </div>
                    </div>

                    {/* Status badge + countdown */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        {expired ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-[10px] font-black uppercase tracking-wider">
                            <WifiOff className="w-3 h-3" />
                            หมดอายุ
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-wider">
                            <Wifi className="w-3 h-3" />
                            ใช้งานได้
                          </span>
                        )}
                        <span className="text-amber-400 font-bold text-sm">{order.price} ฿</span>
                      </div>

                      <CountdownTimer expiryTime={order.expiryTime} isActive={order.isActive} />
                    </div>

                    {/* Details row */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        ซื้อ: {new Date(order.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {order.duration} วัน
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        หมดอายุ: {new Date(order.expiryTime).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
                      </span>
                    </div>

                    {/* VLESS Link */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-0 bg-black/50 border border-white/5 rounded-xl px-3 py-2.5 truncate">
                        <p className="text-[10px] text-gray-600 font-mono truncate">{order.vlessLink}</p>
                      </div>
                      <button
                        onClick={() => copyLink(order.vlessLink, order.id)}
                        className={`p-2.5 rounded-xl border transition-all active:scale-90 flex-shrink-0 ${
                          copiedId === order.id 
                            ? 'bg-emerald-500/10 border-emerald-500/20' 
                            : 'bg-white/5 border-white/5 hover:bg-cyan-500/10 hover:border-cyan-500/20'
                        }`}
                      >
                        {copiedId === order.id ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>

                    {/* Action row */}
                    <div className="flex items-center gap-2 pt-1">
                      <Link
                        href="/profile/renew"
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-cyan-500/5 border border-cyan-500/10 hover:bg-cyan-500/10 hover:border-cyan-500/20 rounded-xl text-cyan-400 text-xs font-bold transition-all active:scale-[0.98]"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        ต่ออายุ
                      </Link>
                      <button
                        onClick={() => copyLink(order.vlessLink, order.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 rounded-xl text-gray-400 text-xs font-bold transition-all active:scale-[0.98]"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        คัดลอกลิงก์
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
