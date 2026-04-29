'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap, Shield, Globe, Gauge, Smartphone, Clock, ChevronRight, CheckCircle2, Star, Wifi, Sprout } from 'lucide-react'

export default function LandingForestSpirit() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const h = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', h)
    return () => window.removeEventListener('mousemove', h)
  }, [])

  return (
    <div className="relative min-h-screen bg-[#0c1f0c] text-[#e8f5e9] overflow-hidden font-sans">
      {/* Dark forest mist layers */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 100%, #1a3a1a 0%, #0c1f0c 60%, #051205 100%)' }} />
        {/* Fog layers */}
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div key={i} className="absolute w-[200%] h-32 bg-gradient-to-r from-transparent via-emerald-900/20 to-transparent"
            style={{ bottom: `${i * 15}%`, left: '-50%' }}
            animate={{ x: [0, 100, 0] }}
            transition={{ duration: 15 + i * 5, repeat: Infinity, ease: 'linear' }}
          />
        ))}
      </div>

      {/* Fireflies */}
      {Array.from({ length: 25 }).map((_, i) => (
        <motion.div key={i} className="absolute rounded-full z-0 pointer-events-none"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: 3 + Math.random() * 4,
            height: 3 + Math.random() * 4,
            background: i % 3 === 0 ? '#a3e635' : i % 3 === 1 ? '#34d399' : '#fbbf24',
            boxShadow: `0 0 ${8 + Math.random() * 12}px ${i % 3 === 0 ? '#a3e635' : i % 3 === 1 ? '#34d399' : '#fbbf24'}`,
          }}
          animate={{
            x: [0, Math.random() * 80 - 40, 0],
            y: [0, Math.random() * 60 - 30, 0],
            opacity: [0.2, 1, 0.2],
          }}
          transition={{ duration: 4 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 3 }}
        />
      ))}

      {/* Mouse follower glow (firefly) */}
      <motion.div className="fixed w-4 h-4 rounded-full bg-lime-400/60 pointer-events-none z-0"
        style={{
          boxShadow: '0 0 20px #a3e635, 0 0 40px #a3e63540',
          left: mousePos.x,
          top: mousePos.y,
          transform: 'translate(-50%, -50%)',
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 200 }}
      />

      {/* Vines / branches decoration */}
      <div className="fixed top-0 left-0 w-64 h-64 z-0 pointer-events-none opacity-10">
        <svg viewBox="0 0 200 200" fill="none">
          <path d="M0 0 Q50 80 20 150 Q10 180 40 200" stroke="#34d399" strokeWidth="2" />
          <path d="M20 50 Q60 70 50 120" stroke="#34d399" strokeWidth="1.5" />
          <path d="M30 100 Q70 110 60 160" stroke="#34d399" strokeWidth="1" />
        </svg>
      </div>
      <div className="fixed top-0 right-0 w-64 h-64 z-0 pointer-events-none opacity-10">
        <svg viewBox="0 0 200 200" fill="none">
          <path d="M200 0 Q150 80 180 150 Q190 180 160 200" stroke="#34d399" strokeWidth="2" />
          <path d="M180 50 Q140 70 150 120" stroke="#34d399" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Hero */}
      <section className="relative z-10 pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 mb-8">
              <Sprout className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-300 font-bold tracking-wider">FOREST SPIRIT VPN</span>
            </div>

            <h1 className="text-5xl sm:text-7xl font-black mb-6 tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 via-emerald-400 to-teal-400">
                VPN แห่งป่า
              </span>
            </h1>

            <p className="text-xl text-emerald-200/60 max-w-2xl mx-auto mb-10 leading-relaxed">
              เชื่อมต่อตามธรรมชาติ แรงดั่งสายน้ำตก
              <br className="hidden sm:block" />
              <span className="text-lime-400">เน็ตแรง เสถียร ปิงต่ำ</span> รองรับทุกค่ายมือถือ
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register"
                className="group px-8 py-4 bg-gradient-to-r from-emerald-600 to-lime-600 rounded-2xl font-bold text-lg text-white hover:shadow-[0_0_40px_rgba(163,230,53,0.3)] transition-all active:scale-95 flex items-center justify-center gap-2">
                <Zap className="w-5 h-5" />
                เริ่มต้นใช้งาน
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/vpn"
                className="px-8 py-4 border border-lime-500/30 rounded-2xl font-bold text-lg text-lime-400 hover:bg-lime-500/10 transition-all active:scale-95 flex items-center justify-center gap-2">
                <Wifi className="w-5 h-5" />
                ทดลองใช้ฟรี
              </Link>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { value: '10Gbps', label: 'ความเร็วสูงสุด', color: '#a3e635' },
              { value: '<5ms', label: 'ปิงเซิร์ฟเวอร์ไทย', color: '#34d399' },
              { value: '50+', label: 'เซิร์ฟเวอร์ทั่วโลก', color: '#2dd4bf' },
              { value: '99.9%', label: 'Uptime', color: '#fbbf24' },
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-2xl border border-emerald-500/10 bg-emerald-500/5 backdrop-blur-sm">
                <p className="text-2xl font-black" style={{ color: stat.color, textShadow: `0 0 15px ${stat.color}60` }}>{stat.value}</p>
                <p className="text-xs text-emerald-400/60 mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-emerald-400">
              ฟีเจอร์สุดล้ำ
            </h2>
            <p className="text-emerald-200/40">เทคโนโลยีที่ทันสมัยที่สุดสำหรับการเชื่อมต่อของคุณ</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Zap, title: 'ความเร็วสูงสุด', desc: 'รองรับความเร็วสูงสุด 10Gbps เล่นเกม ดู 4K ไม่กระตุก' },
              { icon: Shield, title: 'เข้ารหัสระดับทหาร', desc: 'AES-256-GCM + XTLS Reality ปลอดภัยสูงสุด' },
              { icon: Globe, title: 'เซิร์ฟเวอร์ทั่วโลก', desc: '50+ เซิร์ฟเวอร์ใน 10+ ประเทศ เลือกได้ไม่จำกัด' },
              { icon: Gauge, title: 'ปิงต่ำมาก', desc: 'เซิร์ฟเวอร์ไทยปิงต่ำกว่า 5ms เล่นเกมลื่น' },
              { icon: Smartphone, title: 'รองรับทุกอุปกรณ์', desc: 'iOS, Android, Windows, macOS, Router' },
              { icon: Clock, title: 'ออนไลน์ 24/7', desc: 'ระบบอัตโนมัติเต็มรูปแบบ ไม่มีดาวน์ไทม์' },
            ].map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.03] hover:bg-emerald-500/[0.06] hover:border-emerald-500/20 transition-all">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-emerald-100 mb-2">{f.title}</h3>
                <p className="text-sm text-emerald-200/50 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-emerald-400">
              แพ็กเกจราคา
            </h2>
            <p className="text-emerald-200/40">เลือกแพ็กเกจที่เหมาะกับคุณ</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { name: 'Starter', price: '50', speed: '100 Mbps', devices: '1 อุปกรณ์', popular: false },
              { name: 'Pro', price: '100', speed: '1 Gbps', devices: '3 อุปกรณ์', popular: true },
              { name: 'Ultimate', price: '200', speed: '10 Gbps', devices: 'ไม่จำกัด', popular: false },
            ].map((p) => (
              <div key={p.name} className={`relative p-6 rounded-2xl border ${p.popular ? 'border-lime-500/30 bg-lime-500/5' : 'border-emerald-500/10 bg-emerald-500/[0.03]'} flex flex-col`}>
                {p.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-lime-500 rounded-full text-xs font-bold text-[#0c1f0c]">ยอดนิยม</div>}
                <h3 className="text-xl font-bold text-emerald-100 mb-2">{p.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className={`text-4xl font-black ${p.popular ? 'text-lime-400' : 'text-emerald-400/60'}`}>{p.price}</span>
                  <span className="text-emerald-400/40">฿/เดือน</span>
                </div>
                <ul className="space-y-3 mb-6 flex-1">
                  {[`ความเร็ว ${p.speed}`, `ใช้งานได้ ${p.devices}`, 'เซิร์ฟเวอร์ทุกโลเคชั่น', 'รองรับ VLESS + Reality'].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-emerald-200/50">
                      <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0" />{item}
                    </li>
                  ))}
                </ul>
                <Link href="/register"
                  className={`w-full py-3 rounded-xl font-bold text-center transition-all active:scale-95 ${p.popular ? 'bg-gradient-to-r from-emerald-600 to-lime-600 text-white' : 'bg-emerald-900/30 text-emerald-200 hover:bg-emerald-900/50'}`}>
                  สมัครเลย
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="p-8 sm:p-12 rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-lime-500/5"
            style={{ boxShadow: '0 0 60px rgba(163,230,53,0.1)' }}>
            <h2 className="text-3xl sm:text-4xl font-black text-emerald-100 mb-4">พร้อมทะลุขีดจำกัด?</h2>
            <p className="text-emerald-200/40 mb-8 max-w-xl mx-auto">สมัครสมาชิกวันนี้ รับประสบการณ์ VPN ที่เร็วที่สุด พร้อมเทคโนโลยี XTLS Reality ล่าสุด</p>
            <Link href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-lime-600 rounded-2xl font-bold text-lg text-white hover:shadow-[0_0_40px_rgba(163,230,53,0.3)] transition-all active:scale-95">
              <Star className="w-5 h-5" /> เริ่มต้นใช้งานฟรี
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
