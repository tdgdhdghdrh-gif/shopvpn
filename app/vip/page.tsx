'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Crown, Loader2, Star, Shield, Zap, Gift, ChevronRight, TrendingUp, CreditCard } from 'lucide-react'

interface Tier {
  tier: string
  minSpend: number
  icon: string
  color: string
  discount: number
  referralBonus: number
  perks: string[]
}

export default function VIPPage() {
  const [tiers, setTiers] = useState<Tier[]>([])
  const [currentTier, setCurrentTier] = useState<Tier | null>(null)
  const [nextTier, setNextTier] = useState<Tier | null>(null)
  const [totalSpend, setTotalSpend] = useState(0)
  const [amountToNext, setAmountToNext] = useState(0)
  const [progressPercent, setProgressPercent] = useState(0)
  const [topupCount, setTopupCount] = useState(0)
  const [memberSince, setMemberSince] = useState<string | null>(null)
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => { fetchVIP() }, [])

  async function fetchVIP() {
    try {
      const res = await fetch('/api/vip')
      const data = await res.json()
      setTiers(data.tiers || [])
      if (data.currentTier) {
        setIsLoggedIn(true)
        setCurrentTier(data.currentTier)
        setNextTier(data.nextTier)
        setTotalSpend(data.totalSpend || 0)
        setAmountToNext(data.amountToNext || 0)
        setProgressPercent(data.progressPercent || 0)
        setTopupCount(data.topupCount || 0)
        setMemberSince(data.memberSince)
        setUserName(data.userName || '')
      }
    } catch {} finally { setLoading(false) }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-zinc-800">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors">
            <ArrowLeft className="w-4 h-4 text-zinc-400" />
          </Link>
          <div>
            <h1 className="text-white font-bold text-lg flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400" />
              สมาชิก VIP
            </h1>
            <p className="text-zinc-500 text-xs">ยิ่งเติมเงินเยอะ ยิ่งได้สิทธิ์มาก!</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Current Status */}
        {isLoggedIn && currentTier && (
          <div className="relative overflow-hidden rounded-2xl border border-zinc-700 p-6" style={{ background: `linear-gradient(135deg, ${currentTier.color}15, transparent)` }}>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-5xl">{currentTier.icon}</div>
              <div>
                <p className="text-zinc-400 text-xs uppercase font-medium">ระดับปัจจุบัน</p>
                <p className="text-2xl font-black text-white">{currentTier.tier}</p>
                <p className="text-zinc-400 text-xs mt-0.5">{userName} &bull; สมาชิกตั้งแต่ {memberSince ? new Date(memberSince).toLocaleDateString('th-TH', { month: 'short', year: 'numeric' }) : '-'}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-black/30 rounded-xl p-3 text-center">
                <p className="text-white font-bold">{totalSpend.toLocaleString()}</p>
                <p className="text-zinc-500 text-[10px]">ยอดเติมรวม (฿)</p>
              </div>
              <div className="bg-black/30 rounded-xl p-3 text-center">
                <p className="text-white font-bold">{topupCount}</p>
                <p className="text-zinc-500 text-[10px]">จำนวนครั้ง</p>
              </div>
              <div className="bg-black/30 rounded-xl p-3 text-center">
                <p className="text-white font-bold">{currentTier.discount}%</p>
                <p className="text-zinc-500 text-[10px]">ส่วนลดปัจจุบัน</p>
              </div>
            </div>

            {/* Progress to next tier */}
            {nextTier && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-zinc-400 text-xs">ถึง {nextTier.tier} {nextTier.icon}</span>
                  <span className="text-zinc-400 text-xs">เติมอีก {amountToNext.toLocaleString()} บาท</span>
                </div>
                <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${progressPercent}%`, backgroundColor: nextTier.color }}
                  />
                </div>
              </div>
            )}
            {!nextTier && (
              <p className="text-amber-400 text-sm font-medium text-center py-2">🏆 คุณอยู่ระดับสูงสุดแล้ว!</p>
            )}
          </div>
        )}

        {!isLoggedIn && (
          <div className="text-center py-6">
            <Crown className="w-16 h-16 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-300 font-bold text-lg mb-1">ระบบสมาชิก VIP</p>
            <p className="text-zinc-500 text-sm mb-4">เข้าสู่ระบบเพื่อดูระดับ VIP ของคุณ</p>
            <Link href="/login" className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-400 text-black font-bold rounded-xl hover:bg-amber-300 transition-all text-sm">
              เข้าสู่ระบบ
            </Link>
          </div>
        )}

        {/* All Tiers */}
        <div>
          <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            ระดับสมาชิกทั้งหมด
          </h3>
          <div className="space-y-3">
            {tiers.map((tier) => {
              const isCurrentTier = currentTier?.tier === tier.tier
              return (
                <div
                  key={tier.tier}
                  className={`rounded-2xl border p-4 transition-all ${
                    isCurrentTier
                      ? 'border-amber-500/50 bg-amber-500/5 ring-1 ring-amber-500/20'
                      : 'border-zinc-800 bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{tier.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-bold">{tier.tier}</p>
                        {isCurrentTier && (
                          <span className="px-2 py-0.5 bg-amber-400/20 text-amber-400 text-[10px] font-bold rounded-full">ระดับของคุณ</span>
                        )}
                      </div>
                      <p className="text-zinc-500 text-xs">เติมเงินสะสม {tier.minSpend.toLocaleString()} บาทขึ้นไป</p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {tier.perks.map((perk, i) => (
                      <div key={i} className="flex items-center gap-2 text-zinc-400 text-xs">
                        <Star className="w-3 h-3 text-amber-400 flex-shrink-0" />
                        {perk}
                      </div>
                    ))}
                    {tier.discount > 0 && (
                      <div className="flex items-center gap-2 text-emerald-400 text-xs">
                        <Zap className="w-3 h-3 flex-shrink-0" />
                        ส่วนลด {tier.discount}% ทุกการซื้อ VPN
                      </div>
                    )}
                    {tier.referralBonus > 0 && (
                      <div className="flex items-center gap-2 text-pink-400 text-xs">
                        <Gift className="w-3 h-3 flex-shrink-0" />
                        โบนัสแนะนำเพื่อน +{tier.referralBonus} บาท/คน
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* CTA */}
        {isLoggedIn && nextTier && (
          <div className="text-center">
            <Link
              href="/topup"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-bold rounded-2xl hover:from-amber-300 hover:to-yellow-400 transition-all active:scale-95 text-sm shadow-lg shadow-amber-500/20"
            >
              <CreditCard className="w-4 h-4" />
              เติมเงินอัพระดับ VIP
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
