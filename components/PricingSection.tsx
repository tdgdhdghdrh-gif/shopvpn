'use client'

import { motion } from 'framer-motion'
import { Check, Zap, Crown, Rocket, Star, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import FadeIn from './FadeIn'

const plans = [
  {
    name: "Starter",
    price: "50",
    period: "/เดือน",
    desc: "เริ่มต้นใช้งาน VPN ได้ทันที",
    gradient: "from-zinc-400 to-zinc-500",
    checkGradient: "from-zinc-400 to-zinc-500",
    icon: Zap,
    iconColor: "text-zinc-300",
    features: [
      "ใช้งานได้ 1 อุปกรณ์",
      "เซิร์ฟเวอร์ไทย",
      "ความเร็วสูงสุด 100Mbps",
      "ซัพพอร์ตผ่านแชท",
    ],
    popular: false,
  },
  {
    name: "Pro",
    price: "100",
    period: "/เดือน",
    desc: "สำหรับผู้ใช้งานจริงจัง",
    gradient: "from-cyan-400 to-blue-500",
    checkGradient: "from-cyan-400 to-blue-500",
    icon: Crown,
    iconColor: "text-cyan-400",
    features: [
      "ใช้งานได้ 3 อุปกรณ์",
      "เซิร์ฟเวอร์ทุกโลเคชั่น",
      "ความเร็วสูงสุด 1Gbps",
      "ซัพพอร์ต 24/7 ตลอด",
      "เล่นเกมปิงต่ำพิเศษ",
    ],
    popular: true,
  },
  {
    name: "Ultimate",
    price: "200",
    period: "/เดือน",
    desc: "ทุกอย่างไม่จำกัด",
    gradient: "from-violet-400 to-pink-500",
    checkGradient: "from-violet-400 to-pink-500",
    icon: Rocket,
    iconColor: "text-violet-400",
    features: [
      "ใช้งานได้ไม่จำกัดอุปกรณ์",
      "เซิร์ฟเวอร์ทุกโลเคชั่น",
      "ความเร็วสูงสุด 10Gbps",
      "ซัพพอร์ต VIP ส่วนตัว",
      "เล่นเกมปิงต่ำพิเศษ",
      "เซิร์ฟเวอร์ Private เฉพาะคุณ",
    ],
    popular: false,
  },
]

export default function PricingSection() {
  return (
    <section className="relative py-24 md:py-32 bg-black overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(120,119,198,0.04)_0%,transparent_50%)]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <FadeIn>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] text-zinc-400 text-sm font-medium mb-6">
              <Star size={16} className="text-violet-400" />
              แพ็กเกจและราคา
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-5 leading-tight">
              เลือกแพ็กเกจที่{' '}
              <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
                ใช่สำหรับคุณ
              </span>
            </h2>
            <p className="text-zinc-500 text-base md:text-lg max-w-2xl mx-auto">
              ทุกแพ็กเกจรวมการเข้ารหัสระดับทหาร ไม่จำกัดแบนด์วิธ พร้อมรับประกันความพอใจ
            </p>
          </div>
        </FadeIn>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {plans.map((plan, idx) => (
            <FadeIn key={idx} delay={idx * 0.15} direction="up">
              <motion.div
                whileHover={{ y: -10, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                className={`relative flex flex-col h-full rounded-2xl overflow-hidden transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-b from-cyan-500/[0.08] via-black to-black'
                    : ''
                }`}
              >
                {/* Gradient border wrapper */}
                <div className={`relative flex flex-col h-full p-6 md:p-7 rounded-2xl border transition-all ${
                  plan.popular
                    ? 'border-cyan-500/20 hover:border-cyan-500/40 shadow-2xl shadow-cyan-500/[0.05]'
                    : 'border-white/[0.05] hover:border-white/[0.1] bg-white/[0.02]'
                }`}>
                  {/* Popular badge */}
                  {plan.popular && (
                    <div className="absolute -top-px left-1/2 -translate-x-1/2">
                      <div className="px-4 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold rounded-b-lg flex items-center gap-1.5">
                        <Sparkles size={12} />
                        ยอดนิยม
                      </div>
                    </div>
                  )}

                  {/* Corner glow on hover */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                  
                  {/* Plan header */}
                  <div className="mb-6 pt-2">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.gradient} p-[1.5px] mb-4`}>
                      <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
                        <plan.icon className={`w-6 h-6 ${plan.iconColor}`} />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    <p className="text-xs text-zinc-500 mt-1">{plan.desc}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-white">{plan.price}</span>
                      <span className="text-lg text-zinc-500">฿</span>
                      <span className="text-sm text-zinc-600">{plan.period}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex-1 space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${plan.checkGradient} flex items-center justify-center flex-shrink-0`}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm text-zinc-400">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <Link
                    href="/register"
                    className={`group w-full py-3.5 rounded-xl font-bold text-center text-sm transition-all flex items-center justify-center gap-2 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/25'
                        : 'bg-white/[0.03] text-white hover:bg-white/[0.06] border border-white/[0.06]'
                    }`}
                  >
                    เริ่มต้นใช้งาน
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            </FadeIn>
          ))}
        </div>

        {/* Bottom note */}
        <FadeIn delay={0.5}>
          <div className="text-center mt-12 text-zinc-600 text-sm">
            <p>ทุกแพ็กเกจรองรับการชำระเงินผ่าน TrueMoney Wallet, PromptPay</p>
            <p className="mt-1">ไม่พอใจยินดีคืนเงินภายใน 24 ชม.</p>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
