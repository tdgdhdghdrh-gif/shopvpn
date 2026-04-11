'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Construction, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface MaintenanceGuardProps {
  children: React.ReactNode
  isSuperAdmin: boolean
}

export default function MaintenanceGuard({ children, isSuperAdmin }: MaintenanceGuardProps) {
  const pathname = usePathname()
  const [disabledMenus, setDisabledMenus] = useState<string[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/admin/menu-settings')
      .then(res => res.json())
      .then(data => {
        if (data.disabledMenus && Array.isArray(data.disabledMenus)) {
          setDisabledMenus(data.disabledMenus)
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [])

  if (!loaded) return <>{children}</>

  // Check if current page path matches any disabled menu
  const isDisabled = disabledMenus.some(href => {
    if (href === '/admin') return pathname === '/admin'
    return pathname === href || pathname.startsWith(href + '/')
  })

  // Super Admin can still access disabled pages but with a warning banner
  if (isDisabled && isSuperAdmin) {
    return (
      <div>
        <div className="mb-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center shrink-0">
            <Construction className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-amber-400">เมนูนี้อยู่ในสถานะ &quot;ปิดปรับปรุง&quot;</p>
            <p className="text-[11px] text-amber-400/60 font-medium">แอดมินทั่วไปจะไม่สามารถเข้าถึงหน้านี้ได้ (Super Admin ยังใช้งานได้)</p>
          </div>
        </div>
        {children}
      </div>
    )
  }

  // Non-super admin accessing a disabled page
  if (isDisabled) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-3xl flex items-center justify-center">
          <Construction className="w-10 h-10 text-amber-400" />
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="text-2xl font-bold text-white tracking-tight">ปิดปรับปรุงชั่วคราว</h2>
          <p className="text-sm text-zinc-500 font-medium leading-relaxed">
            หน้านี้อยู่ระหว่างการปรับปรุงโดยผู้ดูแลระบบ กรุณาลองอีกครั้งในภายหลัง
          </p>
        </div>
        <Link
          href="/admin"
          className="flex items-center gap-2 px-5 py-2.5 bg-zinc-800 border border-white/10 rounded-xl text-sm font-bold text-white hover:bg-zinc-700 transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          กลับหน้าภาพรวม
        </Link>
      </div>
    )
  }

  return <>{children}</>
}
