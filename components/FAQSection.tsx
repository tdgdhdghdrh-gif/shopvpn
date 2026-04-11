'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, HelpCircle } from 'lucide-react'
import FadeIn from './FadeIn'

const faqs = [
  {
    q: "VPN คืออะไร?",
    a: "VPN คือบริการ VPN (Virtual Private Network) ที่ช่วยเข้ารหัสการเชื่อมต่อของคุณ ทำให้ท่องเว็บได้ปลอดภัย เล่นเกมได้ลื่นไหล และเข้าถึงเนื้อหาที่ถูกบล็อกได้จากทั่วโลก ใช้โปรโตคอล VLESS + XTLS Reality ที่เร็วและปลอดภัยที่สุดในปัจจุบัน"
  },
  {
    q: "ใช้งานยังไง ยากไหม?",
    a: "ง่ายมากครับ! แค่ 3 ขั้นตอน: 1) สมัครสมาชิก 2) เติมเงินและซื้อแพ็กเกจ 3) ดาวน์โหลดแอพ V2Box (iOS) หรือ v2rayNG (Android) แล้วกดเชื่อมต่อเลย มีคู่มือให้พร้อม ถ้าไม่เข้าใจ แอดมินช่วยตั้งค่าให้ได้เลย"
  },
  {
    q: "รองรับค่ายไหนบ้าง?",
    a: "รองรับ AIS 5G/4G, TRUE 5G/4G และ DTAC ครับ ทุกเซิร์ฟเวอร์จะแสดงว่ารองรับค่ายไหนบ้าง เลือกใช้ได้ตามค่ายที่คุณใช้"
  },
  {
    q: "ปลอดภัยไหม? เก็บข้อมูลไหม?",
    a: "ปลอดภัย 100% ครับ เราใช้การเข้ารหัส AES-256-GCM ระดับเดียวกับธนาคาร และมีนโยบาย Zero-Log ไม่เก็บข้อมูลการใช้งาน ไม่เก็บ IP Address ไม่เก็บประวัติการเข้าเว็บ"
  },
  {
    q: "เล่นเกมได้ลื่นจริงไหม?",
    a: "ลื่นจริงครับ! เซิร์ฟเวอร์ไทยปิงต่ำกว่า 5ms เหมาะสำหรับเล่น ROV, PUBG, Mobile Legends และเกมออนไลน์ทุกเกม ไม่มีอาการแลค ดีเลย์ หรือกระตุก"
  },
  {
    q: "ชำระเงินยังไง?",
    a: "รองรับการชำระเงินผ่าน TrueMoney Wallet และ PromptPay ครับ เติมเงินเข้าระบบแล้วเลือกซื้อแพ็กเกจได้เลย ระบบเป็นอัตโนมัติทั้งหมด"
  },
  {
    q: "ใช้ได้กี่อุปกรณ์?",
    a: "ขึ้นอยู่กับแพ็กเกจที่เลือกครับ Starter ใช้ได้ 1 อุปกรณ์, Pro ใช้ได้ 3 อุปกรณ์, Ultimate ใช้ได้ไม่จำกัดอุปกรณ์ รองรับทั้ง iOS, Android, Windows และ macOS"
  },
  {
    q: "มีทดลองใช้ฟรีไหม?",
    a: "มีครับ! เรามี VLESS ฟรีให้ทดลองใช้ สามารถทดสอบความเร็วและความเสถียรได้ก่อนตัดสินใจซื้อ กดที่ปุ่ม 'ทดลองใช้ฟรี' ได้เลยครับ"
  },
]

function FAQItem({ item, index }: { item: typeof faqs[0], index: number }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left p-5 rounded-2xl border transition-all ${
          isOpen 
            ? 'bg-white/[0.03] border-white/[0.1]' 
            : 'bg-white/[0.01] border-white/[0.05] hover:border-white/[0.08]'
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <h3 className={`font-bold text-sm md:text-base transition-colors ${isOpen ? 'text-cyan-400' : 'text-white'}`}>
            {item.q}
          </h3>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="flex-shrink-0"
          >
            <ChevronDown size={20} className={`transition-colors ${isOpen ? 'text-cyan-400' : 'text-zinc-600'}`} />
          </motion.div>
        </div>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <p className="text-sm text-zinc-400 leading-relaxed mt-3 pt-3 border-t border-white/[0.05]">
                {item.a}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </motion.div>
  )
}

export default function FAQSection() {
  return (
    <section className="relative py-24 md:py-32 bg-black overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(120,119,198,0.03)_0%,transparent_50%)]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <FadeIn>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] text-zinc-400 text-sm font-medium mb-6">
              <HelpCircle size={16} className="text-cyan-400" />
              คำถามที่พบบ่อย
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-5 leading-tight">
              มีคำถาม?{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                เรามีคำตอบ
              </span>
            </h2>
            <p className="text-zinc-500">หาคำตอบที่คุณต้องการได้ที่นี่</p>
          </div>
        </FadeIn>

        {/* FAQ Items */}
        <div className="space-y-3">
          {faqs.map((item, idx) => (
            <FAQItem key={idx} item={item} index={idx} />
          ))}
        </div>
      </div>
    </section>
  )
}
