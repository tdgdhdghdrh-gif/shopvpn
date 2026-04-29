'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Terminal, Zap, Shield, Globe } from 'lucide-react'

export default function LandingNeonNight() {
  return (
    <div className="relative min-h-screen bg-black text-green-400 overflow-hidden font-mono">
      {/* Grid floor */}
      <div className="fixed bottom-0 left-0 right-0 h-[40vh] z-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(74,222,128,0.15) 25%, rgba(74,222,128,0.15) 26%, transparent 27%), linear-gradient(90deg, transparent 24%, rgba(74,222,128,0.15) 25%, rgba(74,222,128,0.15) 26%, transparent 27%)',
        backgroundSize: '40px 40px',
        transform: 'perspective(200px) rotateX(60deg)',
        transformOrigin: 'bottom',
      }} />

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-32">
        {/* Terminal window */}
        <div className="bg-black/80 border border-green-500/30 rounded-lg overflow-hidden mb-16 max-w-2xl mx-auto">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-green-500/20 bg-green-500/5">
            <div className="w-3 h-3 rounded-full bg-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/50" />
            <span className="ml-2 text-xs text-green-500/50">vpn.exe</span>
          </div>
          <div className="p-6 text-sm space-y-2">
            <p><span className="text-green-500/50">$</span> sudo connect --secure</p>
            <p className="text-green-300/70">{'>'} Initializing secure tunnel...</p>
            <p className="text-green-300/70">{'>'} Handshake complete</p>
            <p className="text-green-300/70">{'>'} Latency: <span className="text-green-400">4ms</span></p>
            <p className="text-green-300/70">{'>'} Encryption: <span className="text-green-400">AES-256-GCM</span></p>
            <p><span className="text-green-500/50">$</span> status<span className="animate-pulse">_</span></p>
          </div>
        </div>

        {/* Hero */}
        <div className="text-center mb-16">
          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-5xl font-black mb-4 text-green-400"
            style={{ textShadow: '0 0 20px rgba(74,222,128,0.3)' }}>
            NEON NIGHT VPN
          </motion.h1>
          <p className="text-green-400/50 mb-8">เชื่อมต่อในโลก cyberpunk ความเร็วแสง</p>
          <div className="flex gap-4 justify-center">
            <Link href="/register" className="px-8 py-3 bg-green-500 text-black font-bold rounded hover:bg-green-400 transition-colors">
              <Terminal className="w-4 h-4 inline mr-2" />
              EXECUTE
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { label: 'PING', val: '<5ms', color: 'text-green-400' },
            { label: 'SPEED', val: '10Gbps', color: 'text-green-400' },
            { label: 'UPTIME', val: '99.9%', color: 'text-green-400' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
              className="border border-green-500/20 bg-green-500/5 p-4 text-center">
              <p className="text-xs text-green-500/50 mb-1">{s.label}</p>
              <p className={`text-xl font-black ${s.color}`}>{s.val}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
