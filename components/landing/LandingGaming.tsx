'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Gamepad2, Zap, Signal, Shield, Globe, Wifi, Trophy,
  ChevronRight, Play, Rocket, Sword, Target, Timer,
  Sparkles, Server, Flame, Crown, Users, Star,
  MonitorSmartphone, Download, Activity, Eye, ArrowRight,
  Crosshair, Headphones, Bolt, Heart,
} from 'lucide-react'
import PricingSection from '@/components/PricingSection'
import FAQSection from '@/components/FAQSection'

const neonGlow = (color: string) => `shadow-[0_0_15px_${color},0_0_30px_${color}22]`

export default function LandingGaming() {
  return (
    <main className="bg-black">

      {/* ══════════════════════════════════════════════
          HERO - Full Neon Gaming Experience
          ══════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center pt-20 pb-20 overflow-hidden">
        {/* Animated neon grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(0,255,136,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.4) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        {/* Neon glow orbs */}
        <div className="absolute top-20 right-[10%] w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-20 left-[5%] w-80 h-80 bg-violet-500/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[150px]" />

        {/* Scan lines */}
        <div className="absolute inset-0 pointer-events-none z-[5] opacity-30" style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,136,0.01) 2px, rgba(0,255,136,0.01) 4px)',
        }} />

        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent z-[3]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-20">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

              {/* Gaming badge */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex justify-center mb-8">
                <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-emerald-500/[0.08] border border-emerald-500/20 backdrop-blur-sm">
                  <Gamepad2 size={16} className="text-emerald-400" />
                  <span className="text-sm text-emerald-300 font-bold tracking-wider">GAMING VPN #1 IN THAILAND</span>
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                </div>
              </motion.div>

              {/* Main heading */}
              <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-[0.95] tracking-tighter"
              >
                <span className="block">เล่นเกมไม่แลค</span>
                <span className="block mt-2">
                  <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">PING ต่ำสุด</span>
                  {" "}
                  <span className="relative inline-block">
                    <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">5ms</span>
                    <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute -inset-2 bg-violet-500/10 rounded-xl blur-xl -z-10"
                    />
                  </span>
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="text-base sm:text-lg text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed"
              >
                เซิร์ฟเวอร์เกมเฉพาะทาง เน้น Low Latency สำหรับ
                <span className="text-emerald-400 font-bold"> ROV, PUBG, ML, Genshin, Valorant </span>
                และเกมออนไลน์ทุกเกม
              </motion.p>

              {/* CTA */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
              >
                <Link href="/register"
                  className="group relative inline-flex items-center justify-center gap-2.5 px-10 py-5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-black rounded-2xl font-black text-base transition-all shadow-[0_0_30px_rgba(52,211,153,0.2)] hover:shadow-[0_0_60px_rgba(52,211,153,0.3)] hover:scale-[1.02]"
                >
                  <Sword size={18} />
                  เข้าสู่สนามรบ
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/public-vless"
                  className="group inline-flex items-center justify-center gap-2.5 px-10 py-5 bg-white/[0.03] hover:bg-emerald-500/[0.08] text-white border border-emerald-500/20 hover:border-emerald-500/40 rounded-2xl font-bold text-base transition-all"
                >
                  <Play size={16} className="fill-emerald-400 text-emerald-400" />
                  ทดลองใช้ฟรี
                </Link>
              </motion.div>

              {/* Gaming Stats */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
                  {[
                    { icon: Signal, value: "<5ms", label: "Ping ไทย", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
                    { icon: Zap, value: "10Gbps", label: "Max Speed", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
                    { icon: Wifi, value: "99.9%", label: "Uptime", color: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
                    { icon: Trophy, value: "50K+", label: "เกมเมอร์", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
                  ].map((stat, idx) => (
                    <motion.div key={idx} whileHover={{ y: -4, scale: 1.03 }}
                      className="relative p-4 rounded-2xl bg-black/60 border border-emerald-500/10 backdrop-blur-sm text-center hover:border-emerald-500/30 transition-all"
                    >
                      <div className={`w-9 h-9 ${stat.color} border rounded-xl flex items-center justify-center mx-auto mb-2`}>
                        <stat.icon className="w-4 h-4" />
                      </div>
                      <div className="text-xl font-black text-white">{stat.value}</div>
                      <div className="text-[11px] text-zinc-500 font-medium mt-0.5">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SUPPORTED GAMES - Neon cards
          ══════════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(52,211,153,0.04),transparent)]" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="text-xs font-bold text-emerald-400 tracking-[0.2em] uppercase mb-3">Supported Games</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              รองรับ<span className="text-emerald-400">ทุกเกม</span>ยอดนิยม
            </h2>
            <p className="text-zinc-500 max-w-xl mx-auto">เซิร์ฟเวอร์ถูก optimize สำหรับเกมโดยเฉพาะ ลด ping ลด packet loss ลด jitter</p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {[
              { name: 'ROV', ping: '3ms', genre: 'MOBA', hot: true },
              { name: 'PUBG', ping: '5ms', genre: 'Battle Royale', hot: true },
              { name: 'Mobile Legends', ping: '4ms', genre: 'MOBA', hot: true },
              { name: 'Genshin', ping: '8ms', genre: 'RPG', hot: false },
              { name: 'Valorant', ping: '6ms', genre: 'FPS', hot: false },
              { name: 'FIFA Online', ping: '5ms', genre: 'Sports', hot: false },
            ].map((game, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6, scale: 1.03 }}
                className="relative p-5 rounded-2xl bg-zinc-900/80 border border-emerald-500/10 hover:border-emerald-500/30 text-center transition-all group"
              >
                {game.hot && (
                  <div className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-md bg-red-500 text-[8px] font-bold text-white flex items-center gap-0.5">
                    <Flame className="w-2.5 h-2.5" /> HOT
                  </div>
                )}
                <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(52,211,153,0.2)] transition-all">
                  <Gamepad2 className="w-7 h-7 text-emerald-400" />
                </div>
                <p className="text-sm font-bold text-white mb-0.5">{game.name}</p>
                <p className="text-[10px] text-zinc-600 mb-1">{game.genre}</p>
                <p className="text-xs text-emerald-400 font-bold">Ping: {game.ping}</p>
              </motion.div>
            ))}
          </div>

          {/* More games hint */}
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-center text-sm text-zinc-600 mt-8"
          >
            + Fortnite, Apex Legends, League of Legends, Overwatch 2, Roblox, Minecraft และอีกมากมาย
          </motion.p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          WHY GAMERS CHOOSE US - 6 Features
          ══════════════════════════════════════════════ */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="text-xs font-bold text-violet-400 tracking-[0.2em] uppercase mb-3">Why Pro Gamers Trust Us</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              ทำไมเกมเมอร์ถึง<span className="text-violet-400">เลือกเรา</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Timer, title: 'Ultra Low Latency', desc: 'เซิร์ฟเวอร์ไทย ping ต่ำกว่า 5ms เส้นทางตรงถึง game server ไม่ผ่าน proxy ซ้อน', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
              { icon: Shield, title: 'Anti-DDoS Protection', desc: 'ปกป้องจากการโจมตี DDoS ระดับ L3-L7 เล่นเกมแข่งขันได้อย่างปลอดภัย', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
              { icon: Server, title: 'Gaming Optimized', desc: 'เซิร์ฟเวอร์ถูก tune เฉพาะสำหรับเกม ลด jitter, ลด packet loss, TCP BBR enabled', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
              { icon: Target, title: 'Zero Throttling', desc: 'ไม่ลดความเร็ว ไม่จำกัดแบนด์วิธ ไม่ throttle gaming traffic เล่นเต็มสปีด 24 ชม.', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
              { icon: Activity, title: 'Real-time Monitor', desc: 'ดูสถานะเซิร์ฟเวอร์ ping, speed, load แบบ real-time เลือกเซิร์ฟเวอร์ที่ดีที่สุดได้ทันที', color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
              { icon: Crosshair, title: 'Multi-Game Support', desc: 'รองรับทั้ง MOBA, FPS, Battle Royale, RPG, Sports ไม่ว่าเกมไหนก็ลื่น', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
            ].map((f, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="group flex gap-4 p-6 rounded-2xl bg-zinc-900/50 border border-white/[0.04] hover:border-emerald-500/20 transition-all"
              >
                <div className={`w-12 h-12 ${f.bg} border rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1">{f.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SPEED COMPARISON
          ══════════════════════════════════════════════ */}
      <section className="py-24 border-t border-emerald-500/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              <span className="text-emerald-400">เปรียบเทียบ</span> ก่อน-หลังใช้ VPN
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Without VPN */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="p-6 rounded-2xl bg-red-500/[0.03] border border-red-500/10"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <h3 className="text-sm font-bold text-red-400">ไม่ใช้ VPN</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Ping', value: '80-150ms', bad: true },
                  { label: 'Packet Loss', value: '5-15%', bad: true },
                  { label: 'Jitter', value: '20-50ms', bad: true },
                  { label: 'Speed', value: 'ถูก Throttle', bad: true },
                ].map((s, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-red-500/5 last:border-0">
                    <span className="text-sm text-zinc-500">{s.label}</span>
                    <span className="text-sm font-bold text-red-400">{s.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* With VPN */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="p-6 rounded-2xl bg-emerald-500/[0.03] border border-emerald-500/10 relative"
            >
              <div className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-emerald-500 text-black text-[10px] font-black">RECOMMENDED</div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-sm font-bold text-emerald-400">ใช้ VPN</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Ping', value: '3-8ms' },
                  { label: 'Packet Loss', value: '0%' },
                  { label: 'Jitter', value: '<1ms' },
                  { label: 'Speed', value: 'เต็ม 10Gbps' },
                ].map((s, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-emerald-500/5 last:border-0">
                    <span className="text-sm text-zinc-500">{s.label}</span>
                    <span className="text-sm font-bold text-emerald-400">{s.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CARRIER SUPPORT
          ══════════════════════════════════════════════ */}
      <section className="py-20 border-t border-emerald-500/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">รองรับ<span className="text-emerald-400">ทุกค่าย</span>มือถือ</h2>
            <p className="text-zinc-500">ใช้ได้กับทุกเครือข่ายในประเทศไทย เล่นเกมลื่นทุกค่าย</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { name: 'AIS 5G / 4G', ping: '3-5ms', desc: 'รองรับ AIS ทุกแพ็กเกจ เปิด VPN แล้วเล่นเกมได้ทันที', color: 'border-green-500/15 bg-green-500/5' },
              { name: 'TRUE 5G / 4G', ping: '3-6ms', desc: 'รองรับ TRUE ทุกแพ็กเกจ Ping ต่ำสุดในค่ายนี้', color: 'border-red-500/15 bg-red-500/5' },
              { name: 'DTAC / dtac', ping: '4-7ms', desc: 'รองรับ DTAC ทุกแพ็กเกจ ความเร็วเต็มสปีด', color: 'border-blue-500/15 bg-blue-500/5' },
            ].map((c, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`p-6 rounded-2xl border ${c.color} text-center`}
              >
                <h3 className="text-base font-bold text-white mb-1">{c.name}</h3>
                <p className="text-xs text-emerald-400 font-bold mb-2">Ping: {c.ping}</p>
                <p className="text-sm text-zinc-500">{c.desc}</p>
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
          GAMER TESTIMONIALS
          ══════════════════════════════════════════════ */}
      <section className="py-24 border-t border-emerald-500/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="text-xs font-bold text-amber-400 tracking-[0.2em] uppercase mb-3">Gamer Reviews</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white">เกมเมอร์ตัวจริง<span className="text-emerald-400">พูดถึงเรา</span></h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { name: 'ProGamer_TH', rank: 'Conqueror', game: 'ROV', text: 'Ping 3ms ตลอด เล่น ROV rank ไม่เคยหลุดเพราะเน็ตเลย ดีที่สุดที่เคยใช้', stars: 5 },
              { name: 'SniperKing', rank: 'Ace', game: 'PUBG', text: 'เล่น PUBG ยิงขั้นเทพ Ping ต่ำมาก ไม่มี desync เลย กราบ!', stars: 5 },
              { name: 'MythicBoss', rank: 'Mythic', game: 'ML', text: 'เล่น ML rank Mythic ไม่เคยแลค ไม่เคย reconnect ใช้มา 8 เดือนแล้ว', stars: 5 },
            ].map((t, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-zinc-900/50 border border-emerald-500/10"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="px-2 py-0.5 rounded bg-emerald-500/10 text-[10px] font-bold text-emerald-400">{t.game}</div>
                  <div className="px-2 py-0.5 rounded bg-amber-500/10 text-[10px] font-bold text-amber-400">{t.rank}</div>
                </div>
                <div className="flex gap-0.5 mb-3">
                  {Array(t.stars).fill(0).map((_, j) => <Star key={j} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Crown className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="text-sm font-bold text-white">{t.name}</span>
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
          FINAL CTA - Gaming style
          ══════════════════════════════════════════════ */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(52,211,153,0.06),transparent)]" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <Gamepad2 className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 tracking-tight leading-[0.95]">
              พร้อมลุย
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">แรงค์</span>
              <br />แล้วหรือยัง?
            </h2>
            <p className="text-zinc-500 mb-10 text-lg">
              สมัครเลย Ping ต่ำ ไม่แลค ชนะทุกแมตช์ เริ่มต้นแค่ 2 บาท/วัน
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register"
                className="group inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-black rounded-2xl font-black text-base transition-all shadow-[0_0_30px_rgba(52,211,153,0.2)] hover:shadow-[0_0_60px_rgba(52,211,153,0.3)] hover:scale-[1.02]"
              >
                <Sword size={18} />
                เริ่มต้นเล่นเลย
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/login"
                className="inline-flex items-center gap-2 text-zinc-500 hover:text-emerald-400 font-medium transition-colors"
              >
                เข้าสู่ระบบ <ChevronRight size={16} />
              </Link>
            </div>
            <p className="text-xs text-zinc-700 mt-8 flex items-center justify-center gap-2">
              <Heart className="w-3 h-3 text-red-500" /> เกมเมอร์กว่า 50,000+ คนไว้วางใจ
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
