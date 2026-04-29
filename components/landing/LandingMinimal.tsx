'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function LandingMinimal() {
  return (
    <div className="relative min-h-screen bg-white text-black flex flex-col items-center justify-center overflow-hidden">
      {/* Single black dot decoration */}
      <div className="absolute top-[20%] left-[15%] w-3 h-3 rounded-full bg-black/10" />
      <div className="absolute bottom-[25%] right-[20%] w-2 h-2 rounded-full bg-black/5" />
      <div className="absolute top-[60%] right-[10%] w-1 h-1 rounded-full bg-black/20" />

      <div className="relative z-10 text-center px-6 max-w-2xl">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}
          className="text-[11px] tracking-[0.5em] text-zinc-400 mb-8 font-medium">
          SIMON VPN
        </motion.p>

        <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
          className="text-[clamp(3rem,12vw,8rem)] font-black leading-[0.9] tracking-tighter mb-6">
          Fast.<br />
          Private.<br />
          <span className="text-zinc-200">Simple.</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.5 }}
          className="text-zinc-400 text-sm max-w-md mx-auto mb-10 leading-relaxed">
          VPN ที่ใช้ง่ายที่สุดในโลก<br />
          ไม่ต้องตั้งค่า ไม่ต้องยุ่งยาก กดเดียวเชื่อมต่อ
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register"
            className="px-8 py-4 bg-black text-white text-sm font-bold rounded-full hover:bg-zinc-800 transition-colors">
            เริ่มต้นใช้งาน
          </Link>
          <Link href="/public-vless"
            className="px-8 py-4 border border-zinc-200 text-black text-sm font-bold rounded-full hover:border-black transition-colors">
            ทดลองฟรี
          </Link>
        </motion.div>
      </div>

      {/* Bottom tiny features */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
        className="absolute bottom-12 left-0 right-0 flex justify-center gap-12 text-[10px] text-zinc-300 tracking-wider">
        <span>10GBPS</span>
        <span>•</span>
        <span>ZERO LOG</span>
        <span>•</span>
        <span>50+ NODES</span>
      </motion.div>
    </div>
  )
}
