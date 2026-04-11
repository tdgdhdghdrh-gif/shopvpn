'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Shield, Zap, Globe, ChevronRight, Rocket, Play, Check, ArrowRight,
  Lock, Wifi, Server, Eye, Smartphone, Download, Star, Heart,
  MonitorSmartphone, Clock, Users, Sparkles, MousePointer, CheckCircle,
} from 'lucide-react'
import PricingSection from '@/components/PricingSection'
import FAQSection from '@/components/FAQSection'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
}

export default function LandingMinimal() {
  return (
    <main className="bg-black">

      {/* ══════════════════════════════════════════════
          HERO - Ultra clean, massive typography
          ══════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center pt-20 pb-24 overflow-hidden">
        {/* Soft gradient orb */}
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(59,130,246,0.06)_0%,transparent_70%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent" />

        {/* Floating dots pattern */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <motion.div initial="hidden" animate="visible" className="text-center">

            {/* Status badge */}
            <motion.div variants={fadeUp} custom={0} className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm text-zinc-400 font-medium">เซิร์ฟเวอร์ทุกตัวออนไลน์</span>
                <span className="text-[10px] text-zinc-600">99.9% uptime</span>
              </div>
            </motion.div>

            {/* Heading */}
            <motion.h1 variants={fadeUp} custom={1}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-[0.95] tracking-tighter"
            >
              ปกป้องทุก
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                การเชื่อมต่อ
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p variants={fadeUp} custom={2}
              className="text-lg sm:text-xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              VPN ที่ใช้ง่ายที่สุดในประเทศไทย เชื่อมต่อได้ใน 3 คลิก
              <br className="hidden sm:block" />
              เริ่มต้นเพียง <span className="text-white font-bold">2 บาท/วัน</span> เท่านั้น
            </motion.p>

            {/* CTA */}
            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
              <Link href="/register"
                className="group inline-flex items-center gap-2.5 px-10 py-5 bg-white text-black rounded-2xl font-bold text-base transition-all hover:shadow-[0_0_60px_rgba(255,255,255,0.08)] hover:scale-[1.02]"
              >
                <Rocket size={18} />
                เริ่มต้นใช้งาน
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/public-vless"
                className="group inline-flex items-center gap-2.5 px-10 py-5 bg-white/[0.03] hover:bg-white/[0.06] text-white border border-white/[0.06] rounded-2xl font-bold text-base transition-all"
              >
                <Play size={16} className="fill-blue-400 text-blue-400" />
                ทดลองฟรี
              </Link>
            </motion.div>

            {/* Trust line */}
            <motion.div variants={fadeUp} custom={4} className="flex flex-wrap items-center justify-center gap-6 text-sm text-zinc-600">
              {[
                { icon: Shield, text: 'AES-256 Encryption' },
                { icon: Eye, text: 'Zero-Log Policy' },
                { icon: Zap, text: 'VLESS + XTLS Reality' },
              ].map((t, i) => (
                <div key={i} className="flex items-center gap-2">
                  <t.icon className="w-4 h-4" />
                  <span>{t.text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          STATS BAR - Animated numbers
          ══════════════════════════════════════════════ */}
      <section className="py-6 border-y border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: '50,000+', label: 'ผู้ใช้งาน', icon: Users },
              { value: '20+', label: 'เซิร์ฟเวอร์ทั่วโลก', icon: Globe },
              { value: '99.9%', label: 'Uptime', icon: Wifi },
              { value: '<5ms', label: 'Ping ต่ำสุด', icon: Zap },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 justify-center py-3"
              >
                <s.icon className="w-4 h-4 text-zinc-600" />
                <span className="text-lg font-black text-white">{s.value}</span>
                <span className="text-xs text-zinc-600">{s.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          WHY US - 6 Features Grid
          ══════════════════════════════════════════════ */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-xs font-bold text-blue-400 tracking-[0.2em] uppercase mb-3">Why Choose Us?</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              ทำไมต้องเลือกเรา
            </h2>
            <p className="text-zinc-500 max-w-xl mx-auto">ทุกอย่างที่คุณต้องการจาก VPN ครบจบในที่เดียว</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Zap, title: 'ความเร็วสุดขีด', desc: 'ความเร็วสูงสุด 10Gbps ด้วยโปรโตคอล VLESS + XTLS Reality ไม่จำกัดแบนด์วิธ สตรีมวิดีโอ 4K ลื่นไหล', color: 'text-amber-400', bg: 'bg-amber-500/8 border-amber-500/15' },
              { icon: Shield, title: 'เข้ารหัสระดับทหาร', desc: 'เข้ารหัส AES-256-GCM มาตรฐานเดียวกับธนาคารและกองทัพ ไม่มีใครดักจับข้อมูลของคุณได้', color: 'text-emerald-400', bg: 'bg-emerald-500/8 border-emerald-500/15' },
              { icon: Globe, title: '20+ โลเคชั่นทั่วโลก', desc: 'เซิร์ฟเวอร์กระจายอยู่ทั่วโลก ไทย สิงคโปร์ ญี่ปุ่น สหรัฐ เลือกได้ตามใจ', color: 'text-blue-400', bg: 'bg-blue-500/8 border-blue-500/15' },
              { icon: Eye, title: 'Zero-Log Policy', desc: 'ไม่เก็บข้อมูลการใช้งานใดๆ ไม่เก็บ IP ไม่เก็บ DNS Query ไม่เก็บ Browsing History', color: 'text-violet-400', bg: 'bg-violet-500/8 border-violet-500/15' },
              { icon: MonitorSmartphone, title: 'รองรับทุกอุปกรณ์', desc: 'iOS, Android, Windows, macOS ใช้งานได้หมด พร้อมคู่มือตั้งค่าละเอียด', color: 'text-pink-400', bg: 'bg-pink-500/8 border-pink-500/15' },
              { icon: Clock, title: 'ซัพพอร์ต 24/7', desc: 'ทีมงานพร้อมช่วยเหลือตลอด 24 ชั่วโมง ผ่าน Facebook, Ticket และ Live Chat', color: 'text-cyan-400', bg: 'bg-cyan-500/8 border-cyan-500/15' },
            ].map((f, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="group p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.03] transition-all"
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
          HOW IT WORKS - 3 Steps
          ══════════════════════════════════════════════ */}
      <section className="py-24 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-xs font-bold text-emerald-400 tracking-[0.2em] uppercase mb-3">How It Works</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              เริ่มต้นใน <span className="text-emerald-400">3</span> ขั้นตอน
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'สมัครสมาชิก', desc: 'สร้างบัญชีฟรี ใช้เวลาไม่ถึง 1 นาที กรอกชื่อ อีเมล รหัสผ่าน แค่นั้น', icon: MousePointer },
              { step: '02', title: 'เติมเงิน & ซื้อแพ็กเกจ', desc: 'เติมเงินผ่าน TrueMoney หรือ สลิปธนาคาร แล้วเลือกเซิร์ฟเวอร์ที่ต้องการ', icon: Sparkles },
              { step: '03', title: 'เชื่อมต่อเลย', desc: 'ดาวน์โหลด V2Box (iOS) หรือ v2rayNG (Android) กด Subscribe URL แล้วเชื่อมต่อทันที', icon: Wifi },
            ].map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="relative text-center"
              >
                {/* Connector line */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px bg-gradient-to-r from-white/[0.06] to-white/[0.02]" />
                )}
                <div className="w-20 h-20 bg-white/[0.03] border border-white/[0.06] rounded-2xl flex items-center justify-center mx-auto mb-5 relative">
                  <item.icon className="w-8 h-8 text-white/60" />
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-white text-black rounded-lg flex items-center justify-center text-xs font-black">
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
          SUPPORTED CARRIERS
          ══════════════════════════════════════════════ */}
      <section className="py-20 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">รองรับทุกค่ายมือถือ</h2>
            <p className="text-zinc-500">ใช้งานได้กับทุกเครือข่ายในประเทศไทย</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { name: 'AIS 5G / 4G', desc: 'รองรับ AIS ทั้ง 5G และ 4G LTE สัญญาณครอบคลุมทั่วประเทศ', color: 'text-green-400 border-green-500/15 bg-green-500/5' },
              { name: 'TRUE 5G / 4G', desc: 'รองรับ TRUE ทั้ง 5G และ 4G LTE ความเร็วเต็มสปีด', color: 'text-red-400 border-red-500/15 bg-red-500/5' },
              { name: 'DTAC / dtac', desc: 'รองรับ DTAC ทุกแพ็กเกจ เชื่อมต่อได้ทันทีไม่ต้องตั้งค่าเพิ่ม', color: 'text-blue-400 border-blue-500/15 bg-blue-500/5' },
            ].map((c, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`p-6 rounded-2xl border ${c.color} text-center`}
              >
                <Server className={`w-8 h-8 mx-auto mb-3 ${c.color.split(' ')[0]}`} />
                <h3 className="text-base font-bold text-white mb-2">{c.name}</h3>
                <p className="text-sm text-zinc-500">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SUPPORTED APPS
          ══════════════════════════════════════════════ */}
      <section className="py-20 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">ใช้ได้กับทุกอุปกรณ์</h2>
            <p className="text-zinc-500">ดาวน์โหลดแอพที่รองรับ แล้วเชื่อมต่อได้เลย</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'V2Box', platform: 'iOS', desc: 'สำหรับ iPhone / iPad' },
              { name: 'v2rayNG', platform: 'Android', desc: 'สำหรับมือถือ Android' },
              { name: 'V2RayN', platform: 'Windows', desc: 'สำหรับ PC / Laptop' },
              { name: 'V2RayU', platform: 'macOS', desc: 'สำหรับ MacBook / iMac' },
            ].map((app, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] text-center transition-all group"
              >
                <Download className="w-7 h-7 text-zinc-500 mx-auto mb-3 group-hover:text-white transition-colors" />
                <h3 className="text-sm font-bold text-white mb-0.5">{app.name}</h3>
                <p className="text-xs text-blue-400 font-medium mb-1">{app.platform}</p>
                <p className="text-[11px] text-zinc-600">{app.desc}</p>
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
          TESTIMONIALS - Mini
          ══════════════════════════════════════════════ */}
      <section className="py-24 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="text-xs font-bold text-pink-400 tracking-[0.2em] uppercase mb-3">Testimonials</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">ผู้ใช้งานจริงพูดถึงเรา</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { name: 'ปอนด์', role: 'เกมเมอร์', text: 'Ping ต่ำมาก เล่น ROV ไม่เคยแลคเลย ใช้มา 6 เดือน คุ้มค่ามาก', stars: 5 },
              { name: 'แนน', role: 'นักศึกษา', text: 'ใช้ง่ายมาก สมัครปุ๊บเชื่อมต่อปั๊บ ดูหนัง Netflix ลื่นไหลสุดๆ', stars: 5 },
              { name: 'บอส', role: 'ฟรีแลนซ์', text: 'ทำงานต่างประเทศ ใช้ VPN นี้ต่อ server ไทยได้ปกติ ความเร็วดีมาก', stars: 5 },
            ].map((t, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04]"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array(t.stars).fill(0).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center text-xs font-bold text-white">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{t.name}</p>
                    <p className="text-[11px] text-zinc-600">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FAQ
          ══════════════════════════════════════════════ */}
      <FAQSection />

      {/* ══════════════════════════════════════════════
          FINAL CTA
          ══════════════════════════════════════════════ */}
      <section className="py-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 tracking-tight leading-[0.95]">
              พร้อมเริ่มต้น
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">แล้วหรือยัง?</span>
            </h2>
            <p className="text-zinc-500 mb-10 text-lg max-w-lg mx-auto">
              สมัครฟรี ไม่มีค่าแรกเข้า ไม่ผูกมัด เริ่มใช้งานได้ทันที
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register"
                className="group inline-flex items-center gap-2 px-10 py-5 bg-white text-black rounded-2xl font-bold text-base transition-all hover:shadow-[0_0_60px_rgba(255,255,255,0.08)] hover:scale-[1.02]"
              >
                สมัครใช้งานเลย
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/login"
                className="inline-flex items-center gap-2 px-10 py-5 text-zinc-500 hover:text-white font-medium transition-colors"
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
