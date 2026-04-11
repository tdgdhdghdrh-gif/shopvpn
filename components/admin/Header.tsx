'use client'

import { useEffect, useState } from 'react'
import { Bell, User, ChevronDown, Zap } from 'lucide-react'

interface HeaderProps {
  adminName: string
}

export default function Header({ adminName }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header 
      className={`sticky top-0 z-30 flex items-center justify-between h-14 px-3 sm:px-5 transition-all duration-300 border-b
        ${scrolled ? 'bg-zinc-950/90 border-white/5 backdrop-blur-xl' : 'bg-transparent border-transparent'}
      `}
    >
      {/* Title - leave space for hamburger on mobile */}
      <div className="flex items-center gap-2 pl-10 lg:pl-0 min-w-0">
        <div className="hidden sm:flex w-8 h-8 bg-blue-500/10 border border-blue-500/20 rounded-lg items-center justify-center flex-shrink-0">
          <Zap className="w-3.5 h-3.5 text-blue-400" />
        </div>
        <div className="min-w-0">
          <h1 className="text-sm sm:text-base font-bold tracking-tight text-white truncate">แดชบอร์ดผู้ดูแลระบบ</h1>
          <p className="hidden sm:block text-[10px] text-zinc-600 font-medium tracking-wide">โพรโตคอลตรวจสอบระบบแบบสด</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-auto flex-shrink-0">
        {/* Notifications */}
        <button className="relative p-2 bg-zinc-900/80 border border-white/5 rounded-lg text-zinc-500 hover:text-white transition-all active:scale-95">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full" />
        </button>

        {/* Profile */}
        <div className="flex items-center gap-2 group cursor-pointer p-1 pr-2 sm:pr-3 bg-zinc-900/80 border border-white/5 rounded-lg hover:bg-zinc-800 transition-all active:scale-[0.98]">
          <div className="w-7 h-7 bg-gradient-to-br from-zinc-700 to-black rounded-md flex items-center justify-center border border-white/5">
             <User className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="hidden sm:block min-w-0">
            <p className="text-xs font-bold text-white leading-tight truncate max-w-[120px]">{adminName || 'Admin'}</p>
            <p className="text-[9px] text-zinc-600 font-medium">Admin</p>
          </div>
          <ChevronDown className="hidden sm:block w-3.5 h-3.5 text-zinc-600" />
        </div>
      </div>
    </header>
  )
}
