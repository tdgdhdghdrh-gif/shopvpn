'use client'

import { motion } from 'framer-motion'
import { Gift, Rocket, Sparkles, ArrowRight, Shield, Zap, Star } from 'lucide-react'
import Link from 'next/link'
import FadeIn from './FadeIn'

export default function CTASection() {
  return (
    <section className="relative py-24 md:py-32 bg-black overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <FadeIn>
          <div className="relative rounded-3xl overflow-hidden">
            {/* Background gradient — dark sophisticated version */}
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-900" />
            
            {/* Gradient border effect */}
            <div className="absolute inset-0 rounded-3xl border border-white/[0.08]" />
            
            {/* Subtle gradient orbs */}
            <motion.div
              animate={{ opacity: [0.15, 0.3, 0.15], scale: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-20 -right-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px]"
            />
            <motion.div
              animate={{ opacity: [0.1, 0.25, 0.1], scale: [1.1, 1, 1.1] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute -bottom-20 -left-20 w-80 h-80 bg-violet-500/10 rounded-full blur-[100px]"
            />
            
            {/* Dot pattern overlay */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '24px 24px',
            }} />
            
            {/* Content */}
            <div className="relative z-10 py-16 px-8 md:px-16 text-center">
              {/* Badge */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] text-zinc-300 text-sm font-medium mb-8 border border-white/[0.08]"
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles size={16} className="text-cyan-400" />
                </motion.div>
                โปรโมชั่นพิเศษสำหรับสมาชิกใหม่
                <Gift size={16} className="text-pink-400" />
              </motion.div>

              {/* Heading */}
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight"
              >
                พร้อมเริ่มต้นใช้งาน
                <br />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">อินเทอร์เน็ตที่ดีกว่า?</span>
              </motion.h2>

              {/* Description */}
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-zinc-400 text-lg mb-10 max-w-2xl mx-auto"
              >
                สมัครสมาชิกวันนี้ รับสิทธิ์ทดลองใช้ฟรี ไม่ต้องใช้บัตรเครดิต
                <br className="hidden sm:block" />
                ยกเลิกได้ทุกเมื่อ ไม่มีค่าใช้จ่ายแอบแฝง
              </motion.p>

              {/* Feature pills */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap items-center justify-center gap-3 mb-10"
              >
                {[
                  { icon: Shield, text: "เข้ารหัส AES-256", color: "text-emerald-400" },
                  { icon: Zap, text: "ความเร็ว 10Gbps", color: "text-cyan-400" },
                  { icon: Star, text: "ซัพพอร์ต 24/7", color: "text-violet-400" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] text-zinc-300 text-sm">
                    <item.icon size={14} className={item.color} />
                    {item.text}
                  </div>
                ))}
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    href="/register" 
                    className="group inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/25 rounded-2xl font-black text-lg transition-all"
                  >
                    <Rocket size={22} />
                    สมัครฟรีเลย
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    href="/login" 
                    className="inline-flex items-center gap-2 px-10 py-4 bg-white/[0.03] hover:bg-white/[0.06] text-white border border-white/[0.08] rounded-2xl font-bold text-lg transition-all"
                  >
                    เข้าสู่ระบบ
                  </Link>
                </motion.div>
              </motion.div>

              {/* Bottom text */}
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="text-zinc-600 text-sm mt-8"
              >
                ใช้งานโดย 1,000+ คนทั่วประเทศไทย
              </motion.p>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
