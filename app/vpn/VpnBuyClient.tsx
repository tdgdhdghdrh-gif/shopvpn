'use client'

import { useState, useEffect } from 'react'
import { 
  Wifi, 
  Calendar, 
  Edit3,
  ChevronRight,
  Minus,
  Plus,
  Gift,
  Server,
  Wallet,
  Check,
  Sparkles,
  Zap,
  Shield
} from 'lucide-react'

interface VpnBuyClientProps {
  serverId: string
  server: {
    flag: string
    name: string
    host: string
  }
  user: {
    balance: number
    hasDiscount: boolean
    name: string
  }
}

// Success Animation Component
function SuccessAnimation({ message, subMessage, onComplete }: { message: string, subMessage: string, onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-emerald-500 rounded-full animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 0.5}s`,
              animationDuration: '1s'
            }}
          />
        ))}
        {[...Array(10)].map((_, i) => (
          <div
            key={`spark-${i}`}
            className="absolute w-1 h-1 bg-blue-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `sparkle 0.8s ease-out ${Math.random() * 0.3}s forwards`
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative text-center">
        {/* Glowing circle */}
        <div className="relative w-32 h-32 mx-auto mb-6">
          {/* Outer glow rings */}
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
          <div className="absolute inset-2 bg-emerald-500/30 rounded-full animate-pulse" />
          <div className="absolute inset-4 bg-emerald-500/40 rounded-full" />
          
          {/* Inner circle with checkmark */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/50 animate-bounce">
              <Check className="w-10 h-10 text-white stroke-[3]" />
            </div>
          </div>
          
          {/* Orbiting particles */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s' }}>
            <div className="absolute -top-1 left-1/2 w-3 h-3 bg-blue-400 rounded-full shadow-lg shadow-blue-400/50" />
          </div>
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }}>
            <div className="absolute top-1/2 -right-1 w-2 h-2 bg-purple-400 rounded-full shadow-lg shadow-purple-400/50" />
          </div>
        </div>

        {/* Success text */}
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-white animate-fade-in-up">
            {message}
          </h2>
          <p className="text-emerald-400 text-lg animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {subMessage}
          </p>
        </div>

        {/* Loading bar */}
        <div className="mt-8 w-64 h-1 bg-zinc-800 rounded-full overflow-hidden mx-auto">
          <div className="h-full bg-gradient-to-r from-emerald-400 to-blue-500 animate-progress" />
        </div>
        
        {/* Status icons */}
        <div className="mt-6 flex justify-center gap-4">
          <div className="flex items-center gap-2 text-zinc-500 text-sm animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>ปลอดภัย</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-500 text-sm animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <Zap className="w-4 h-4 text-amber-400" />
            <span>เร็วแรง</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-500 text-sm animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>พร้อมใช้งาน</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes sparkle {
          0% { transform: scale(0) rotate(0deg); opacity: 1; }
          100% { transform: scale(2) rotate(180deg); opacity: 0; }
        }
        @keyframes fade-in-up {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
        .animate-fade-in {
          animation: fade-in-up 0.5s ease-out forwards;
          opacity: 0;
        }
        .animate-progress {
          animation: progress 2s ease-out forwards;
        }
      `}</style>
    </div>
  )
}

export default function VpnBuyClient({ serverId, server, user }: VpnBuyClientProps) {
  const [days, setDays] = useState(1)
  const [customName, setCustomName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTrialSubmitting, setIsTrialSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [successData, setSuccessData] = useState({ message: '', subMessage: '', redirect: '' })
  
  const PRICE_PER_DAY = user.hasDiscount ? 1 : 2
  const totalPrice = days * PRICE_PER_DAY

  const handleDecrease = () => setDays(prev => Math.max(1, prev - 1))
  const handleIncrease = () => setDays(prev => Math.min(30, prev + 1))
  const handleQuickSelect = (d: number) => setDays(d)

  const handleSuccessComplete = () => {
    window.location.href = successData.redirect
  }

  const handleTrial = async () => {
    setIsTrialSubmitting(true)
    setMessage('')
    
    try {
      const formData = new FormData()
      formData.append('serverId', serverId)
      formData.append('trial', 'true')
      
      const res = await fetch('/api/vpn/buy', {
        method: 'POST',
        body: formData
      })
      
      const data = await res.json()
      
      if (data.success) {
        setSuccessData({
          message: 'สร้างสำเร็จ!',
          subMessage: 'บัญชีทดลองของคุณพร้อมใช้งานแล้ว',
          redirect: '/profile/orders'
        })
        setShowSuccess(true)
      } else {
        setMessage(data.error || 'สร้างบัญชีทดลองไม่สำเร็จ')
      }
    } catch (err) {
      setMessage('เกิดข้อผิดพลาด')
    } finally {
      setIsTrialSubmitting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')
    
    try {
      const formData = new FormData()
      formData.append('serverId', serverId)
      formData.append('days', days.toString())
      formData.append('customName', customName)
      
      const res = await fetch('/api/vpn/buy', {
        method: 'POST',
        body: formData
      })
      
      const data = await res.json()
      
      if (data.success) {
        setSuccessData({
          message: 'สั่งซื้อสำเร็จ!',
          subMessage: `VPN ${days} วันพร้อมใช้งานแล้ว`,
          redirect: '/profile/orders'
        })
        setShowSuccess(true)
      } else {
        setMessage(data.error || 'สั่งซื้อไม่สำเร็จ')
      }
    } catch (err) {
      setMessage('เกิดข้อผิดพลาด')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {showSuccess && (
        <SuccessAnimation 
          message={successData.message}
          subMessage={successData.subMessage}
          onComplete={handleSuccessComplete}
        />
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Server Info */}
        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Server className="w-6 h-6 text-blue-500" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-white">{server.flag} {server.name}</div>
              <div className="text-xs text-zinc-500">{server.host}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-zinc-500">ราคา/วัน</div>
              <div className="text-sm font-medium text-emerald-400">{PRICE_PER_DAY} ฿</div>
            </div>
          </div>
        </div>

        {message && !showSuccess && (
          <div className={`p-4 rounded-xl text-sm ${message.includes('สำเร็จ') ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
            {message}
          </div>
        )}

        {/* Custom Name */}
        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
          <label className="block text-sm font-medium text-zinc-400 mb-3">
            <span className="flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              ตั้งชื่อบัญชี (ไม่บังคับ)
            </span>
          </label>
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="เช่น มือถือคุณแม่, iPhone ของฉัน"
            className="w-full px-4 py-3 rounded-lg bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors text-sm"
            maxLength={30}
          />
          <p className="mt-2 text-xs text-zinc-500">ถ้าไม่กรอกจะใช้ชื่อแบบสุ่ม</p>
        </div>

        {/* Days Selection */}
        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
          <label className="block text-sm font-medium text-zinc-400 mb-4">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              จำนวนวัน
            </span>
          </label>
          
          <div className="flex items-center gap-4 mb-4">
            <button
              type="button"
              onClick={handleDecrease}
              className="w-12 h-12 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
            >
              <Minus className="w-5 h-5" />
            </button>
            <input
              type="number"
              min="1"
              max="30"
              value={days}
              onChange={(e) => setDays(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
              className="flex-1 text-center px-4 py-3 rounded-xl bg-black border border-zinc-800 text-white text-2xl font-bold focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              type="button"
              onClick={handleIncrease}
              className="w-12 h-12 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Select */}
          <div className="grid grid-cols-4 gap-2">
            {[1, 7, 15, 30].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => handleQuickSelect(d)}
                className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-colors ${
                  days === d 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white'
                }`}
              >
                {d} วัน
              </button>
            ))}
          </div>
        </div>

        {/* Free Trial Banner */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Gift className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-white text-sm">ทดลองใช้ฟรี 1 ชั่วโมง</h3>
              <p className="text-zinc-500 text-xs">ต่อบัญชี (รีเซ็ตทุกเที่ยงคืน)</p>
            </div>
            <button
              type="button"
              onClick={handleTrial}
              disabled={isTrialSubmitting}
              className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isTrialSubmitting ? 'กำลังสร้าง...' : 'ใช้ฟรี'}
            </button>
          </div>
        </div>

        {/* Price Summary */}
        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
          <div className="flex justify-between items-center text-sm mb-3">
            <span className="text-zinc-500 flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              เครดิตคงเหลือ
            </span>
            <span className="text-white font-mono">{user.balance} ฿</span>
          </div>
          <div className="flex justify-between items-center text-sm mb-3">
            <span className="text-zinc-500">จำนวนวัน</span>
            <span className="text-white">{days} วัน</span>
          </div>
          <div className="flex justify-between items-center text-sm mb-3">
            <span className="text-zinc-500">ราคา/วัน</span>
            <span className="text-white">{PRICE_PER_DAY} ฿</span>
          </div>
          <div className="border-t border-zinc-800 pt-3 flex justify-between items-center">
            <span className="text-zinc-400">รวมทั้งสิ้น</span>
            <span className="text-emerald-400 font-bold text-2xl">{totalPrice} ฿</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <Wifi className="w-5 h-5" />
          {isSubmitting ? 'กำลังดำเนินการ...' : 'สั่งซื้อ VPN'}
          <ChevronRight className="w-4 h-4" />
        </button>
      </form>
    </>
  )
}
