'use client'

import { useEffect, useState } from 'react'
import { Bell, Search, User, ChevronDown, Sparkles, LayoutGrid, Zap } from 'lucide-react'

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
      className={`sticky top-0 z-30 flex items-center justify-between h-16 sm:h-24 px-4 sm:px-12 transition-all duration-500 border-b
        ${scrolled ? 'bg-zinc-950/80 border-white/5 backdrop-blur-2xl' : 'bg-transparent border-transparent'}
      `}
    >
      {/* Title */}
      <div className="flex items-center gap-3 sm:gap-4 pl-12 lg:pl-0">
        <div className="hidden sm:flex w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/10 border border-blue-500/20 rounded-2xl items-center justify-center shadow-lg shadow-blue-500/5">
          <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
        </div>
        <div className="space-y-0.5">
          <h1 className="text-lg sm:text-2xl font-black tracking-tighter text-white uppercase">แดชบอร์ดผู้ดูแลระบบ</h1>
          <p className="hidden sm:block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">โพรโตคอลตรวจสอบระบบแบบสด</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 sm:gap-8 ml-auto">
        {/* Search */}
        <div className="relative hidden xl:block group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-blue-400 transition-colors" />
          <input
            type="text"
            placeholder="ค้นหาข้อมูลโปรโตคอล..."
            className="bg-zinc-900/50 border border-white/5 rounded-2xl py-3 pl-14 pr-6 text-xs font-bold text-zinc-300 placeholder-zinc-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 transition-all w-64 shadow-inner"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2.5 sm:p-3.5 bg-zinc-900 border border-white/5 rounded-2xl text-zinc-500 hover:text-white transition-all hover:shadow-2xl hover:shadow-blue-500/10 group active:scale-95 shadow-inner">
          <Bell className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:rotate-12" />
          <span className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-blue-500 rounded-full border-[2px] sm:border-[3px] border-zinc-900 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
        </button>

        {/* Profile */}
        <div className="flex items-center gap-2 sm:gap-4 group cursor-pointer p-1 sm:p-1.5 sm:pr-4 bg-zinc-900 border border-white/5 rounded-[1.25rem] hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-inner">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-zinc-700 to-black rounded-[1rem] flex items-center justify-center border border-white/5 overflow-hidden shadow-2xl transition-transform group-hover:scale-95">
             <User className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400" />
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-black text-white leading-tight uppercase tracking-tight">{adminName || 'ผู้ดูแลระบบ'}</p>
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-0.5">แอดมินระดับ 4</p>
          </div>
          <ChevronDown className="hidden md:block w-4 h-4 text-zinc-600 group-hover:text-white transition-colors ml-1" />
        </div>
      </div>
    </header>
  )
}
