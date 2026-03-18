'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, Zap, Globe, ChevronRight, Play, 
  Users, Lock, Rocket, Star, Wifi, Server
} from 'lucide-react'
import Link from 'next/link'

export function HeroSection() {
  const stats = [
    { icon: Users, value: "1,000+", label: "ผู้ใช้งาน" },
    { icon: Server, value: "20+", label: "เซิร์ฟเวอร์" },
    { icon: Wifi, value: "99.9%", label: "ออนไลน์" },
    { icon: Zap, value: "10Gbps", label: "ความเร็ว" }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { type: "spring" as const, stiffness: 100, delay: 0.4 }
    }
  }

  return (
    <section className="relative min-h-[80vh] flex items-center pt-16 pb-16 bg-black overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-[100px]"
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [0, -90, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-cyan-500/10 to-blue-500/10 blur-[100px]"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Badge */}
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Star size={12} className="text-amber-500" />
              </motion.div>
              <span>VPN ความเร็วสูงอันดับ 1 ในไทย</span>
            </motion.div>

            {/* Heading */}
            <motion.h1 variants={itemVariants} className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              อินเทอร์เน็ตที่
              <motion.span 
                className="text-blue-500 inline-block"
                animate={{ 
                  textShadow: [
                    "0 0 20px rgba(59, 130, 246, 0)",
                    "0 0 20px rgba(59, 130, 246, 0.5)",
                    "0 0 20px rgba(59, 130, 246, 0)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >เร็ว</motion.span>
              {" "}และ{" "}
              <motion.span 
                className="text-blue-500 inline-block"
                animate={{ 
                  textShadow: [
                    "0 0 20px rgba(59, 130, 246, 0)",
                    "0 0 20px rgba(59, 130, 246, 0.5)",
                    "0 0 20px rgba(59, 130, 246, 0)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >ปลอดภัย</motion.span>
            </motion.h1>

            {/* Description */}
            <motion.p variants={itemVariants} className="text-zinc-500 text-base mb-8 max-w-lg leading-relaxed">
              เข้าถึงทุกเว็บไซต์ด้วยความเร็วแสง เล่นเกมไม่แลค ดูหนัง 4K ไม่กระตุก เริ่มต้นเพียง 50 บาท/เดือน
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mb-10">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  href="/register" 
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/25"
                >
                  <motion.div
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Rocket size={18} />
                  </motion.div>
                  สมัครใช้งานฟรี
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <ChevronRight size={16} />
                  </motion.div>
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  href="/public-vless" 
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 rounded-lg font-medium transition-colors"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Play size={16} className="fill-blue-500 text-blue-500" />
                  </motion.div>
                  ทดลองใช้ฟรี
                </Link>
              </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div variants={itemVariants} className="grid grid-cols-4 gap-4">
              {stats.map((stat, idx) => (
                <motion.div 
                  key={idx} 
                  className="text-center"
                  whileHover={{ y: -5, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div 
                    className="text-xl font-bold text-white"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + idx * 0.1, type: "spring" }}
                  >
                    {stat.value}
                  </motion.div>
                  <div className="text-xs text-zinc-600">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Content - Feature Cards */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 gap-4"
          >
            {[
              { icon: Shield, title: "ปลอดภัย", desc: "AES-256", color: "text-emerald-500", delay: 0 },
              { icon: Zap, title: "เร็ว", desc: "10Gbps", color: "text-amber-500", delay: 0.1 },
              { icon: Globe, title: "ทั่วโลก", desc: "20+ ประเทศ", color: "text-blue-500", delay: 0.2 },
              { icon: Lock, title: "ไม่เก็บ Log", desc: "Private", color: "text-purple-500", delay: 0.3 }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + item.delay, type: "spring" }}
                whileHover={{ 
                  scale: 1.05, 
                  rotateX: 5,
                  rotateY: 5,
                  transition: { type: "spring", stiffness: 300 }
                }}
                className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: item.delay }}
                >
                  <item.icon className={`w-8 h-8 ${item.color} mb-3`} />
                </motion.div>
                <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                <p className="text-xs text-zinc-600">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
