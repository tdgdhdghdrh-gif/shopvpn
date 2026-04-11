'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Shield, Lock, Globe, Server, Users, Building2,
  ChevronRight, Check, ArrowRight, Rocket, Play,
  ShieldCheck, FileCheck, Headphones, Zap, Eye,
  MonitorSmartphone, Download, Star, Heart, Clock,
  CheckCircle, Wifi, Award, Briefcase, BarChart3,
  TrendingUp, UserCheck, Phone,
} from 'lucide-react'
import PricingSection from '@/components/PricingSection'
import FAQSection from '@/components/FAQSection'
import TestimonialsSection from '@/components/TestimonialsSection'

export default function LandingCorporate() {
  return (
    <main className="bg-black">

      {/* ══════════════════════════════════════════════
          HERO - Professional split layout
          ══════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center pt-20 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(99,102,241,0.08),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(59,130,246,0.04),transparent_60%)]" />

        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }} />

        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent z-[3]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left - Text */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              {/* Trust badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/[0.08] border border-indigo-500/20 mb-8">
                <ShieldCheck size={14} className="text-indigo-400" />
                <span className="text-sm text-indigo-300 font-medium">Enterprise-Grade Security</span>
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 leading-[1.05] tracking-tight">
                โซลูชัน VPN
                <br />
                <span className="bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
                  ระดับองค์กร
                </span>
                <br />
                สำหรับคุณ
              </h1>

              <p className="text-lg text-zinc-400 mb-8 leading-relaxed max-w-lg">
                ปกป้องข้อมูลองค์กรด้วยการเข้ารหัสระดับทหาร Zero-Log Policy
                เซิร์ฟเวอร์ Uptime 99.9% รองรับทุกอุปกรณ์ ทุกแพลตฟอร์ม
              </p>

              {/* Key points */}
              <div className="space-y-3 mb-10">
                {[
                  'เข้ารหัส AES-256-GCM มาตรฐานเดียวกับธนาคาร',
                  'Zero-Log Policy ไม่เก็บข้อมูลการใช้งานใดๆ',
                  'ซัพพอร์ต 24/7 พร้อมผู้เชี่ยวชาญด้านความปลอดภัย',
                  'VLESS + XTLS Reality โปรโตคอลรุ่นล่าสุด',
                ].map((point, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-5 h-5 bg-indigo-500/10 border border-indigo-500/20 rounded-md flex items-center justify-center shrink-0">
                      <Check size={12} className="text-indigo-400" />
                    </div>
                    <span className="text-sm text-zinc-300">{point}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register"
                  className="group inline-flex items-center justify-center gap-2.5 px-9 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-base transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-[1.02]"
                >
                  <Rocket size={18} />
                  เริ่มต้นใช้งาน
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/public-vless"
                  className="inline-flex items-center justify-center gap-2.5 px-9 py-5 bg-white/[0.03] hover:bg-white/[0.06] text-white border border-white/[0.06] rounded-2xl font-bold text-base transition-all"
                >
                  <Play size={16} className="fill-indigo-400 text-indigo-400" />
                  ทดลองใช้ฟรี
                </Link>
              </div>
            </motion.div>

            {/* Right - Stats grid */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Shield, value: 'AES-256', label: 'Military Encryption', desc: 'มาตรฐานเดียวกับกองทัพ', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
                  { icon: Server, value: '20+', label: 'Global Servers', desc: 'เซิร์ฟเวอร์ทั่วโลก', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
                  { icon: Users, value: '50K+', label: 'Trusted Users', desc: 'ผู้ใช้งานทั่วประเทศ', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                  { icon: Globe, value: '99.9%', label: 'Uptime SLA', desc: 'การันตีความเสถียร', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
                ].map((stat, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.1 }}
                    className="p-6 rounded-2xl bg-zinc-900/60 border border-white/[0.04] text-center hover:border-indigo-500/20 transition-all group"
                  >
                    <div className={`w-12 h-12 ${stat.bg} border rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div className="text-2xl font-black text-white mb-0.5">{stat.value}</div>
                    <div className="text-xs text-zinc-400 font-medium">{stat.label}</div>
                    <div className="text-[10px] text-zinc-600 mt-0.5">{stat.desc}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          TRUST BADGES BAR
          ══════════════════════════════════════════════ */}
      <section className="py-8 border-y border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            {[
              { icon: Shield, text: 'AES-256-GCM' },
              { icon: Eye, text: 'Zero-Log Policy' },
              { icon: Lock, text: 'VLESS + XTLS Reality' },
              { icon: Award, text: 'ISO 27001 Standards' },
              { icon: Clock, text: '24/7 Support' },
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-2 text-zinc-600 hover:text-zinc-400 transition-colors">
                <b.icon className="w-4 h-4" />
                <span className="text-xs font-medium">{b.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECURITY FEATURES - 6 cards
          ══════════════════════════════════════════════ */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] mb-6">
              <Lock size={14} className="text-indigo-400" />
              <span className="text-sm text-zinc-400 font-medium">Enterprise Security</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              ทำไมองค์กรถึง<span className="text-indigo-400">ไว้วางใจ</span>เรา
            </h2>
            <p className="text-zinc-500 max-w-2xl mx-auto">มาตรฐานความปลอดภัยระดับสากล พร้อมฟีเจอร์ครบครันสำหรับทุกองค์กร</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: ShieldCheck, title: 'Zero-Log Policy', desc: 'ไม่เก็บข้อมูลการใช้งานใดๆ ทั้งสิ้น ไม่เก็บ IP, DNS Query, Browsing History หรือ Metadata', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
              { icon: Lock, title: 'Military-Grade Encryption', desc: 'เข้ารหัสด้วย AES-256-GCM มาตรฐานเดียวกับกองทัพสหรัฐฯ ป้องกันการดักจับทุกรูปแบบ', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
              { icon: Eye, title: 'VLESS + XTLS Reality', desc: 'โปรโตคอลรุ่นล่าสุดที่เร็วและปลอดภัยที่สุด ไม่สามารถตรวจจับด้วย DPI ได้', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
              { icon: Server, title: 'Dedicated Servers', desc: 'เซิร์ฟเวอร์ Bare Metal ไม่ใช้ shared hosting ประสิทธิภาพสูงสุดสำหรับองค์กร', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
              { icon: BarChart3, title: 'SLA 99.9% Uptime', desc: 'การันตี Uptime 99.9% ด้วยระบบ Auto-Failover และ Health Check ตลอด 24 ชม.', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
              { icon: Headphones, title: 'Priority Support', desc: 'ทีมผู้เชี่ยวชาญพร้อมให้บริการ 24/7 ผ่าน Ticket, Facebook, Line Official', color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
            ].map((f, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="group p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-indigo-500/20 transition-all"
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
          USE CASES
          ══════════════════════════════════════════════ */}
      <section className="py-24 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight">
              เหมาะสำหรับ<span className="text-blue-400">ทุกการใช้งาน</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Briefcase, title: 'ทำงานระยะไกล', desc: 'เข้าถึงข้อมูลองค์กรอย่างปลอดภัยจากทุกที่ทั่วโลก', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
              { icon: TrendingUp, title: 'ธุรกิจออนไลน์', desc: 'ปกป้องธุรกรรมออนไลน์ ป้องกันการโจรกรรมข้อมูล', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
              { icon: UserCheck, title: 'ความเป็นส่วนตัว', desc: 'ท่องเว็บอย่างเป็นส่วนตัว ไม่ถูก ISP ติดตาม', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
              { icon: Globe, title: 'เข้าถึงเนื้อหา', desc: 'ปลดบล็อกเนื้อหาจากทุกประเทศทั่วโลก', color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
            ].map((uc, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] text-center transition-all group"
              >
                <div className={`w-14 h-14 ${uc.color} border rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <uc.icon className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{uc.title}</h3>
                <p className="text-sm text-zinc-500">{uc.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          HOW IT WORKS - Professional 3 Steps
          ══════════════════════════════════════════════ */}
      <section className="py-24 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-xs font-bold text-indigo-400 tracking-[0.2em] uppercase mb-3">Getting Started</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              เริ่มต้นใช้งาน<span className="text-indigo-400">ง่ายๆ</span> 3 ขั้นตอน
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'สมัครสมาชิก', desc: 'สร้างบัญชีฟรี ใช้เวลาไม่ถึง 1 นาที กรอกข้อมูลพื้นฐานเท่านั้น ไม่ต้องใช้บัตรเครดิต', icon: FileCheck },
              { step: '02', title: 'เลือกแพ็กเกจ', desc: 'เติมเงินผ่าน TrueMoney หรือสลิปธนาคาร เลือกแพ็กเกจที่เหมาะกับองค์กรของคุณ', icon: Building2 },
              { step: '03', title: 'เชื่อมต่อทันที', desc: 'ดาวน์โหลดแอพ V2Box (iOS) หรือ v2rayNG (Android) กด Subscribe URL แล้วใช้งานได้เลย', icon: Globe },
            ].map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                {i < 2 && (
                  <div className="hidden md:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px bg-gradient-to-r from-indigo-500/10 to-transparent" />
                )}
                <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5 relative">
                  <item.icon className="w-8 h-8 text-indigo-400" />
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-indigo-500 text-white rounded-lg flex items-center justify-center text-xs font-black">
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
          SUPPORTED PLATFORMS
          ══════════════════════════════════════════════ */}
      <section className="py-20 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">รองรับทุกแพลตฟอร์ม</h2>
            <p className="text-zinc-500">ใช้งานได้ทุกอุปกรณ์ พร้อมคู่มือตั้งค่าละเอียด</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'iOS', app: 'V2Box', desc: 'iPhone / iPad' },
              { name: 'Android', app: 'v2rayNG', desc: 'Smartphone / Tablet' },
              { name: 'Windows', app: 'V2RayN', desc: 'PC / Laptop' },
              { name: 'macOS', app: 'V2RayU', desc: 'MacBook / iMac' },
            ].map((p, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-indigo-500/20 text-center transition-all"
              >
                <MonitorSmartphone className="w-7 h-7 text-indigo-400 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-white mb-0.5">{p.name}</h3>
                <p className="text-xs text-indigo-400 font-medium">{p.app}</p>
                <p className="text-[11px] text-zinc-600 mt-1">{p.desc}</p>
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
          FINAL CTA - Corporate style
          ══════════════════════════════════════════════ */}
      <section className="py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center p-10 sm:p-16 rounded-3xl bg-gradient-to-br from-indigo-600/10 via-blue-600/5 to-violet-600/10 border border-indigo-500/20"
          >
            <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <Shield className="w-8 h-8 text-indigo-400" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
              พร้อมปกป้อง
              <br />
              <span className="text-indigo-400">ข้อมูลองค์กร</span>ของคุณ
            </h2>
            <p className="text-zinc-400 mb-10 text-lg max-w-2xl mx-auto">
              เริ่มต้นใช้งานวันนี้ ด้วยความมั่นใจในความปลอดภัยระดับสากล
              ไม่มีค่าแรกเข้า ไม่ผูกมัด
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register"
                className="group inline-flex items-center gap-2 px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-base transition-all shadow-lg shadow-indigo-500/20 hover:scale-[1.02]"
              >
                เริ่มต้นใช้งานเลย
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/contacts"
                className="inline-flex items-center gap-2 px-10 py-5 bg-white/[0.03] hover:bg-white/[0.06] text-white border border-white/[0.06] rounded-2xl font-bold text-base transition-all"
              >
                <Headphones size={16} />
                ติดต่อทีมขาย
              </Link>
            </div>
            <p className="text-xs text-zinc-600 mt-8 flex items-center justify-center gap-2">
              <Heart className="w-3 h-3 text-red-500" /> องค์กรกว่า 500+ แห่งไว้วางใจ
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
