'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Waves, Fish, Droplets, Zap } from 'lucide-react'

export default function LandingOcean() {
  const [bubbles, setBubbles] = useState<{x: number; size: number; delay: number}[]>([])

  useEffect(() => {
    setBubbles(Array.from({ length: 20 }).map(() => ({
      x: Math.random() * 100,
      size: 4 + Math.random() * 12,
      delay: Math.random() * 5,
    })))
  }, [])

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#001a33] via-[#002a4d] to-[#003d66] text-white overflow-hidden">
      {/* Light rays */}
      <div className="fixed top-0 left-1/4 w-16 h-full bg-gradient-to-b from-cyan-400/5 to-transparent z-0 pointer-events-none" />
      <div className="fixed top-0 left-1/2 w-12 h-full bg-gradient-to-b from-cyan-400/5 to-transparent z-0 pointer-events-none" />
      <div className="fixed top-0 left-3/4 w-16 h-full bg-gradient-to-b from-cyan-400/5 to-transparent z-0 pointer-events-none" />

      {/* Bubbles */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {bubbles.map((b, i) => (
          <motion.div key={i} className="absolute rounded-full border border-cyan-300/20"
            style={{ left: `${b.x}%`, width: b.size, height: b.size, bottom: -20 }}
            animate={{ y: [0, -window.innerHeight - 100], x: [0, Math.sin(i) * 30] }}
            transition={{ duration: 8 + Math.random() * 6, delay: b.delay, repeat: Infinity, ease: 'linear' }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-32">
        <div className="text-center mb-20">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
            <Waves className="w-12 h-12 mx-auto text-cyan-400" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-black mb-4">
            DEEP SEA VPN
          </motion.h1>
          <p className="text-cyan-200/50 max-w-md mx-auto mb-8">
            ดำดิ่งสู่ความเร็วที่ไร้ขีดจำกัด ลึกลับดั่งมหาสมุทร
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register" className="px-8 py-3 bg-cyan-600 text-white font-bold rounded-full hover:bg-cyan-500 transition-colors">
              ดำน้ำลึก
            </Link>
          </div>
        </div>

        {/* Deep sea cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Fish, title: 'ลื่นไหล', desc: 'เหมือนปลาว่ายน้ำ' },
            { icon: Droplets, title: 'สดชื่น', desc: 'เชื่อมต่อเย็นฉ่ำ' },
            { icon: Zap, title: 'เร็วใต้น้ำ', desc: '10Gbps ลึกลับ' },
          ].map((item, i) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
              className="bg-cyan-950/30 border border-cyan-500/20 p-6 rounded-2xl text-center">
              <item.icon className="w-8 h-8 mx-auto mb-3 text-cyan-300" />
              <p className="font-bold">{item.title}</p>
              <p className="text-sm text-cyan-200/50">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
