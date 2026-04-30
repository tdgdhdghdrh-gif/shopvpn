'use client'

import { useSearchParams } from 'next/navigation'
import { Construction, Clock } from 'lucide-react'

export default function MaintenancePage() {
  const searchParams = useSearchParams()
  const msg = searchParams.get('msg') || 'ขณะนี้ระบบกำลังปรับปรุง กรุณากลับมาใหม่ในอีกสักครู่'

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Construction className="w-10 h-10 text-amber-400" />
        </div>
        <h1 className="text-3xl font-black mb-3">กำลังปรับปรุงระบบ</h1>
        <p className="text-zinc-400 mb-8 leading-relaxed">{decodeURIComponent(msg)}</p>
        <div className="flex items-center justify-center gap-2 text-sm text-zinc-500">
          <Clock className="w-4 h-4" />
          กรุณารอสักครู่...
        </div>
      </div>
    </div>
  )
}
