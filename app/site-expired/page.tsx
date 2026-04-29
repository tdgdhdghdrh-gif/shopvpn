export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Clock, Lock, Shield, AlertTriangle, Mail } from 'lucide-react'

async function getSiteName() {
  try {
    const settings = await prisma.settings.findFirst({
      select: { siteName: true },
    })
    return settings?.siteName || 'เว็บไซต์'
  } catch {
    return 'เว็บไซต์'
  }
}

export default async function SiteExpiredPage() {
  // Check if actually expired
  const settings = await prisma.settings.findFirst({
    select: { siteExpiryDate: true },
  })

  // If not expired or no expiry date, redirect to home
  if (!settings?.siteExpiryDate || new Date(settings.siteExpiryDate) > new Date()) {
    redirect('/')
  }

  const siteName = await getSiteName()
  const expiredDate = new Date(settings.siteExpiryDate).toLocaleString('th-TH', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(220,38,38,0.08)_0%,_transparent_70%)]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />

      <div className="relative z-10 max-w-md w-full text-center space-y-8">
        {/* Icon */}
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 bg-red-500/10 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
          <div className="absolute inset-2 bg-red-500/5 rounded-full animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500/20 to-red-900/20 rounded-full flex items-center justify-center border border-red-500/20">
              <Lock className="w-10 h-10 text-red-400" />
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            เว็บไซต์หมดอายุ
          </h1>
          <p className="text-zinc-500 text-sm leading-relaxed">
            {siteName} หมดอายุการใช้งานแล้ว<br />
            กรุณาติดต่อผู้ดูแลระบบเพื่อต่ออายุ
          </p>
        </div>

        {/* Expiry Info Card */}
        <div className="bg-zinc-950 border border-red-500/20 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider justify-center">
            <AlertTriangle className="w-3.5 h-3.5" />
            หมดอายุเมื่อ
          </div>
          <div className="flex items-center justify-center gap-2 text-white font-mono text-lg">
            <Clock className="w-5 h-5 text-red-400" />
            {expiredDate}
          </div>
        </div>

        {/* Contact */}
        <div className="space-y-2">
          <p className="text-zinc-600 text-xs">หากคุณเป็นผู้ดูแลระบบ</p>
          <a
            href="/admin/site-expiry"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:border-zinc-600 transition-all"
          >
            <Shield className="w-3.5 h-3.5" />
            จัดการวันหมดอายุ
          </a>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-zinc-900">
          <p className="text-[10px] text-zinc-700">
            SimonVPN License System
          </p>
        </div>
      </div>
    </div>
  )
}
