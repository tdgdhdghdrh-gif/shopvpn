'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap, Shield, Globe, Gauge, Smartphone, Clock, ChevronRight, CheckCircle2, Star, Wifi, CloudRain } from 'lucide-react'

export default function LandingCyberTokyo() {
  const [raindrops, setRaindrops] = useState<{x: number; delay: number; duration: number}[]>([])
  useEffect(() => {
    setRaindrops(Array.from({ length: 40 }).map(() => ({
      x: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 0.5 + Math.random() * 0.5,
    })))
  }, [])

  return (
    <div className="relative min-h-screen bg-[#0a0a12] text-white overflow-hidden font-sans">
      {/* Rain */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {raindrops.map((r, i) => (
          <motion.div key={i} className="absolute w-px bg-blue-300/20"
            style={{ left: `${r.x}%`, height: 20 }}
            animate={{ y: ['-10vh', '110vh'] }}
            transition={{ duration: r.duration, repeat: Infinity, delay: r.delay, ease: 'linear' }}
          />
        ))}
      </div>

      {/* City lights bokeh */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 h-[60vh] bg-gradient-to-t from-blue-900/10 to-transparent" />
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="absolute rounded-full blur-xl"
            style={{
              left: `${Math.random() * 100}%`,
              bottom: `${Math.random() * 40}%`,
              width: 50 + Math.random() * 100,
              height: 50 + Math.random() * 100,
              background: i % 3 === 0 ? 'rgba(59, 130, 246, 0.15)' : i % 3 === 1 ? 'rgba(236, 72, 153, 0.1)' : 'rgba(34, 211, 238, 0.1)',
            }}
          />
        ))}
      </div>

      {/* Neon signs text effect */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-5">
        <div className="absolute top-[20%] left-[10%] text-6xl font-black text-pink-500" style={{ writingMode: 'vertical-rl' }}>渋谷</div>
        <div className="absolute top-[40%] right-[15%] text-5xl font-black text-cyan-500" style={{ writingMode: 'vertical-rl' }}>新宿</div>
        <div className="absolute bottom-[30%] left-[20%] text-4xl font-black text-yellow-500">ネオン</div>
      </div>

      {/* Hero */}
      <section className="relative z-10 pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 mb-8">
              <CloudRain className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-cyan-300 font-bold tracking-wider">CYBER TOKYO VPN</span>
            </div>

            <h1 className="text-5xl sm:text-7xl font-black mb-6 tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400">
                東京VPN
              </span>
            </h1>

            <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              เร็วเหมือนสายฝนในโตเกียว
              <br className="hidden sm:block" />
              <span className="text-cyan-400">เน็ตแรง เสถียร ปิงต่ำ</span> รองรับทุกค่ายมือถือ
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register"
                className="group px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl font-bold text-lg text-white hover:shadow-[0_0_40px_rgba(236,72,153,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2">
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
              { value: '10Gbps', label: 'ความเร็วสูงสุด', color: 'pink' },
              { value: '<5ms', label: 'ปิงเซิร์ฟเวอร์ไทย', color: 'cyan' },
              { value: '50+', label: 'เซิร์ฟเวอร์ทั่วโลก', color: 'purple' },
              { value: '99.9%', label: 'Uptime', color: 'blue' },
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm">
                <p className="text-2xl font-black" style={{ color: stat.color === 'pink' ? '#f472b6' : stat.color === 'cyan' ? '#22d3ee' : stat.color === 'purple' ? '#c084fc' : '#60a5fa' }}>{stat.value}</p>
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
            <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400">
              機能
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
                className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all">
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
            <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400">
              料金
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
                {p.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-pink-500 rounded-full text-xs font-bold text-white">人気</div>}
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
                  className={`w-full py-3 rounded-xl font-bold text-center transition-all active:scale-95 ${p.popular ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}>
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
            className="p-8 sm:p-12 rounded-3xl border border-pink-500/20 bg-gradient-to-br from-pink-500/5 to-cyan-500/5">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">พร้อมทะลุขีดจำกัด?</h2>
            <p className="text-zinc-400 mb-8 max-w-xl mx-auto">สมัครสมาชิกวันนี้ รับประสบการณ์ VPN ที่เร็วที่สุด พร้อมเทคโนโลยี XTLS Reality ล่าสุด</p>
            <Link href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-600 to-cyan-600 rounded-2xl font-bold text-lg text-white hover:shadow-[0_0_40px_rgba(236,72,153,0.4)] transition-all active:scale-95">
              <Star className="w-5 h-5" /> เริ่มต้นใช้งานฟรี
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
