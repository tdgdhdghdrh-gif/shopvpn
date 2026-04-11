'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import {
  Crown, Diamond, Sparkles, Shield, Zap, Globe, Star, ChevronRight,
  Play, Rocket, Lock, Eye, Server, Users, Wifi, Check, ArrowRight,
  Heart, MonitorSmartphone, Timer, Award, Gift, Gem, Flame,
  TrendingUp, Headphones, Clock, Download, Activity,
} from 'lucide-react'
import PricingSection from '@/components/PricingSection'
import FAQSection from '@/components/FAQSection'
import TestimonialsSection from '@/components/TestimonialsSection'

// Auto-rotating headline
const headlines = [
  { text: 'ความเร็วสูงสุด', highlight: '10Gbps' },
  { text: 'ปลอดภัยระดับ', highlight: 'ทหาร' },
  { text: 'เซิร์ฟเวอร์ทั่ว', highlight: 'โลก' },
  { text: 'Ping ต่ำสุด', highlight: '5ms' },
]

export default function LandingPremium() {
  const [headlineIdx, setHeadlineIdx] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setHeadlineIdx(p => (p + 1) % headlines.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <main className="bg-black">

      {/* ══════════════════════════════════════════════
          HERO - Premium Gold/Amber theme
          ══════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center pt-20 pb-24 overflow-hidden">
        {/* Premium gradient orbs */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-[radial-gradient(ellipse,rgba(251,191,36,0.06)_0%,transparent_70%)]" />
        <div className="absolute bottom-20 right-[10%] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(168,85,247,0.04)_0%,transparent_70%)]" />
        <div className="absolute top-40 left-[5%] w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(251,191,36,0.03)_0%,transparent_70%)]" />

        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div key={i}
              className="absolute w-1 h-1 rounded-full bg-amber-400/20"
              style={{ left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 25}%` }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent z-[3]" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">

            {/* Premium badge */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex justify-center mb-10">
              <div className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-gradient-to-r from-amber-500/[0.08] to-yellow-500/[0.08] border border-amber-500/20 backdrop-blur-sm">
                <Crown size={16} className="text-amber-400" />
                <span className="text-sm text-amber-300 font-bold tracking-wider">PREMIUM VPN SERVICE</span>
                <Diamond size={14} className="text-amber-400" />
              </div>
            </motion.div>

            {/* Animated headline */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[0.95] tracking-tighter">
                <span className="block mb-2">VPN ที่ดีที่สุด</span>
                <span className="block">
                  <AnimatePresence mode="wait">
                    <motion.span key={headlineIdx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4 }}
                      className="inline-block"
                    >
                      {headlines[headlineIdx].text}{' '}
                      <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
                        {headlines[headlineIdx].highlight}
                      </span>
                    </motion.span>
                  </AnimatePresence>
                </span>
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="text-lg sm:text-xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              ประสบการณ์ VPN ระดับพรีเมียม เข้ารหัสระดับทหาร เซิร์ฟเวอร์ทั่วโลก
              <br className="hidden sm:block" />
              ความเร็วไม่จำกัด เริ่มต้นเพียง <span className="text-amber-400 font-bold">2 บาท/วัน</span>
            </motion.p>

            {/* CTA */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <Link href="/register"
                className="group relative inline-flex items-center gap-2.5 px-10 py-5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black rounded-2xl font-black text-base transition-all shadow-[0_0_30px_rgba(251,191,36,0.2)] hover:shadow-[0_0_60px_rgba(251,191,36,0.3)] hover:scale-[1.02]"
              >
                <Crown size={18} />
                เริ่มต้นใช้งานพรีเมียม
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/public-vless"
                className="group inline-flex items-center gap-2.5 px-10 py-5 bg-white/[0.03] hover:bg-amber-500/[0.05] text-white border border-amber-500/20 hover:border-amber-500/40 rounded-2xl font-bold text-base transition-all"
              >
                <Play size={16} className="fill-amber-400 text-amber-400" />
                ทดลองใช้ฟรี
              </Link>
            </motion.div>

            {/* Stats row */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
                {[
                  { value: '50K+', label: 'ผู้ใช้งาน', icon: Users },
                  { value: '20+', label: 'เซิร์ฟเวอร์', icon: Globe },
                  { value: '99.9%', label: 'Uptime', icon: Wifi },
                  { value: '<5ms', label: 'Ping', icon: Zap },
                ].map((s, i) => (
                  <motion.div key={i} whileHover={{ y: -4 }}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-amber-500/10 text-center hover:border-amber-500/20 transition-all"
                  >
                    <s.icon className="w-5 h-5 text-amber-400/60 mx-auto mb-2" />
                    <div className="text-xl font-black text-white">{s.value}</div>
                    <div className="text-[11px] text-zinc-600">{s.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          PREMIUM FEATURES - 6 Cards
          ══════════════════════════════════════════════ */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/[0.06] border border-amber-500/15 mb-6">
              <Gem size={14} className="text-amber-400" />
              <span className="text-sm text-amber-300 font-medium">Premium Features</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              ฟีเจอร์ <span className="bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">ระดับพรีเมียม</span>
            </h2>
            <p className="text-zinc-500 max-w-2xl mx-auto">ทุกอย่างที่ VPN ระดับสากลต้องมี ครบจบในที่เดียว</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Zap, title: 'ความเร็ว 10Gbps', desc: 'ความเร็วสูงสุดระดับ 10Gbps ด้วย VLESS + XTLS Reality ไม่จำกัดแบนด์วิธ ดูหนัง 4K สตรีมลื่นไหล', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
              { icon: Shield, title: 'เข้ารหัส AES-256', desc: 'การเข้ารหัสระดับทหาร AES-256-GCM มาตรฐานเดียวกับธนาคารและกองทัพสหรัฐฯ', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
              { icon: Globe, title: '20+ Global Servers', desc: 'เซิร์ฟเวอร์ Bare Metal กระจายทั่วโลก ไทย สิงคโปร์ ญี่ปุ่น สหรัฐ เลือกได้ตามใจ', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
              { icon: Eye, title: 'Zero-Log Policy', desc: 'ไม่เก็บข้อมูลใดๆ ทั้งสิ้น ไม่ว่าจะเป็น IP, DNS Query, Browsing History หรือ Metadata', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
              { icon: MonitorSmartphone, title: 'ทุกอุปกรณ์', desc: 'iOS, Android, Windows, macOS ใช้ได้ทุกแพลตฟอร์ม พร้อมคู่มือละเอียดทุกขั้นตอน', color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
              { icon: Headphones, title: 'VIP Support 24/7', desc: 'ทีมผู้เชี่ยวชาญพร้อมให้บริการตลอด 24 ชม. ผ่าน Ticket, Facebook, Line Official', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
            ].map((f, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="group p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-amber-500/20 transition-all"
              >
                <div className={`w-12 h-12 ${f.bg} border rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          WHAT YOU GET - Comparison table style
          ══════════════════════════════════════════════ */}
      <section className="py-24 border-t border-amber-500/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight">
              สิ่งที่คุณจะ<span className="text-amber-400">ได้รับ</span>
            </h2>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="rounded-2xl border border-amber-500/10 overflow-hidden"
          >
            <div className="grid grid-cols-1 divide-y divide-amber-500/5">
              {[
                { feature: 'ความเร็วสูงสุด', value: '10Gbps', desc: 'ไม่จำกัดแบนด์วิธ' },
                { feature: 'โปรโตคอล', value: 'VLESS + XTLS Reality', desc: 'เร็วและปลอดภัยที่สุด' },
                { feature: 'การเข้ารหัส', value: 'AES-256-GCM', desc: 'ระดับธนาคาร' },
                { feature: 'เซิร์ฟเวอร์', value: '20+ ทั่วโลก', desc: 'Bare Metal Server' },
                { feature: 'Uptime', value: '99.9%', desc: 'Auto-Failover' },
                { feature: 'รองรับค่าย', value: 'AIS, TRUE, DTAC', desc: 'ทุกค่ายมือถือในไทย' },
                { feature: 'อุปกรณ์', value: 'iOS, Android, Win, Mac', desc: 'ใช้ได้ทุกแพลตฟอร์ม' },
                { feature: 'ซัพพอร์ต', value: '24/7', desc: 'Ticket, Facebook, Line' },
                { feature: 'Log Policy', value: 'Zero-Log', desc: 'ไม่เก็บข้อมูลใดๆ' },
                { feature: 'ราคาเริ่มต้น', value: '2 บาท/วัน', desc: 'ไม่มีค่าแรกเข้า' },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-amber-500/[0.02] transition-colors">
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-sm text-zinc-300">{row.feature}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-white">{row.value}</span>
                    <span className="text-[11px] text-zinc-600 ml-2 hidden sm:inline">{row.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          HOW IT WORKS - 3 Premium Steps
          ══════════════════════════════════════════════ */}
      <section className="py-24 border-t border-amber-500/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-xs font-bold text-amber-400 tracking-[0.2em] uppercase mb-3">Getting Started</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              เริ่มต้นใน <span className="text-amber-400">3</span> ขั้นตอน
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'สมัครสมาชิกฟรี', desc: 'สร้างบัญชีใหม่ได้ใน 30 วินาที กรอกข้อมูลพื้นฐานเท่านั้น ไม่ต้องใช้บัตรเครดิต', icon: Rocket },
              { step: '02', title: 'เติมเงิน & ซื้อ VPN', desc: 'เติมเงินผ่าน TrueMoney Wallet หรือสลิปธนาคาร ขั้นต่ำ 50 บาท แล้วเลือกเซิร์ฟเวอร์', icon: Gift },
              { step: '03', title: 'เชื่อมต่อทันที', desc: 'ดาวน์โหลดแอพ V2Box หรือ v2rayNG กดปุ่ม Subscribe URL แล้วเปิดใช้งาน VPN ได้เลย', icon: Wifi },
            ].map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5 relative">
                  <item.icon className="w-8 h-8 text-amber-400" />
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-r from-amber-500 to-yellow-500 text-black rounded-lg flex items-center justify-center text-xs font-black">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed max-w-xs mx-auto">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CARRIER SUPPORT
          ══════════════════════════════════════════════ */}
      <section className="py-20 border-t border-amber-500/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">รองรับ<span className="text-amber-400">ทุกค่าย</span>มือถือ</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { name: 'AIS 5G / 4G', desc: 'รองรับทุกแพ็กเกจ ความเร็วเต็มสปีด', color: 'border-green-500/15 bg-green-500/5' },
              { name: 'TRUE 5G / 4G', desc: 'รองรับทุกแพ็กเกจ Ping ต่ำสุด', color: 'border-red-500/15 bg-red-500/5' },
              { name: 'DTAC / dtac', desc: 'รองรับทุกแพ็กเกจ เชื่อมต่อทันที', color: 'border-blue-500/15 bg-blue-500/5' },
            ].map((c, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`p-5 rounded-2xl border ${c.color} text-center`}
              >
                <h3 className="text-base font-bold text-white mb-1">{c.name}</h3>
                <p className="text-sm text-zinc-500">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          PRICING
          ══════════════════════════════════════════════ */}
      <PricingSection />

      {/* ══════════════════════════════════════════════
          TESTIMONIALS
          ══════════════════════════════════════════════ */}
      <TestimonialsSection />

      {/* ══════════════════════════════════════════════
          FAQ
          ══════════════════════════════════════════════ */}
      <FAQSection />

      {/* ══════════════════════════════════════════════
          FINAL CTA - Premium Gold
          ══════════════════════════════════════════════ */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(251,191,36,0.04),transparent)]" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="w-20 h-20 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <Crown className="w-10 h-10 text-amber-400" />
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 tracking-tight leading-[0.95]">
              อัพเกรด
              <br />
              <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
                ประสบการณ์
              </span>
              ของคุณ
            </h2>
            <p className="text-zinc-500 mb-10 text-lg max-w-lg mx-auto">
              เริ่มต้นใช้งานวันนี้ สัมผัส VPN ระดับพรีเมียม ไม่มีค่าแรกเข้า ไม่ผูกมัด
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register"
                className="group inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black rounded-2xl font-black text-base transition-all shadow-[0_0_30px_rgba(251,191,36,0.2)] hover:shadow-[0_0_60px_rgba(251,191,36,0.3)] hover:scale-[1.02]"
              >
                <Crown size={18} />
                เริ่มต้นใช้งานพรีเมียม
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/login"
                className="inline-flex items-center gap-2 text-zinc-500 hover:text-amber-400 font-medium transition-colors"
              >
                เข้าสู่ระบบ <ChevronRight size={16} />
              </Link>
            </div>
            <p className="text-xs text-zinc-700 mt-8 flex items-center justify-center gap-2">
              <Heart className="w-3 h-3 text-red-500" /> ผู้ใช้งานกว่า 50,000+ คนไว้วางใจ
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
