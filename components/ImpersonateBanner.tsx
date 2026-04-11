'use client'

import { useEffect, useState } from 'react'

interface ImpersonateData {
  isImpersonating: boolean
  targetUser?: {
    id: string
    name: string
    email: string
    balance: number
    avatar?: string | null
  } | null
  realAdminEmail?: string
}

export default function ImpersonateBanner() {
  const [data, setData] = useState<ImpersonateData | null>(null)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    checkImpersonation()
  }, [])

  async function checkImpersonation() {
    try {
      const res = await fetch('/api/admin/impersonate')
      const json = await res.json()
      if (json.isImpersonating) {
        setData(json)
      }
    } catch {
      // ignore
    }
  }

  async function handleExit() {
    setExiting(true)
    try {
      const res = await fetch('/api/admin/impersonate', { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        window.location.href = '/admin/users'
      }
    } catch {
      setExiting(false)
    }
  }

  if (!data?.isImpersonating || !data.targetUser) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] animate-in slide-in-from-top duration-300">
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 shadow-lg shadow-amber-500/20">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex items-center justify-between gap-3">
          {/* Left: Info */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Avatar */}
            {data.targetUser.avatar ? (
              <div className="w-7 h-7 rounded-full overflow-hidden ring-2 ring-white/30 flex-shrink-0 hidden sm:block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={data.targetUser.avatar} alt="" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 hidden sm:block">
                {data.targetUser.name.charAt(0).toUpperCase()}
              </div>
            )}
            
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-white/80 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <span className="text-white text-[11px] sm:text-xs font-bold truncate">
                  กำลังดูในฐานะ: {data.targetUser.name}
                </span>
                <span className="text-white/60 text-[10px] hidden sm:inline truncate">
                  ({data.targetUser.email})
                </span>
              </div>
              <p className="text-white/50 text-[9px] sm:text-[10px] font-medium">
                โหมดดูเท่านั้น — ไม่สามารถใช้เครดิตหรือทำรายการได้
              </p>
            </div>
          </div>

          {/* Right: Exit button */}
          <button 
            onClick={handleExit}
            disabled={exiting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 border border-white/20 rounded-lg text-white text-[11px] sm:text-xs font-bold transition-all active:scale-95 flex-shrink-0 disabled:opacity-50"
          >
            {exiting ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" className="opacity-25" />
                  <path d="M4 12a8 8 0 0 1 8-8" className="opacity-75" />
                </svg>
                กำลังออก...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                ออกจากโหมดดู
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
