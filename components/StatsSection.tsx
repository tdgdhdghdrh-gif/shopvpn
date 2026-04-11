'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Users, Server, Globe, Clock } from 'lucide-react'
import FadeIn from './FadeIn'

function useCountUp(target: number, duration: number = 2000, startOnView: boolean = true) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(!startOnView)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!startOnView) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [startOnView])

  useEffect(() => {
    if (!started) return
    let start = 0
    const end = target
    const stepTime = Math.max(Math.floor(duration / end), 5)
    const increment = Math.ceil(end / (duration / stepTime))
    
    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(start)
      }
    }, stepTime)
    
    return () => clearInterval(timer)
  }, [started, target, duration])

  return { count, ref }
}

const stats = [
  { 
    icon: Users, 
    value: 1000, 
    suffix: "+", 
    label: "ผู้ใช้งานทั่วประเทศ",
    gradient: "from-cyan-500 to-blue-500",
    glow: "shadow-cyan-500/20",
  },
  { 
    icon: Server, 
    value: 20, 
    suffix: "+", 
    label: "เซิร์ฟเวอร์ทั่วโลก",
    gradient: "from-violet-500 to-purple-500",
    glow: "shadow-violet-500/20",
  },
  { 
    icon: Globe, 
    value: 12, 
    suffix: "+", 
    label: "ประเทศที่ให้บริการ",
    gradient: "from-blue-500 to-indigo-500",
    glow: "shadow-blue-500/20",
  },
  { 
    icon: Clock, 
    value: 99, 
    suffix: ".9%", 
    label: "Uptime ตลอดทั้งปี",
    gradient: "from-emerald-500 to-teal-500",
    glow: "shadow-emerald-500/20",
  },
]

export default function StatsSection() {
  return (
    <section className="relative py-20 bg-black overflow-hidden">
      {/* Top & bottom lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      
      {/* Subtle bg */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(120,119,198,0.04)_0%,transparent_60%)]" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, idx) => {
            const { count, ref } = useCountUp(stat.value)
            
            return (
              <FadeIn key={idx} delay={idx * 0.1} direction="up">
                <motion.div
                  ref={ref}
                  whileHover={{ y: -6, scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className={`group relative p-6 md:p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] text-center transition-all backdrop-blur-sm overflow-hidden hover:shadow-lg ${stat.glow}`}
                >
                  {/* Hover glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative z-10">
                    <div className={`w-12 h-12 md:w-14 md:h-14 mx-auto rounded-2xl bg-gradient-to-br ${stat.gradient} p-[1.5px] mb-4`}>
                      <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center group-hover:bg-zinc-950 transition-colors">
                        <stat.icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                      </div>
                    </div>
                    <div className="text-3xl md:text-4xl font-black text-white mb-1 tabular-nums">
                      {count.toLocaleString()}{stat.suffix}
                    </div>
                    <div className="text-xs md:text-sm text-zinc-500">{stat.label}</div>
                  </div>
                </motion.div>
              </FadeIn>
            )
          })}
        </div>
      </div>
    </section>
  )
}
