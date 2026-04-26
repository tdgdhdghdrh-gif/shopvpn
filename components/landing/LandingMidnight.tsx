'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import {
  Moon, Star, Shield, Zap, Globe, Sparkles, ChevronRight,
  Lock, Eye, Server, Users, Wifi, Check, ArrowRight,
  Heart, MonitorSmartphone, Timer, Award, Gift, Gem, Flame,
  TrendingUp, Headphones, Clock, Download, Activity, Crown,
  Play, Rocket, ArrowUpRight, CircleDot, Orbit,
} from 'lucide-react'
import PricingSection from '@/components/PricingSection'
import FAQSection from '@/components/FAQSection'
import TestimonialsSection from '@/components/TestimonialsSection'

const headlines = [
  { text: 'ความเร็วสูงสุด', highlight: '10Gbps' },
  { text: 'ปลอดภัยยามดึก', highlight: 'Military' },
  { text: 'เซิร์ฟเวอร์ทั่ว', highlight: 'โลก' },
  { text: 'Ping ต่ำสุด', highlight: '5ms' },
]

const STAR_DURATIONS = [2.1, 3.2, 1.8, 2.9, 3.5, 2.3, 1.9, 3.1, 2.5, 3.8, 2.0, 3.3, 2.7, 3.4, 1.6, 2.8]
function TwinklingStar({ delay, left, top, size, index = 0 }: { delay: number; left: string; top: string; size: number; index?: number }) {
  const duration = STAR_DURATIONS[index % STAR_DURATIONS.length]
  return (
    <motion.div className="absolute rounded-full bg-white"
      style={{ left, top, width: size, height: size, boxShadow: `0 0 ${size * 2}px rgba(255,255,255,0.3)`, willChange: 'transform, opacity' }}
      animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.8, 1.2, 0.8] }}
      transition={{ duration, repeat: Infinity, delay, ease: 'easeInOut' }} />
  )
}

function AnimatedMoon() {
  return (
    <motion.div className="absolute top-[10%] right-[15%] w-[120px] h-[120px] sm:w-[180px] sm:h-[180px]"
      animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(234,179,8,0.15)_0%,transparent_70%)]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-amber-200 via-yellow-100 to-amber-200 shadow-[0_0_60px_rgba(234,179,8,0.3)]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-24 sm:h-24">
        <div className="absolute top-[25%] left-[20%] w-2 h-2 rounded-full bg-amber-300/30" />
        <div className="absolute top-[60%] left-[55%] w-3 h-3 rounded-full bg-amber-300/20" />
      </div>
    </motion.div>
  )
}

function NebulaCloud({ top, left, width, height, color, delay }: { top: string; left: string; width: number; height: number; color: string; delay: number }) {
  return (
    <motion.div className="absolute rounded-full"
      style={{ top, left, width, height, background: `radial-gradient(ellipse, ${color} 0%, transparent 70%)`, filter: 'blur(40px)', willChange: 'transform, opacity' }}
      animate={{ x: [0, 30, -20, 0], opacity: [0.3, 0.5, 0.3] }}
      transition={{ duration: 15, repeat: Infinity, delay, ease: 'easeInOut' }} />
  )
}

function ShootingStar({ delay }: { delay: number }) {
  return (
    <motion.div className="absolute w-1 h-1 rounded-full bg-white"
      style={{ top: `${10 + Math.random() * 30}%`, left: `${Math.random() * 80}%`, boxShadow: '0 0 6px rgba(255,255,255,0.8), -20px 0 20px rgba(255,255,255,0.3)', willChange: 'transform, opacity' }}
      animate={{ x: [0, 200], y: [0, 100], opacity: [0, 1, 0] }}
      transition={{ duration: 1.5, repeat: Infinity, delay, ease: 'easeOut' }} />
  )
}

function AnimatedCounter({ value }: { value: string }) {
  return (
    <motion.span initial={{ opacity: 0, scale: 0.5 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 100 }} className="inline-block">
      {value}
    </motion.span>
  )
}

export default function LandingMidnight() {
  const [headlineIdx, setHeadlineIdx] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => setHeadlineIdx(p => (p + 1) % headlines.length), 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <main className="bg-[#030308] overflow-hidden" style={{ isolation: 'isolate' }}>
      <section className="relative min-h-screen flex items-center pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a] via-[#050510] to-[#030308]" />
        <NebulaCloud top="10%" left="20%" width={400} height={300} color="rgba(99,102,241,0.06)" delay={0} />
        <NebulaCloud top="30%" left="60%" width={350} height={250} color="rgba(139,92,246,0.05)" delay={5} />
        <NebulaCloud top="50%" left="10%" width={300} height={200} color="rgba(234,179,8,0.03)" delay={10} />
        <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.04) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.7, 0.5] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} />
        <div className="absolute inset-0 pointer-events-none">
          {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(i => (
            <TwinklingStar key={i} delay={i * 0.2} left={`${3 + i * 6}%`} top={`${5 + (i % 5) * 12}%`} size={1 + (i % 3)} index={i} />
          ))}
        </div>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <ShootingStar delay={0} /><ShootingStar delay={4} /><ShootingStar delay={8} />
        </div>
        <AnimatedMoon />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#030308] to-transparent z-[3]" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex justify-center mb-10">
              <div className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-indigo-500/[0.08] border border-indigo-500/20 backdrop-blur-sm">
                <Moon size={16} className="text-indigo-400" /><span className="text-sm text-indigo-300 font-bold tracking-wider">MIDNIGHT VPN</span><Star size={14} className="text-amber-400" />
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-8">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[0.95] tracking-tighter">
                <span className="block mb-2">VPN ยามเที่ยงคืน</span>
                <span className="block">
                  <AnimatePresence mode="wait">
                    <motion.span key={headlineIdx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="inline-block">
                      {headlines[headlineIdx].text}{' '}
                      <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-amber-400 bg-clip-text text-transparent">{headlines[headlineIdx].highlight}</span>
                    </motion.span>
                  </AnimatePresence>
                </span>
              </h1>
            </motion.div>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-lg sm:text-xl text-indigo-200/70 max-w-2xl mx-auto mb-10 leading-relaxed">หรูหรา ลึกลับ ปลอดภัย ดั่งแสงดาวยามค่ำคืน</motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/register" className="group relative px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-500 text-white font-bold text-lg shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:scale-105">
                <span className="flex items-center gap-2">เข้าสู่โลกกลางคืน <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></span>
              </Link>
              <Link href="/public-vless" className="px-8 py-4 rounded-2xl border border-indigo-500/30 text-indigo-300 font-bold text-lg hover:bg-indigo-500/10 transition-all">ทดลองใช้ฟรี</Link>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
                {[{ value: '50K+', label: 'ผู้ใช้งาน', icon: Users }, { value: '20+', label: 'เซิร์ฟเวอร์', icon: Globe }, { value: '99.9%', label: 'Uptime', icon: Wifi }, { value: '<5ms', label: 'Ping', icon: Zap }].map((s, i) => (
                  <motion.div key={i} whileHover={{ y: -4 }} className="p-4 rounded-2xl bg-indigo-500/[0.03] border border-indigo-500/10 text-center hover:border-indigo-500/20 transition-all">
                    <s.icon className="w-5 h-5 text-indigo-400/60 mx-auto mb-2" /><div className="text-xl font-black text-white"><AnimatedCounter value={s.value} /></div><div className="text-[11px] text-zinc-600">{s.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/[0.06] border border-indigo-500/15 mb-6"><Gem size={14} className="text-indigo-400" /><span className="text-sm text-indigo-300 font-medium">Midnight Features</span></div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">หรูหรายาม<span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">ค่ำคืน</span></h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Zap, title: 'ความเร็ว 10Gbps', desc: 'เร็วดั่งแสงดาวที่พุ่งผ่านท้องฟ้า', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
              { icon: Shield, title: 'เข้ารหัส AES-256', desc: 'ปลอดภัยดั่งความมืดที่ซ่อนเร้น', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
              { icon: Globe, title: '20+ Global Servers', desc: 'เซิร์ฟเวอร์กระจายทั่วจักรวาล', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
              { icon: Eye, title: 'Zero-Log Policy', desc: 'ไม่เก็บข้อมูลใดๆ ดั่งความลับของจักรวาล', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
              { icon: MonitorSmartphone, title: 'ทุกอุปกรณ์', desc: 'iOS, Android, Windows, macOS', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
              { icon: Headphones, title: 'VIP Support 24/7', desc: 'ทีมผู้เชี่ยวชาญพร้อมตลอด 24 ชม.', color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10 border-fuchsia-500/20' },
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="group p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-indigo-500/20 transition-all">
                <div className={`w-12 h-12 ${f.bg} border rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}><f.icon className={`w-6 h-6 ${f.color}`} /></div>
                <h3 className="text-base font-bold text-white mb-2">{f.title}</h3><p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 border-t border-indigo-500/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight">สิ่งที่คุณจะ<span className="text-indigo-400">ได้รับ</span></h2>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-2xl border border-indigo-500/10 overflow-hidden">
            <div className="grid grid-cols-1 divide-y divide-indigo-500/5">
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
                <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-indigo-500/[0.02] transition-colors">
                  <div className="flex items-center gap-3"><Check className="w-4 h-4 text-indigo-400 shrink-0" /><span className="text-sm text-zinc-300">{row.feature}</span></div>
                  <div className="text-right"><span className="text-sm font-bold text-white">{row.value}</span><span className="text-[11px] text-zinc-600 ml-2 hidden sm:inline">{row.desc}</span></div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 border-t border-indigo-500/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-xs font-bold text-indigo-400 tracking-[0.2em] uppercase mb-3">Getting Started</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">เริ่มต้นใน <span className="text-indigo-400">3</span> ขั้นตอน</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[{ step: '01', title: 'สมัครสมาชิกฟรี', desc: 'สร้างบัญชีใหม่ได้ใน 30 วินาที', icon: Moon },
              { step: '02', title: 'เติมเงิน & ซื้อ VPN', desc: 'เติมเงินผ่าน TrueMoney Wallet ขั้นต่ำ 50 บาท', icon: Orbit },
              { step: '03', title: 'เชื่อมต่อทันที', desc: 'ดาวน์โหลดแอพ V2Box หรือ v2rayNG', icon: Wifi },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5 relative">
                  <item.icon className="w-8 h-8 text-indigo-400" /><div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg flex items-center justify-center text-xs font-black">{item.step}</div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3><p className="text-sm text-zinc-500 leading-relaxed max-w-xs mx-auto">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-indigo-500/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">รองรับ<span className="text-indigo-400">ทุกค่าย</span>มือถือ</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[{ name: 'AIS 5G / 4G', desc: 'รองรับทุกแพ็กเกจ', color: 'border-green-500/15 bg-green-500/5' },
              { name: 'TRUE 5G / 4G', desc: 'Ping ต่ำสุด', color: 'border-red-500/15 bg-red-500/5' },
              { name: 'DTAC / dtac', desc: 'เชื่อมต่อทันที', color: 'border-blue-500/15 bg-blue-500/5' },
            ].map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`p-5 rounded-2xl border ${c.color} text-center`}><h3 className="text-base font-bold text-white mb-1">{c.name}</h3><p className="text-sm text-zinc-500">{c.desc}</p></motion.div>
            ))}
          </div>
        </div>
      </section>

      <PricingSection /><TestimonialsSection /><FAQSection />
    </main>
  )
}
