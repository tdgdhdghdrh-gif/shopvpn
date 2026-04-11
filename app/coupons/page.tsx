'use client'

import { useState, useEffect } from 'react'
import { Ticket, Search, CheckCircle2, AlertCircle, Gift, Clock, Loader2, History, Sparkles, Copy, Check } from 'lucide-react'
import Navbar from '@/components/Navbar'

interface Redemption {
  id: string
  discount: number
  createdAt: string
  coupon: { code: string; name: string; type: string; value: number }
}

interface CouponInfo {
  code: string; name: string; description: string | null
  type: string; value: number; minPurchase: number
  maxDiscount: number | null; expiresAt: string | null
}

export default function CouponsPage() {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const [couponInfo, setCouponInfo] = useState<CouponInfo | null>(null)
  const [redemptions, setRedemptions] = useState<Redemption[]>([])
  const [message, setMessage] = useState({ type: '', text: '' })
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/user/me').then(r => r.json()).then(d => {
      if (d.user) { setUser(d.user); setIsAdmin(d.user.isAdmin || d.user.isSuperAdmin) }
    }).catch(() => {})
    fetchHistory()
  }, [])

  useEffect(() => {
    if (message.text) {
      const t = setTimeout(() => setMessage({ type: '', text: '' }), 4000)
      return () => clearTimeout(t)
    }
  }, [message])

  async function fetchHistory() {
    try {
      const res = await fetch('/api/coupons')
      const data = await res.json()
      if (data.redemptions) setRedemptions(data.redemptions)
    } catch {} finally { setLoadingHistory(false) }
  }

  async function checkCoupon() {
    if (!code.trim()) return
    setChecking(true)
    setCouponInfo(null)
    try {
      const res = await fetch(`/api/coupons?code=${encodeURIComponent(code.trim())}`)
      const data = await res.json()
      if (data.error) {
        setMessage({ type: 'error', text: data.error })
      } else {
        setCouponInfo(data.coupon)
      }
    } catch {
      setMessage({ type: 'error', text: 'ไม่สามารถเช็คคูปองได้' })
    } finally { setChecking(false) }
  }

  async function redeemCoupon() {
    if (!code.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: data.message })
        setCode('')
        setCouponInfo(null)
        fetchHistory()
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาด' })
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-transparent text-white">
      <Navbar user={user} isAdmin={isAdmin} />

      {/* Toast */}
      {message.text && (
        <div className={`fixed top-20 right-4 left-4 sm:left-auto sm:w-96 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl animate-in slide-in-from-top-5 ${
          message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span className="font-semibold text-xs sm:text-sm">{message.text}</span>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl flex items-center justify-center">
            <Ticket className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">คูปองส่วนลด</h1>
          <p className="text-zinc-500 text-sm">กรอกรหัสคูปองเพื่อรับเครดิตฟรีหรือส่วนลดพิเศษ</p>
        </div>

        {/* Input Section */}
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input
                type="text"
                value={code}
                onChange={(e) => { setCode(e.target.value.toUpperCase()); setCouponInfo(null) }}
                onKeyDown={(e) => e.key === 'Enter' && checkCoupon()}
                placeholder="กรอกรหัสคูปอง..."
                className="w-full bg-black border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm font-bold text-white placeholder:text-zinc-700 focus:border-amber-500/50 transition-all tracking-widest uppercase"
                maxLength={30}
              />
            </div>
            <button
              onClick={checkCoupon}
              disabled={checking || !code.trim()}
              className="px-5 py-3.5 bg-zinc-800 border border-white/10 rounded-xl text-sm font-bold text-white hover:bg-zinc-700 transition-all disabled:opacity-40 shrink-0"
            >
              {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </button>
          </div>

          {/* Coupon Preview */}
          {couponInfo && (
            <div className="bg-gradient-to-br from-amber-600/[0.08] to-transparent border border-amber-500/20 rounded-xl p-5 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-white text-sm">{couponInfo.name}</span>
                </div>
                <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs font-black text-amber-400">
                  {couponInfo.type === 'fixed' ? `${couponInfo.value}฿` : `${couponInfo.value}%`}
                </span>
              </div>
              {couponInfo.description && (
                <p className="text-xs text-zinc-400">{couponInfo.description}</p>
              )}
              <div className="flex flex-wrap gap-2 text-[10px] font-medium">
                {couponInfo.minPurchase > 0 && (
                  <span className="px-2 py-0.5 bg-zinc-800 border border-white/5 rounded text-zinc-500">ขั้นต่ำ {couponInfo.minPurchase}฿</span>
                )}
                {couponInfo.maxDiscount && (
                  <span className="px-2 py-0.5 bg-zinc-800 border border-white/5 rounded text-zinc-500">ลดสูงสุด {couponInfo.maxDiscount}฿</span>
                )}
                {couponInfo.expiresAt && (
                  <span className="px-2 py-0.5 bg-zinc-800 border border-white/5 rounded text-zinc-500">
                    หมดอายุ {new Date(couponInfo.expiresAt).toLocaleDateString('th-TH')}
                  </span>
                )}
              </div>

              <button
                onClick={redeemCoupon}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 border border-amber-500/30 rounded-xl text-sm font-black text-white hover:from-amber-500 hover:to-orange-500 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> กำลังใช้คูปอง...</span>
                ) : (
                  <span className="flex items-center justify-center gap-2"><Gift className="w-4 h-4" /> ใช้คูปองนี้</span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* History */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-zinc-500" />
            <h3 className="text-sm font-bold text-white">ประวัติการใช้คูปอง</h3>
          </div>

          {loadingHistory ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-600" />
            </div>
          ) : redemptions.length === 0 ? (
            <div className="text-center py-12 text-zinc-600 text-sm">ยังไม่เคยใช้คูปอง</div>
          ) : (
            <div className="space-y-2">
              {redemptions.map((r) => (
                <div key={r.id} className="flex items-center gap-3 p-4 bg-zinc-900/50 border border-white/5 rounded-xl">
                  <div className="w-9 h-9 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-center shrink-0">
                    <Ticket className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white truncate">{r.coupon.name}</span>
                      <span className="px-1.5 py-0.5 bg-zinc-800 border border-white/5 rounded text-[9px] font-bold text-zinc-500 tracking-wider">{r.coupon.code}</span>
                    </div>
                    <p className="text-[11px] text-zinc-600 mt-0.5">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {new Date(r.createdAt).toLocaleString('th-TH')}
                    </p>
                  </div>
                  <span className="text-emerald-400 font-black text-sm">+{r.discount}฿</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
