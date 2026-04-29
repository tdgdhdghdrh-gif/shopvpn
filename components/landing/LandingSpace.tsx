'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Rocket, Zap, Shield, Globe } from 'lucide-react'

export default function LandingSpace() {
  const [stars, setStars] = useState<{x: number; y: number; size: number; opacity: number}[]>([])

  useEffect(() => {
    setStars(Array.from({ length: 100 }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.8 + 0.2,
    })))
  }, [])

  return (
    <div className="relative min-h-screen bg-[#020617] text-white overflow-hidden">
      {/* Stars */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {stars.map((s, i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size, opacity: s.opacity }} />
        ))}
      </div>

      {/* Planet glows */}
      <div className="fixed top-[20%] right-[15%] w-32 h-32 bg-indigo-500/20 rounded-full blur-[80px] z-0 pointer-events-none" />
      <div className="fixed bottom-[30%] left-[10%] w-24 h-24 bg-cyan-500/15 rounded-full blur-[60px] z-0 pointer-events-none" />

      {/* Orbit rings */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-indigo-500/10 rounded-full z-0 pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-cyan-500/10 rounded-full z-0 pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-32">
        <div className="text-center mb-20">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <Rocket className="w-12 h-12 mx-auto text-indigo-400" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
            className="text-5xl md:text-6xl font-black mb-4">
            <span className="text-indigo-300">COSMIC</span> VPN
          </motion.h1>
          <p className="text-indigo-200/50 max-w-md mx-auto mb-8">
            เชื่อมต่อเร็วทะลุทุกดวงดาว ทะยานสู่อินเทอร์เน็ตแห่งอนาคต
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register" className="px-8 py-3 bg-indigo-500 text-white font-bold rounded-full hover:bg-indigo-400 transition-colors">
              บินขึ้นสู่อวกาศ
            </Link>
          </div>
        </div>

        {/* Planet cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: 'Mercury', color: 'bg-amber-500/20 border-amber-500/30', icon: Zap },
            { name: 'Neptune', color: 'bg-cyan-500/20 border-cyan-500/30', icon: Shield },
            { name: 'Andromeda', color: 'bg-indigo-500/20 border-indigo-500/30', icon: Globe },
          ].map((planet, i) => (
            <motion.div key={planet.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.1 }}
              className={`p-6 rounded-2xl border ${planet.color} text-center`}>
              <div className={`w-12 h-12 mx-auto mb-3 rounded-full ${planet.color.split(' ')[0]} flex items-center justify-center`}>
                <planet.icon className="w-6 h-6 text-white/80" />
              </div>
              <p className="font-bold">{planet.name}</p>
              <p className="text-xs text-white/40">NODE_0{i + 1}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
