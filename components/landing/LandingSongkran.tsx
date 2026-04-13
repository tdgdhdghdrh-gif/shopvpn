'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useMemo } from 'react'
import {
  Droplets, Sun, Sparkles, Shield, Zap, Globe, Star, ChevronRight,
  Play, Rocket, Lock, Eye, Server, Users, Wifi, Check, ArrowRight,
  Heart, MonitorSmartphone, Timer, Award, Gift, Gem, Flame,
  TrendingUp, Headphones, Clock, Download, Activity, Waves, Crown,
} from 'lucide-react'
import PricingSection from '@/components/PricingSection'
import FAQSection from '@/components/FAQSection'
import TestimonialsSection from '@/components/TestimonialsSection'

// ═══════════════════════════════════════════
// Headline rotation
// ═══════════════════════════════════════════
const headlines = [
  { text: 'สาดความเร็ว', highlight: '10Gbps' },
  { text: 'ปลอดภัยระดับ', highlight: 'Military' },
  { text: 'เซิร์ฟเวอร์ทั่ว', highlight: 'โลก' },
  { text: 'Ping ต่ำสุด', highlight: '<5ms' },
]

// ═══════════════════════════════════════════
// SVG Water Wave (animated)
// ═══════════════════════════════════════════
function WaterWaveSVG() {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-[2] pointer-events-none overflow-hidden" style={{ height: 120 }}>
      {/* Wave layer 1 - front */}
      <motion.svg
        viewBox="0 0 1440 120"
        className="absolute bottom-0 w-[200%] h-full"
        preserveAspectRatio="none"
        animate={{ x: [0, '-50%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      >
        <path
          d="M0,60 C240,100 480,20 720,60 C960,100 1200,20 1440,60 L1440,120 L0,120 Z"
          fill="rgba(14,165,233,0.08)"
        />
        <path
          d="M0,80 C180,50 360,100 540,70 C720,40 900,100 1080,70 C1260,40 1440,80 1440,80 L1440,120 L0,120 Z"
          fill="rgba(56,189,248,0.05)"
        />
      </motion.svg>
      {/* Wave layer 2 - back (offset) */}
      <motion.svg
        viewBox="0 0 1440 120"
        className="absolute bottom-0 w-[200%] h-full"
        preserveAspectRatio="none"
        animate={{ x: ['-50%', 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
      >
        <path
          d="M0,70 C200,30 400,100 600,60 C800,20 1000,90 1200,50 C1300,30 1440,70 1440,70 L1440,120 L0,120 Z"
          fill="rgba(6,182,212,0.06)"
        />
      </motion.svg>
    </div>
  )
}

// ═══════════════════════════════════════════
// Water ripple rings
// ═══════════════════════════════════════════
function WaterRipple({ x, y, delay, size }: { x: string; y: string; delay: number; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full border border-sky-400/20"
      style={{ left: x, top: y, width: 0, height: 0, willChange: 'transform, opacity' }}
      animate={{
        width: [0, size, size * 1.8],
        height: [0, size, size * 1.8],
        opacity: [0.5, 0.25, 0.05],
        x: [0, -size / 2, -size * 0.9],
        y: [0, -size / 2, -size * 0.9],
      }}
      transition={{ duration: 3, repeat: Infinity, delay, ease: 'easeOut' }}
    />
  )
}

// ═══════════════════════════════════════════
// Floating water drops (varied sizes & glow)
// ═══════════════════════════════════════════
// Pre-computed durations to avoid Math.random() on every render
const WATER_DROP_DURATIONS = [7.3, 8.1, 6.5, 9.2, 7.8, 8.7, 6.9, 9.5, 7.1, 8.4, 6.2, 9.8, 7.6]
function WaterDrop({ delay, left, size, glow, index = 0 }: { delay: number; left: string; size: number; glow?: boolean; index?: number }) {
  const duration = WATER_DROP_DURATIONS[index % WATER_DROP_DURATIONS.length]
  return (
    <motion.div
      className="absolute"
      style={{
        left,
        top: '-5%',
        width: size,
        height: size * 1.4,
        background: glow
          ? 'linear-gradient(180deg, rgba(56,189,248,0.5) 0%, rgba(14,165,233,0.2) 100%)'
          : 'linear-gradient(180deg, rgba(56,189,248,0.25) 0%, rgba(14,165,233,0.1) 100%)',
        borderRadius: '50% 50% 50% 50% / 30% 30% 70% 70%',
        boxShadow: glow ? '0 0 12px rgba(56,189,248,0.3)' : 'none',
        willChange: 'transform, opacity',
      }}
      animate={{
        y: ['0vh', '115vh'],
        rotate: [0, 20, -15, 8],
        opacity: [0.05, 0.8, 0.8, 0.05],
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: 'linear',
      }}
    />
  )
}

// ═══════════════════════════════════════════
// Floating Thai flowers (ดอกมะลิ, ดอกบัว, กลีบกุหลาบ)
// ═══════════════════════════════════════════
const FLOWERS = ['🌸', '🪷', '🌺', '✿', '❀', '🏵️']
const FLOWER_DURATIONS = [12.4, 13.7, 11.2, 14.5, 12.8, 13.1, 11.9]
function FloatingFlower({ delay, left, flower, index = 0 }: { delay: number; left: string; flower: string; index?: number }) {
  const duration = FLOWER_DURATIONS[index % FLOWER_DURATIONS.length]
  return (
    <motion.div
      className="absolute"
      style={{ left, top: '-4%', fontSize: 18, filter: 'drop-shadow(0 0 4px rgba(244,114,182,0.3))', willChange: 'transform, opacity' }}
      animate={{
        y: ['0vh', '105vh'],
        x: [0, 30, -20, 15, -10],
        rotate: [0, 90, 180, 270, 360],
        opacity: [0.05, 0.7, 0.7, 0.5, 0.05],
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: 'linear',
      }}
    >
      {flower}
    </motion.div>
  )
}

// ═══════════════════════════════════════════
// Thai ornamental corner (ลายไทย SVG)
// ═══════════════════════════════════════════
function ThaiCorner({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={`w-20 h-20 sm:w-28 sm:h-28 ${className}`} fill="none">
      <path
        d="M5,95 Q5,5 95,5"
        stroke="url(#thaiGold)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M15,95 Q15,15 95,15"
        stroke="url(#thaiGold)"
        strokeWidth="0.8"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
      {/* Decorative dots along the curve */}
      <circle cx="30" cy="8" r="2" fill="rgba(251,191,36,0.4)" />
      <circle cx="60" cy="5" r="1.5" fill="rgba(251,191,36,0.3)" />
      <circle cx="8" cy="30" r="2" fill="rgba(251,191,36,0.4)" />
      <circle cx="5" cy="60" r="1.5" fill="rgba(251,191,36,0.3)" />
      {/* Thai floral element at corner */}
      <circle cx="8" cy="8" r="5" fill="rgba(251,191,36,0.15)" stroke="rgba(251,191,36,0.3)" strokeWidth="0.5" />
      <circle cx="8" cy="8" r="2" fill="rgba(251,191,36,0.3)" />
      <defs>
        <linearGradient id="thaiGold" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(251,191,36,0.6)" />
          <stop offset="50%" stopColor="rgba(245,158,11,0.4)" />
          <stop offset="100%" stopColor="rgba(251,191,36,0.6)" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// ═══════════════════════════════════════════
// Animated Counter
// ═══════════════════════════════════════════
function AnimatedCounter({ value, suffix = '' }: { value: string; suffix?: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ type: 'spring', stiffness: 100 }}
      className="inline-block"
    >
      {value}{suffix}
    </motion.span>
  )
}

// ═══════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════
export default function LandingSongkran() {
  const [headlineIdx, setHeadlineIdx] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setHeadlineIdx(p => (p + 1) % headlines.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <main className="bg-[#060e1f] overflow-hidden" style={{ isolation: 'isolate' }}>

      {/* ══════════════════════════════════════════════════════
          HERO - Songkran Festival Theme (Full Immersion)
          ══════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center pt-20 pb-32 overflow-hidden">

        {/* Multi-layer gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1830] via-[#0c1f3d] to-[#060e1f]" />

        {/* Large ambient orbs */}
        <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[1000px] h-[700px] bg-[radial-gradient(ellipse,rgba(56,189,248,0.1)_0%,transparent_65%)]" />
        <div className="absolute top-[10%] right-[-5%] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(251,191,36,0.07)_0%,transparent_60%)]" />
        <div className="absolute bottom-[10%] left-[-5%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(244,114,182,0.06)_0%,transparent_60%)]" />
        <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(6,182,212,0.05)_0%,transparent_60%)]" />

        {/* Animated radial pulse */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.03) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Water ripples */}
        <div className="absolute inset-0 pointer-events-none">
          <WaterRipple x="20%" y="60%" delay={0} size={120} />
          <WaterRipple x="70%" y="40%" delay={1.5} size={100} />
          <WaterRipple x="45%" y="75%" delay={3} size={80} />
          <WaterRipple x="80%" y="70%" delay={2} size={60} />
        </div>

        {/* Water drops — lots of them */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <WaterDrop delay={0} left="5%" size={10} glow index={0} />
          <WaterDrop delay={0.7} left="12%" size={6} index={1} />
          <WaterDrop delay={1.3} left="22%" size={8} glow index={2} />
          <WaterDrop delay={2} left="32%" size={5} index={3} />
          <WaterDrop delay={0.5} left="42%" size={12} glow index={4} />
          <WaterDrop delay={3} left="52%" size={7} index={5} />
          <WaterDrop delay={1.8} left="62%" size={9} glow index={6} />
          <WaterDrop delay={2.5} left="72%" size={6} index={7} />
          <WaterDrop delay={0.3} left="82%" size={11} glow index={8} />
          <WaterDrop delay={3.5} left="92%" size={7} index={9} />
          <WaterDrop delay={4} left="15%" size={5} index={10} />
          <WaterDrop delay={4.5} left="55%" size={8} glow index={11} />
          <WaterDrop delay={5} left="88%" size={6} index={12} />
        </div>

        {/* Floating flowers */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <FloatingFlower delay={0} left="8%" flower="🌸" index={0} />
          <FloatingFlower delay={2} left="20%" flower="🪷" index={1} />
          <FloatingFlower delay={4} left="35%" flower="✿" index={2} />
          <FloatingFlower delay={1} left="50%" flower="🌺" index={3} />
          <FloatingFlower delay={3.5} left="65%" flower="❀" index={4} />
          <FloatingFlower delay={5.5} left="78%" flower="🌸" index={5} />
          <FloatingFlower delay={2.5} left="90%" flower="🪷" index={6} />
        </div>

        {/* Sparkle particles — water + gold */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(16)].map((_, i) => (
            <motion.div key={i}
              className="absolute rounded-full"
              style={{
                left: `${5 + i * 6}%`,
                top: `${10 + (i % 5) * 18}%`,
                width: i % 3 === 0 ? 3 : 2,
                height: i % 3 === 0 ? 3 : 2,
                background: i % 3 === 0
                  ? 'rgba(251,191,36,0.6)'
                  : i % 3 === 1
                    ? 'rgba(56,189,248,0.5)'
                    : 'rgba(244,114,182,0.4)',
                boxShadow: i % 3 === 0
                  ? '0 0 6px rgba(251,191,36,0.4)'
                  : i % 3 === 1
                    ? '0 0 6px rgba(56,189,248,0.3)'
                    : '0 0 6px rgba(244,114,182,0.3)',
                willChange: 'transform, opacity',
              }}
              animate={{
                y: [0, -30 - i * 2, 0],
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.8, 1],
              }}
              transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
            />
          ))}
        </div>

        {/* Thai ornamental corners */}
        <div className="absolute top-4 left-4 opacity-40">
          <ThaiCorner />
        </div>
        <div className="absolute top-4 right-4 opacity-40 -scale-x-100">
          <ThaiCorner />
        </div>
        <div className="absolute bottom-28 left-4 opacity-30 -scale-y-100">
          <ThaiCorner />
        </div>
        <div className="absolute bottom-28 right-4 opacity-30 scale-[-1]">
          <ThaiCorner />
        </div>

        {/* SVG water waves at bottom */}
        <WaterWaveSVG />

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#060e1f] to-transparent z-[3]" />

        {/* ── Hero Content ── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">

            {/* Songkran Festival Badge */}
            <motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.2, type: 'spring' }} className="flex justify-center mb-10">
              <div className="relative inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-gradient-to-r from-sky-500/[0.12] via-amber-500/[0.1] to-pink-500/[0.12] border border-amber-400/20 backdrop-blur-sm">
                {/* Animated border glow */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ boxShadow: '0 0 20px rgba(56,189,248,0.15), 0 0 40px rgba(251,191,36,0.1)' }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}>
                  <Sun size={18} className="text-amber-400" />
                </motion.div>
                <span className="text-sm font-black tracking-widest bg-gradient-to-r from-sky-300 via-amber-300 to-pink-300 bg-clip-text text-transparent uppercase">
                  Songkran Festival
                </span>
                <Droplets size={16} className="text-sky-400" />
              </div>
            </motion.div>

            {/* Thai Year & Date */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="mb-4">
              <span className="text-xs sm:text-sm text-amber-400/60 font-medium tracking-[0.3em] uppercase">เทศกาลสงกรานต์ 2569</span>
            </motion.div>

            {/* Main Headline with rotating text */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tighter">
                {/* Water effect text */}
                <span className="block mb-3 bg-gradient-to-b from-white via-white to-sky-200/80 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(56,189,248,0.2)]">
                  สาดความเร็ว
                </span>
                <span className="block h-[1.1em]">
                  <AnimatePresence mode="wait">
                    <motion.span key={headlineIdx}
                      initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: -30, filter: 'blur(8px)' }}
                      transition={{ duration: 0.5 }}
                      className="inline-block"
                    >
                      <span className="text-white/90">{headlines[headlineIdx].text}{' '}</span>
                      <span className="relative">
                        <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-amber-400 bg-clip-text text-transparent">
                          {headlines[headlineIdx].highlight}
                        </span>
                        {/* Underline glow */}
                        <motion.span
                          className="absolute -bottom-2 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-sky-400/0 via-sky-400/50 to-sky-400/0"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: 0.3, duration: 0.5 }}
                        />
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
              สนุกกับเทศกาลสงกรานต์ สนุกกับ VPN ที่ <span className="text-sky-300 font-semibold">เร็วแรงดั่งสายน้ำ</span>
              <br className="hidden sm:block" />
              เข้ารหัสระดับทหาร เซิร์ฟเวอร์ทั่วโลก เริ่มต้นเพียง <span className="text-amber-400 font-black text-2xl align-middle">2 ฿</span><span className="text-amber-400/70">/วัน</span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <Link href="/register"
                className="group relative inline-flex items-center gap-2.5 px-10 py-5 rounded-2xl font-black text-base transition-all hover:scale-[1.03]"
              >
                {/* Animated gradient bg */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-sky-500 via-cyan-400 to-sky-500 bg-[length:200%_100%] animate-[shimmer_3s_linear_infinite]" />
                {/* Glow */}
                <div className="absolute inset-0 rounded-2xl shadow-[0_0_30px_rgba(56,189,248,0.3),0_0_60px_rgba(56,189,248,0.1)] group-hover:shadow-[0_0_40px_rgba(56,189,248,0.4),0_0_80px_rgba(56,189,248,0.15)]" />
                <span className="relative flex items-center gap-2.5 text-white">
                  <Droplets size={18} />
                  สาดน้ำเริ่มใช้งาน
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link href="/public-vless"
                className="group inline-flex items-center gap-2.5 px-10 py-5 bg-white/[0.04] hover:bg-sky-500/[0.08] text-white border border-sky-400/20 hover:border-sky-400/40 rounded-2xl font-bold text-base transition-all backdrop-blur-sm"
              >
                <Play size={16} className="fill-sky-400 text-sky-400" />
                ทดลองใช้ฟรี
              </Link>
            </motion.div>

            {/* Stats Row — glowing cards */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
                {[
                  { value: '50K+', label: 'ผู้ใช้งาน', icon: Users, color: 'sky' },
                  { value: '20+', label: 'เซิร์ฟเวอร์', icon: Globe, color: 'cyan' },
                  { value: '99.9%', label: 'Uptime', icon: Wifi, color: 'amber' },
                  { value: '<5ms', label: 'Ping', icon: Zap, color: 'pink' },
                ].map((s, i) => (
                  <motion.div key={i}
                    whileHover={{ y: -6, scale: 1.02 }}
                    className="relative p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center hover:border-sky-400/20 transition-all backdrop-blur-sm group"
                  >
                    {/* Hover glow */}
                    <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-b from-${s.color}-500/5 to-transparent`} />
                    <s.icon className={`w-5 h-5 text-${s.color}-400/60 mx-auto mb-2 relative`} />
                    <div className="text-2xl font-black text-white relative">
                      <AnimatedCounter value={s.value} />
                    </div>
                    <div className="text-[11px] text-zinc-600 relative">{s.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SONGKRAN PROMO BANNER
          ══════════════════════════════════════════════════════ */}
      <section className="relative py-10 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto px-4"
        >
          <div className="relative rounded-3xl overflow-hidden border border-amber-500/20">
            {/* Gradient BG */}
            <div className="absolute inset-0 bg-gradient-to-r from-sky-900/40 via-[#0d1f3c] to-amber-900/30" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(56,189,248,0.1),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_right,rgba(251,191,36,0.08),transparent_50%)]" />

            {/* Animated border */}
            <motion.div
              className="absolute inset-0 rounded-3xl"
              style={{ boxShadow: '0 0 30px rgba(251,191,36,0.08), inset 0 0 30px rgba(56,189,248,0.05)' }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            <div className="relative px-8 py-10 sm:px-12 sm:py-14 flex flex-col sm:flex-row items-center gap-8">
              {/* Left: Icon cluster */}
              <div className="relative shrink-0">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-amber-500/15 to-sky-500/15 border border-amber-500/20 flex items-center justify-center"
                >
                  <span className="text-5xl sm:text-6xl">🎉</span>
                </motion.div>
                {/* Orbiting particles */}
                <motion.div
                  className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-sky-500/20 border border-sky-400/30 flex items-center justify-center"
                  animate={{ y: [0, -5, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Droplets size={14} className="text-sky-400" />
                </motion.div>
                <motion.div
                  className="absolute -bottom-1 -left-1 w-7 h-7 rounded-full bg-amber-500/20 border border-amber-400/30 flex items-center justify-center"
                  animate={{ y: [0, 5, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  <Sun size={12} className="text-amber-400" />
                </motion.div>
              </div>

              {/* Right: Text */}
              <div className="text-center sm:text-left">
                <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                  <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-400 tracking-wide">SONGKRAN SPECIAL</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white mb-2">
                  ฉลองสงกรานต์กับ <span className="bg-gradient-to-r from-sky-400 to-amber-400 bg-clip-text text-transparent">VPN สุดเท่</span>
                </h3>
                <p className="text-zinc-400 text-sm sm:text-base max-w-lg">
                  เทศกาลแห่งความสนุก สาดน้ำ สาดความเร็ว ปกป้องตัวคุณด้วย VPN ที่เร็วที่สุด ปลอดภัยที่สุด
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FEATURES - 6 Cards with Hover Water Ripple Effect
          ══════════════════════════════════════════════════════ */}
      <section className="py-24 relative">
        {/* Section BG */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(56,189,248,0.04),transparent)]" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-sky-500/[0.08] to-cyan-500/[0.08] border border-sky-500/15 mb-6">
              <Waves size={14} className="text-sky-400" />
              <span className="text-sm text-sky-300 font-bold tracking-wide">Water-Proof Features</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              ฟีเจอร์ <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-amber-400 bg-clip-text text-transparent">แรงดั่งสายน้ำ</span>
            </h2>
            <p className="text-zinc-500 max-w-2xl mx-auto">ทุกอย่างที่ VPN ระดับสากลต้องมี ครบจบในที่เดียว</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Zap, title: 'ความเร็ว 10Gbps', desc: 'สาดความเร็วสูงสุด 10Gbps ด้วย VLESS + XTLS Reality ไม่จำกัดแบนด์วิธ ดูหนัง 4K สตรีมลื่นไหล', color: 'text-sky-400', border: 'border-sky-500/20', bg: 'from-sky-500/10 to-sky-500/5', glow: 'rgba(56,189,248,0.15)' },
              { icon: Shield, title: 'เข้ารหัส AES-256', desc: 'การเข้ารหัสระดับทหาร AES-256-GCM มาตรฐานเดียวกับธนาคารและกองทัพสหรัฐฯ', color: 'text-amber-400', border: 'border-amber-500/20', bg: 'from-amber-500/10 to-amber-500/5', glow: 'rgba(251,191,36,0.15)' },
              { icon: Globe, title: '20+ Global Servers', desc: 'เซิร์ฟเวอร์ Bare Metal กระจายทั่วโลก ไทย สิงคโปร์ ญี่ปุ่น สหรัฐ เลือกได้ตามใจ', color: 'text-cyan-400', border: 'border-cyan-500/20', bg: 'from-cyan-500/10 to-cyan-500/5', glow: 'rgba(6,182,212,0.15)' },
              { icon: Eye, title: 'Zero-Log Policy', desc: 'ไม่เก็บข้อมูลใดๆ ทั้งสิ้น ไม่ว่าจะเป็น IP, DNS Query, Browsing History หรือ Metadata', color: 'text-pink-400', border: 'border-pink-500/20', bg: 'from-pink-500/10 to-pink-500/5', glow: 'rgba(236,72,153,0.15)' },
              { icon: MonitorSmartphone, title: 'ทุกอุปกรณ์', desc: 'iOS, Android, Windows, macOS ใช้ได้ทุกแพลตฟอร์ม พร้อมคู่มือละเอียดทุกขั้นตอน', color: 'text-orange-400', border: 'border-orange-500/20', bg: 'from-orange-500/10 to-orange-500/5', glow: 'rgba(249,115,22,0.15)' },
              { icon: Headphones, title: 'Support 24/7', desc: 'ทีมผู้เชี่ยวชาญพร้อมให้บริการตลอด 24 ชม. ผ่าน Ticket, Facebook, Line Official', color: 'text-violet-400', border: 'border-violet-500/20', bg: 'from-violet-500/10 to-violet-500/5', glow: 'rgba(139,92,246,0.15)' },
            ].map((f, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`group relative p-7 rounded-2xl bg-white/[0.02] border ${f.border} transition-all overflow-hidden`}
              >
                {/* Hover radial glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(circle at 30% 30%, ${f.glow}, transparent 70%)` }}
                />
                {/* Icon */}
                <div className={`relative w-14 h-14 bg-gradient-to-br ${f.bg} border ${f.border} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon className={`w-7 h-7 ${f.color}`} />
                </div>
                <h3 className="relative text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="relative text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          WHAT YOU GET - Glowing Comparison
          ══════════════════════════════════════════════════════ */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(251,191,36,0.03),transparent)]" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight">
              สิ่งที่คุณจะ<span className="bg-gradient-to-r from-sky-400 to-amber-400 bg-clip-text text-transparent">ได้รับ</span>
            </h2>
            <p className="text-zinc-500">เปรียบเทียบทุกฟีเจอร์ที่คุณจะได้</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-sky-500/10 overflow-hidden backdrop-blur-sm"
          >
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-sky-500/[0.06] to-amber-500/[0.04] border-b border-sky-500/10">
              <div className="flex items-center gap-2">
                <Crown size={16} className="text-amber-400" />
                <span className="text-sm font-bold text-white">Songkran VPN Package</span>
              </div>
            </div>

            <div className="grid grid-cols-1 divide-y divide-white/[0.03]">
              {[
                { feature: 'ความเร็วสูงสุด', value: '10Gbps', desc: 'ไม่จำกัดแบนด์วิธ', icon: Zap },
                { feature: 'โปรโตคอล', value: 'VLESS + XTLS Reality', desc: 'เร็วและปลอดภัยที่สุด', icon: Lock },
                { feature: 'การเข้ารหัส', value: 'AES-256-GCM', desc: 'ระดับธนาคาร', icon: Shield },
                { feature: 'เซิร์ฟเวอร์', value: '20+ ทั่วโลก', desc: 'Bare Metal Server', icon: Globe },
                { feature: 'Uptime', value: '99.9%', desc: 'Auto-Failover', icon: Activity },
                { feature: 'รองรับค่าย', value: 'AIS, TRUE, DTAC', desc: 'ทุกค่ายในไทย', icon: Wifi },
                { feature: 'อุปกรณ์', value: 'ทุกแพลตฟอร์ม', desc: 'iOS, Android, Win, Mac', icon: MonitorSmartphone },
                { feature: 'ซัพพอร์ต', value: '24/7', desc: 'Ticket, Facebook, Line', icon: Headphones },
                { feature: 'Log Policy', value: 'Zero-Log', desc: 'ไม่เก็บข้อมูลใดๆ', icon: Eye },
                { feature: 'ราคาเริ่มต้น', value: '2 บาท/วัน', desc: 'ไม่มีค่าแรกเข้า', icon: Gift },
              ].map((row, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between px-6 py-4 hover:bg-sky-500/[0.03] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-500/[0.06] flex items-center justify-center group-hover:bg-sky-500/[0.1] transition-colors">
                      <row.icon className="w-4 h-4 text-sky-400/60" />
                    </div>
                    <span className="text-sm text-zinc-300">{row.feature}</span>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{row.value}</span>
                    <span className="text-[11px] text-zinc-600 hidden sm:inline">({row.desc})</span>
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          HOW IT WORKS - 3 Songkran Steps with Connection Line
          ══════════════════════════════════════════════════════ */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_100%,rgba(56,189,248,0.03),transparent)]" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-xs font-black text-sky-400 tracking-[0.25em] uppercase mb-3">How It Works</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              เริ่มสาดน้ำใน <span className="bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">3</span> ขั้นตอน
            </h2>
          </motion.div>

          <div className="relative">
            {/* Connection line (desktop) */}
            <div className="hidden md:block absolute top-[60px] left-[16.67%] right-[16.67%] h-[2px] bg-gradient-to-r from-sky-500/20 via-amber-500/20 to-pink-500/20" />
            <motion.div
              className="hidden md:block absolute top-[59px] left-[16.67%] right-[16.67%] h-[3px] bg-gradient-to-r from-sky-400/40 via-amber-400/40 to-pink-400/40 rounded-full"
              initial={{ scaleX: 0, originX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 1 }}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
              {[
                { step: '01', title: 'สมัครสมาชิกฟรี', desc: 'สร้างบัญชีใหม่ได้ใน 30 วินาที กรอกข้อมูลพื้นฐานเท่านั้น ไม่ต้องใช้บัตรเครดิต', icon: Rocket, emoji: '🌊', gradient: 'from-sky-500 to-cyan-500', bg: 'from-sky-500/15 to-cyan-500/10', border: 'border-sky-500/25' },
                { step: '02', title: 'เติมเงิน & ซื้อ VPN', desc: 'เติมเงินผ่าน TrueMoney Wallet หรือสลิปธนาคาร ขั้นต่ำ 50 บาท แล้วเลือกเซิร์ฟเวอร์', icon: Gift, emoji: '🌸', gradient: 'from-amber-500 to-orange-500', bg: 'from-amber-500/15 to-orange-500/10', border: 'border-amber-500/25' },
                { step: '03', title: 'เชื่อมต่อทันที', desc: 'ดาวน์โหลดแอพ V2Box หรือ v2rayNG กดปุ่ม Subscribe URL แล้วเปิดใช้งาน VPN ได้เลย', icon: Wifi, emoji: '☀️', gradient: 'from-pink-500 to-rose-500', bg: 'from-pink-500/15 to-rose-500/10', border: 'border-pink-500/25' },
              ].map((item, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.2 }}
                  className="text-center relative"
                >
                  {/* Step circle with icon */}
                  <div className="relative inline-block mb-6">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`w-[120px] h-[120px] bg-gradient-to-br ${item.bg} border ${item.border} rounded-3xl flex items-center justify-center mx-auto relative`}
                    >
                      <item.icon className="w-12 h-12 text-white/80" />
                      {/* Step number badge */}
                      <div className={`absolute -top-3 -right-3 w-9 h-9 bg-gradient-to-r ${item.gradient} rounded-xl flex items-center justify-center text-sm font-black text-white shadow-lg`}>
                        {item.step}
                      </div>
                      {/* Emoji badge */}
                      <div className="absolute -bottom-2 -left-2 text-2xl">
                        {item.emoji}
                      </div>
                    </motion.div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed max-w-xs mx-auto">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CARRIER SUPPORT with animated cards
          ══════════════════════════════════════════════════════ */}
      <section className="py-20 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
              รองรับ<span className="bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">ทุกค่าย</span>มือถือ
            </h2>
            <p className="text-zinc-500 text-sm">เชื่อมต่อได้ทุกค่ายมือถือในประเทศไทย</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { name: 'AIS', sub: '5G / 4G', desc: 'รองรับทุกแพ็กเกจ ความเร็วเต็มสปีด', gradient: 'from-green-500/10 to-emerald-500/5', border: 'border-green-500/20', color: 'text-green-400' },
              { name: 'TRUE', sub: '5G / 4G', desc: 'รองรับทุกแพ็กเกจ Ping ต่ำสุด', gradient: 'from-red-500/10 to-orange-500/5', border: 'border-red-500/20', color: 'text-red-400' },
              { name: 'DTAC', sub: '4G / 5G', desc: 'รองรับทุกแพ็กเกจ เชื่อมต่อทันที', gradient: 'from-blue-500/10 to-sky-500/5', border: 'border-blue-500/20', color: 'text-blue-400' },
            ].map((c, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className={`p-6 rounded-2xl bg-gradient-to-b ${c.gradient} border ${c.border} text-center transition-all`}
              >
                <div className={`text-2xl font-black ${c.color} mb-0.5`}>{c.name}</div>
                <div className="text-xs text-zinc-500 mb-2">{c.sub}</div>
                <p className="text-sm text-zinc-400">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SHARED SECTIONS: Pricing, Testimonials, FAQ
          ══════════════════════════════════════════════════════ */}
      <PricingSection />
      <TestimonialsSection />
      <FAQSection />

      {/* ══════════════════════════════════════════════════════
          FINAL CTA - Grand Songkran Ending
          ══════════════════════════════════════════════════════ */}
      <section className="py-32 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(56,189,248,0.06),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_30%_60%,rgba(251,191,36,0.04),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_70%_40%,rgba(244,114,182,0.03),transparent)]" />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div key={i}
              className="absolute rounded-full"
              style={{
                left: `${10 + i * 12}%`,
                top: `${20 + (i % 3) * 25}%`,
                width: i % 2 === 0 ? 3 : 2,
                height: i % 2 === 0 ? 3 : 2,
                background: i % 3 === 0
                  ? 'rgba(56,189,248,0.5)'
                  : i % 3 === 1
                    ? 'rgba(251,191,36,0.5)'
                    : 'rgba(244,114,182,0.4)',
                boxShadow: `0 0 8px ${i % 3 === 0 ? 'rgba(56,189,248,0.3)' : i % 3 === 1 ? 'rgba(251,191,36,0.3)' : 'rgba(244,114,182,0.3)'}`,
              }}
              animate={{ y: [0, -25, 0], opacity: [0.3, 1, 0.3], scale: [1, 1.5, 1] }}
              transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* Icon with glow */}
            <div className="relative inline-block mb-8">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-24 h-24 bg-gradient-to-br from-sky-500/15 to-cyan-500/10 border border-sky-500/25 rounded-3xl flex items-center justify-center mx-auto"
              >
                <Droplets className="w-12 h-12 text-sky-400" />
              </motion.div>
              {/* Orbiting glow */}
              <motion.div
                className="absolute -inset-4 rounded-3xl"
                style={{ boxShadow: '0 0 40px rgba(56,189,248,0.15), 0 0 80px rgba(56,189,248,0.05)' }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>

            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 tracking-tight leading-[0.95]">
              สาดน้ำ
              <br />
              <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-amber-400 bg-clip-text text-transparent">
                สาดความเร็ว
              </span>
            </h2>
            <p className="text-zinc-400 mb-10 text-lg max-w-lg mx-auto leading-relaxed">
              เริ่มต้นใช้งานวันนี้ สัมผัส VPN ที่เร็วแรงดั่งสายน้ำ
              <br className="hidden sm:block" />
              ไม่มีค่าแรกเข้า ไม่ผูกมัด
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register"
                className="group relative inline-flex items-center gap-2 px-10 py-5 rounded-2xl font-black text-base transition-all hover:scale-[1.03]"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-sky-500 via-cyan-400 to-sky-500 bg-[length:200%_100%] animate-[shimmer_3s_linear_infinite]" />
                <div className="absolute inset-0 rounded-2xl shadow-[0_0_30px_rgba(56,189,248,0.3)] group-hover:shadow-[0_0_50px_rgba(56,189,248,0.4)]" />
                <span className="relative flex items-center gap-2 text-white">
                  <Droplets size={18} />
                  สาดน้ำเริ่มใช้งาน
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link href="/login"
                className="inline-flex items-center gap-2 text-zinc-500 hover:text-sky-400 font-medium transition-colors"
              >
                เข้าสู่ระบบ <ChevronRight size={16} />
              </Link>
            </div>
            <p className="text-xs text-zinc-700 mt-10 flex items-center justify-center gap-2">
              <Heart className="w-3 h-3 text-red-500" /> ผู้ใช้งานกว่า 50,000+ คนไว้วางใจ
            </p>
          </motion.div>
        </div>
      </section>

      {/* Shimmer keyframes */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </main>
  )
}
