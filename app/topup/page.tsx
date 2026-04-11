'use client'

import Link from 'next/link'
import { 
  ArrowLeft, Gift, ScanLine, ChevronRight, AlertCircle, 
  Coins, Zap, Shield, Clock, CheckCircle2, Wallet
} from 'lucide-react'

export default function TopupSelectPage() {
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
              <h1 className="text-sm font-semibold text-white">เติมเงิน</h1>
              <p className="text-[10px] text-zinc-500">เลือกวิธีที่สะดวก</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-5 pb-12">

        {/* Hero */}
        <div className="relative overflow-hidden bg-zinc-900/50 border border-white/5 rounded-2xl p-5 sm:p-7 mb-5">
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-yellow-500/8 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative flex items-center gap-4 sm:gap-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/25 shrink-0">
              <Wallet className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-white">เติมเงินเข้าบัญชี</h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">เลือกวิธีการเติมเงินที่สะดวกสำหรับคุณ</p>
            </div>
          </div>

          {/* Quick info pills */}
          <div className="relative flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <Zap className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] font-medium text-emerald-400">อัตโนมัติ</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <Clock className="w-3 h-3 text-blue-400" />
              <span className="text-[10px] font-medium text-blue-400">เข้าทันที</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <Shield className="w-3 h-3 text-purple-400" />
              <span className="text-[10px] font-medium text-purple-400">ปลอดภัย 100%</span>
            </div>
          </div>
        </div>

        {/* Two-column on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Left: Options */}
          <div className="lg:col-span-3 space-y-3">

            {/* Important Notice */}
            <div className="p-3.5 bg-amber-500/8 border border-amber-500/15 rounded-2xl">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-xs font-bold text-white">เติมเงินขั้นต่ำ <span className="text-amber-400">60 บาท</span></span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    ยอดเงินจะเข้าระบบทันทีหลังตรวจสอบสำเร็จ ไม่สามารถคืนเงินได้หากโอนผิดหรือยืนยันผิด
                  </p>
                </div>
              </div>
            </div>

            {/* Wallet Option */}
            <Link href="/topup/wallet" className="block group">
              <div className="relative overflow-hidden bg-zinc-900/50 border border-white/5 hover:border-red-500/30 rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/5 active:scale-[0.98] card-hover-glow">
                <div className="absolute -top-16 -right-16 w-32 h-32 bg-red-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                
                <div className="relative flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20 group-hover:scale-105 transition-transform duration-300 shrink-0">
                    <Gift className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-red-400 transition-colors">
                      ซองของขวัญ
                    </h3>
                    <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">TrueMoney Wallet</p>
                    <p className="text-[10px] text-zinc-600 mt-0.5">เติมเงินอัตโนมัติผ่านซองเล็ท</p>
                  </div>
                  
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/5 border border-white/5 rounded-xl flex items-center justify-center group-hover:bg-red-500/15 group-hover:border-red-500/20 group-hover:text-red-400 transition-all shrink-0">
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Slip Option */}
            <Link href="/topup/slip" className="block group">
              <div className="relative overflow-hidden bg-zinc-900/50 border border-white/5 hover:border-blue-500/30 rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5 active:scale-[0.98] card-hover-glow">
                <div className="absolute -top-16 -right-16 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                
                <div className="relative flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300 shrink-0">
                    <ScanLine className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                      สลิปธนาคาร
                    </h3>
                    <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">PromptPay / โอนเงิน</p>
                    <p className="text-[10px] text-zinc-600 mt-0.5">ตรวจสอบสลิปอัตโนมัติผ่าน AI</p>
                  </div>
                  
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/5 border border-white/5 rounded-xl flex items-center justify-center group-hover:bg-blue-500/15 group-hover:border-blue-500/20 group-hover:text-blue-400 transition-all shrink-0">
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Right: Info sidebar */}
          <div className="lg:col-span-2">
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5">
              <h4 className="text-xs font-semibold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-4 rounded-full bg-gradient-to-b from-emerald-400 to-cyan-400" />
                ข้อมูลเพิ่มเติม
              </h4>
              <div className="space-y-2.5">
                {[
                  { text: 'เติมเงินอัตโนมัติ ไม่ต้องรอแอดมิน', icon: Zap, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
                  { text: 'ยอดเงินเข้าทันทีหลังตรวจสอบสำเร็จ', icon: Clock, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
                  { text: 'ระบบตรวจสอบความปลอดภัย 100%', icon: Shield, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-2.5 bg-black/30 border border-white/5 rounded-xl">
                    <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${item.color}`}>
                      <item.icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] text-zinc-300">{item.text}</span>
                  </div>
                ))}
              </div>

              {/* Comparison */}
              <div className="mt-4 pt-4 border-t border-white/5">
                <h4 className="text-[10px] font-semibold text-zinc-500 uppercase mb-3">เปรียบเทียบ</h4>
                <div className="space-y-2">
                  <div className="p-2.5 bg-red-500/5 border border-red-500/10 rounded-xl">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Gift className="w-3.5 h-3.5 text-red-400" />
                      <span className="text-[11px] font-bold text-white">ซองของขวัญ</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[9px] px-1.5 py-0.5 bg-red-500/10 border border-red-500/15 rounded text-red-400">TrueMoney</span>
                      <span className="text-[9px] px-1.5 py-0.5 bg-zinc-800 border border-white/5 rounded text-zinc-400">ใส่ลิงก์</span>
                      <span className="text-[9px] px-1.5 py-0.5 bg-zinc-800 border border-white/5 rounded text-zinc-400">เร็วมาก</span>
                    </div>
                  </div>
                  <div className="p-2.5 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                    <div className="flex items-center gap-2 mb-1.5">
                      <ScanLine className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-[11px] font-bold text-white">สลิปธนาคาร</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[9px] px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/15 rounded text-blue-400">PromptPay</span>
                      <span className="text-[9px] px-1.5 py-0.5 bg-zinc-800 border border-white/5 rounded text-zinc-400">อัพโหลดรูป</span>
                      <span className="text-[9px] px-1.5 py-0.5 bg-zinc-800 border border-white/5 rounded text-zinc-400">AI ตรวจ</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
