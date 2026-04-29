'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Flower2, Sparkles, Zap, Shield } from 'lucide-react'

export default function LandingSakura() {
  const [petals, setPetals] = useState<{x: number; delay: number; duration: number}[]>([])

  useEffect(() => {
    setPetals(Array.from({ length: 20 }).map(() => ({
      x: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 6 + Math.random() * 4,
    })))
  }, [])

  return (
    <div className="relative min-h-screen bg-[#1a0a12] text-white overflow-hidden">
      {/* Falling petals */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {petals.map((p, i) => (
          <motion.div key={i} className="absolute w-2 h-2 bg-pink-300/30 rounded-full"
            style={{ left: `${p.x}%`, top: -10 }}
            animate={{ y: ['0vh', '110vh'], x: [0, Math.sin(i) * 50], rotate: [0, 360] }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'linear' }}
          />
        ))}
      </div>

      {/* Branch SVG */}
      <svg className="absolute top-0 left-0 w-64 h-48 opacity-20 z-0 pointer-events-none" viewBox="0 0 100 80">
        <path d="M0,20 Q40,30 60,10 T100,5" stroke="#4a1a2e" strokeWidth="1" fill="none" />
        <path d="M60,10 Q70,40 65,70" stroke="#4a1a2e" strokeWidth="0.5" fill="none" />
      </svg>

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-32">
        <div className="text-center mb-20">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
            <Flower2 className="w-12 h-12 mx-auto text-pink-300" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-black mb-4">
            <span className="text-pink-200">SAKURA</span> VPN
          </motion.h1>
          <p className="text-pink-200/50 max-w-md mx-auto mb-8">
            อ่อนโยน สวยงาม แข็งแกร่ง เชื่อมต่อด้วยความนุ่มนวลดั่งกลีบซากุระ
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register" className="px-8 py-3 bg-pink-500 text-white font-bold rounded-full hover:bg-pink-400 transition-colors">
              เริ่มต้นใช้งาน
            </Link>
          </div>
        </div>

        {/* Blossom cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Sparkles, title: 'บุปผา', desc: 'เชื่อมต่องดงาม' },
            { icon: Zap, title: 'กลีบไม้', desc: 'ความเร็วพุ่งพล่าน' },
            { icon: Shield, title: 'กิ่งซากุระ', desc: 'ปกป้องอ่อนโยน' },
          ].map((item, i) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
              className="bg-pink-950/30 border border-pink-500/20 p-6 rounded-2xl text-center">
              <item.icon className="w-8 h-8 mx-auto mb-3 text-pink-300" />
              <p className="font-bold">{item.title}</p>
              <p className="text-sm text-pink-200/50">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
