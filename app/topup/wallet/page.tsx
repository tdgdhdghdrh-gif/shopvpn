'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, Gift, Wallet, AlertCircle, CheckCircle2, Loader2, 
  Copy, Link as LinkIcon, AlertTriangle, Zap, Shield, Clock,
  ChevronRight, Info
} from 'lucide-react'

export default function WalletTopupPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [minTopup, setMinTopup] = useState(60)

  useEffect(() => {
    fetch('/api/settings/public')
      .then(res => res.json())
      .then(data => {
        if (data.settings?.minTopupAmount) setMinTopup(data.settings.minTopupAmount)
      })
      .catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!url.trim()) {
      setMessage({ type: 'error', text: 'กรุณากรอกลิงก์ซองเล็ท' })
      return
    }

    if (!url.includes('gift.truemoney.com')) {
      setMessage({ type: 'error', text: 'ลิงก์ซองเล็ทไม่ถูกต้อง' })
      return
    }

    setShowConfirm(true)
  }

  async function confirmTopup() {
    setLoading(true)
    setMessage({ type: '', text: '' })
    setShowConfirm(false)

    try {
      const res = await fetch('/api/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), type: 'wallet' })
      })

      const data = await res.json()

      if (data.success) {
        window.location.href = `/profile/topups?success=true&amount=${data.amount}&balance=${data.newBalance}`
      } else {
        setMessage({ type: 'error', text: data.error || 'เติมเงินไม่สำเร็จ' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาด กรุณาลองใหม่' })
    } finally {
      setLoading(false)
    }
  }

  const copyExample = () => {
    setUrl('https://gift.truemoney.com/campaign/?v=xxxxxxxxxxxx')
    setMessage({ type: '', text: '' })
  }

  return (
    <div className="min-h-screen bg-transparent text-white font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-14">
            <Link 
              href="/topup" 
              className="p-2 -ml-2 hover:bg-white/5 rounded-xl transition-all active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-400" />
            </Link>
            <div className="ml-3">
              <h1 className="text-sm font-semibold text-white">เติมด้วยซองเล็ท</h1>
              <p className="text-[10px] text-zinc-500">TrueMoney Wallet</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-5 pb-12">

        {/* Hero */}
        <div className="relative overflow-hidden bg-zinc-900/50 border border-white/5 rounded-2xl p-5 sm:p-7 mb-5">
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-orange-500/8 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative flex items-center gap-4 sm:gap-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/25 shrink-0">
              <Gift className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-white">ซองของขวัญ</h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">เติมเงินอัตโนมัติผ่าน TrueMoney Wallet</p>
            </div>
          </div>

          {/* Quick info pills */}
          <div className="relative flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <Zap className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] font-medium text-emerald-400">อัตโนมัติ</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <Clock className="w-3 h-3 text-blue-400" />
              <span className="text-[10px] font-medium text-blue-400">เข้าทันที</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <Shield className="w-3 h-3 text-purple-400" />
              <span className="text-[10px] font-medium text-purple-400">ปลอดภัย 100%</span>
            </div>
          </div>
        </div>

        {/* Two-column layout on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Left: Form */}
          <div className="lg:col-span-3 space-y-4">

            {/* Message */}
            {message.text && (
              <div className={`p-3 rounded-xl flex items-center gap-2.5 text-xs sm:text-sm ${
                message.type === 'success' 
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                  : 'bg-red-500/10 border border-red-500/20 text-red-400'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            {/* Form Card */}
            <form onSubmit={handleSubmit}>
              <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5">
                <label className="flex items-center gap-2 text-xs font-semibold text-zinc-300 mb-3">
                  <LinkIcon className="w-3.5 h-3.5 text-red-400" />
                  ลิงก์ซองของขวัญ
                </label>
                <textarea
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://gift.truemoney.com/campaign/?v=..."
                  className="w-full h-24 bg-black/50 border border-white/10 rounded-xl px-3.5 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-500/40 focus:ring-1 focus:ring-red-500/20 transition-all resize-none font-mono"
                />
                <button
                  type="button"
                  onClick={copyExample}
                  className="mt-2 text-[11px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  ใส่ตัวอย่างลิงก์
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 hover:shadow-red-500/30 active:scale-[0.98] text-sm group/btn relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin relative z-10" />
                ) : (
                  <Wallet className="w-4 h-4 relative z-10" />
                )}
                <span className="relative z-10">{loading ? 'กำลังตรวจสอบ...' : 'เติมเงินเลย'}</span>
              </button>
            </form>

            {/* Warning note */}
            <div className="p-3 bg-amber-500/8 border border-amber-500/15 rounded-xl flex items-start gap-2.5">
              <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-400/80 leading-relaxed">
                ระบบจะตรวจสอบและเติมเงินอัตโนมัติ ยอดเงินจะเข้าทันทีหลังตรวจสอบสำเร็จ เติมขั้นต่ำ <span className="font-bold text-amber-400">{minTopup} บาท</span>
              </p>
            </div>
          </div>

          {/* Right: Steps */}
          <div className="lg:col-span-2">
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5">
              <h3 className="text-xs font-semibold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-4 rounded-full bg-gradient-to-b from-red-400 to-orange-400" />
                วิธีใช้งาน
              </h3>
              <div className="space-y-2.5">
                {[
                  { step: '1', text: 'เปิดแอพ TrueMoney Wallet', sub: 'แอพสีแดงในมือถือ' },
                  { step: '2', text: 'สร้างซองของขวัญ', sub: 'กด "ซองของขวัญ" แล้วกำหนดจำนวน' },
                  { step: '3', text: 'คัดลอกลิงก์ซอง', sub: 'กดแชร์แล้วเลือก "คัดลอกลิงก์"' },
                  { step: '4', text: 'วางลิงก์แล้วกดเติมเงิน', sub: 'วางในช่องด้านบน แล้วกดปุ่ม' }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-2.5 bg-black/30 border border-white/5 rounded-xl">
                    <div className="w-7 h-7 bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/20 rounded-lg flex items-center justify-center text-[11px] font-bold text-red-400 shrink-0">
                      {item.step}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-white">{item.text}</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/10 rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 w-full sm:max-w-sm animate-slide-up">
            {/* Handle bar for mobile */}
            <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-4 sm:hidden" />
            
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">ยืนยันการเติมเงิน</h3>
                <p className="text-[10px] text-zinc-500 mt-0.5">กรุณาตรวจสอบก่อนกดยืนยัน</p>
              </div>
            </div>
            
            <div className="space-y-2.5 mb-5">
              <div className="p-3 bg-zinc-800/50 border border-white/5 rounded-xl flex items-center justify-between">
                <span className="text-xs text-zinc-400">เติมเงินขั้นต่ำ</span>
                <span className="text-sm font-bold text-white">{minTopup} บาท</span>
              </div>
              <div className="p-3 bg-red-500/8 border border-red-500/15 rounded-xl">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-red-400 leading-relaxed">
                    <strong>ไม่คืนเงิน</strong> หากเติมผิดบัญชี หรือกดยืนยันผิด
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium rounded-xl transition-colors border border-white/5"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmTopup}
                disabled={loading}
                className="flex-1 py-2.5 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                ยืนยันเติมเงิน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
