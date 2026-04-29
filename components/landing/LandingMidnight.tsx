'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Moon, Star, Zap, Shield } from 'lucide-react'

export default function LandingMidnight() {
  const [stars, setStars] = useState<{x: number; y: number; size: number; opacity: number}[]>([])

  useEffect(() => {
    setStars(Array.from({ length: 80 }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 70,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.8 + 0.2,
    })))
  }, [])

  return (
    <div className="relative min-h-screen bg-[#050510] text-white overflow-hidden">
      {/* Stars */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {stars.map((s, i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size, opacity: s.opacity }} />
        ))}
      </div>

      {/* Moon */}
      <div className="absolute top-[10%] right-[15%] w-20 h-20 rounded-full bg-amber-100/10 z-0" />
      <div className="absolute top-[10%] right-[13%] w-20 h-20 rounded-full bg-[#050510]" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-32">
        <div className="text-center mb-20">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
            <Moon className="w-12 h-12 mx-auto text-indigo-300" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-black mb-4">
            <span className="text-indigo-200">MIDNIGHT</span> VPN
          </motion.h1>
          <p className="text-indigo-200/50 max-w-md mx-auto mb-8">
            หรูหรา ลึกลับ ดั่งดวงดาว ให้การเชื่อมต่อของคุณงดงามยามค่ำคืน
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register" className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-500 transition-colors">
              สำรวจกลางคืน
            </Link>
          </div>
        </div>

        {/* Constellation cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Star, title: 'ประกายดาว', desc: 'เชื่อมต่อสว่างไสว' },
            { icon: Zap, title: 'ดาวตก', desc: 'ความเร็วสูงสุด' },
            { icon: Shield, title: 'กลุ่มดาว', desc: 'ปกป้องทั่วกาแล็กซี' },
          ].map((item, i) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
              className="bg-indigo-950/30 border border-indigo-500/20 p-6 rounded-2xl text-center">
              <item.icon className="w-8 h-8 mx-auto mb-3 text-indigo-300" />
              <p className="font-bold">{item.title}</p>
              <p className="text-sm text-indigo-200/50">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
