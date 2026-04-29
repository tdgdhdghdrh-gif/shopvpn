'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap, Shield, Globe } from 'lucide-react'

export default function LandingAurora() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const h = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])

  return (
    <div className="relative min-h-screen bg-[#02040a] text-white overflow-hidden">
      {/* Aurora bands */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-[-20%] right-[-20%] h-[500px] bg-gradient-to-r from-violet-600/20 via-fuchsia-500/15 to-cyan-500/20 rounded-full blur-[120px]"
          style={{ transform: `translateY(${scrollY * 0.3}px) rotate(-5deg)` }} />
        <div className="absolute top-[20%] left-[-10%] right-[-30%] h-[400px] bg-gradient-to-r from-cyan-500/15 via-violet-500/10 to-fuchsia-500/15 rounded-full blur-[100px]"
          style={{ transform: `translateY(${scrollY * -0.2}px) rotate(3deg)` }} />
        <div className="absolute top-[50%] left-[-30%] right-[-10%] h-[300px] bg-gradient-to-r from-fuchsia-500/10 via-cyan-500/15 to-violet-500/10 rounded-full blur-[80px]"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-32">
        <div className="text-center mb-20">
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black mb-4">
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              AURORA VPN
            </span>
          </motion.h1>
          <p className="text-zinc-400 max-w-md mx-auto mb-8">
            เชื่อมต่อลื่นไหลดั่งแสงออโรรา ทะลุทุกขีดจำกัดของความเร็ว
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register" className="px-8 py-3 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold rounded-full hover:opacity-90 transition-opacity">
              เริ่มต้นใช้งาน
            </Link>
          </div>
        </div>

        {/* Glass cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Zap, title: 'ความเร็วสูง', desc: '10Gbps ไม่จำกัด', color: 'from-violet-500/20 to-violet-500/5' },
            { icon: Shield, title: 'ความปลอดภัย', desc: 'AES-256-GCM', color: 'from-fuchsia-500/20 to-fuchsia-500/5' },
            { icon: Globe, title: 'ทั่วโลก', desc: '50+ เซิร์ฟเวอร์', color: 'from-cyan-500/20 to-cyan-500/5' },
          ].map((item, i) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
              className={`p-6 rounded-2xl border border-white/10 bg-gradient-to-b ${item.color} backdrop-blur`}>
              <item.icon className="w-8 h-8 mb-3 text-white/80" />
              <p className="font-bold mb-1">{item.title}</p>
              <p className="text-sm text-zinc-400">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
