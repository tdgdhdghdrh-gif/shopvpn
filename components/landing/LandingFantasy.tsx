'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { TreePine, Zap, Shield, Globe, Sparkles } from 'lucide-react'

export default function LandingFantasy() {
  return (
    <div className="relative min-h-screen bg-[#0d1210] text-[#e8f5e9] overflow-hidden">
      {/* Magic particles */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div key={i} className="absolute w-1 h-1 bg-emerald-400/50 rounded-full"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{ opacity: [0.2, 1, 0.2], y: [0, -20, 0] }}
            transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
          />
        ))}
      </div>

      {/* Parchment border */}
      <div className="fixed inset-4 border border-emerald-500/10 rounded z-0 pointer-events-none" />
      <div className="fixed top-6 left-6 text-emerald-500/20 text-xl">ᚠ</div>
      <div className="fixed top-6 right-6 text-emerald-500/20 text-xl">ᚢ</div>
      <div className="fixed bottom-6 left-6 text-emerald-500/20 text-xl">ᚦ</div>
      <div className="fixed bottom-6 right-6 text-emerald-500/20 text-xl">ᚨ</div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-32">
        <div className="text-center mb-20">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
            <TreePine className="w-10 h-10 mx-auto text-emerald-400" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-black mb-4 text-emerald-300" style={{ fontFamily: 'serif' }}>
            VPN ต่างโลก
          </motion.h1>
          <p className="text-emerald-200/50 max-w-md mx-auto mb-8">
            เชื่อมต่อด้วยพลังเวทมนตร์ เข้ารหัสข้อมูลดั่งโล่แห่งเอลฟ์
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register" className="px-8 py-3 bg-emerald-700 text-white font-bold rounded hover:bg-emerald-600 transition-colors">
              <Sparkles className="w-4 h-4 inline mr-2" />
              ร่ายคาถา
            </Link>
          </div>
        </div>

        {/* Rune stones */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { rune: 'ᚦ', title: 'ความเร็ว', desc: 'สายฟ้าแห่งโธร์' },
            { rune: 'ᛟ', title: 'ปกป้อง', desc: 'โล่แห่งโอดิน' },
            { rune: 'ᛉ', title: 'เชื่อมต่อ', desc: 'ประตูแห่งอัลฟ์เฮיים' },
          ].map((item, i) => (
            <motion.div key={item.title} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.1 }}
              className="bg-emerald-950/30 border border-emerald-500/20 p-6 text-center rounded">
              <p className="text-3xl text-emerald-400/60 mb-2">{item.rune}</p>
              <p className="font-bold text-emerald-300">{item.title}</p>
              <p className="text-xs text-emerald-400/40">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
