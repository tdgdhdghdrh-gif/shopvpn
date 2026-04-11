'use client'

import { useEffect } from 'react'
import { RefreshCw, AlertTriangle } from 'lucide-react'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Admin Error]', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center">
        <AlertTriangle className="w-8 h-8 text-red-400" />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-lg font-bold text-white">เกิดข้อผิดพลาด</h2>
        <p className="text-sm text-zinc-500 max-w-md">
          {error.message || 'ระบบเกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง'}
        </p>
      </div>
      <button
        onClick={reset}
        className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-sm font-bold text-white hover:bg-zinc-800 transition-all active:scale-95"
      >
        <RefreshCw className="w-4 h-4" />
        ลองใหม่
      </button>
    </div>
  )
}
