'use client'

import { motion } from 'framer-motion'
import { MapPin, ShieldCheck, Clock, Activity, Rocket, Globe } from 'lucide-react'
import Link from 'next/link'
import FadeIn from './FadeIn'

const serverLocations = [
  { flag: "🇹🇭", name: "กรุงเทพ", ping: "<1ms", country: "Thailand", status: "online" },
  { flag: "🇹🇭", name: "เชียงใหม่", ping: "2ms", country: "Thailand", status: "online" },
  { flag: "🇸🇬", name: "สิงคโปร์", ping: "15ms", country: "Singapore", status: "online" },
  { flag: "🇯🇵", name: "โตเกียว", ping: "45ms", country: "Japan", status: "online" },
  { flag: "🇭🇰", name: "ฮ่องกง", ping: "25ms", country: "Hong Kong", status: "online" },
  { flag: "🇰🇷", name: "โซล", ping: "40ms", country: "South Korea", status: "online" },
  { flag: "🇺🇸", name: "ลอสแองเจลิส", ping: "180ms", country: "USA", status: "online" },
  { flag: "🇬🇧", name: "ลอนดอน", ping: "220ms", country: "UK", status: "online" },
  { flag: "🇩🇪", name: "แฟรงก์เฟิร์ต", ping: "200ms", country: "Germany", status: "online" },
  { flag: "🇦🇺", name: "ซิดนีย์", ping: "150ms", country: "Australia", status: "online" },
  { flag: "🇮🇳", name: "มุมไบ", ping: "80ms", country: "India", status: "online" },
  { flag: "🇹🇼", name: "ไทเป", ping: "35ms", country: "Taiwan", status: "online" },
]

export default function ServerLocationsSection() {
  return (
    <section className="relative py-24 md:py-32 bg-black overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(120,119,198,0.04)_0%,transparent_50%)]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <FadeIn>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] text-zinc-400 text-sm font-medium mb-6">
              <MapPin size={16} className="text-blue-400" />
              ให้บริการทั่วโลก
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-5 leading-tight">
              เซิร์ฟเวอร์{' '}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                20+ แห่งทั่วโลก
              </span>
            </h2>
            <p className="text-zinc-500 text-base md:text-lg max-w-2xl mx-auto">
              เชื่อมต่อได้จากทุกที่ทั่วโลก ด้วยความเร็วสูงสุด 10Gbps ไม่มีดีเลย์
            </p>
          </div>
        </FadeIn>

        {/* Server Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-12">
          {serverLocations.map((loc, idx) => (
            <FadeIn key={idx} delay={idx * 0.04} direction="up">
              <motion.div
                whileHover={{ y: -5, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="group relative p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] text-center transition-all overflow-hidden"
              >
                {/* Corner glow on hover */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                
                <div className="relative z-10">
                  <div className="text-3xl mb-2 group-hover:scale-125 transition-transform duration-300">{loc.flag}</div>
                  <div className="text-sm font-bold text-white mb-0.5">{loc.name}</div>
                  <div className="text-[10px] text-zinc-600 mb-2">{loc.country}</div>
                  <div className="flex items-center justify-center gap-1">
                    <motion.div 
                      className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 2, repeat: Infinity, delay: idx * 0.2 }}
                    />
                    <span className="text-xs text-emerald-400 font-medium">{loc.ping}</span>
                  </div>
                </div>
              </motion.div>
            </FadeIn>
          ))}
        </div>

        {/* Server Features Banner */}
        <FadeIn delay={0.3}>
          <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-center gap-4 group">
                <motion.div 
                  whileHover={{ rotate: 10 }}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 p-[1.5px] flex-shrink-0"
                >
                  <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
                    <ShieldCheck className="w-7 h-7 text-blue-400" />
                  </div>
                </motion.div>
                <div>
                  <div className="font-bold text-white text-lg">ความปลอดภัยสูง</div>
                  <div className="text-sm text-zinc-500">เข้ารหัส AES-256-GCM</div>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <motion.div 
                  whileHover={{ rotate: 10 }}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 p-[1.5px] flex-shrink-0"
                >
                  <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
                    <Clock className="w-7 h-7 text-violet-400" />
                  </div>
                </motion.div>
                <div>
                  <div className="font-bold text-white text-lg">ออนไลน์ 24/7</div>
                  <div className="text-sm text-zinc-500">Uptime 99.9% ไม่มีดาวน์ไทม์</div>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <motion.div 
                  whileHover={{ rotate: 10 }}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 p-[1.5px] flex-shrink-0"
                >
                  <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
                    <Activity className="w-7 h-7 text-emerald-400" />
                  </div>
                </motion.div>
                <div>
                  <div className="font-bold text-white text-lg">ความเร็ว 10Gbps</div>
                  <div className="text-sm text-zinc-500">Bare Metal Server ทุกโลเคชั่น</div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* CTA */}
        <FadeIn delay={0.4}>
          <div className="mt-10 text-center">
            <p className="text-zinc-600 text-sm mb-5">และอีกกว่า 10+ โลเคชั่นทั่วโลก</p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                href="/register" 
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-bold transition-all hover:shadow-lg hover:shadow-blue-500/25"
              >
                <Globe size={18} />
                สมัครเพื่อดูทั้งหมด
                <Rocket size={18} />
              </Link>
            </motion.div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
