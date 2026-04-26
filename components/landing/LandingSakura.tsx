'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import {
  Flower2, Cherry, Shield, Zap, Globe, Star, ChevronRight,
  Lock, Eye, Server, Users, Wifi, Check, ArrowRight,
  Heart, MonitorSmartphone, Timer, Award, Gift, Gem, Flame,
  TrendingUp, Headphones, Clock, Download, Activity, Sparkles,
  Crown, Play, Rocket, ArrowUpRight, TreePine, Leaf,
} from 'lucide-react'
import PricingSection from '@/components/PricingSection'
import FAQSection from '@/components/FAQSection'
import TestimonialsSection from '@/components/TestimonialsSection'

const headlines = [
  { text: 'ความเร็วบานสะพรั่ง', highlight: '10Gbps' },
  { text: 'ปลอดภัยดั่งกลีบ', highlight: 'ซากุระ' },
  { text: 'เซิร์ฟเวอร์ทั่ว', highlight: 'ญี่ปุ่น' },
  { text: 'Ping ต่ำสุด', highlight: '5ms' },
]

const PETAL_DURATIONS = [8.2, 9.5, 7.8, 10.3, 8.9, 9.7, 7.4, 10.8, 8.1, 9.2, 7.6, 10.5]
const PETAL_COLORS = ['#ffb7c5', '#ff92a5', '#ffc0cb', '#ffaec0', '#f8a4b8', '#ffccdd']
function SakuraPetal({ delay, left, size, index = 0 }: { delay: number; left: string; size: number; index?: number }) {
  const duration = PETAL_DURATIONS[index % PETAL_DURATIONS.length]
  const color = PETAL_COLORS[index % PETAL_COLORS.length]
  return (
    <motion.div className="absolute"
      style={{ left, top: '-5%', width: size, height: size * 0.6, background: color, borderRadius: '50% 0 50% 0', opacity: 0.5, filter: 'blur(0.5px)', boxShadow: `0 0 8px ${color}40`, willChange: 'transform, opacity' }}
      animate={{ y: ['0vh', '110vh'], x: [0, 40, -30, 20, -10, 5], rotate: [0, 90, 180, 270, 360], opacity: [0, 0.6, 0.6, 0.4, 0] }}
      transition={{ duration, repeat: Infinity, delay, ease: 'linear' }} />
  )
}

function SakuraTree({ side }: { side: 'left' | 'right' }) {
  const isLeft = side === 'left'
  return (
    <motion.div className={`absolute bottom-0 ${isLeft ? 'left-0' : 'right-0'} w-[200px] h-[300px] sm:w-[300px] sm:h-[400px] pointer-events-none`}
      initial={{ opacity: 0, x: isLeft ? -50 : 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1.5, delay: 0.5 }}>
      <svg viewBox="0 0 300 400" className="w-full h-full" fill="none">
        <path d={isLeft ? "M80,400 Q90,350 100,300 Q110,250 130,200 Q140,170 150,150" : "M220,400 Q210,350 200,300 Q190,250 170,200 Q160,170 150,150"} stroke="rgba(139,69,19,0.4)" strokeWidth="8" strokeLinecap="round" />
        <path d={isLeft ? "M120,250 Q140,230 170,220" : "M180,250 Q160,230 130,220"} stroke="rgba(139,69,19,0.3)" strokeWidth="4" strokeLinecap="round" />
        {[{ cx: isLeft ? 150 : 150, cy: 140, r: 35 }, { cx: isLeft ? 170 : 130, cy: 210, r: 25 }, { cx: isLeft ? 130 : 170, cy: 180, r: 20 }, { cx: isLeft ? 60 : 240, cy: 260, r: 22 }].map((b, i) => (
          <motion.circle key={i} cx={b.cx} cy={b.cy} r={b.r} fill={`rgba(255,183,197,${0.15 + i * 0.03})`}
            animate={{ scale: [1, 1.05, 1], opacity: [0.6, 0.8, 0.6] }} transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }} />
        ))}
      </svg>
    </motion.div>
  )
}

function PinkGlowPulse() {
  return (
    <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
      style={{ background: 'radial-gradient(circle, rgba(244,114,182,0.08) 0%, transparent 70%)' }}
      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} />
  )
}

function AnimatedCounter({ value }: { value: string }) {
  return (
    <motion.span initial={{ opacity: 0, scale: 0.5 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 100 }} className="inline-block">
      {value}
    </motion.span>
  )
}

export default function LandingSakura() {
  const [headlineIdx, setHeadlineIdx] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => setHeadlineIdx(p => (p + 1) % headlines.length), 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <main className="bg-[#1a0a12] overflow-hidden" style={{ isolation: 'isolate' }}>
      <section className="relative min-h-screen flex items-center pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#2a0a1a] via-[#1a0a12] to-[#1a0a12]" />
        <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[1000px] h-[700px] bg-[radial-gradient(ellipse,rgba(244,114,182,0.1)_0%,transparent_65%)]" />
        <div className="absolute top-[10%] right-[-5%] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(251,207,232,0.06)_0%,transparent_60%)]" />
        <div className="absolute bottom-[10%] left-[-5%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(236,72,153,0.05)_0%,transparent_60%)]" />
        <PinkGlowPulse />
        <SakuraTree side="left" />
        <SakuraTree side="right" />
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[0,1,2,3,4,5,6,7,8,9,10,11].map(i => (
            <SakuraPetal key={i} delay={i * 0.5} left={`${5 + i * 8}%`} size={8 + (i % 4) * 3} index={i} />
          ))}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#1a0a12] to-transparent z-[3]" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex justify-center mb-10">
              <div className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-pink-500/[0.08] border border-pink-500/20 backdrop-blur-sm">
                <Flower2 size={16} className="text-pink-400" /><span className="text-sm text-pink-300 font-bold tracking-wider">SAKURA VPN</span><Cherry size={14} className="text-pink-400" />
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-8">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[0.95] tracking-tighter">
                <span className="block mb-2">VPN ดั่งกลีบซากุระ</span>
                <span className="block">
                  <AnimatePresence mode="wait">
                    <motion.span key={headlineIdx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="inline-block">
                      {headlines[headlineIdx].text}{' '}
                      <span className="bg-gradient-to-r from-pink-300 via-rose-300 to-fuchsia-300 bg-clip-text text-transparent">{headlines[headlineIdx].highlight}</span>
                    </motion.span>
                  </AnimatePresence>
                </span>
              </h1>
            </motion.div>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-lg sm:text-xl text-pink-200/70 max-w-2xl mx-auto mb-10 leading-relaxed">อ่อนโยน สวยงาม ละมุนตา แต่แข็งแกร่งดั่งกลีบซากุระ</motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/register" className="group relative px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400 text-white font-bold text-lg shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-all hover:scale-105">
                <span className="flex items-center gap-2">บานสะพรั่งไปด้วยกัน <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></span>
              </Link>
              <Link href="/public-vless" className="px-8 py-4 rounded-2xl border border-pink-500/30 text-pink-300 font-bold text-lg hover:bg-pink-500/10 transition-all">ทดลองใช้ฟรี</Link>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
                {[{ value: '50K+', label: 'ผู้ใช้งาน', icon: Users }, { value: '20+', label: 'เซิร์ฟเวอร์', icon: Globe }, { value: '99.9%', label: 'Uptime', icon: Wifi }, { value: '<5ms', label: 'Ping', icon: Zap }].map((s, i) => (
                  <motion.div key={i} whileHover={{ y: -4 }} className="p-4 rounded-2xl bg-pink-500/[0.03] border border-pink-500/10 text-center hover:border-pink-500/20 transition-all">
                    <s.icon className="w-5 h-5 text-pink-400/60 mx-auto mb-2" /><div className="text-xl font-black text-white"><AnimatedCounter value={s.value} /></div><div className="text-[11px] text-zinc-600">{s.label}</div>
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/[0.06] border border-pink-500/15 mb-6"><Gem size={14} className="text-pink-400" /><span className="text-sm text-pink-300 font-medium">Sakura Features</span></div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">ความงามแห่ง<span className="bg-gradient-to-r from-pink-300 to-rose-300 bg-clip-text text-transparent">ซากุระ</span></h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Zap, title: 'ความเร็ว 10Gbps', desc: 'เร็วดั่งลมพัดกลีบซากุระ ไม่จำกัดแบนด์วิธ', color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
              { icon: Shield, title: 'เข้ารหัส AES-256', desc: 'ปลอดภัยดั่งกลีบซากุระที่ไม่มีวันเหี่ยวเฉา', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
              { icon: Globe, title: '20+ Global Servers', desc: 'เซิร์ฟเวอร์กระจายทั่วเอเชีย', color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10 border-fuchsia-500/20' },
              { icon: Eye, title: 'Zero-Log Policy', desc: 'ไม่เก็บข้อมูลใดๆ ดั่งความลับของสวนซากุระ', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
              { icon: MonitorSmartphone, title: 'ทุกอุปกรณ์', desc: 'iOS, Android, Windows, macOS', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
              { icon: Headphones, title: 'VIP Support 24/7', desc: 'ทีมผู้เชี่ยวชาญพร้อมตลอด 24 ชม.', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="group p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-pink-500/20 transition-all">
                <div className={`w-12 h-12 ${f.bg} border rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}><f.icon className={`w-6 h-6 ${f.color}`} /></div>
                <h3 className="text-base font-bold text-white mb-2">{f.title}</h3><p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 border-t border-pink-500/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight">สิ่งที่คุณจะ<span className="text-pink-400">ได้รับ</span></h2>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-2xl border border-pink-500/10 overflow-hidden">
            <div className="grid grid-cols-1 divide-y divide-pink-500/5">
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
                <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-pink-500/[0.02] transition-colors">
                  <div className="flex items-center gap-3"><Check className="w-4 h-4 text-pink-400 shrink-0" /><span className="text-sm text-zinc-300">{row.feature}</span></div>
                  <div className="text-right"><span className="text-sm font-bold text-white">{row.value}</span><span className="text-[11px] text-zinc-600 ml-2 hidden sm:inline">{row.desc}</span></div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 border-t border-pink-500/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-xs font-bold text-pink-400 tracking-[0.2em] uppercase mb-3">Getting Started</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">เริ่มต้นใน <span className="text-pink-400">3</span> ขั้นตอน</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[{ step: '01', title: 'สมัครสมาชิกฟรี', desc: 'สร้างบัญชีใหม่ได้ใน 30 วินาที', icon: Flower2 },
              { step: '02', title: 'เติมเงิน & ซื้อ VPN', desc: 'เติมเงินผ่าน TrueMoney Wallet ขั้นต่ำ 50 บาท', icon: Leaf },
              { step: '03', title: 'เชื่อมต่อทันที', desc: 'ดาวน์โหลดแอพ V2Box หรือ v2rayNG', icon: Wifi },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5 relative">
                  <item.icon className="w-8 h-8 text-pink-400" /><div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg flex items-center justify-center text-xs font-black">{item.step}</div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3><p className="text-sm text-zinc-500 leading-relaxed max-w-xs mx-auto">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-pink-500/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">รองรับ<span className="text-pink-400">ทุกค่าย</span>มือถือ</h2>
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
