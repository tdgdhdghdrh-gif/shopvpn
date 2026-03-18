'use client'

import Link from 'next/link'
import { ArrowLeft, Gift, ScanLine, Sparkles, ChevronRight } from 'lucide-react'

export default function TopupSelectPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/60 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-md mx-auto px-4 sm:px-6">
          <div className="flex items-center h-14 sm:h-16">
            <Link 
              href="/" 
              className="p-2 -ml-2 hover:bg-white/10 rounded-xl transition-all active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="ml-3 text-base sm:text-lg font-semibold">เติมเงิน</h1>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Title Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/5 rounded-full text-xs sm:text-sm text-gray-400 mb-4 sm:mb-5">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" />
            เลือกวิธีเติมเงิน
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">เติมเงินเข้าบัญชี</h2>
          <p className="text-gray-500 text-sm sm:text-base">เลือกวิธีการเติมเงินที่สะดวกสำหรับคุณ</p>
        </div>

        {/* Options Grid */}
        <div className="space-y-4 sm:space-y-6">
          {/* Wallet Option */}
          <Link href="/topup/wallet" className="block">
            <div className="group relative overflow-hidden bg-gradient-to-br from-red-500/10 via-orange-500/5 to-transparent border border-red-500/20 hover:border-red-500/40 rounded-2xl sm:rounded-3xl p-6 sm:p-8 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/10 active:scale-[0.98]">
              <div className="absolute -top-20 -right-20 w-32 h-32 sm:w-40 sm:h-40 bg-red-500/20 rounded-full blur-3xl group-hover:bg-red-500/30 transition-all" />
              
              <div className="relative flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 sm:w-[72px] sm:h-[72px] bg-gradient-to-br from-red-500 to-orange-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/25 group-hover:scale-110 group-hover:shadow-red-500/40 transition-all duration-300">
                    <Gift className="w-7 h-7 sm:w-9 sm:h-9 text-white" />
                  </div>
                </div>
                
                <div className="ml-4 sm:ml-6 flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2 group-hover:text-red-400 transition-colors">
                    ซองของขวัญ
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 mb-0.5 sm:mb-1">
                    TrueMoney Wallet
                  </p>
                  <p className="text-xs text-gray-600">
                    เติมเงินอัตโนมัติผ่านซองเล็ท
                  </p>
                </div>
                
                <div className="flex-shrink-0 ml-3 sm:ml-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:bg-red-500/20 group-hover:text-red-400 transition-all">
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Slip Option */}
          <Link href="/topup/slip" className="block">
            <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-transparent border border-blue-500/20 hover:border-blue-500/40 rounded-2xl sm:rounded-3xl p-6 sm:p-8 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 active:scale-[0.98]">
              <div className="absolute -top-20 -right-20 w-32 h-32 sm:w-40 sm:h-40 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/30 transition-all" />
              
              <div className="relative flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 sm:w-[72px] sm:h-[72px] bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-110 group-hover:shadow-blue-500/40 transition-all duration-300">
                    <ScanLine className="w-7 h-7 sm:w-9 sm:h-9 text-white" />
                  </div>
                </div>
                
                <div className="ml-4 sm:ml-6 flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2 group-hover:text-blue-400 transition-colors">
                    สลิปธนาคาร
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 mb-0.5 sm:mb-1">
                    PromptPay / โอนเงิน
                  </p>
                  <p className="text-xs text-gray-600">
                    ตรวจสอบสลิปอัตโนมัติ
                  </p>
                </div>
                
                <div className="flex-shrink-0 ml-3 sm:ml-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-all">
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Info */}
        <div className="mt-10 sm:mt-14 p-4 sm:p-6 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl">
          <h4 className="font-medium text-white mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            ข้อมูลเพิ่มเติม
          </h4>
          <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-400">
            <li className="flex items-start gap-2 sm:gap-3">
              <span className="text-green-400 mt-0.5 text-base sm:text-lg leading-none">✓</span>
              <span>เติมเงินอัตโนมัติ ไม่ต้องรอแอดมิน</span>
            </li>
            <li className="flex items-start gap-2 sm:gap-3">
              <span className="text-green-400 mt-0.5 text-base sm:text-lg leading-none">✓</span>
              <span>ยอดเงินเข้าทันทีหลังตรวจสอบสำเร็จ</span>
            </li>
            <li className="flex items-start gap-2 sm:gap-3">
              <span className="text-green-400 mt-0.5 text-base sm:text-lg leading-none">✓</span>
              <span>ระบบตรวจสอบความปลอดภัย 100%</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  )
}
