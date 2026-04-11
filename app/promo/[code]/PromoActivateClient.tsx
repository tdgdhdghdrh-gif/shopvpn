'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Gift, Check, Sparkles, ArrowRight, Percent, Shield, Zap } from 'lucide-react'

interface PromoActivateClientProps {
  promo: {
    code: string
    name: string
    description: string | null
    discountPercent: number
  }
  alreadyActivated: boolean
  currentDiscount: number | null
}

export default function PromoActivateClient({ promo, alreadyActivated, currentDiscount }: PromoActivateClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [activated, setActivated] = useState(alreadyActivated)
  const [error, setError] = useState('')

  async function handleActivate() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/promo/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promo.code }),
      })
      const data = await res.json()
      if (data.success) {
        setActivated(true)
      } else {
        if (data.alreadyActivated) {
          setActivated(true)
        } else {
          setError(data.error || 'เกิดข้อผิดพลาด')
        }
      }
    } catch (err) {
      setError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้')
    } finally {
      setLoading(false)
    }
  }

  // ราคาปกติ 2 บาท/วัน
  const normalPrice = 2
  const discountedPrice = Math.max(0.5, Math.round(normalPrice * (100 - promo.discountPercent) / 100 * 100) / 100)

  return (
    <div className="min-h-dvh bg-transparent text-white flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[50%] bg-purple-600/8 rounded-full blur-[200px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[50%] bg-blue-600/8 rounded-full blur-[200px]" />
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Header Card */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-cyan-500/20 border border-purple-500/20 rounded-3xl flex items-center justify-center relative">
            <Gift className="w-9 h-9 text-purple-400" />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
              <Percent className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{promo.name}</h1>
            {promo.description && (
              <p className="text-sm text-zinc-500 mt-2 max-w-sm mx-auto">{promo.description}</p>
            )}
          </div>
        </div>

        {/* Discount Display */}
        <div className="bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-transparent border border-purple-500/15 rounded-3xl p-6 space-y-5">
          {/* Discount Percentage */}
          <div className="text-center">
            <div className="inline-flex items-baseline gap-1">
              <span className="text-6xl sm:text-7xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                {promo.discountPercent}
              </span>
              <span className="text-2xl font-black text-purple-400">%</span>
            </div>
            <p className="text-sm font-bold text-zinc-400 mt-1">ส่วนลดถาวร</p>
          </div>

          {/* Price Comparison */}
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">ราคาปกติ</p>
              <p className="text-lg font-bold text-zinc-500 line-through">{normalPrice} ฿/วัน</p>
            </div>
            <ArrowRight className="w-5 h-5 text-zinc-600" />
            <div className="text-center">
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">ราคาพิเศษ</p>
              <p className="text-lg font-black text-emerald-400">{discountedPrice} ฿/วัน</p>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 bg-white/[0.03] rounded-xl p-3">
              <Shield className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span className="text-[11px] font-bold text-zinc-400">ลดราคาถาวร</span>
            </div>
            <div className="flex items-center gap-2 bg-white/[0.03] rounded-xl p-3">
              <Zap className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span className="text-[11px] font-bold text-zinc-400">ใช้ได้ทันที</span>
            </div>
          </div>
        </div>

        {/* Action */}
        {activated ? (
          <div className="space-y-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 text-center space-y-2">
              <div className="w-12 h-12 mx-auto bg-emerald-500/20 rounded-2xl flex items-center justify-center">
                <Check className="w-6 h-6 text-emerald-400" />
              </div>
              <p className="text-sm font-bold text-emerald-400">รับส่วนลดสำเร็จแล้ว!</p>
              <p className="text-xs text-zinc-500">ส่วนลด {promo.discountPercent}% ถูกเพิ่มในบัญชีของคุณแล้ว</p>
            </div>
            <button
              onClick={() => router.push('/vpn')}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-2xl text-sm font-black tracking-wide transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              ไปซื้อ VPN เลย
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
                <p className="text-xs text-red-400 font-bold">{error}</p>
              </div>
            )}
            <button
              onClick={handleActivate}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl text-sm font-black tracking-wide transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  กำลังรับส่วนลด...
                </>
              ) : (
                <>
                  <Gift className="w-4 h-4" />
                  รับส่วนลด {promo.discountPercent}% เลย!
                </>
              )}
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="text-center">
          <a href="/" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
            กลับหน้าหลัก
          </a>
        </div>
      </div>
    </div>
  )
}
