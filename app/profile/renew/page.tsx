'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, Clock, Server, Copy, CheckCircle2, AlertCircle, 
  Wifi, Tag, Minus, Plus, Wallet, RefreshCw, Sparkles
} from 'lucide-react'

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
  ipLimit: number
  createdAt: string
  server: {
    id: string
    name: string
    flag: string
    isActive: boolean
    pricePerDay: number
    priceWeekly: number | null
    priceMonthly: number | null
  }
}

interface UserInfo {
  id: string
  name: string
  balance: number
  hasDiscount: boolean
  promoPercent: number
}

// Countdown Timer
function CountdownTimer({ expiryTime }: { expiryTime: string }) {
  const [timeLeft, setTimeLeft] = useState('')
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const calculate = () => {
      const now = new Date().getTime()
      const expiry = new Date(expiryTime).getTime()
      const diff = expiry - now

      if (diff <= 0) {
        setTimeLeft('หมดอายุแล้ว')
        setIsExpired(true)
        return
      }

      setIsExpired(false)
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      if (days > 0) {
        setTimeLeft(`${days}วัน ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
      } else {
        setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
      }
    }

    calculate()
    const timer = setInterval(calculate, 1000)
    return () => clearInterval(timer)
  }, [expiryTime])

  return (
    <span className={`font-mono text-xs ${isExpired ? 'text-red-400' : 'text-emerald-400'}`}>
      {timeLeft}
    </span>
  )
}

export default function RenewPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<VpnOrder[]>([])
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<VpnOrder | null>(null)
  const [days, setDays] = useState(7)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 4000)
      return () => clearTimeout(timer)
    }
  }, [message])

  async function fetchOrders() {
    try {
      const res = await fetch('/api/vpn/renew')
      if (res.status === 401) {
        router.push('/login')
        return
      }
      const data = await res.json()
      if (data.vpnOrders) {
        setOrders(data.vpnOrders)
        setUserInfo(data.user)
      }
    } catch (error) {
      console.error('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  async function handleRenew() {
    if (!selectedOrder) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/vpn/renew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: selectedOrder.id, days })
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: `${data.message} (หักเงิน ${data.deducted} ฿)` })
        setSelectedOrder(null)
        setDays(7)
        // Refresh data
        fetchOrders()
      } else {
        setMessage({ type: 'error', text: data.error || 'ต่ออายุไม่สำเร็จ' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' })
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

  // Calculate price based on selected order's server pricing (matching buy flow)
  function calculatePrice(order: VpnOrder | null, selectedDays: number): { pricePerDay: number; totalPrice: number; isPackagePrice: boolean; originalPricePerDay: number } {
    if (!order || !userInfo) return { pricePerDay: 2, totalPrice: selectedDays * 2, isPackagePrice: false, originalPricePerDay: 2 }
    
    const serverPricePerDay = order.server.pricePerDay ?? 2
    const originalPricePerDay = serverPricePerDay
    let ppd = serverPricePerDay
    
    // Apply 50% discount
    if (userInfo.hasDiscount) {
      ppd = Math.max(0.5, ppd * 0.5)
    }
    
    // Apply promo discount
    const promoPercent = userInfo.promoPercent || 0
    if (promoPercent > 0) {
      ppd = Math.max(0.5, Math.round(ppd * (100 - promoPercent) / 100 * 100) / 100)
    }
    
    // Check package pricing
    let total = 0
    let isPackage = false
    if (selectedDays === 7 && order.server.priceWeekly != null) {
      total = userInfo.hasDiscount ? order.server.priceWeekly * 0.5 : order.server.priceWeekly
      if (promoPercent > 0) {
        total = Math.max(0.5, Math.round(total * (100 - promoPercent) / 100 * 100) / 100)
      }
      isPackage = true
    } else if (selectedDays === 30 && order.server.priceMonthly != null) {
      total = userInfo.hasDiscount ? order.server.priceMonthly * 0.5 : order.server.priceMonthly
      if (promoPercent > 0) {
        total = Math.max(0.5, Math.round(total * (100 - promoPercent) / 100 * 100) / 100)
      }
      isPackage = true
    } else {
      total = selectedDays * ppd
    }
    
    return { pricePerDay: ppd, totalPrice: total, isPackagePrice: isPackage, originalPricePerDay: originalPricePerDay }
  }

  const { pricePerDay, totalPrice, isPackagePrice, originalPricePerDay } = calculatePrice(selectedOrder, days)
  const hasAnyDiscount = userInfo?.hasDiscount || (userInfo?.promoPercent || 0) > 0
  const canAfford = userInfo ? userInfo.balance >= totalPrice : false

  return (
    <div className="min-h-screen bg-transparent text-white">
      {/* Toast */}
      {message.text && (
        <div className={`fixed bottom-4 right-4 left-4 sm:left-auto sm:right-8 sm:bottom-8 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-5 ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
            : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span className="font-semibold text-sm">{message.text}</span>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link 
                href="/profile/orders" 
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-lg font-bold tracking-tight">ต่ออายุ VPN</h1>
                <p className="text-[10px] text-gray-500 font-medium">เลือกโค้ดที่ต้องการต่ออายุ</p>
              </div>
            </div>
            {userInfo && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl">
                <Wallet className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-cyan-400 font-bold text-sm">{userInfo.balance.toLocaleString()} ฿</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Discount Badge */}
        {userInfo?.hasDiscount && (
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-2xl">
            <div className="w-10 h-10 bg-pink-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-pink-400">ส่วนลด 50%</p>
              <p className="text-xs text-gray-400">คุณได้รับส่วนลด 50% จากราคาปกติ</p>
            </div>
          </div>
        )}
        {(userInfo?.promoPercent || 0) > 0 && (
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl">
            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Tag className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-400">โปรโมชั่น -{userInfo?.promoPercent}%</p>
              <p className="text-xs text-gray-400">คุณได้รับส่วนลดโปรโมชั่นถาวร {userInfo?.promoPercent}%</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            <p className="text-sm text-gray-500">กำลังโหลดรายการ VPN...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center">
              <Wifi className="w-10 h-10 text-gray-600" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-gray-400 font-medium">ยังไม่มีโค้ด VPN</p>
              <p className="text-gray-600 text-sm">ซื้อ VPN ก่อนเพื่อใช้ฟีเจอร์ต่ออายุ</p>
            </div>
            <Link
              href="/"
              className="mt-4 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-sm font-bold text-white transition-all active:scale-95"
            >
              ไปซื้อ VPN
            </Link>
          </div>
        ) : (
          <>
            {/* Orders List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  โค้ดทั้งหมด ({orders.length})
                </h2>
                <button 
                  onClick={() => { setLoading(true); fetchOrders() }}
                  className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="space-y-2">
                {orders.map((order) => {
                  const expired = isExpired(order.expiryTime)
                  const isSelected = selectedOrder?.id === order.id
                  return (
                    <button
                      key={order.id}
                      type="button"
                      onClick={() => {
                        setSelectedOrder(isSelected ? null : order)
                        setDays(7)
                      }}
                      className={`w-full text-left rounded-2xl border transition-all ${
                        isSelected
                          ? 'bg-cyan-500/5 border-cyan-500/30 ring-1 ring-cyan-500/10'
                          : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10'
                      }`}
                    >
                      <div className="p-4 space-y-3">
                        {/* Top row: name + status */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-lg flex-shrink-0">{order.server.flag}</span>
                            <span className="font-bold text-white text-sm truncate">{order.remark}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {expired ? (
                              <span className="inline-flex items-center px-2.5 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-[9px] font-black uppercase tracking-wider">
                                หมดอายุ
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-[9px] font-black uppercase tracking-wider">
                                ใช้งานได้
                              </span>
                            )}
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                              isSelected ? 'border-cyan-400 bg-cyan-400' : 'border-white/20'
                            }`}>
                              {isSelected && <CheckCircle2 className="w-3 h-3 text-black" />}
                            </div>
                          </div>
                        </div>

                        {/* Info row */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-gray-500">
                          <span className="flex items-center gap-1.5">
                            <Server className="w-3 h-3" />
                            {order.server.name}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            <CountdownTimer expiryTime={order.expiryTime} />
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Tag className="w-3 h-3" />
                            {order.duration} วัน
                          </span>
                        </div>

                        {/* VLESS link */}
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            defaultValue={order.vlessLink}
                            readOnly
                            className="flex-1 bg-black/50 border border-white/5 rounded-lg px-3 py-2 text-[10px] text-gray-500 truncate font-mono"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <button
                            onClick={(e) => { e.stopPropagation(); copyLink(order.vlessLink, order.id) }}
                            className="p-2 bg-white/5 hover:bg-cyan-500/10 border border-white/10 rounded-lg transition-colors flex-shrink-0"
                          >
                            {copiedId === order.id ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Renew Panel - shown when order is selected */}
            {selectedOrder && (
              <div className="sticky bottom-0 bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 space-y-5 animate-in slide-in-from-bottom-5 duration-300 shadow-2xl shadow-black/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    ต่ออายุ: {selectedOrder.remark}
                  </h3>
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="text-[10px] text-gray-500 hover:text-white transition-colors"
                  >
                    ยกเลิก
                  </button>
                </div>

                {/* Day selector */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">จำนวนวัน</label>
                    <span className="text-cyan-400 font-bold text-lg">{days} วัน</span>
                  </div>

                  {/* Quick select */}
                  <div className="grid grid-cols-6 gap-1.5">
                    {[1, 3, 7, 14, 21, 30].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDays(d)}
                        className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                          days === d 
                            ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' 
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>

                  {/* +/- controls */}
                  <div className="flex items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={() => setDays(Math.max(1, days - 1))}
                      className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:bg-white/10 transition-all active:scale-90"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      value={days}
                      onChange={(e) => setDays(parseInt(e.target.value))}
                      className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={() => setDays(Math.min(30, days + 1))}
                      className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:bg-white/10 transition-all active:scale-90"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Price summary */}
                <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">ราคาต่อวัน ({selectedOrder.server.name})</span>
                    <span className={`font-bold ${hasAnyDiscount ? 'text-pink-400' : 'text-white'}`}>
                      {pricePerDay} ฿/วัน
                      {hasAnyDiscount && <span className="text-gray-600 line-through ml-2">{originalPricePerDay} ฿</span>}
                    </span>
                  </div>
                  {isPackagePrice ? (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">แพ็ค {days} วัน (ราคาพิเศษ)</span>
                      <span className="text-emerald-400 font-bold">{totalPrice} ฿</span>
                    </div>
                  ) : (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{days} วัน x {pricePerDay} ฿</span>
                      <span className="text-white font-bold">{totalPrice} ฿</span>
                    </div>
                  )}
                  <div className="border-t border-white/5 pt-2 flex justify-between">
                    <span className="text-white font-bold">รวมทั้งหมด</span>
                    <span className="text-cyan-400 font-black text-xl">{totalPrice} ฿</span>
                  </div>
                  {isExpired(selectedOrder.expiryTime) ? (
                    <p className="text-[10px] text-gray-600 pt-1">หมดอายุแล้ว — จะต่อจากตอนนี้</p>
                  ) : (
                    <p className="text-[10px] text-gray-600 pt-1">ยังไม่หมดอายุ — จะต่อจากวันหมดอายุเดิม</p>
                  )}
                </div>

                {/* Balance warning */}
                {!canAfford && (
                  <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-red-400 text-xs font-bold">เครดิตไม่เพียงพอ</p>
                      <p className="text-red-400/70 text-[10px]">มี {userInfo?.balance || 0} ฿ ต้องการ {totalPrice} ฿</p>
                    </div>
                    <Link
                      href="/topup"
                      className="px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-[10px] font-bold hover:bg-red-500/30 transition-colors flex-shrink-0"
                    >
                      เติมเงิน
                    </Link>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="button"
                  onClick={handleRenew}
                  disabled={submitting || !canAfford}
                  className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-2xl text-sm font-black text-white uppercase tracking-wider transition-all shadow-lg shadow-cyan-600/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Clock className="w-4 h-4" />
                      ต่ออายุ {days} วัน — {totalPrice} ฿
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
