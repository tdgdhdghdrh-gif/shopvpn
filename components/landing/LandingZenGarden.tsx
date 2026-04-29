'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap, Shield, Globe, Gauge, Smartphone, Clock, ChevronRight, CheckCircle2, Star, Wifi, Droplets } from 'lucide-react'

export default function LandingZenGarden() {
  const [ripples, setRipples] = useState<{x: number; y: number; id: number}[]>([])
  const nextId = { current: 0 }

  const addRipple = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = nextId.current++
    setRipples(prev => [...prev, { x, y, id }])
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 2000)
  }

  return (
    <div className="relative min-h-screen bg-[#f5f0e8] text-[#2c2c2c] overflow-hidden font-sans selection:bg-[#d4a574]/30" onClick={addRipple}>
      {/* Subtle paper texture */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-30"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.15\'/%3E%3C/svg%3E")' }}
      />

      {/* Water ripples on click */}
      {ripples.map(r => (
        <motion.div key={r.id} className="absolute rounded-full border border-[#8b7355]/30 pointer-events-none z-0"
          style={{ left: r.x, top: r.y, transform: 'translate(-50%, -50%)' }}
          initial={{ width: 0, height: 0, opacity: 0.6 }}
          animate={{ width: 200, height: 200, opacity: 0 }}
          transition={{ duration: 2, ease: 'easeOut' }}
        />
      ))}

      {/* Floating sakura petals */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div key={i} className="absolute w-3 h-3 rounded-full bg-[#e8b4b8]/60 z-0 pointer-events-none"
          style={{ left: `${Math.random() * 100}%`, top: -20 }}
          animate={{ y: ['0vh', '110vh'], x: [0, Math.sin(i) * 50], rotate: [0, 360] }}
          transition={{ duration: 8 + Math.random() * 6, repeat: Infinity, delay: Math.random() * 5, ease: 'linear' }}
        />
      ))}

      {/* Hero */}
      <section className="relative z-10 pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
            <div className="inline-block px-5 py-2 mb-8 border border-[#8b7355]/30 rounded-full">
              <span className="text-sm text-[#8b7355] font-medium tracking-widest">和のVPN • ZEN CONNECTION</span>
            </div>

            <h1 className="text-5xl sm:text-7xl font-light mb-8 tracking-wide" style={{ fontFamily: 'serif' }}>
              <span className="text-[#2c2c2c]">静けさの</span>
              <br />
              <span className="text-[#8b6914] font-normal">中で繋がる</span>
            </h1>

            <p className="text-lg text-[#6b6b6b] max-w-xl mx-auto mb-12 leading-loose tracking-wide">
              ในความสงบ คุณเชื่อมต่อได้ดีที่สุด
              <br />
              <span className="text-[#8b6914]">VPN ที่เสถียร เร็ว และง่ายต่อการใช้งาน</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register"
                className="px-10 py-4 bg-[#2c2c2c] text-[#f5f0e8] rounded-full font-medium tracking-wide hover:bg-[#1a1a1a] transition-all active:scale-95 flex items-center justify-center gap-2">
                <Droplets className="w-4 h-4" />
                เริ่มต้นใช้งาน
              </Link>
              <Link href="/vpn"
                className="px-10 py-4 border border-[#8b7355]/40 text-[#2c2c2c] rounded-full font-medium tracking-wide hover:bg-[#8b7355]/10 transition-all active:scale-95 flex items-center justify-center gap-2">
                <Wifi className="w-4 h-4" />
                ทดลองใช้ฟรี
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Minimal stats */}
      <section className="relative z-10 py-16 px-4 border-t border-[#8b7355]/10">
        <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { value: '10Gbps', label: 'ความเร็ว' },
            { value: '<5ms', label: 'ปิงต่ำ' },
            { value: '50+', label: 'เซิร์ฟเวอร์' },
            { value: '99.9%', label: 'เสถียรภาพ' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-2xl font-light text-[#2c2c2c]" style={{ fontFamily: 'serif' }}>{s.value}</p>
              <p className="text-xs text-[#8b7355] mt-2 tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features — minimal cards */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-light text-[#2c2c2c] mb-4" style={{ fontFamily: 'serif' }}>機能</h2>
            <div className="w-12 h-px bg-[#8b7355]/40 mx-auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: 'ความเร็วสูง', desc: '10Gbps เล่นเกม ดู 4K ไม่กระตุก' },
              { icon: Shield, title: 'ปลอดภัย', desc: 'AES-256-GCM + XTLS Reality' },
              { icon: Globe, title: 'ทั่วโลก', desc: '50+ เซิร์ฟเวอร์ใน 10+ ประเทศ' },
              { icon: Gauge, title: 'ปิงต่ำ', desc: 'เซิร์ฟเวอร์ไทยปิงต่ำกว่า 5ms' },
              { icon: Smartphone, title: 'ทุกอุปกรณ์', desc: 'iOS, Android, Windows, macOS' },
              { icon: Clock, title: 'ตลอดเวลา', desc: 'ระบบอัตโนมัติ ไม่มีดาวน์ไทม์' },
            ].map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-8 border border-[#8b7355]/10 rounded-2xl hover:border-[#8b7355]/30 hover:shadow-sm transition-all bg-white/40">
                <div className="w-8 h-8 mb-6 text-[#8b6914]">
                  <f.icon className="w-8 h-8" strokeWidth={1} />
                </div>
                <h3 className="text-lg font-medium text-[#2c2c2c] mb-3 tracking-wide">{f.title}</h3>
                <p className="text-sm text-[#8b7355] leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing — zen stones style */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-light text-[#2c2c2c] mb-4" style={{ fontFamily: 'serif' }}>料金</h2>
            <div className="w-12 h-px bg-[#8b7355]/40 mx-auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { name: 'Starter', price: '50', color: '#9ca3af' },
              { name: 'Pro', price: '100', color: '#8b6914', popular: true },
              { name: 'Ultimate', price: '200', color: '#2c2c2c' },
            ].map((p) => (
              <div key={p.name} className={`relative p-8 rounded-2xl border ${p.popular ? 'border-[#8b6914]/30 bg-white/60' : 'border-[#8b7355]/10 bg-white/40'} flex flex-col items-center text-center`}>
                {p.popular && <div className="absolute -top-3 px-4 py-1 bg-[#8b6914] text-[#f5f0e8] rounded-full text-xs tracking-widest">おすすめ</div>}
                <h3 className="text-lg font-medium text-[#2c2c2c] tracking-wide mb-4">{p.name}</h3>
                <div className="w-16 h-16 rounded-full border-2 flex items-center justify-center mb-6" style={{ borderColor: p.color }}>
                  <span className="text-2xl font-light" style={{ color: p.color }}>{p.price}</span>
                </div>
                <p className="text-sm text-[#8b7355] mb-6">บาท/เดือน</p>
                <Link href="/register" className={`w-full py-3 rounded-full text-sm font-medium tracking-wide transition-all active:scale-95 ${p.popular ? 'bg-[#2c2c2c] text-[#f5f0e8] hover:bg-[#1a1a1a]' : 'border border-[#8b7355]/30 text-[#2c2c2c] hover:bg-[#8b7355]/10'}`}>
                  สมัครเลย
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — zen circle */}
      <section className="relative z-10 py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="p-12 border border-[#8b7355]/20 rounded-full aspect-square flex flex-col items-center justify-center mx-auto max-w-sm hover:border-[#8b7355]/40 transition-all">
            <h2 className="text-2xl font-light text-[#2c2c2c] mb-4" style={{ fontFamily: 'serif' }}>始めましょう</h2>
            <p className="text-sm text-[#8b7355] mb-8 leading-relaxed">สมัครวันนี้ รับประสบการณ์<br />VPN ที่สงบและรวดเร็ว</p>
            <Link href="/register" className="px-8 py-3 bg-[#2c2c2c] text-[#f5f0e8] rounded-full text-sm tracking-wide hover:bg-[#1a1a1a] transition-all active:scale-95">
              สมัครฟรี
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
