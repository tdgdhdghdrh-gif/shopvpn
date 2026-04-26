'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import {
  Sun, Sunrise, Sunset, Shield, Zap, Globe, Star, ChevronRight,
  Lock, Eye, Server, Users, Wifi, Check, ArrowRight,
  Heart, MonitorSmartphone, Timer, Award, Gift, Gem, Flame,
  TrendingUp, Headphones, Clock, Download, Activity, CloudSun,
} from 'lucide-react'
import PricingSection from '@/components/PricingSection'
import FAQSection from '@/components/FAQSection'
import TestimonialsSection from '@/components/TestimonialsSection'

const headlines = [
  { text: 'สัมผัสความเร็วระดับ', highlight: '10Gbps' },
  { text: 'ปลอดภัยยามพระอาทิตย์', highlight: 'ตก' },
  { text: 'เซิร์ฟเวอร์ทั่ว', highlight: 'โลก' },
  { text: 'Ping ต่ำสุด', highlight: '5ms' },
]

export default function LandingSunset() {
  const [headlineIdx, setHeadlineIdx] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setHeadlineIdx(p => (p + 1) % headlines.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <main className="bg-[#1a0a00]">
      {/* HERO */}
      <section className="relative min-h-screen flex items-center pt-20 pb-24 overflow-hidden">
        {/* Sunset gradient orbs */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-[radial-gradient(ellipse,rgba(251,146,60,0.1)_0%,transparent_70%)]" />
        <div className="absolute bottom-20 right-[10%] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(236,72,153,0.07)_0%,transparent_70%)]" />
        <div className="absolute top-40 left-[5%] w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(245,158,11,0.06)_0%,transparent_70%)]" />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div key={i}
              className="absolute w-1 h-1 rounded-full bg-orange-400/20"
              style={{ left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 25}%` }}
              animate={{ y: [0, -30, 0], opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#1a0a00] to-transparent z-[3]" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex justify-center mb-10">
              <div className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-orange-500/[0.08] border border-orange-500/20 backdrop-blur-sm">
                <Sun size={16} className="text-orange-400" />
                <span className="text-sm text-orange-300 font-bold tracking-wider">SUNSET VPN</span>
                <CloudSun size={14} className="text-orange-400" />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-8">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[0.95] tracking-tighter">
                <span className="block mb-2">VPN ยามพระอาทิตย์</span>
                <span className="block">
                  <AnimatePresence mode="wait">
                    <motion.span key={headlineIdx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="inline-block">
                      {headlines[headlineIdx].text}{' '}
                      <span className="bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                        {headlines[headlineIdx].highlight}
                      </span>
                    </motion.span>
                  </AnimatePresence>
                </span>
              </h1>
            </motion.div>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-lg sm:text-xl text-orange-200/70 max-w-2xl mx-auto mb-10 leading-relaxed">
              สัมผัสประสบการณ์ VPN ที่อบอุ่นและสวยงามดั่งแสงอาทิตย์อัสดง
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="group relative px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 text-white font-bold text-lg shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all hover:scale-105">
                <span className="flex items-center gap-2">เริ่มต้นการเดินทาง <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></span>
              </Link>
              <Link href="/login" className="px-8 py-4 rounded-2xl border border-orange-500/30 text-orange-300 font-bold text-lg hover:bg-orange-500/10 transition-all">
                เข้าสู่ระบบ
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-orange-400 text-sm font-bold tracking-wider">FEATURES</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-3">แสงสุดท้ายที่สมบูรณ์แบบ</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: 'ความเร็ว 10Gbps', desc: 'เร็วดั่งแสงอาทิตย์', color: 'orange' },
              { icon: Shield, title: 'เข้ารหัส AES-256', desc: 'ปลอดภัยยามค่ำคืน', color: 'pink' },
              { icon: Globe, title: '50+ ประเทศ', desc: 'ครอบคลุมทุกทวีป', color: 'purple' },
              { icon: Clock, title: 'Uptime 99.9%', desc: 'เสถียรตลอด 24 ชม.', color: 'amber' },
              { icon: Users, title: 'รองรับหลายอุปกรณ์', desc: 'ใช้งานพร้อมกันได้', color: 'rose' },
              { icon: Headphones, title: 'ซัพพอร์ต 24/7', desc: 'พร้อมช่วยเหลือเสมอ', color: 'fuchsia' },
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="group p-6 rounded-2xl bg-orange-500/[0.03] border border-orange-500/10 hover:border-orange-500/30 hover:bg-orange-500/[0.06] transition-all">
                <div className={`w-12 h-12 rounded-xl bg-${f.color}-500/10 flex items-center justify-center mb-4`}>
                  <f.icon className={`w-6 h-6 text-${f.color}-400`} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-orange-200/50">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <PricingSection />
      <TestimonialsSection />
      <FAQSection />
    </main>
  )
}
