'use client'

import { motion } from 'framer-motion'
import { Users, CreditCard, Rocket, Zap, ArrowRight } from 'lucide-react'
import FadeIn from './FadeIn'

const steps = [
  { 
    step: "01", 
    icon: Users, 
    title: "สมัครสมาชิก", 
    desc: "สมัครฟรี ไม่ต้องใช้บัตรเครดิต ใช้เวลาไม่ถึง 1 นาที",
    gradient: "from-cyan-400 to-blue-500",
  },
  { 
    step: "02", 
    icon: CreditCard, 
    title: "เลือกแพ็กเกจ", 
    desc: "เริ่มต้นเพียง 50 บาท/เดือน ชำระผ่าน TrueMoney หรือ PromptPay",
    gradient: "from-violet-400 to-pink-500",
  },
  { 
    step: "03", 
    icon: Rocket, 
    title: "เชื่อมต่อเลย!", 
    desc: "ดาวน์โหลดแอพ เชื่อมต่อเซิร์ฟเวอร์ แล้วเพลิดเพลินกับอินเทอร์เน็ตที่เร็วและปลอดภัย",
    gradient: "from-emerald-400 to-teal-500",
  },
]

export default function HowItWorksSection() {
  return (
    <section className="relative py-24 md:py-32 bg-black overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(120,119,198,0.03)_0%,transparent_50%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <FadeIn>
          <div className="text-center mb-16 md:mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] text-zinc-400 text-sm font-medium mb-6">
              <Zap size={16} className="text-emerald-400" />
              เริ่มต้นง่ายๆ
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-5 leading-tight">
              เริ่มใช้งานใน{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                3 ขั้นตอน
              </span>
            </h2>
            <p className="text-zinc-500 text-base md:text-lg max-w-2xl mx-auto">
              ง่าย ไว ไม่ยุ่งยาก ใช้เวลาไม่ถึง 5 นาที
            </p>
          </div>
        </FadeIn>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, idx) => (
            <FadeIn key={idx} delay={idx * 0.2} direction="up">
              <div className="relative">
                {/* Connection line */}
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-full">
                    <motion.div 
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + idx * 0.3, duration: 0.8 }}
                      className="h-[1px] bg-gradient-to-r from-white/[0.1] to-transparent origin-left"
                    />
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 1 + idx * 0.3 }}
                      className="absolute right-0 top-1/2 -translate-y-1/2"
                    >
                      <ArrowRight size={14} className="text-zinc-600" />
                    </motion.div>
                  </div>
                )}

                <motion.div
                  whileHover={{ y: -10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="group text-center relative z-10"
                >
                  {/* Step number & Icon */}
                  <div className="relative inline-block mb-6">
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${step.gradient} p-[1.5px] mx-auto`}
                    >
                      <div className="w-full h-full bg-black rounded-[22px] flex items-center justify-center group-hover:bg-zinc-950 transition-colors">
                        <step.icon className="w-10 h-10 text-white" />
                      </div>
                    </motion.div>
                    
                    {/* Step badge */}
                    <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg`}>
                      <span className="text-xs font-black text-white">{step.step}</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{step.title}</h3>
                  <p className="text-sm text-zinc-500 max-w-xs mx-auto leading-relaxed">{step.desc}</p>
                </motion.div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
