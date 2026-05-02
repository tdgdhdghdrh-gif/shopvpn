'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap, Shield, Globe, ChevronRight, TrendingUp, BarChart3, PieChart, Building2, Gamepad2 } from 'lucide-react'

export default function LandingGaming() {
  const [health, setHealth] = useState(100)
  const [score, setScore] = useState(0)

  useEffect(() => {
    const h = setInterval(() => setHealth(h => h > 95 ? 100 : h + 1), 2000)
    const s = setInterval(() => setScore(s => s + 150), 3000)
    return () => { clearInterval(h); clearInterval(s) }
  }, [])

  return (
    <div className="relative min-h-screen bg-[#050a05] text-emerald-400 overflow-hidden font-mono">
      {/* Grid overlay */}
      <div className="fixed inset-0 z-0 opacity-[0.04] pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(74,222,128,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(74,222,128,0.5) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      {/* HUD Top */}
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-3 bg-[#050a05]/90 border-b border-emerald-500/20 backdrop-blur">
        <div className="flex items-center gap-3">
          <Gamepad2 className="w-5 h-5" />
          <span className="text-xs font-bold tracking-wider">SIMON_VPN</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>{score.toLocaleString()} XP</span>
          </div>
          <div className="flex items-center gap-1">
            <Trophy className="w-3 h-3" />
            <span>RANK S</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 pt-24 pb-32 px-6 max-w-6xl mx-auto">
        {/* Hero with crosshair */}
        <div className="relative min-h-[70vh] flex items-center justify-center mb-20">
          <Crosshair className="absolute w-[300px] h-[300px] text-emerald-500/5 animate-spin" style={{ animationDuration: '20s' }} />
          <Crosshair className="absolute w-[200px] h-[200px] text-emerald-500/10 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />

          <div className="text-center relative z-10">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded mb-6">
              <Swords className="w-4 h-4" />
              <span className="text-xs font-bold tracking-widest">GAME MODE: ACTIVE</span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              className="text-6xl font-black mb-4 leading-none">
              NO LAG.<br />
              <span className="text-emerald-300">NO LIMIT.</span>
            </motion.h1>

            <p className="text-emerald-400/60 mb-8 text-sm">ปิงต่ำสุด 5ms เล่น ROV PUBG ไม่มีสะดุด</p>

            <div className="flex gap-4 justify-center">
              <Link href="/register" className="px-8 py-3 bg-emerald-500 text-black font-bold text-sm rounded hover:bg-emerald-400 transition-colors">
                START GAME
              </Link>
              <Link href="/public-vless" className="px-8 py-3 border border-emerald-500/30 text-emerald-400 font-bold text-sm rounded hover:bg-emerald-500/10 transition-colors">
                FREE TRIAL
              </Link>
            </div>
          </div>
        </div>

        {/* Stats as game bars */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {[
            { icon: Heart, label: 'HEALTH', val: `${health}%`, color: 'text-red-400', bar: health },
            { icon: Zap, label: 'SPEED', val: '10Gbps', color: 'text-yellow-400', bar: 95 },
            { icon: Shield, label: 'ARMOR', val: 'AES-256', color: 'text-blue-400', bar: 100 },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
              className="bg-emerald-950/50 border border-emerald-500/20 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-3">
                <s.icon className={`w-4 h-4 ${s.color}`} />
                <span className="text-xs font-bold">{s.label}</span>
                <span className="ml-auto text-xs font-bold">{s.val}</span>
              </div>
              <div className="h-3 bg-black/50 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${s.bar}%` }} transition={{ duration: 1, delay: 0.5 }}
                  className="h-full rounded-full" style={{ backgroundColor: s.color.replace('text-', '').replace('400', '500') === 'red' ? '#ef4444' : s.color.includes('yellow') ? '#eab308' : '#3b82f6' }} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Game cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['ROV', 'PUBG', 'VALORANT', 'MLBB'].map((g, i) => (
            <motion.div key={g} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 + i * 0.1 }}
              className="bg-emerald-950/30 border border-emerald-500/10 rounded p-4 text-center hover:border-emerald-500/30 transition-colors cursor-pointer">
              <Gamepad2 className="w-6 h-6 mx-auto mb-2 text-emerald-500/50" />
              <p className="text-xs font-bold">{g}</p>
              <p className="text-[10px] text-emerald-500/40">OPTIMIZED</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
