'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Droplets, Sun, Waves, Zap, Shield } from 'lucide-react'

export default function LandingSongkran() {
  const [droplets, setDroplets] = useState<{x: number; delay: number; duration: number}[]>([])

  useEffect(() => {
    setDroplets(Array.from({ length: 30 }).map(() => ({
      x: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 1 + Math.random() * 2,
    })))
  }, [])

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0a4a6e] via-[#0d7a9e] to-[#0ea5e9] text-white overflow-hidden">
      {/* Water droplets falling */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {droplets.map((d, i) => (
          <motion.div key={i} className="absolute w-1 h-3 bg-sky-300/40 rounded-full"
            style={{ left: `${d.x}%` }}
            animate={{ y: ['-10vh', '110vh'] }}
            transition={{ duration: d.duration, delay: d.delay, repeat: Infinity, ease: 'linear' }}
          />
        ))}
      </div>

      {/* Water waves at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-0 pointer-events-none">
        <svg viewBox="0 0 1440 120" className="w-full" preserveAspectRatio="none">
          <motion.path fill="rgba(255,255,255,0.1)" d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,30 1440,60 L1440,120 L0,120Z"
            animate={{ d: ['M0,60 C360,120 720,0 1080,60 C1260,90 1380,30 1440,60 L1440,120 L0,120Z', 'M0,40 C360,0 720,120 1080,40 C1260,10 1380,70 1440,40 L1440,120 L0,120Z'] }}
            transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse' }}
          />
        </svg>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center mb-16">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-flex items-center gap-2 text-amber-300 text-sm font-bold mb-4">
            <Sun className="w-5 h-5" />
            SONGKRAN FESTIVAL
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            สาดความเร็ว<br />
            <span className="text-sky-200">ทะลุทุกขีดจำกัด</span>
          </h1>
          <p className="text-sky-100/70 max-w-md mx-auto mb-8">
            เร็วแรงดั่งสายน้ำสงกรานต์ เชื่อมต่อได้ทุกที่ทุกเวลา
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register" className="px-8 py-3 bg-amber-400 text-blue-900 font-bold rounded-full hover:bg-amber-300 transition-colors">
              เริ่มสาดน้ำ
            </Link>
            <Link href="/public-vless" className="px-8 py-3 border border-white/30 text-white font-bold rounded-full hover:bg-white/10 transition-colors">
              ทดลองฟรี
            </Link>
          </div>
        </div>

        {/* Water splash cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Droplets, title: 'สายน้ำแรง', desc: 'ความเร็วสูงสุด 10Gbps' },
            { icon: Shield, title: 'ปลอดภัย', desc: 'เข้ารหัส AES-256' },
            { icon: Zap, title: 'เร็วทันใจ', desc: 'Ping ต่ำสุด <5ms' },
          ].map((item, i) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.1 }}
              className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6 text-center">
              <item.icon className="w-8 h-8 mx-auto mb-3 text-sky-200" />
              <p className="font-bold mb-1">{item.title}</p>
              <p className="text-sm text-sky-100/60">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
