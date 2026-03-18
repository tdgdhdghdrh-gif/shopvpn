'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Gift, Wallet, AlertCircle, CheckCircle2, Loader2, Copy, Link as LinkIcon } from 'lucide-react'

export default function WalletTopupPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!url.trim()) {
      setMessage({ type: 'error', text: 'กรุณากรอกลิงก์ซองเล็ท' })
      return
    }

    setLoading(true)
    setMessage({ type: '', text: '' })

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
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/60 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-md mx-auto px-4 sm:px-6">
          <div className="flex items-center h-14 sm:h-16">
            <Link 
              href="/topup" 
              className="p-2 -ml-2 hover:bg-white/10 rounded-xl transition-all active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="ml-3 text-base sm:text-lg font-semibold">เติมด้วยซองเล็ท</h1>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 sm:px-6 py-6">
        {/* Hero Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-red-500/20 via-orange-500/10 to-transparent border border-red-500/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6">
          <div className="absolute -top-10 -right-10 w-32 h-32 sm:w-40 sm:h-40 bg-red-500/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-24 h-24 sm:w-32 sm:h-32 bg-orange-500/20 rounded-full blur-3xl" />
          
          <div className="relative text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-xl shadow-red-500/30">
              <Gift className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">ซองของขวัญ</h2>
            <p className="text-gray-400 text-sm sm:text-base">เติมเงินอัตโนมัติผ่าน TrueMoney Wallet</p>
          </div>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-3 sm:p-4 rounded-xl sm:rounded-2xl flex items-center gap-2 sm:gap-3 ${
            message.type === 'success' 
              ? 'bg-green-500/10 border border-green-500/30 text-green-400' 
              : 'bg-red-500/10 border border-red-500/30 text-red-400'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            )}
            <span className="text-xs sm:text-sm">{message.text}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-red-400" />
              ลิงก์ซองของขวัญ
            </label>
            <textarea
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://gift.truemoney.com/campaign/?v=..."
              className="w-full h-24 sm:h-28 bg-black/50 border border-white/10 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/10 transition-all resize-none text-sm"
            />
            <button
              type="button"
              onClick={copyExample}
              className="mt-2 text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 transition-colors"
            >
              <Copy className="w-3 h-3" />
              ใส่ตัวอย่างลิงก์
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 sm:py-4 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-bold rounded-xl sm:rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 hover:shadow-red-500/30 active:scale-[0.98] text-sm sm:text-base"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
            ) : (
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
            {loading ? 'กำลังตรวจสอบ...' : 'เติมเงินเลย'}
          </button>
        </form>

        {/* Steps */}
        <div className="mt-8 sm:mt-10">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2 text-sm sm:text-base">
            วิธีใช้งาน
          </h3>
          <div className="space-y-3">
            {[
              { step: '1', text: 'เปิดแอพ TrueMoney Wallet' },
              { step: '2', text: 'กด "ซองของขวัญ" แล้วสร้างซอง' },
              { step: '3', text: 'คัดลอกลิงก์ซองเล็ท' },
              { step: '4', text: 'วางลิงก์แล้วกดเติมเงิน' }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/20 rounded-lg sm:rounded-xl flex items-center justify-center text-sm sm:text-base font-bold text-red-400 flex-shrink-0">
                  {item.step}
                </div>
                <span className="text-sm sm:text-base text-gray-300">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Note */}
        <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg sm:rounded-xl">
          <p className="text-xs text-yellow-400/80 text-center">
            ระบบจะตรวจสอบและเติมเงินอัตโนมัติ ยอดเงินจะเข้าทันทีหลังตรวจสอบสำเร็จ
          </p>
        </div>
      </main>
    </div>
  )
}
