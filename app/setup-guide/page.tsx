'use client'

import Link from 'next/link'
import { 
  ArrowLeft, Phone, Smartphone, Shield, Zap, CheckCircle2, 
  Copy, ExternalLink, AlertCircle, Signal, Wifi, Star,
  ChevronDown
} from 'lucide-react'
import { useState } from 'react'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-bold text-zinc-400 hover:text-white transition-all active:scale-95"
    >
      {copied ? (
        <>
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span className="text-emerald-400">คัดลอกแล้ว</span>
        </>
      ) : (
        <>
          <Copy className="w-3 h-3" />
          <span>คัดลอก</span>
        </>
      )}
    </button>
  )
}

function DialButton({ code, label }: { code: string; label: string }) {
  return (
    <a
      href={`tel:${encodeURIComponent(code)}`}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg text-[11px] font-bold text-emerald-400 transition-all active:scale-95"
    >
      <Phone className="w-3 h-3" />
      {label}
    </a>
  )
}

interface PromoCardProps {
  number: number
  title: string
  code: string
  price: string
  description?: string
  recommended?: boolean
  color: string
  borderColor: string
  bgColor: string
}

function PromoCard({ number, title, code, price, description, recommended, color, borderColor, bgColor }: PromoCardProps) {
  return (
    <div className={`relative p-4 border rounded-2xl transition-all ${recommended ? `${bgColor} ${borderColor}` : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}>
      {recommended && (
        <div className="absolute -top-2.5 right-3">
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 ${bgColor} ${borderColor} border rounded-full text-[9px] font-black ${color} uppercase tracking-wider`}>
            <Star className="w-2.5 h-2.5" />
            แนะนำ
          </span>
        </div>
      )}
      <div className="flex items-start gap-3">
        <div className={`w-7 h-7 ${bgColor} ${borderColor} border rounded-lg flex items-center justify-center flex-shrink-0`}>
          <span className={`text-xs font-black ${color}`}>{number}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-white">{title}</h4>
          <div className="flex items-center gap-2 mt-1.5">
            <code className="text-[11px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">{code}</code>
            <CopyButton text={code} />
          </div>
          <div className="flex items-center gap-3 mt-2">
            <span className={`text-xs font-bold ${color}`}>{price}</span>
            <DialButton code={code} label="กดโทร" />
          </div>
          {description && (
            <p className="text-[10px] text-zinc-500 mt-1.5 leading-relaxed">{description}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SetupGuidePage() {
  const [expandedSection, setExpandedSection] = useState<string | null>('ais')

  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section)
  }

  return (
    <div className="min-h-screen bg-transparent text-white font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-14">
            <Link 
              href="/" 
              className="p-2 -ml-2 hover:bg-white/5 rounded-xl transition-all active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-400" />
            </Link>
            <div className="ml-3">
              <h1 className="text-sm font-semibold text-white">โปรเสริมที่ต้องสมัคร</h1>
              <p className="text-[10px] text-zinc-500">สมัครก่อนใช้ VPN เพื่อความเสถียร</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-5 pb-12 space-y-5">

        {/* Hero */}
        <div className="relative overflow-hidden bg-zinc-900/50 border border-white/5 rounded-2xl p-5 sm:p-7">
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-cyan-500/8 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative flex items-center gap-4 sm:gap-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/25 shrink-0">
              <Smartphone className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-white">โปรเสริมที่ต้องสมัคร</h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">สมัครโปรเสริมก่อนใช้ VPN เพื่อความเสถียรสูงสุด</p>
            </div>
          </div>

          <div className="relative flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] font-medium text-emerald-400">กันเน็ตรั่ว</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <Zap className="w-3 h-3 text-blue-400" />
              <span className="text-[10px] font-medium text-blue-400">เสถียรขึ้น</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <Signal className="w-3 h-3 text-purple-400" />
              <span className="text-[10px] font-medium text-purple-400">เร็วขึ้น</span>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/15 rounded-2xl">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-amber-400">สำคัญ!</p>
            <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
              ควรเติมเงินไว้ในซิมให้พอสำหรับการต่ออายุอัตโนมัติในเดือนถัดไป เพื่อไม่ให้โปรหลุดกลางทาง
            </p>
          </div>
        </div>

        {/* === AIS Section === */}
        <div className="border border-white/5 rounded-2xl overflow-hidden">
          <button
            onClick={() => toggleSection('ais')}
            className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center">
                <span className="text-sm font-black text-emerald-400">AIS</span>
              </div>
              <div className="text-left">
                <h3 className="text-base font-bold text-white">AIS One-2-Call</h3>
                <p className="text-[10px] text-zinc-500 mt-0.5">ซิม AIS ต้องสมัครโปรกันรั่วก่อนใช้งาน</p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-zinc-500 transition-transform duration-200 ${expandedSection === 'ais' ? 'rotate-180' : ''}`} />
          </button>

          {expandedSection === 'ais' && (
            <div className="px-5 pb-5 space-y-4 border-t border-white/5 pt-4">
              {/* Recommendation banner */}
              <div className="p-3 bg-cyan-500/5 border border-cyan-500/15 rounded-xl">
                <p className="text-[11px] text-cyan-400 font-bold leading-relaxed">
                  เหมาะสำหรับ: สายเกม, สายไลฟ์สด, สายโหลด, สายดูหนัง, เล่นโซเซียลมีเดีย
                </p>
                <p className="text-[10px] text-zinc-500 mt-1">
                  งบน้อยสมัครแค่กันรั่วก็พอ แต่ถ้าอยากเสถียรแนะนำสมัคร AIS Play ด้วย
                </p>
              </div>

              {/* Step 1 */}
              <div>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">ขั้นตอนที่ 1 - เปลี่ยนแพ็คเกจหลัก</p>
                <PromoCard
                  number={1}
                  title="Easy Free Net กันรั่ว 64kbps"
                  code="*777*44#"
                  price="ครั้งแรกฟรี / ครั้งต่อไป 10 บาท"
                  description="ลูกค้าใหม่กด *777*44# / ลูกค้าเดิมใช้งานเกิน 30 วัน กด *777*1043#"
                  color="text-emerald-400"
                  borderColor="border-emerald-500/20"
                  bgColor="bg-emerald-500/5"
                />
              </div>

              {/* Step 2 */}
              <div>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">ขั้นตอนที่ 2 - เลือกโปรกันรั่ว (เลือก 1 อย่าง)</p>
                <div className="space-y-3">
                  <PromoCard
                    number={2}
                    title="กันเน็ตรั่ว 64kbps"
                    code="*777*7067#"
                    price="32 บาท/เดือน (รวม VAT)"
                    color="text-emerald-400"
                    borderColor="border-emerald-500/20"
                    bgColor="bg-emerald-500/5"
                  />
                  <PromoCard
                    number={3}
                    title="กันรั่ว 128kbps"
                    code="*777*7068#"
                    price="36 บาท/เดือน (รวม VAT)"
                    color="text-blue-400"
                    borderColor="border-blue-500/20"
                    bgColor="bg-blue-500/5"
                  />
                  <PromoCard
                    number={4}
                    title="กันรั่ว 7 วัน"
                    code="*777*7311#"
                    price="20 บาท / 7 วัน"
                    description="เหมาะสำหรับทดลองใช้ระยะสั้น"
                    color="text-amber-400"
                    borderColor="border-amber-500/20"
                    bgColor="bg-amber-500/5"
                  />
                </div>
              </div>

              {/* Step 3 - AIS Play */}
              <div>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">ขั้นตอนที่ 3 - เสริมความเสถียร (แนะนำ)</p>
                <PromoCard
                  number={5}
                  title="AIS PLAY"
                  code="*777*885#"
                  price="64 บาท/เดือน (รวม VAT)"
                  description="แนะนำสมัครเพิ่มเพื่อความเสถียรสูงสุด เน็ตไม่หลุดง่าย"
                  recommended={true}
                  color="text-cyan-400"
                  borderColor="border-cyan-500/20"
                  bgColor="bg-cyan-500/5"
                />
              </div>

              {/* Extra dial codes */}
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                <p className="text-[10px] font-bold text-zinc-500 mb-2">รหัสสมัครเพิ่มเติม (ลูกค้าเดิม)</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <code className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">*777*1043#</code>
                  <span className="text-[10px] text-zinc-600">สำหรับลูกค้าเดิมใช้งานเกิน 30 วัน</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* === True Zoom Section === */}
        <div className="border border-white/5 rounded-2xl overflow-hidden">
          <button
            onClick={() => toggleSection('true')}
            className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center">
                <span className="text-sm font-black text-red-400">TRUE</span>
              </div>
              <div className="text-left">
                <h3 className="text-base font-bold text-white">True Zoom</h3>
                <p className="text-[10px] text-zinc-500 mt-0.5">ซิม True สมัครโปร Zoom เพื่อใช้งาน VPN</p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-zinc-500 transition-transform duration-200 ${expandedSection === 'true' ? 'rotate-180' : ''}`} />
          </button>

          {expandedSection === 'true' && (
            <div className="px-5 pb-5 space-y-4 border-t border-white/5 pt-4">
              <div className="p-3 bg-rose-500/5 border border-rose-500/15 rounded-xl">
                <p className="text-[11px] text-rose-400 font-bold leading-relaxed">
                  เหมาะสำหรับ: ดูหนัง, ฟังเพลง, ท่องโซเซียล (MaxSpeed 10Mbps)
                </p>
              </div>

              <PromoCard
                number={1}
                title="True Zoom"
                code="*900*8234#"
                price="81 บาท / 30 วัน (รวม VAT)"
                description="ความเร็วสูงสุด 10Mbps เหมาะสำหรับดูหนัง ฟังเพลง ท่องโซเซียล"
                recommended={true}
                color="text-red-400"
                borderColor="border-red-500/20"
                bgColor="bg-red-500/5"
              />
            </div>
          )}
        </div>

        {/* Quick Summary Card */}
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Wifi className="w-4 h-4 text-cyan-400" />
            สรุปค่าใช้จ่ายต่อเดือน
          </h3>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[9px] font-black text-emerald-400">AIS</span>
                <span className="text-xs text-zinc-400">กันรั่ว 64kbps อย่างเดียว</span>
              </div>
              <span className="text-xs font-bold text-white">32 บาท/ด.</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[9px] font-black text-emerald-400">AIS</span>
                <span className="text-xs text-zinc-400">กันรั่ว 64kbps + AIS Play</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-cyan-400">96 บาท/ด.</span>
                <span className="text-[9px] text-zinc-600 ml-1">แนะนำ</span>
              </div>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[9px] font-black text-emerald-400">AIS</span>
                <span className="text-xs text-zinc-400">กันรั่ว 128kbps + AIS Play</span>
              </div>
              <span className="text-xs font-bold text-white">100 บาท/ด.</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-[9px] font-black text-red-400">TRUE</span>
                <span className="text-xs text-zinc-400">True Zoom 10Mbps</span>
              </div>
              <span className="text-xs font-bold text-white">81 บาท/ด.</span>
            </div>
          </div>
        </div>

        {/* Back to home */}
        <Link
          href="/"
          className="block w-full py-3.5 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-center text-sm font-bold text-white transition-all shadow-lg shadow-cyan-600/20 active:scale-[0.98]"
        >
          เลือกเซิร์ฟเวอร์ VPN
        </Link>
      </main>
    </div>
  )
}
