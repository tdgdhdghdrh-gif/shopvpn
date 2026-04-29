'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap, Shield, Globe, Gauge, Smartphone, Clock, ChevronRight, CheckCircle2, Star, Wifi, Sun } from 'lucide-react'

export default function LandingRetroWave() {
  const [sunY, setSunY] = useState(0)
  useEffect(() => {
    const h = () => setSunY(window.scrollY * 0.15)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])

  return (
    <div className="relative min-h-screen bg-[#1a0b2e] text-white overflow-hidden font-sans">
      {/* Sunset gradient sky */}
      <div className="fixed inset-0 z-0 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, #2d1b4e 0%, #1a0b2e 40%, #0f0518 100%)' }}
      />

      {/* Giant retro sun */}
      <div className="fixed top-[15%] left-1/2 -translate-x-1/2 z-0 pointer-events-none"
        style={{ transform: `translate(-50%, ${sunY}px)` }}>
        <div className="w-[500px] h-[500px] rounded-full"
          style={{
            background: 'linear-gradient(to bottom, #ff6b35 0%, #f7931e 30%, #ff00ff 60%, transparent 100%)',
            boxShadow: '0 0 100px rgba(255, 107, 53, 0.3)',
          }}
        />
        {/* Sun stripes */}
        <div className="absolute inset-0 flex flex-col justify-end overflow-hidden rounded-full">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-2 w-full" style={{ background: '#1a0b2e', marginBottom: i * 3 }} />
          ))}
        </div>
      </div>

      {/* Grid floor */}
      <div className="fixed bottom-0 left-0 right-0 h-[40vh] z-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, rgba(255,0,255,0.05) 100%)',
          perspective: '500px',
        }}>
        <div className="w-full h-full"
          style={{
            backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255,0,255,0.15) 25%, rgba(255,0,255,0.15) 26%, transparent 27%, transparent 74%, rgba(255,0,255,0.15) 75%, rgba(255,0,255,0.15) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255,0,255,0.15) 25%, rgba(255,0,255,0.15) 26%, transparent 27%, transparent 74%, rgba(255,0,255,0.15) 75%, rgba(255,0,255,0.15) 76%, transparent 77%, transparent)',
            backgroundSize: '50px 50px',
            transform: 'rotateX(60deg)',
            transformOrigin: 'bottom',
          }}
        />
      </div>

      {/* Palm trees silhouette */}
      <div className="fixed bottom-0 left-[10%] z-0 pointer-events-none opacity-20">
        <svg width="150" height="200" viewBox="0 0 150 200" fill="none">
          <path d="M75 200 L75 100" stroke="#ff00ff" strokeWidth="4" />
          <path d="M75 100 Q30 60 10 80" stroke="#ff00ff" strokeWidth="3" fill="none" />
          <path d="M75 100 Q120 60 140 80" stroke="#ff00ff" strokeWidth="3" fill="none" />
          <path d="M75 80 Q40 40 20 50" stroke="#ff00ff" strokeWidth="3" fill="none" />
          <path d="M75 80 Q110 40 130 50" stroke="#ff00ff" strokeWidth="3" fill="none" />
        </svg>
      </div>
      <div className="fixed bottom-0 right-[10%] z-0 pointer-events-none opacity-20">
        <svg width="120" height="160" viewBox="0 0 120 160" fill="none">
          <path d="M60 160 L60 80" stroke="#ff00ff" strokeWidth="4" />
          <path d="M60 80 Q20 50 10 60" stroke="#ff00ff" strokeWidth="3" fill="none" />
          <path d="M60 80 Q100 50 110 60" stroke="#ff00ff" strokeWidth="3" fill="none" />
        </svg>
      </div>

      {/* Hero */}
      <section className="relative z-10 pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-500/30 bg-orange-500/10 mb-8">
              <Sun className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-orange-300 font-bold tracking-wider">RETRO WAVE VPN</span>
            </div>

            <h1 className="text-5xl sm:text-8xl font-black mb-6 tracking-tighter italic"
              style={{ textShadow: '0 0 40px rgba(255,0,255,0.4)' }}>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500">
                VAPOR VPN
              </span>
            </h1>

            <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              ย้อนเวลากลับไปสู่ยุค 80s
              <br className="hidden sm:block" />
              <span className="text-pink-400">เน็ตแรง เสถียร ปิงต่ำ</span> รองรับทุกค่ายมือถือ
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register"
                className="group px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-600 rounded-2xl font-bold text-lg text-white hover:shadow-[0_0_40px_rgba(255,0,255,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2"
                style={{ boxShadow: '0 0 20px rgba(255,0,255,0.2)' }}>
                <Zap className="w-5 h-5" />
                เริ่มต้นใช้งาน
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/vpn"
                className="px-8 py-4 border border-cyan-500/30 rounded-2xl font-bold text-lg text-cyan-400 hover:bg-cyan-500/10 transition-all active:scale-95 flex items-center justify-center gap-2">
                <Wifi className="w-5 h-5" />
                ทดลองใช้ฟรี
              </Link>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { value: '10Gbps', label: 'ความเร็วสูงสุด', color: '#ff6b35' },
              { value: '<5ms', label: 'ปิงเซิร์ฟเวอร์ไทย', color: '#f7931e' },
              { value: '50+', label: 'เซิร์ฟเวอร์ทั่วโลก', color: '#ff00ff' },
              { value: '99.9%', label: 'Uptime', color: '#c084fc' },
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm">
                <p className="text-2xl font-black" style={{ color: stat.color, textShadow: `0 0 20px ${stat.color}40` }}>{stat.value}</p>
                <p className="text-xs text-zinc-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 italic" style={{ textShadow: '0 0 20px rgba(255,0,255,0.3)' }}>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500">
                FEATURES
              </span>
            </h2>
            <p className="text-zinc-500">เทคโนโลยีที่ทันสมัยที่สุดสำหรับการเชื่อมต่อของคุณ</p>
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
                className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-pink-500/20 transition-all">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 italic" style={{ textShadow: '0 0 20px rgba(255,0,255,0.3)' }}>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500">
                PRICING
              </span>
            </h2>
            <p className="text-zinc-500">เลือกแพ็กเกจที่เหมาะกับคุณ</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { name: 'Starter', price: '50', speed: '100 Mbps', devices: '1 อุปกรณ์', popular: false },
              { name: 'Pro', price: '100', speed: '1 Gbps', devices: '3 อุปกรณ์', popular: true },
              { name: 'Ultimate', price: '200', speed: '10 Gbps', devices: 'ไม่จำกัด', popular: false },
            ].map((p) => (
              <div key={p.name} className={`relative p-6 rounded-2xl border ${p.popular ? 'border-pink-500/30 bg-pink-500/5' : 'border-white/5 bg-white/[0.02]'} flex flex-col`}>
                {p.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-pink-500 rounded-full text-xs font-bold text-white">BEST</div>}
                <h3 className="text-xl font-bold text-white mb-2">{p.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className={`text-4xl font-black ${p.popular ? 'text-pink-400' : 'text-zinc-400'}`}>{p.price}</span>
                  <span className="text-zinc-500">฿/เดือน</span>
                </div>
                <ul className="space-y-3 mb-6 flex-1">
                  {[`ความเร็ว ${p.speed}`, `ใช้งานได้ ${p.devices}`, 'เซิร์ฟเวอร์ทุกโลเคชั่น', 'รองรับ VLESS + Reality'].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-zinc-400">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />{item}
                    </li>
                  ))}
                </ul>
                <Link href="/register"
                  className={`w-full py-3 rounded-xl font-bold text-center transition-all active:scale-95 ${p.popular ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}>
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
            className="p-8 sm:p-12 rounded-3xl border border-pink-500/20 bg-gradient-to-br from-orange-500/5 to-purple-500/5"
            style={{ boxShadow: '0 0 60px rgba(255,0,255,0.1)' }}>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 italic">GET STARTED</h2>
            <p className="text-zinc-400 mb-8 max-w-xl mx-auto">สมัครสมาชิกวันนี้ รับประสบการณ์ VPN ที่เร็วที่สุด พร้อมเทคโนโลยี XTLS Reality ล่าสุด</p>
            <Link href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 rounded-2xl font-bold text-lg text-white hover:shadow-[0_0_40px_rgba(255,0,255,0.4)] transition-all active:scale-95"
              style={{ boxShadow: '0 0 30px rgba(255,0,255,0.2)' }}>
              <Star className="w-5 h-5" /> เริ่มต้นใช้งานฟรี
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
