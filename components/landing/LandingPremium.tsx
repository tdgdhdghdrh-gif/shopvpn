'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Diamond, Sparkles, Crown, Star, Zap, ChevronRight } from 'lucide-react'

export default function LandingPremium() {
  const [particles, setParticles] = useState<{x: number; y: number; size: number; delay: number}[]>([])

  useEffect(() => {
    setParticles(Array.from({ length: 30 }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      delay: Math.random() * 3,
    })))
  }, [])

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Gold particles */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {particles.map((p, i) => (
          <motion.div key={i} className="absolute rounded-full bg-amber-400"
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
            animate={{ opacity: [0.2, 0.8, 0.2], scale: [1, 1.5, 1] }}
            transition={{ duration: 3, delay: p.delay, repeat: Infinity }}
          />
        ))}
      </div>

      {/* Central glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[150px] z-0 pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-32">
        {/* Header */}
        <div className="text-center mb-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-flex items-center gap-2 text-amber-400 text-xs tracking-[0.4em] font-bold">
            <Crown className="w-4 h-4" />
            PREMIUM COLLECTION
          </motion.div>
        </div>

        {/* Hero */}
        <div className="text-center mb-20">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
            className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-amber-300 to-yellow-500 rotate-45 flex items-center justify-center shadow-[0_0_60px_rgba(245,158,11,0.3)]">
            <Diamond className="w-8 h-8 text-black -rotate-45" />
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="text-5xl md:text-7xl font-black mb-4">
            <span className="bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
              DIAMOND CLASS
            </span>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="text-zinc-400 text-sm max-w-md mx-auto mb-10">
            ประสบการณ์ VPN ระดับสูงสุด เซิร์ฟเวอร์พรีเมียมส่วนตัว ความเร็วไม่จำกัด
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
            className="flex gap-4 justify-center">
            <Link href="/register" className="px-8 py-4 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-bold rounded-full hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-shadow">
              <Sparkles className="w-4 h-4 inline mr-2" />
              Get Premium
            </Link>
          </motion.div>
        </div>

        {/* Pricing gems */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: 'GOLD', price: '50', period: '/day', features: ['1 Device', 'Standard Speed', 'Global Servers'] },
            { name: 'PLATINUM', price: '100', period: '/week', features: ['3 Devices', 'High Speed', 'Priority Support'], popular: true },
            { name: 'DIAMOND', price: '200', period: '/month', features: ['Unlimited', '10Gbps', 'Private Server'] },
          ].map((plan, i) => (
            <motion.div key={plan.name} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 + i * 0.15 }}
              className={`relative p-6 rounded-2xl border ${plan.popular ? 'border-amber-400/40 bg-amber-950/20' : 'border-white/10 bg-white/[0.02]'} text-center`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-400 text-black text-[10px] font-bold rounded-full">
                  MOST POPULAR
                </div>
              )}
              <Star className={`w-6 h-6 mx-auto mb-3 ${plan.popular ? 'text-amber-400' : 'text-zinc-600'}`} />
              <p className="text-xs font-bold tracking-wider mb-2 text-zinc-400">{plan.name}</p>
              <p className="text-3xl font-black mb-1">{plan.price}<span className="text-sm text-zinc-500">฿</span></p>
              <p className="text-xs text-zinc-600 mb-4">{plan.period}</p>
              <div className="space-y-2">
                {plan.features.map((f) => (
                  <p key={f} className="text-xs text-zinc-400">{f}</p>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
