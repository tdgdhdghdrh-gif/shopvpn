'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sunrise, Sun, Zap, Shield } from 'lucide-react'

export default function LandingSunset() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#2d1b4e] via-[#1a0a2e] to-[#0f0518] text-white overflow-hidden">
      {/* Sun */}
      <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-gradient-to-b from-orange-400 to-pink-500 opacity-80 blur-sm z-0" />
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-gradient-to-b from-orange-500/20 to-transparent rounded-full blur-[80px] z-0 pointer-events-none" />

      {/* Mountains */}
      <svg className="absolute bottom-0 left-0 right-0 h-32 z-0" viewBox="0 0 100 20" preserveAspectRatio="none">
        <path d="M0,20 L15,5 L30,15 L50,3 L70,12 L85,6 L100,10 L100,20Z" fill="#0a0514" opacity="0.7" />
        <path d="M0,20 L10,12 L25,18 L40,8 L60,16 L75,10 L90,14 L100,11 L100,20Z" fill="#0a0514" opacity="0.9" />
      </svg>

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-32">
        <div className="text-center mb-20">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
            <Sunrise className="w-12 h-12 mx-auto text-orange-400" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-black mb-4">
            <span className="text-orange-300">SUNSET</span> VPN
          </motion.h1>
          <p className="text-orange-200/50 max-w-md mx-auto mb-8">
            อบอุ่น สวยงาม ไร้ขีดจำกัด เชื่อมต่อตลอดเวลาไม่ว่าจะพระอาทิตย์ตกดิน
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register" className="px-8 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-full hover:opacity-90 transition-opacity">
              เริ่มต้นใช้งาน
            </Link>
          </div>
        </div>

        {/* Sunset cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Sun, title: 'สดใส', desc: 'เชื่อมต่อตลอดวัน' },
            { icon: Zap, title: 'อุ่นไว', desc: 'ความเร็วสูงสุด' },
            { icon: Shield, title: 'ปลอดภัย', desc: 'เข้ารหัสระดับสูง' },
          ].map((item, i) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
              className="bg-white/5 border border-orange-500/20 p-6 rounded-2xl text-center">
              <item.icon className="w-8 h-8 mx-auto mb-3 text-orange-300" />
              <p className="font-bold">{item.title}</p>
              <p className="text-sm text-orange-200/50">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
