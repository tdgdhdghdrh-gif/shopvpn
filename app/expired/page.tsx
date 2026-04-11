'use client'

import { useEffect, useState } from 'react'
import { ShieldX, Clock, Mail, KeyRound, Loader2 } from 'lucide-react'

export default function ExpiredPage() {
  const [mounted, setMounted] = useState(false)
  const [resetting, setResetting] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleResetKey = async () => {
    setResetting(true)
    try {
      await fetch('/api/license/activate', { method: 'DELETE' })
      window.location.href = '/setup'
    } catch {
      // ถ้า API ล้มเหลว ก็ redirect ไปหน้า setup เลย
      window.location.href = '/setup'
    }
  }

  return (
    <div className="min-h-dvh bg-black flex items-center justify-center p-6">
      <div className={`max-w-md w-full text-center transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Icon */}
        <div className="relative mx-auto w-20 h-20 mb-6">
          <div className="absolute inset-0 bg-red-500/20 rounded-3xl blur-xl animate-pulse" />
          <div className="relative w-20 h-20 bg-gradient-to-br from-red-600 to-rose-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-red-500/30">
            <ShieldX className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
          เว็บไซต์หมดอายุ
        </h1>
        <p className="text-sm sm:text-base text-zinc-500 mb-8">
          License ของเว็บไซต์นี้หมดอายุแล้ว ไม่สามารถเข้าใช้งานได้
        </p>

        {/* Info Card */}
        <div className="bg-zinc-900/60 border border-white/[0.06] rounded-2xl p-5 sm:p-6 mb-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">หมดอายุการใช้งาน</div>
                <div className="text-xs text-zinc-500">กรุณาติดต่อผู้ดูแลเพื่อต่ออายุ</div>
              </div>
            </div>

            <div className="border-t border-white/5 pt-4">
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">ติดต่อผู้ให้บริการ</div>
                  <div className="text-xs text-zinc-500">แจ้งชื่อเว็บและ License Key ของคุณ</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-zinc-800/50 border border-white/10 rounded-xl text-sm font-bold text-zinc-400 hover:text-white hover:border-white/20 transition-all active:scale-95"
          >
            ลองใหม่อีกครั้ง
          </button>
          <button
            onClick={handleResetKey}
            disabled={resetting}
            className="px-6 py-3 bg-violet-600/20 border border-violet-500/30 rounded-xl text-sm font-bold text-violet-400 hover:bg-violet-600/30 hover:border-violet-500/40 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {resetting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                กำลังรีเซ็ต...
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                ใส่คีย์ใหม่
              </>
            )}
          </button>
        </div>

        <p className="mt-6 text-[11px] text-zinc-700">
          หากคุณเพิ่งต่ออายุแล้ว กรุณารอ 1 นาที แล้วกด &quot;ลองใหม่อีกครั้ง&quot;
        </p>
      </div>
    </div>
  )
}
