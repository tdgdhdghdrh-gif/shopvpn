'use client'

import { useEffect } from 'react'

function isChunkError(error: Error): boolean {
  const message = error.message || ''
  const patterns = [
    'Loading chunk',
    'ChunkLoadError',
    'Failed to load chunk',
    'Failed to fetch dynamically imported module',
    'error loading dynamically imported module',
  ]
  return patterns.some((p) => message.toLowerCase().includes(p.toLowerCase()))
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Global Error]', error)

    // Auto-reload on chunk load errors (stale deployment cache)
    if (isChunkError(error)) {
      const RELOAD_KEY = '__chunk_error_reload'
      const alreadyReloaded = sessionStorage.getItem(RELOAD_KEY)
      if (!alreadyReloaded) {
        sessionStorage.setItem(RELOAD_KEY, '1')
        window.location.reload()
        return
      }
      // If already reloaded once, clear the flag so future deploys can trigger again
      sessionStorage.removeItem(RELOAD_KEY)
    }
  }, [error])

  return (
    <html lang="th" className="dark">
      <body className="bg-black text-white antialiased">
        <div className="flex flex-col items-center justify-center min-h-dvh gap-6 px-4">
          <div className="text-center space-y-3">
            <h2 className="text-xl font-bold text-white">
              {isChunkError(error)
                ? 'กำลังโหลด...'
                : 'เกิดข้อผิดพลาดร้ายแรง'}
            </h2>
            <p className="text-sm text-zinc-500 max-w-md">
              {isChunkError(error)
                ? 'กรุณารอสักครู่ ระบบกำลังโหลดเวอร์ชันล่าสุด'
                : error.message || 'ระบบเกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง'}
            </p>
          </div>
          {!isChunkError(error) && (
            <button
              onClick={() => reset()}
              className="px-5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-sm font-bold text-white hover:bg-zinc-800 transition-all"
            >
              ลองใหม่
            </button>
          )}
        </div>
      </body>
    </html>
  )
}
