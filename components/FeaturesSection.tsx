'use client'

import { motion } from 'framer-motion'
import { 
  Gamepad2, Youtube, Download, Shield, Globe, Smartphone,
  Zap, Lock, Eye, Server, Signal, Cpu,
  ShieldCheck, HeartPulse, Timer
} from 'lucide-react'
import FadeIn from './FadeIn'

const features = [
  { 
    icon: Zap, 
    title: "ความเร็วระดับ 10Gbps", 
    desc: "ไม่จำกัดแบนด์วิธ เล่นเกมได้ลื่นปรื๊ด ดาวน์โหลดไฟล์ใหญ่ได้ภายในวินาที",
    gradient: "from-amber-400 to-orange-500",
    iconBg: "bg-amber-500/10",
    delay: 0 
  },
  { 
    icon: Shield, 
    title: "เข้ารหัส AES-256-GCM", 
    desc: "ปกป้องข้อมูลระดับทหาร ป้องกันการดักจับข้อมูลทุกรูปแบบ",
    gradient: "from-emerald-400 to-teal-500",
    iconBg: "bg-emerald-500/10",
    delay: 0.08 
  },
  { 
    icon: Globe, 
    title: "20+ เซิร์ฟเวอร์ทั่วโลก", 
    desc: "เชื่อมต่อเซิร์ฟเวอร์ได้ทุกมุมโลก ปลดบล็อกทุกเว็บไซต์",
    gradient: "from-blue-400 to-indigo-500",
    iconBg: "bg-blue-500/10",
    delay: 0.16 
  },
  { 
    icon: Lock, 
    title: "Zero-Log Policy", 
    desc: "ไม่เก็บข้อมูลการใช้งาน ไม่เก็บ IP Address ไม่เก็บประวัติการเข้าเว็บ",
    gradient: "from-purple-400 to-pink-500",
    iconBg: "bg-purple-500/10",
    delay: 0.24 
  },
  { 
    icon: Smartphone, 
    title: "รองรับทุกอุปกรณ์", 
    desc: "ใช้งานได้ทั้ง iOS, Android, Windows, macOS ผ่านแอพ V2Box / v2rayNG",
    gradient: "from-cyan-400 to-blue-500",
    iconBg: "bg-cyan-500/10",
    delay: 0.32 
  },
  { 
    icon: HeartPulse, 
    title: "ซัพพอร์ต 24/7", 
    desc: "ทีมงานคอยช่วยเหลือตลอด 24 ชม. แก้ปัญหาให้ภายใน 5 นาที",
    gradient: "from-rose-400 to-red-500",
    iconBg: "bg-rose-500/10",
    delay: 0.40 
  },
]

const useCases = [
  { 
    icon: Gamepad2, 
    title: "เล่นเกมลื่นไหล", 
    desc: "ปิงต่ำ เล่น ROV, PUBG, ML ได้ลื่นไม่มีสะดุด",
    color: "text-green-400",
    gradient: "from-green-500/10 to-green-500/5",
    border: "border-green-500/10",
  },
  { 
    icon: Youtube, 
    title: "สตรีม 4K ไม่กระตุก", 
    desc: "YouTube, Netflix, Disney+ ดูชัดระดับ 4K HDR",
    color: "text-red-400",
    gradient: "from-red-500/10 to-red-500/5",
    border: "border-red-500/10",
  },
  { 
    icon: Download, 
    title: "โหลดไฟล์เต็มสปีด", 
    desc: "ดาวน์โหลดไฟล์ใหญ่ๆ ไม่จำกัดความเร็ว",
    color: "text-blue-400",
    gradient: "from-blue-500/10 to-blue-500/5",
    border: "border-blue-500/10",
  },
  { 
    icon: Eye, 
    title: "ท่องเว็บปลอดภัย", 
    desc: "ปกป้องข้อมูลส่วนตัวจากแฮกเกอร์",
    color: "text-purple-400",
    gradient: "from-purple-500/10 to-purple-500/5",
    border: "border-purple-500/10",
  },
]

export default function FeaturesSection() {
  return (
    <section className="relative py-24 md:py-32 bg-black overflow-hidden">
      {/* Subtle gradient bg */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(120,119,198,0.06)_0%,transparent_50%)]" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <FadeIn>
          <div className="text-center mb-16 md:mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] text-zinc-400 text-sm font-medium mb-6">
              <ShieldCheck size={16} className="text-cyan-400" />
              ฟีเจอร์ระดับพรีเมียม
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-5 leading-tight">
              ทำไมต้องเลือก{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                VPN ของเรา?
              </span>
            </h2>
            <p className="text-zinc-500 text-base md:text-lg max-w-2xl mx-auto">
              เทคโนโลยี VPN ระดับโลก พร้อมฟีเจอร์ครบครันที่ตอบโจทย์ทุกการใช้งาน
            </p>
          </div>
        </FadeIn>

        {/* Main Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-20 md:mb-24">
          {features.map((item, idx) => (
            <FadeIn key={idx} delay={item.delay} direction="up">
              <motion.div 
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="group relative h-full p-6 md:p-7 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-all overflow-hidden"
              >
                {/* Corner glow on hover */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                
                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} p-[1.5px] mb-5`}>
                    <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center group-hover:bg-zinc-950 transition-colors">
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{item.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            </FadeIn>
          ))}
        </div>

        {/* Use Cases */}
        <FadeIn>
          <div className="text-center mb-10">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
              เหมาะสำหรับทุกการใช้งาน
            </h3>
            <p className="text-zinc-500">ไม่ว่าจะเล่นเกม ดูหนัง หรือทำงาน VPN ของเราตอบโจทย์ทุกอย่าง</p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {useCases.map((item, idx) => (
            <FadeIn key={idx} delay={idx * 0.08} direction="up">
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 400 }}
                className={`group p-5 rounded-2xl bg-gradient-to-br ${item.gradient} border ${item.border} hover:border-white/[0.08] transition-all`}
              >
                <item.icon className={`w-8 h-8 ${item.color} mb-3 group-hover:scale-110 transition-transform`} />
                <h4 className="font-bold text-white mb-1">{item.title}</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            </FadeIn>
          ))}
        </div>

        {/* Tech Stack Banner */}
        <FadeIn delay={0.3}>
          <div className="mt-16 p-6 md:p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {[
                { icon: Cpu, label: "VLESS Protocol", desc: "โปรโตคอลใหม่ล่าสุด", color: "text-cyan-400" },
                { icon: Signal, label: "XTLS Reality", desc: "เทคโนโลยีป้องกันบล็อก", color: "text-violet-400" },
                { icon: Server, label: "Bare Metal", desc: "เซิร์ฟเวอร์เฉพาะ", color: "text-blue-400" },
                { icon: Timer, label: "Auto Failover", desc: "สลับเซิร์ฟเวอร์อัตโนมัติ", color: "text-emerald-400" },
              ].map((tech, idx) => (
                <div key={idx} className="flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.05] flex items-center justify-center group-hover:bg-white/[0.06] transition-colors flex-shrink-0">
                    <tech.icon className={`w-5 h-5 ${tech.color}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{tech.label}</div>
                    <div className="text-[10px] text-zinc-600">{tech.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
