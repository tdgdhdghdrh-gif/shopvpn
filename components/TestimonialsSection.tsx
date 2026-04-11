'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight, Quote, MessageSquare } from 'lucide-react'
import FadeIn from './FadeIn'

const testimonials = [
  {
    name: "ธนกฤต",
    role: "เกมเมอร์",
    avatar: "T",
    rating: 5,
    text: "ปิงต่ำมากครับ เล่น ROV ได้ 15ms เล่น PUBG ก็ลื่นมาก แนะนำเลยครับ สำหรับสายเกม ใช้มาปีกว่าแล้วไม่เคยผิดหวัง",
    gradient: "from-green-400 to-emerald-500",
  },
  {
    name: "พิชชา",
    role: "YouTuber",
    avatar: "P",
    rating: 5,
    text: "ดู YouTube 4K ลื่นมากค่ะ ไม่กระตุกเลย Netflix ก็ดูได้ชัดแจ๋ว คุ้มค่ามากค่ะ ราคาถูกกว่าเจ้าอื่นเยอะเลย",
    gradient: "from-red-400 to-pink-500",
  },
  {
    name: "สมชาย",
    role: "โปรแกรมเมอร์",
    avatar: "S",
    rating: 5,
    text: "ใช้ทำงานรีโมทจากต่างประเทศ เสถียรมากครับ Connection ไม่เคยหลุด ใช้มา 6 เดือนแล้ว ดีมากจริงๆ",
    gradient: "from-blue-400 to-indigo-500",
  },
  {
    name: "นิรันดร์",
    role: "นักศึกษา",
    avatar: "N",
    rating: 5,
    text: "ราคาประหยัดมากครับ 50 บาทเดือนก็ใช้ได้แล้ว สำหรับนักศึกษาแบบผม ถือว่าคุ้มสุดๆ ซัพพอร์ตก็ดี ตอบไว",
    gradient: "from-violet-400 to-purple-500",
  },
  {
    name: "กัลยา",
    role: "ฟรีแลนซ์",
    avatar: "K",
    rating: 5,
    text: "ใช้เข้าเว็บต่างประเทศได้ทุกเว็บเลยค่ะ ไม่มีบล็อก VPN ก็ใช้ง่ายมาก แค่กดเชื่อมต่อก็เสร็จ ไม่ยุ่งยาก",
    gradient: "from-amber-400 to-orange-500",
  },
]

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const startAutoplay = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setDirection(1)
      setCurrent(prev => (prev + 1) % testimonials.length)
    }, 5000)
  }

  useEffect(() => {
    startAutoplay()
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const goTo = (idx: number) => {
    setDirection(idx > current ? 1 : -1)
    setCurrent(idx)
    startAutoplay()
  }

  const next = () => {
    setDirection(1)
    setCurrent(prev => (prev + 1) % testimonials.length)
    startAutoplay()
  }

  const prev = () => {
    setDirection(-1)
    setCurrent(prev => (prev - 1 + testimonials.length) % testimonials.length)
    startAutoplay()
  }

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0, scale: 0.95 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0, scale: 0.95 }),
  }

  return (
    <section className="relative py-24 md:py-32 bg-black overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(120,119,198,0.04)_0%,transparent_50%)]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <FadeIn>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] text-zinc-400 text-sm font-medium mb-6">
              <MessageSquare size={16} className="text-pink-400" />
              รีวิวจากผู้ใช้จริง
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-5 leading-tight">
              ผู้ใช้จริงพูดถึง{' '}
              <span className="bg-gradient-to-r from-pink-400 via-rose-400 to-violet-400 bg-clip-text text-transparent">
                VPN ของเรา
              </span>
            </h2>
            <p className="text-zinc-500 text-base md:text-lg max-w-2xl mx-auto">
              กว่า 1,000+ คนไว้วางใจใช้งาน VPN ของเราในทุกๆ วัน
            </p>
          </div>
        </FadeIn>

        {/* Testimonial Carousel */}
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            {/* Navigation */}
            <button
              onClick={prev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-all hidden md:flex"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={next}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-all hidden md:flex"
            >
              <ChevronRight size={20} />
            </button>

            {/* Card */}
            <div className="overflow-hidden rounded-2xl">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={current}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 200, damping: 25 }}
                  className="p-8 md:p-10 bg-white/[0.02] border border-white/[0.05] rounded-2xl"
                >
                  {/* Quote icon */}
                  <Quote className="w-10 h-10 text-white/[0.06] mb-6" />
                  
                  {/* Text */}
                  <p className="text-lg md:text-xl text-zinc-300 leading-relaxed mb-8 italic">
                    &ldquo;{testimonials[current].text}&rdquo;
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${testimonials[current].gradient} flex items-center justify-center text-white font-bold text-lg`}>
                        {testimonials[current].avatar}
                      </div>
                      <div>
                        <div className="font-bold text-white">{testimonials[current].name}</div>
                        <div className="text-sm text-zinc-500">{testimonials[current].role}</div>
                      </div>
                    </div>
                    
                    {/* Stars */}
                    <div className="flex gap-1">
                      {Array.from({length: testimonials[current].rating}).map((_, i) => (
                        <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                className={`transition-all duration-300 rounded-full ${
                  idx === current 
                    ? 'w-8 h-2.5 bg-gradient-to-r from-cyan-400 to-violet-400' 
                    : 'w-2.5 h-2.5 bg-white/[0.08] hover:bg-white/[0.15]'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
