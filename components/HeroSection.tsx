'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  ChevronRight, Play, 
  Users, Rocket, Wifi, Server, Sparkles, Zap
} from 'lucide-react'
import Link from 'next/link'

// Star field data — positioned by CSS, animated by CSS keyframes (GPU only)
const stars: { top: string; left: string; size: 'sm' | 'md' | 'lg'; delay: string; duration: string }[] = [
  // Small stars - lots of them scattered across
  { top: '5%', left: '10%', size: 'sm', delay: '0s', duration: '3s' },
  { top: '12%', left: '85%', size: 'sm', delay: '0.5s', duration: '4s' },
  { top: '8%', left: '45%', size: 'sm', delay: '1s', duration: '3.5s' },
  { top: '18%', left: '72%', size: 'sm', delay: '1.5s', duration: '3s' },
  { top: '25%', left: '5%', size: 'sm', delay: '2s', duration: '4.5s' },
  { top: '32%', left: '92%', size: 'sm', delay: '0.3s', duration: '3.8s' },
  { top: '40%', left: '18%', size: 'sm', delay: '1.8s', duration: '3.2s' },
  { top: '55%', left: '78%', size: 'sm', delay: '0.7s', duration: '4.2s' },
  { top: '62%', left: '35%', size: 'sm', delay: '2.5s', duration: '3.6s' },
  { top: '70%', left: '58%', size: 'sm', delay: '1.2s', duration: '3s' },
  { top: '78%', left: '8%', size: 'sm', delay: '0.8s', duration: '4s' },
  { top: '85%', left: '90%', size: 'sm', delay: '2.2s', duration: '3.4s' },
  { top: '15%', left: '28%', size: 'sm', delay: '3s', duration: '3.5s' },
  { top: '48%', left: '95%', size: 'sm', delay: '1.6s', duration: '4.5s' },
  { top: '90%', left: '42%', size: 'sm', delay: '0.4s', duration: '3.8s' },
  { top: '35%', left: '55%', size: 'sm', delay: '2.8s', duration: '3s' },
  { top: '22%', left: '65%', size: 'sm', delay: '1.3s', duration: '4.2s' },
  { top: '65%', left: '12%', size: 'sm', delay: '0.9s', duration: '3.6s' },
  { top: '50%', left: '42%', size: 'sm', delay: '2.1s', duration: '4s' },
  { top: '80%', left: '68%', size: 'sm', delay: '3.2s', duration: '3.2s' },
  // Medium stars
  { top: '10%', left: '60%', size: 'md', delay: '0.6s', duration: '4s' },
  { top: '30%', left: '25%', size: 'md', delay: '1.4s', duration: '5s' },
  { top: '45%', left: '80%', size: 'md', delay: '2.4s', duration: '4.5s' },
  { top: '68%', left: '48%', size: 'md', delay: '0.2s', duration: '5.5s' },
  { top: '88%', left: '15%', size: 'md', delay: '1.8s', duration: '4.2s' },
  { top: '20%', left: '38%', size: 'md', delay: '3.5s', duration: '5s' },
  { top: '58%', left: '88%', size: 'md', delay: '0.8s', duration: '4.8s' },
  { top: '75%', left: '30%', size: 'md', delay: '2.6s', duration: '5.2s' },
  // Large bright stars
  { top: '15%', left: '75%', size: 'lg', delay: '1s', duration: '6s' },
  { top: '42%', left: '8%', size: 'lg', delay: '2s', duration: '5s' },
  { top: '72%', left: '82%', size: 'lg', delay: '3s', duration: '7s' },
  { top: '55%', left: '25%', size: 'lg', delay: '0.5s', duration: '5.5s' },
  { top: '28%', left: '50%', size: 'lg', delay: '4s', duration: '6.5s' },
]

// Cross-shaped extra bright stars
const crossStars = [
  { top: '18%', left: '82%', delay: '0s', duration: '4s' },
  { top: '60%', left: '6%', delay: '2s', duration: '5s' },
  { top: '38%', left: '65%', delay: '3.5s', duration: '4.5s' },
]

// Shooting stars
const shootingStars = [
  { top: '8%', left: '70%', delay: '1s', duration: '1.5s', animation: 'shooting-star', interval: '8s' },
  { top: '25%', left: '40%', delay: '5s', duration: '1.2s', animation: 'shooting-star-2', interval: '12s' },
  { top: '15%', left: '55%', delay: '9s', duration: '1.3s', animation: 'shooting-star', interval: '15s' },
]

export function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 50, filter: 'blur(10px)' },
    visible: { 
      opacity: 1, 
      y: 0,
      filter: 'blur(0px)',
      transition: { type: "spring" as const, stiffness: 60, damping: 15 }
    }
  }

  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-20 bg-black overflow-hidden">
      
      {/* ========== STAR FIELD ========== */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        {/* Twinkling stars */}
        {stars.map((star, i) => (
          <div
            key={i}
            className={`hero-star hero-star--${star.size}`}
            style={{
              top: star.top,
              left: star.left,
              animation: `${star.size === 'lg' ? 'twinkle-bright' : 'twinkle'} ${star.duration} ease-in-out ${star.delay} infinite`,
            }}
          />
        ))}

        {/* Cross-shaped bright stars */}
        {crossStars.map((star, i) => (
          <div
            key={`cross-${i}`}
            className="hero-star--cross"
            style={{
              position: 'absolute',
              top: star.top,
              left: star.left,
              animationDelay: star.delay,
              animationDuration: star.duration,
            }}
          />
        ))}

        {/* Shooting stars */}
        {shootingStars.map((star, i) => (
          <div
            key={`shoot-${i}`}
            className="hero-shooting-star"
            style={{
              top: star.top,
              left: star.left,
              animation: `${star.animation} ${star.duration} ease-out ${star.delay} infinite`,
              animationDelay: star.delay,
            }}
          />
        ))}
      </div>

      {/* ========== AURORA BACKGROUND ========== */}
      <div className="absolute inset-0 hero-aurora z-[1]" />
      
      {/* Static radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.12),transparent)] z-[2]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(34,211,238,0.05),transparent_50%)] z-[2]" />
      
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black via-black/80 to-transparent z-[3]" />

      {/* ========== GLOWING ORBS ========== */}
      <div className="hero-orb top-16 right-[12%] w-80 h-80 bg-cyan-500" 
           style={{ filter: 'blur(100px)', animation: 'orb-pulse 8s ease-in-out infinite' }} />
      <div className="hero-orb bottom-16 left-[8%] w-96 h-96 bg-violet-500" 
           style={{ filter: 'blur(120px)', animation: 'orb-pulse-alt 10s ease-in-out infinite' }} />
      <div className="hero-orb top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-500"
           style={{ filter: 'blur(130px)', animation: 'orb-pulse 12s ease-in-out infinite', animationDelay: '3s' }} />

      {/* ========== CONTENT ========== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-20">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Top badge */}
            <motion.div variants={itemVariants} className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm">
                <Sparkles size={14} className="text-cyan-400 animate-spin-slow" />
                <span className="text-sm text-zinc-300 font-medium">VPN ความเร็วสูงอันดับ 1 ในไทย</span>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
              </div>
            </motion.div>

            {/* Main heading */}
            <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tight">
              <span className="block">อินเทอร์เน็ตที่</span>
              <span className="block mt-2">
                <span className="hero-gradient-text">เร็ว</span>
                {" "}และ{" "}
                <span className="hero-gradient-text-alt">ปลอดภัย</span>
              </span>
            </motion.h1>

            {/* Animated underline */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 1.2, duration: 1, ease: "easeOut" }}
              className="mx-auto mb-8 h-[2px] w-40 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"
            />

            {/* Subtitle */}
            <motion.p variants={itemVariants} className="text-base sm:text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              เข้าถึงทุกเว็บไซต์ด้วยความเร็วแสง เล่นเกมไม่แลค ดูหนัง 4K ไม่กระตุก
              <br className="hidden sm:block" />
              เริ่มต้นเพียง <span className="text-white font-semibold">2 บาท/วัน</span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link 
                  href="/register" 
                  className="group relative inline-flex items-center justify-center gap-2.5 px-9 py-4 bg-white text-black rounded-2xl font-bold text-base transition-all shadow-[0_0_30px_rgba(255,255,255,0.08)] hover:shadow-[0_0_50px_rgba(255,255,255,0.15)]"
                >
                  <Rocket size={18} />
                  สมัครใช้งานฟรี
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link 
                  href="/public-vless" 
                  className="group inline-flex items-center justify-center gap-2.5 px-9 py-4 bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.08] hover:border-white/[0.15] rounded-2xl font-bold text-base transition-all backdrop-blur-sm"
                >
                  <Play size={16} className="fill-cyan-400 text-cyan-400" />
                  ทดลองใช้ฟรี
                </Link>
              </motion.div>
            </motion.div>

            {/* Stats row */}
            <motion.div variants={itemVariants}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5 max-w-2xl mx-auto">
                {[
                  { icon: Users, value: "1,000+", label: "ผู้ใช้งาน", color: "text-cyan-400", glow: "shadow-[0_0_20px_rgba(34,211,238,0.08)]" },
                  { icon: Server, value: "20+", label: "เซิร์ฟเวอร์", color: "text-violet-400", glow: "shadow-[0_0_20px_rgba(168,85,247,0.08)]" },
                  { icon: Wifi, value: "99.9%", label: "ออนไลน์", color: "text-emerald-400", glow: "shadow-[0_0_20px_rgba(52,211,153,0.08)]" },
                  { icon: Zap, value: "10Gbps", label: "ความเร็ว", color: "text-amber-400", glow: "shadow-[0_0_20px_rgba(251,191,36,0.08)]" },
                ].map((stat, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4 + idx * 0.12, type: "spring", stiffness: 80 }}
                    whileHover={{ y: -4, scale: 1.03 }}
                    className={`group relative p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] backdrop-blur-sm transition-all text-center ${stat.glow} hover:shadow-lg`}
                  >
                    <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-2 opacity-70`} />
                    <div className="text-xl sm:text-2xl font-black text-white">{stat.value}</div>
                    <div className="text-[11px] text-zinc-500 font-medium mt-0.5">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ========== SCROLL INDICATOR ========== */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
        <div className="w-6 h-10 rounded-full border-2 border-white/[0.12] flex justify-center pt-2">
          <div 
            className="w-1 h-2 bg-white/40 rounded-full"
            style={{ animation: 'scroll-hint 2s ease-in-out infinite' }}
          />
        </div>
      </div>
    </section>
  )
}
