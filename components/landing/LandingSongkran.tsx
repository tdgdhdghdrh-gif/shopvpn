'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import {
  Droplets, Sun, Sparkles, Shield, Zap, Globe, Star, ChevronRight,
  Play, Rocket, Lock, Eye, Server, Users, Wifi, Check, ArrowRight,
  Heart, MonitorSmartphone, Timer, Award, Gift, Gem, Flame,
  TrendingUp, Headphones, Clock, Download, Activity, Waves,
} from 'lucide-react'
import PricingSection from '@/components/PricingSection'
import FAQSection from '@/components/FAQSection'
import TestimonialsSection from '@/components/TestimonialsSection'

// Auto-rotating headline — Songkran theme
const headlines = [
  { text: 'สาดความเร็ว', highlight: '10Gbps' },
  { text: 'ปลอดภัยเหนือ', highlight: 'ทุกระดับ' },
  { text: 'เซิร์ฟเวอร์กระจาย', highlight: 'ทั่วโลก' },
  { text: 'Ping สุดปัง', highlight: '<5ms' },
]

// Floating water drop particle
function WaterDrop({ delay, left, size }: { delay: number; left: string; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        left,
        top: '-5%',
        width: size,
        height: size * 1.3,
        background: 'linear-gradient(180deg, rgba(56,189,248,0.3) 0%, rgba(14,165,233,0.15) 100%)',
        borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%',
      }}
      animate={{
        y: ['0vh', '110vh'],
        rotate: [0, 15, -10, 5],
        opacity: [0, 0.7, 0.7, 0],
      }}
      transition={{
        duration: 6 + Math.random() * 4,
        repeat: Infinity,
        delay,
        ease: 'linear',
      }}
    />
  )
}

// Floating flower petal
function FlowerPetal({ delay, left }: { delay: number; left: string }) {
  return (
    <motion.div
      className="absolute text-pink-400/30"
      style={{ left, top: '-3%', fontSize: 14 }}
      animate={{
        y: ['0vh', '100vh'],
        x: [0, 20, -15, 10],
        rotate: [0, 180, 360],
        opacity: [0, 0.6, 0.6, 0],
      }}
      transition={{
        duration: 8 + Math.random() * 4,
        repeat: Infinity,
        delay,
        ease: 'linear',
      }}
    >
      ✿
    </motion.div>
  )
}

export default function LandingSongkran() {
  const [headlineIdx, setHeadlineIdx] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setHeadlineIdx(p => (p + 1) % headlines.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <main className="bg-gradient-to-b from-[#0a1628] via-[#0d1f3c] to-[#0a1628]">

      {/* ══════════════════════════════════════════════
          HERO - Songkran Water Festival Theme
          ══════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center pt-20 pb-24 overflow-hidden">
        {/* Water/Gold gradient orbs */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-[radial-gradient(ellipse,rgba(56,189,248,0.08)_0%,transparent_70%)]" />
        <div className="absolute bottom-20 right-[10%] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(251,191,36,0.06)_0%,transparent_70%)]" />
        <div className="absolute top-40 left-[5%] w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(244,114,182,0.05)_0%,transparent_70%)]" />
        <div className="absolute bottom-40 left-[20%] w-[350px] h-[350px] bg-[radial-gradient(circle,rgba(56,189,248,0.04)_0%,transparent_70%)]" />

        {/* Animated water drops */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <WaterDrop delay={0} left="10%" size={8} />
          <WaterDrop delay={1.5} left="25%" size={6} />
          <WaterDrop delay={3} left="45%" size={10} />
          <WaterDrop delay={0.8} left="60%" size={7} />
          <WaterDrop delay={2.5} left="75%" size={9} />
          <WaterDrop delay={4} left="90%" size={6} />
          <FlowerPetal delay={1} left="15%" />
          <FlowerPetal delay={3.5} left="55%" />
          <FlowerPetal delay={5} left="80%" />
        </div>

        {/* Animated sparkle particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                left: `${10 + i * 12}%`,
                top: `${15 + (i % 4) * 20}%`,
                background: i % 2 === 0 ? 'rgba(56,189,248,0.4)' : 'rgba(251,191,36,0.4)',
              }}
              animate={{
                y: [0, -25, 0],
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0a1628] to-transparent z-[3]" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">

            {/* Songkran badge */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex justify-center mb-10">
              <div className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-gradient-to-r from-sky-500/[0.1] via-amber-500/[0.08] to-pink-500/[0.1] border border-sky-400/20 backdrop-blur-sm">
                <Droplets size={16} className="text-sky-400" />
                <span className="text-sm font-bold tracking-wider bg-gradient-to-r from-sky-300 via-amber-300 to-pink-300 bg-clip-text text-transparent">SONGKRAN VPN FESTIVAL</span>
                <Sun size={14} className="text-amber-400" />
              </div>
            </motion.div>

            {/* Animated headline */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[0.95] tracking-tighter">
                <span className="block mb-2">สาดความเร็ว</span>
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
                      <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-400 bg-clip-text text-transparent">
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
              สนุกกับสงกรานต์ สนุกกับ VPN ที่เร็วแรงดั่งสายน้ำ เข้ารหัสระดับทหาร
              <br className="hidden sm:block" />
              เซิร์ฟเวอร์ทั่วโลก เริ่มต้นเพียง <span className="text-sky-400 font-bold">2 บาท/วัน</span>
            </motion.p>

            {/* CTA */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <Link href="/register"
                className="group relative inline-flex items-center gap-2.5 px-10 py-5 bg-gradient-to-r from-sky-500 via-cyan-500 to-sky-500 text-white rounded-2xl font-black text-base transition-all shadow-[0_0_30px_rgba(56,189,248,0.25)] hover:shadow-[0_0_60px_rgba(56,189,248,0.35)] hover:scale-[1.02]"
              >
                <Droplets size={18} />
                สาดน้ำเริ่มใช้งาน
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/public-vless"
                className="group inline-flex items-center gap-2.5 px-10 py-5 bg-white/[0.03] hover:bg-sky-500/[0.05] text-white border border-sky-500/20 hover:border-sky-500/40 rounded-2xl font-bold text-base transition-all"
              >
                <Play size={16} className="fill-sky-400 text-sky-400" />
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
                    className="p-4 rounded-2xl bg-white/[0.02] border border-sky-500/10 text-center hover:border-sky-500/25 transition-all"
                  >
                    <s.icon className="w-5 h-5 text-sky-400/60 mx-auto mb-2" />
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
          WATER SPLASH DIVIDER
          ══════════════════════════════════════════════ */}
      <div className="relative h-16 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-500/30 to-transparent" />
        <motion.div
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* ══════════════════════════════════════════════
          FEATURES - 6 Cards with Songkran Colors
          ══════════════════════════════════════════════ */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/[0.06] border border-sky-500/15 mb-6">
              <Waves size={14} className="text-sky-400" />
              <span className="text-sm text-sky-300 font-medium">Water-Proof Features</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              ฟีเจอร์ <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-sky-400 bg-clip-text text-transparent">แรงดั่งสายน้ำ</span>
            </h2>
            <p className="text-zinc-500 max-w-2xl mx-auto">สิ่งที่ VPN ระดับสากลต้องมี ครบจบในที่เดียว พร้อมรับสงกรานต์</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Zap, title: 'ความเร็ว 10Gbps', desc: 'สาดความเร็วสูงสุดระดับ 10Gbps ด้วย VLESS + XTLS Reality ไม่จำกัดแบนด์วิธ ดูหนัง 4K สตรีมลื่นไหล', color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
              { icon: Shield, title: 'เข้ารหัส AES-256', desc: 'การเข้ารหัสระดับทหาร AES-256-GCM มาตรฐานเดียวกับธนาคารและกองทัพสหรัฐฯ', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
              { icon: Globe, title: '20+ Global Servers', desc: 'เซิร์ฟเวอร์ Bare Metal กระจายทั่วโลก ไทย สิงคโปร์ ญี่ปุ่น สหรัฐ เลือกได้ตามใจ', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
              { icon: Eye, title: 'Zero-Log Policy', desc: 'ไม่เก็บข้อมูลใดๆ ทั้งสิ้น ไม่ว่าจะเป็น IP, DNS Query, Browsing History หรือ Metadata', color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
              { icon: MonitorSmartphone, title: 'ทุกอุปกรณ์', desc: 'iOS, Android, Windows, macOS ใช้ได้ทุกแพลตฟอร์ม พร้อมคู่มือละเอียดทุกขั้นตอน', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
              { icon: Headphones, title: 'Support 24/7', desc: 'ทีมผู้เชี่ยวชาญพร้อมให้บริการตลอด 24 ชม. ผ่าน Ticket, Facebook, Line Official', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
            ].map((f, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="group p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-sky-500/20 transition-all hover:bg-sky-500/[0.02]"
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
          WHAT YOU GET - Comparison table
          ══════════════════════════════════════════════ */}
      <section className="py-24 border-t border-sky-500/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight">
              สิ่งที่คุณจะ<span className="text-sky-400">ได้รับ</span>
            </h2>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="rounded-2xl border border-sky-500/10 overflow-hidden"
          >
            <div className="grid grid-cols-1 divide-y divide-sky-500/5">
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
                <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-sky-500/[0.02] transition-colors">
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-sky-400 shrink-0" />
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
          HOW IT WORKS - 3 Songkran Steps
          ══════════════════════════════════════════════ */}
      <section className="py-24 border-t border-sky-500/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-xs font-bold text-sky-400 tracking-[0.2em] uppercase mb-3">Getting Started</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              เริ่มสาดน้ำใน <span className="text-sky-400">3</span> ขั้นตอน
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'สมัครสมาชิกฟรี', desc: 'สร้างบัญชีใหม่ได้ใน 30 วินาที กรอกข้อมูลพื้นฐานเท่านั้น ไม่ต้องใช้บัตรเครดิต', icon: Rocket, color: 'from-sky-500/10 to-cyan-500/10 border-sky-500/20' },
              { step: '02', title: 'เติมเงิน & ซื้อ VPN', desc: 'เติมเงินผ่าน TrueMoney Wallet หรือสลิปธนาคาร ขั้นต่ำ 50 บาท แล้วเลือกเซิร์ฟเวอร์', icon: Gift, color: 'from-amber-500/10 to-orange-500/10 border-amber-500/20' },
              { step: '03', title: 'เชื่อมต่อทันที', desc: 'ดาวน์โหลดแอพ V2Box หรือ v2rayNG กดปุ่ม Subscribe URL แล้วเปิดใช้งาน VPN ได้เลย', icon: Wifi, color: 'from-pink-500/10 to-rose-500/10 border-pink-500/20' },
            ].map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className={`w-20 h-20 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-5 relative`}>
                  <item.icon className="w-8 h-8 text-sky-400" />
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-r from-sky-500 to-cyan-500 text-white rounded-lg flex items-center justify-center text-xs font-black">
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
      <section className="py-20 border-t border-sky-500/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">รองรับ<span className="text-sky-400">ทุกค่าย</span>มือถือ</h2>
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
          FINAL CTA - Songkran Water Splash
          ══════════════════════════════════════════════ */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(56,189,248,0.06),transparent)]" />
        {/* Floating particles for CTA */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(4)].map((_, i) => (
            <motion.div key={i}
              className="absolute w-1.5 h-1.5 rounded-full"
              style={{
                left: `${20 + i * 20}%`,
                top: `${30 + (i % 2) * 30}%`,
                background: i % 2 === 0 ? 'rgba(56,189,248,0.3)' : 'rgba(251,191,36,0.3)',
              }}
              animate={{ y: [0, -20, 0], opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="w-20 h-20 bg-gradient-to-br from-sky-500/10 to-cyan-500/10 border border-sky-500/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <Droplets className="w-10 h-10 text-sky-400" />
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 tracking-tight leading-[0.95]">
              สาดน้ำ
              <br />
              <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-400 bg-clip-text text-transparent">
                สาดความเร็ว
              </span>
            </h2>
            <p className="text-zinc-500 mb-10 text-lg max-w-lg mx-auto">
              เริ่มต้นใช้งานวันนี้ สัมผัส VPN ที่เร็วแรงดั่งสายน้ำ ไม่มีค่าแรกเข้า ไม่ผูกมัด
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register"
                className="group inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-sky-500 via-cyan-500 to-sky-500 text-white rounded-2xl font-black text-base transition-all shadow-[0_0_30px_rgba(56,189,248,0.25)] hover:shadow-[0_0_60px_rgba(56,189,248,0.35)] hover:scale-[1.02]"
              >
                <Droplets size={18} />
                สาดน้ำเริ่มใช้งาน
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/login"
                className="inline-flex items-center gap-2 text-zinc-500 hover:text-sky-400 font-medium transition-colors"
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
