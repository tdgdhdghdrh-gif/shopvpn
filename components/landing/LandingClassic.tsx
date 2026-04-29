'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap, Shield, Globe, ChevronRight, Terminal, Cpu, Lock, Wifi } from 'lucide-react'

export default function LandingClassic() {
  const [lines, setLines] = useState<string[]>([])
  const fullLines = [
    '> initializing_secure_connection...',
    '> handshake_complete [AES-256-GCM]',
    '> routing_optimized --latency <5ms',
    '> tunnel_established ✓',
    '> welcome_to_simon_vpn',
  ]

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      if (i < fullLines.length) {
        setLines(prev => [...prev, fullLines[i]])
        i++
      }
    }, 400)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative min-h-screen bg-[#0c0c0c] text-[#00ff41] font-mono overflow-hidden">
      {/* Matrix rain background */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 19px, #00ff41 20px)',
        backgroundSize: '100% 20px',
      }} />

      {/* Scanline */}
      <div className="fixed inset-0 z-50 pointer-events-none opacity-[0.02]" style={{
        background: 'repeating-linear-gradient(0deg, transparent, transparent 1px, #000 2px)',
        backgroundSize: '100% 4px',
      }} />

      {/* CRT vignette */}
      <div className="fixed inset-0 z-40 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)',
      }} />

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-32">
        {/* Header */}
        <div className="flex items-center gap-3 mb-16 border-b border-[#00ff41]/20 pb-4">
          <Terminal className="w-6 h-6" />
          <span className="text-sm tracking-[0.3em] font-bold">SIMON_VPN_CONSOLE_v9.0</span>
          <div className="ml-auto flex gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00ff41] animate-pulse" />
            <span className="text-[10px]">ONLINE</span>
          </div>
        </div>

        {/* Typing terminal */}
        <div className="bg-black/50 border border-[#00ff41]/30 rounded-lg p-6 mb-12 font-mono text-sm">
          {lines.map((line, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-1">
              {line}
            </motion.div>
          ))}
          <motion.div animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="inline-block w-2 h-4 bg-[#00ff41] align-middle" />
        </div>

        {/* Main Hero */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h1 className="text-5xl font-black mb-4 leading-tight">
              <span className="text-white">SECURE</span><br />
              <span className="text-[#00ff41]">TERMINAL</span><br />
              <span className="text-white/50 text-3xl">CONNECTION</span>
            </h1>
            <p className="text-[#00ff41]/70 mb-8 leading-relaxed">
              เข้ารหัสข้อมูลแบบ end-to-end ความเร็วสูงสุด 10Gbps<br />
              ไม่เก็บ log ไม่ติดตาม ไม่มีข้อมูลรั่วไหล
            </p>
            <div className="flex gap-4">
              <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3 bg-[#00ff41] text-black font-bold rounded hover:bg-[#00cc33] transition-colors">
                <Zap className="w-4 h-4" />
                INITIALIZE
              </Link>
              <Link href="/public-vless" className="inline-flex items-center gap-2 px-6 py-3 border border-[#00ff41]/30 text-[#00ff41] font-bold rounded hover:bg-[#00ff41]/10 transition-colors">
                <Terminal className="w-4 h-4" />
                TEST_RUN
              </Link>
            </div>
          </div>

          {/* Status panel */}
          <div className="bg-black/60 border border-[#00ff41]/20 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4 text-xs text-[#00ff41]/50">
              <Cpu className="w-4 h-4" />
              SYSTEM_STATUS
            </div>
            {[
              { label: 'ENCRYPTION', val: 'AES-256-GCM', bar: 100, color: '#00ff41' },
              { label: 'LATENCY', val: '<5ms', bar: 95, color: '#00ff41' },
              { label: 'UPTIME', val: '99.99%', bar: 99, color: '#00ff41' },
              { label: 'BANDWIDTH', val: '10Gbps', bar: 90, color: '#00ff41' },
            ].map((s, i) => (
              <div key={i} className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#00ff41]/70">{s.label}</span>
                  <span style={{ color: s.color }}>{s.val}</span>
                </div>
                <div className="h-2 bg-[#00ff41]/10 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${s.bar}%` }} transition={{ duration: 1.5, delay: i * 0.2 }} className="h-full rounded-full" style={{ backgroundColor: s.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Server nodes */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['TOKYO', 'SINGAPORE', 'LONDON', 'NEW YORK'].map((city, i) => (
            <motion.div key={city} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
              className="bg-black/40 border border-[#00ff41]/20 rounded p-4 text-center hover:border-[#00ff41]/50 transition-colors">
              <Wifi className="w-5 h-5 mx-auto mb-2 text-[#00ff41]/50" />
              <p className="text-xs font-bold text-[#00ff41]">{city}</p>
              <p className="text-[10px] text-[#00ff41]/40">NODE_{String(i + 1).padStart(2, '0')}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
