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
  Wallet,
  Check,
  Sparkles,
  Zap,
  Shield,
  MonitorSmartphone,
  Tag,
  CreditCard,
  ArrowUpRight,
  Signal,
  X,
  AlertTriangle
} from 'lucide-react'

interface InboundOption {
  inboundId: number
  carrier: string
  remark: string
}

interface VpnBuyClientProps {
  serverId: string
  server: {
    flag: string
    name: string
    pricePerDay: number
    priceWeekly: number | null
    priceMonthly: number | null
    customPackages: { days: number; price: number; label: string }[]
    description: string | null
    badge: string | null
    defaultIpLimit: number
    maxClients: number
    activeClients: number
    features: string[]
  }
  user: {
    balance: number
    hasDiscount: boolean
    name: string
    promoDiscountPercent: number
  }
  inboundOptions: InboundOption[]
}

// Success Animation Component
function SuccessAnimation({ message, subMessage, onComplete }: { message: string, subMessage: string, onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
      <div className="relative text-center px-6">
        {/* Glow ring */}
        <div className="relative w-28 h-28 mx-auto mb-8">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
          <div className="absolute inset-3 bg-emerald-500/10 rounded-full animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/30">
              <Check className="w-10 h-10 text-white stroke-[3]" />
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2 animate-fade-in-up">
          {message}
        </h2>
        <p className="text-emerald-400 text-sm animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          {subMessage}
        </p>

        {/* Progress bar */}
        <div className="mt-8 w-48 h-1 bg-zinc-800 rounded-full overflow-hidden mx-auto">
          <div className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 animate-progress rounded-full" />
        </div>
        
        <div className="mt-5 flex justify-center gap-5">
          <div className="flex items-center gap-1.5 text-zinc-600 text-[11px] animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>Secure</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-600 text-[11px] animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Fast</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-600 text-[11px] animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <Sparkles className="w-3.5 h-3.5 text-violet-500" />
            <span>Ready</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          0% { transform: translateY(16px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.4s ease-out forwards;
        }
        .animate-fade-in {
          animation: fade-in-up 0.4s ease-out forwards;
          opacity: 0;
        }
        .animate-progress {
          animation: progress 2.2s ease-out forwards;
        }
      `}</style>
    </div>
  )
}

export default function VpnBuyClient({ serverId, server, user, inboundOptions }: VpnBuyClientProps) {
  const [days, setDays] = useState(1)
  const [customName, setCustomName] = useState('')
  const [ipLimit, setIpLimit] = useState(server.defaultIpLimit || 0)
  const [selectedInboundId, setSelectedInboundId] = useState<number | null>(
    inboundOptions.length === 1 ? inboundOptions[0].inboundId : null
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTrialSubmitting, setIsTrialSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [successData, setSuccessData] = useState({ message: '', subMessage: '', redirect: '' })
  const [trialEnabled, setTrialEnabled] = useState(true)
  const [trialDurationMinutes, setTrialDurationMinutes] = useState(60)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  // Fetch trial settings from public API
  useEffect(() => {
    fetch('/api/settings/public')
      .then(res => res.json())
      .then(data => {
        if (data.settings) {
          setTrialEnabled(data.settings.trialEnabled ?? true)
          setTrialDurationMinutes(data.settings.trialDurationMinutes ?? 60)
        }
      })
      .catch(() => {})
  }, [])

  const needsSelection = inboundOptions.length > 1
  
  // Use per-server pricing
  const basePricePerDay = server.pricePerDay ?? 2
  let PRICE_PER_DAY = user.hasDiscount ? basePricePerDay * 0.5 : basePricePerDay
  if (user.promoDiscountPercent > 0) {
    PRICE_PER_DAY = Math.max(0.5, Math.round(PRICE_PER_DAY * (100 - user.promoDiscountPercent) / 100 * 100) / 100)
  }

  // Calculate total with package pricing support
  const ipCost = ipLimit > 0 ? ipLimit * 1 : 0
  let baseCost = days * PRICE_PER_DAY
  
  // Check for package pricing (weekly / monthly / custom packages)
  let packagePrice: number | null = null
  if (days === 7 && server.priceWeekly != null) {
    packagePrice = server.priceWeekly
  } else if (days === 30 && server.priceMonthly != null) {
    packagePrice = server.priceMonthly
  } else {
    const matchedPkg = server.customPackages.find(p => p.days === days)
    if (matchedPkg) packagePrice = matchedPkg.price
  }

  if (packagePrice != null) {
    baseCost = user.hasDiscount ? packagePrice * 0.5 : packagePrice
    if (user.promoDiscountPercent > 0) {
      baseCost = Math.max(0.5, Math.round(baseCost * (100 - user.promoDiscountPercent) / 100 * 100) / 100)
    }
  }
  
  const totalPrice = baseCost + ipCost
  const canAfford = totalPrice <= user.balance
  const isPackagePrice = packagePrice != null

  const handleDecrease = () => setDays(prev => Math.max(1, prev - 1))
  const maxDays = server.customPackages.length > 0 ? Math.max(365, ...server.customPackages.map(p => p.days)) : 365
  const handleIncrease = () => setDays(prev => Math.min(maxDays, prev + 1))

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
      if (selectedInboundId !== null) formData.append('selectedInboundId', selectedInboundId.toString())
      
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

  const doPurchase = async () => {
    setIsSubmitting(true)
    setMessage('')
    
    try {
      const formData = new FormData()
      formData.append('serverId', serverId)
      formData.append('days', days.toString())
      formData.append('customName', customName)
      formData.append('ipLimit', ipLimit.toString())
      if (selectedInboundId !== null) formData.append('selectedInboundId', selectedInboundId.toString())
      
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await doPurchase()
  }

  const openConfirmModal = () => {
    setAgreedToTerms(false)
    setShowConfirmModal(true)
  }

  const handleConfirmPurchase = async () => {
    if (!agreedToTerms) return
    setShowConfirmModal(false)
    await doPurchase()
  }

  // Helper to format package price with discount
  const fmtPkg = (price: number | null) => {
    if (price == null) return null
    let p = user.hasDiscount ? price * 0.5 : price
    if (user.promoDiscountPercent > 0) p = Math.max(0.5, Math.round(p * (100 - user.promoDiscountPercent) / 100 * 100) / 100)
    return `${p} ฿`
  }

  const quickDays = [
    { value: 1, label: '1 วัน', sub: `${PRICE_PER_DAY} ฿` },
    { value: 7, label: '7 วัน', sub: fmtPkg(server.priceWeekly) || '1 สัปดาห์' },
    { value: 30, label: '30 วัน', sub: fmtPkg(server.priceMonthly) || '1 เดือน' },
    ...server.customPackages
      .sort((a, b) => a.days - b.days)
      .map(pkg => ({ value: pkg.days, label: pkg.label || `${pkg.days} วัน`, sub: fmtPkg(pkg.price) || `${pkg.days} วัน` })),
  ]

  return (
    <>
      {showSuccess && (
        <SuccessAnimation 
          message={successData.message}
          subMessage={successData.subMessage}
          onComplete={handleSuccessComplete}
        />
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Error/Success Message */}
        {message && !showSuccess && (
          <div className={`p-3.5 rounded-2xl text-sm font-medium flex items-center gap-3 ${
            message.includes('สำเร็จ') 
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
              message.includes('สำเร็จ') ? 'bg-emerald-500/20' : 'bg-red-500/20'
            }`}>
              {message.includes('สำเร็จ') ? <Check className="w-4 h-4" /> : <span className="text-sm">!</span>}
            </div>
            <span>{message}</span>
          </div>
        )}

        {/* === SECTION: Inbound / Plan Selection === */}
        {inboundOptions.length > 1 && (
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 overflow-hidden">
            <div className="p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-violet-500/10 flex items-center justify-center">
                  <Signal className="w-3.5 h-3.5 text-violet-400" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-zinc-200 block leading-tight">เลือกแพ็กเกจ</span>
                  <span className="text-[11px] text-zinc-600">เลือกแพ็กเกจที่ตรงกับเครือข่ายของคุณ</span>
                </div>
              </div>
              <div className="space-y-2">
                {inboundOptions.map((opt) => {
                  const isSelected = selectedInboundId === opt.inboundId
                  const isAis = opt.carrier === 'ais'
                  const isTrue = opt.carrier === 'true'
                  const isDtac = opt.carrier === 'dtac'

                  // Carrier badge colors
                  const badgeBg = isAis 
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' 
                    : isTrue 
                    ? 'bg-red-500/15 text-red-400 border-red-500/20' 
                    : isDtac 
                    ? 'bg-blue-500/15 text-blue-400 border-blue-500/20' 
                    : 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20'

                  const badgeLabel = isAis ? 'AIS' : isTrue ? 'TRUE' : isDtac ? 'DTAC' : opt.carrier.toUpperCase()

                  // Selected glow color
                  const glowColor = isAis 
                    ? 'ring-emerald-500/30 border-emerald-500/40' 
                    : isTrue 
                    ? 'ring-red-500/30 border-red-500/40' 
                    : isDtac 
                    ? 'ring-blue-500/30 border-blue-500/40' 
                    : 'ring-white/20 border-white/30'

                  return (
                    <button
                      key={opt.inboundId}
                      type="button"
                      onClick={() => setSelectedInboundId(opt.inboundId)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl text-left transition-all active:scale-[0.98] ${
                        isSelected
                          ? `bg-zinc-900/80 ring-2 ${glowColor} shadow-lg`
                          : 'bg-zinc-900/40 border border-zinc-800/60 hover:bg-zinc-800/50 hover:border-zinc-700/60'
                      }`}
                    >
                      {/* Radio indicator */}
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        isSelected 
                          ? isAis ? 'border-emerald-400 bg-emerald-500/20' 
                            : isTrue ? 'border-red-400 bg-red-500/20' 
                            : isDtac ? 'border-blue-400 bg-blue-500/20' 
                            : 'border-white bg-white/20'
                          : 'border-zinc-700'
                      }`}>
                        {isSelected && (
                          <div className={`w-2.5 h-2.5 rounded-full ${
                            isAis ? 'bg-emerald-400' 
                            : isTrue ? 'bg-red-400' 
                            : isDtac ? 'bg-blue-400' 
                            : 'bg-white'
                          }`} />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm font-semibold block truncate ${
                          isSelected ? 'text-white' : 'text-zinc-300'
                        }`}>
                          {opt.remark || `Inbound #${opt.inboundId}`}
                        </span>
                      </div>

                      {/* Carrier badge */}
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border flex-shrink-0 ${badgeBg}`}>
                        {badgeLabel}
                      </span>
                    </button>
                  )
                })}
              </div>
              {selectedInboundId === null && (
                <p className="text-[11px] text-amber-500/80 mt-2.5 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-amber-500/80" />
                  กรุณาเลือกแพ็กเกจก่อนสั่งซื้อ
                </p>
              )}
            </div>
          </div>
        )}

        {/* === Features (mobile - shown only when admin defines features) === */}
        {server.features && server.features.length > 0 && (
          <div className="lg:hidden rounded-2xl border border-zinc-800/80 bg-zinc-950 overflow-hidden">
            <div className="p-5">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-zinc-200 block leading-tight">จุดเด่น</span>
                  <span className="text-[11px] text-zinc-600">รายละเอียดเซิร์ฟเวอร์</span>
                </div>
              </div>
              <div className="space-y-1.5">
                {server.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2.5 py-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 flex-shrink-0" />
                    <span className="text-xs text-zinc-400">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* === SECTION 1: Account Name === */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 overflow-hidden">
          <div className="p-5">
            <div className="flex items-center gap-2.5 mb-3.5">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/10 flex items-center justify-center">
                <Edit3 className="w-3.5 h-3.5 text-violet-400" />
              </div>
              <div>
                <span className="text-sm font-semibold text-zinc-200 block leading-tight">ตั้งชื่อบัญชี</span>
                <span className="text-[11px] text-zinc-600">ตั้งชื่อเพื่อให้จำได้ง่าย</span>
              </div>
            </div>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="เช่น iPhone ของฉัน, มือถือคุณแม่"
              className="w-full px-4 py-3.5 rounded-xl bg-black/60 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-700 transition-all text-sm"
              maxLength={30}
              required
            />
            <div className="flex justify-between mt-2">
              <p className="text-[11px] text-zinc-700">จะแสดงในรายการ VPN ของคุณ</p>
              <p className="text-[11px] text-zinc-700 tabular-nums">{customName.length}/30</p>
            </div>
          </div>
        </div>

        {/* === SECTION 2: Duration === */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 overflow-hidden">
          <div className="p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/10 flex items-center justify-center">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div>
                <span className="text-sm font-semibold text-zinc-200 block leading-tight">ระยะเวลา</span>
                <span className="text-[11px] text-zinc-600">เลือกจำนวนวันที่ต้องการ</span>
              </div>
            </div>

            {/* Quick select pills */}
            <div className={`grid gap-2 mb-4 ${quickDays.length <= 4 ? 'grid-cols-4' : quickDays.length <= 6 ? 'grid-cols-3' : 'grid-cols-4'}`}>
              {quickDays.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setDays(d.value)}
                  className={`relative py-3 sm:py-3.5 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
                    days === d.value 
                      ? 'bg-white text-black shadow-lg shadow-white/5 ring-1 ring-white/20' 
                      : 'bg-zinc-900/80 hover:bg-zinc-800/80 text-zinc-400 border border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <span className="block">{d.label}</span>
                  {d.sub && (
                    <span className={`block text-[10px] mt-0.5 ${days === d.value ? 'text-black/60' : 'text-zinc-600'}`}>{d.sub}</span>
                  )}
                  {(d.value >= 90) && (
                    <span className="absolute -top-2 -right-1.5 px-1.5 py-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-[8px] font-bold text-white rounded-md uppercase shadow-sm">Save</span>
                  )}
                </button>
              ))}
            </div>

            {/* Stepper */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDecrease}
                disabled={days <= 1}
                className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 flex items-center justify-center transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Minus className="w-4 h-4 text-zinc-400" />
              </button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={days}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1
                    setDays(Math.max(1, Math.min(maxDays, val)))
                  }}
                  className="w-full text-center py-3 rounded-xl bg-black/60 border border-zinc-800 text-white text-2xl font-bold focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-700 transition-all [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-600 font-medium">วัน</span>
              </div>
              <button
                type="button"
                onClick={handleIncrease}
                disabled={days >= maxDays}
                className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 flex items-center justify-center transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4 text-zinc-400" />
              </button>
            </div>
          </div>
        </div>

        {/* === SECTION 3: IP Limit === */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 overflow-hidden">
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/10 flex items-center justify-center">
                  <MonitorSmartphone className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-zinc-200 block leading-tight">จำกัดอุปกรณ์</span>
                  <span className="text-[11px] text-zinc-600">
                    {ipLimit === 0 ? 'ไม่จำกัดจำนวนเครื่อง' : `จำกัด ${ipLimit} เครื่อง (+${ipCost} ฿)`}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIpLimit(ipLimit > 0 ? 0 : 2)}
                className={`relative w-12 h-7 rounded-full transition-all duration-300 flex-shrink-0 ${
                  ipLimit > 0 
                    ? 'bg-emerald-500 shadow-inner shadow-emerald-600/50' 
                    : 'bg-zinc-800 border border-zinc-700'
                }`}
              >
                <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-all duration-300 ${
                  ipLimit > 0 ? 'translate-x-[22px]' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            {/* IP stepper */}
            {ipLimit > 0 && (
              <div className="mt-4 pt-4 border-t border-zinc-800/50">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIpLimit(prev => Math.max(1, prev - 1))}
                    disabled={ipLimit <= 1}
                    className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 flex items-center justify-center transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-3.5 h-3.5 text-zinc-400" />
                  </button>
                  <div className="flex-1 flex items-center justify-center gap-2">
                    <span className="text-2xl font-bold text-white tabular-nums">{ipLimit}</span>
                    <span className="text-xs text-zinc-500">อุปกรณ์</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIpLimit(prev => Math.min(10, prev + 1))}
                    disabled={ipLimit >= 10}
                    className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 flex items-center justify-center transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-3.5 h-3.5 text-zinc-400" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* === SECTION 4: Free Trial === */}
        {trialEnabled && (
        <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 overflow-hidden">
          <div className="p-5 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <Gift className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white text-sm">ทดลองใช้ฟรี {trialDurationMinutes >= 60 ? `${Math.floor(trialDurationMinutes / 60)} ชม.${trialDurationMinutes % 60 > 0 ? ` ${trialDurationMinutes % 60} นาที` : ''}` : `${trialDurationMinutes} นาที`}</h3>
              <p className="text-zinc-500 text-[11px]">1 ครั้งต่อเซิร์ฟเวอร์ (รีเซ็ตทุกเที่ยงคืน)</p>
            </div>
            <button
              type="button"
              onClick={handleTrial}
              disabled={isTrialSubmitting || (needsSelection && selectedInboundId === null)}
              className="px-5 py-2.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-bold rounded-xl transition-all border border-emerald-500/20 hover:border-emerald-500/30 disabled:opacity-50 active:scale-95 whitespace-nowrap"
            >
              {isTrialSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                  รอสักครู่
                </span>
              ) : 'ใช้ฟรี'}
            </button>
          </div>
        </div>
        )}

        {/* === SECTION 5: Price Summary === */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 overflow-hidden">
          <div className="p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/10 flex items-center justify-center">
                <Tag className="w-3.5 h-3.5 text-pink-400" />
              </div>
              <span className="text-sm font-semibold text-zinc-200">สรุปราคา</span>
            </div>

            <div className="space-y-0">
              {/* Balance */}
              <div className="flex justify-between items-center py-2.5">
                <span className="text-sm text-zinc-500 flex items-center gap-2">
                  <Wallet className="w-3.5 h-3.5" />
                  เครดิตคงเหลือ
                </span>
                <span className={`text-sm font-semibold tabular-nums ${canAfford ? 'text-white' : 'text-red-400'}`}>{user.balance.toLocaleString()} ฿</span>
              </div>
              
              <div className="h-px bg-zinc-800/50" />
              
              {/* Breakdown */}
              <div className="flex justify-between items-center py-2.5">
                <span className="text-sm text-zinc-500">{server.flag} {server.name}</span>
                {isPackagePrice ? (
                  <span className="text-sm text-emerald-400 tabular-nums font-medium">
                    {baseCost} ฿ <span className="text-zinc-600 text-[11px]">(แพ็กเกจ)</span>
                  </span>
                ) : (
                  <span className="text-sm text-zinc-300 tabular-nums">{PRICE_PER_DAY} ฿ x {days} วัน</span>
                )}
              </div>
              {ipLimit > 0 && (
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-sm text-zinc-500">จำกัด IP ({ipLimit} เครื่อง)</span>
                  <span className="text-sm text-zinc-300 tabular-nums">+{ipCost} ฿</span>
                </div>
              )}
              {(user.hasDiscount || user.promoDiscountPercent > 0) && (
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-sm text-emerald-500 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    ส่วนลด {user.promoDiscountPercent > 0 ? `${user.promoDiscountPercent}%` : 'สมาชิก'}
                  </span>
                  <span className="text-sm text-emerald-400 font-medium">Active</span>
                </div>
              )}
              
              <div className="h-px bg-zinc-800/50" />
              
              {/* Total */}
              <div className="flex justify-between items-center pt-3 pb-1">
                <span className="text-sm font-medium text-zinc-300">รวมทั้งสิ้น</span>
                <div className="text-right">
                  <span className="text-3xl font-bold text-white tabular-nums tracking-tight">{totalPrice}</span>
                  <span className="text-sm text-zinc-500 ml-1">฿</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* === SUBMIT BUTTON === */}
        <div className="pt-1 pb-4">
          <button
            type="button"
            onClick={openConfirmModal}
            disabled={isSubmitting || !canAfford || (needsSelection && selectedInboundId === null)}
            className={`w-full py-4 sm:py-4.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2.5 active:scale-[0.98] disabled:cursor-not-allowed ${
              !canAfford
                ? 'bg-zinc-900 text-zinc-600 border border-zinc-800'
                : 'bg-gradient-to-r from-white to-zinc-100 text-black hover:shadow-lg hover:shadow-white/10 disabled:opacity-60'
            }`}
          >
            {!canAfford ? (
              <>
                <Wallet className="w-4.5 h-4.5" />
                เครดิตไม่เพียงพอ
              </>
            ) : isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                กำลังดำเนินการ...
              </>
            ) : (
              <>
                <CreditCard className="w-4.5 h-4.5" />
                สั่งซื้อ VPN &bull; {totalPrice} ฿
                <ChevronRight className="w-4 h-4 opacity-60" />
              </>
            )}
          </button>
          
          {!canAfford && (
            <div className="text-center mt-3">
              <p className="text-xs text-zinc-600 mb-1.5">
                ยอดขาด {(totalPrice - user.balance).toLocaleString()} ฿
              </p>
              <a 
                href="/topup" 
                className="inline-flex items-center gap-1 text-xs text-cyan-500 hover:text-cyan-400 font-medium transition-colors"
              >
                เติมเงิน
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      </form>

      {/* === CONFIRMATION MODAL === */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div 
            className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative p-6 pb-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-zinc-500" />
              </button>
              
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
                <AlertTriangle className="w-7 h-7 text-amber-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-1.5">ยืนยันการสั่งซื้อ</h2>
              <p className="text-sm text-zinc-500">
                กรุณาตรวจสอบรายละเอียดก่อนยืนยัน
              </p>
            </div>

            {/* Order Summary */}
            <div className="px-6 py-4 bg-zinc-900/50 border-y border-zinc-800/60 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-500">เซิร์ฟเวอร์</span>
                <span className="text-sm text-white font-medium">{server.flag} {server.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-500">ระยะเวลา</span>
                <span className="text-sm text-white font-medium">{days} วัน</span>
              </div>
              {customName && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-500">ชื่อบัญชี</span>
                  <span className="text-sm text-white font-medium">{customName}</span>
                </div>
              )}
              {ipLimit > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-500">จำกัดอุปกรณ์</span>
                  <span className="text-sm text-white font-medium">{ipLimit} เครื่อง</span>
                </div>
              )}
              <div className="h-px bg-zinc-800/60" />
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-zinc-400">รวมทั้งสิ้น</span>
                <span className="text-xl font-bold text-white">{totalPrice} ฿</span>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="p-6 space-y-4">
              <button
                onClick={() => setAgreedToTerms(!agreedToTerms)}
                className="w-full flex items-start gap-3 text-left group"
              >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                  agreedToTerms 
                    ? 'bg-emerald-500 border-emerald-500' 
                    : 'border-zinc-600 group-hover:border-zinc-500'
                }`}>
                  {agreedToTerms && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className={`text-sm leading-relaxed ${agreedToTerms ? 'text-zinc-300' : 'text-zinc-500'}`}>
                  ฉันยอมรับเงื่อนไข <span className="text-red-400 font-medium">ไม่คืนเงินทุกกรณี</span> และเข้าใจว่าบริการ VPN เป็นลักษณะดิจิทัลที่ไม่สามารถยกเลิกหรือขอคืนเงินได้หลังจากเปิดใช้งาน
                </span>
              </button>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-sm font-bold transition-all active:scale-[0.98] border border-zinc-800"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleConfirmPurchase}
                  disabled={!agreedToTerms || isSubmitting}
                  className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition-all active:scale-[0.98] disabled:cursor-not-allowed ${
                    agreedToTerms && !isSubmitting
                      ? 'bg-gradient-to-r from-white to-zinc-100 text-black hover:shadow-lg hover:shadow-white/10'
                      : 'bg-zinc-800 text-zinc-600'
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      กำลังดำเนินการ...
                    </span>
                  ) : (
                    'ยืนยันการสั่งซื้อ'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
