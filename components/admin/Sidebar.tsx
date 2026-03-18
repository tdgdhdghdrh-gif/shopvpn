'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Server, 
  Users, 
  Wallet, 
  Settings, 
  LogOut,
  ChevronLeft,
  Menu,
  X,
  Shield,
  ExternalLink,
  ChevronRight,
  Zap,
  Globe,
  PieChart,
  Command,
  TrendingUp
} from 'lucide-react'
import { logoutAction } from '@/lib/actions'

const menuItems = [
  {
    name: 'ภาพรวม',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'โหนดเครือข่าย',
    href: '/admin/vpn',
    icon: Globe,
  },
  {
    name: 'ผู้ใช้ระบบ',
    href: '/admin/users',
    icon: Users,
  },
  {
    name: 'ธุรกรรมการเงิน',
    href: '/admin/topups',
    icon: PieChart,
  },
  {
    name: 'รายได้เซิร์ฟเวอร์',
    href: '/admin/revenue',
    icon: TrendingUp,
  },
  {
    name: 'พารามิเตอร์',
    href: '/admin/settings',
    icon: Settings,
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleSidebar = () => setIsOpen(!isOpen)

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <>
      {/* Mobile Toggle */}
      <div className="lg:hidden fixed top-5 left-5 z-[60]">
        <button
          onClick={toggleSidebar}
          className="p-3 bg-zinc-900 border border-white/5 rounded-2xl text-zinc-400 hover:text-white transition-all shadow-2xl active:scale-95"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-[50] animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-[55] h-screen transition-all duration-500 bg-zinc-950 border-r border-white/5
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'w-[100px]' : 'w-[280px]'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Brand */}
          <div className={`p-6 sm:p-8 flex items-center gap-4 ${isCollapsed ? 'justify-center' : ''} ${isOpen ? 'pt-24 lg:pt-8' : 'pt-8'}`}>
            <div className="min-w-10 h-10 sm:min-w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20 active:scale-95 transition-transform">
              <Command className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-black text-lg sm:text-xl tracking-tighter text-white uppercase">CORE<span className="text-zinc-500">ADMIN</span></span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-blue-500 font-black">Nexus Engine</span>
              </div>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 px-4 sm:px-6 py-6 sm:py-10 space-y-1 sm:space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 sm:py-4 rounded-2xl transition-all duration-300 group
                    ${isActive 
                      ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                      : 'text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent'}
                  `}
                >
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110 ${isActive ? 'text-blue-400' : 'text-zinc-500 group-hover:text-white'}`} />
                  {!isCollapsed && (
                    <span className="font-bold text-xs sm:text-sm tracking-tight flex-1">{item.name}</span>
                  )}
                  {!isCollapsed && isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_12px_rgba(59,130,246,1)]" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 sm:p-6 border-t border-white/5 space-y-2 sm:space-y-4">
            {!isCollapsed && (
              <Link 
                href="/" 
                className="flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 sm:py-4 rounded-2xl text-zinc-500 hover:text-white hover:bg-white/5 transition-all group"
              >
                <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-bold text-xs sm:text-sm tracking-tight">ระบบหน้าบ้าน</span>
              </Link>
            )}

            <form action={logoutAction}>
              <button
                type="submit"
                className={`w-full flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 sm:py-4 rounded-2xl text-red-500/60 hover:text-red-500 hover:bg-red-500/10 transition-all group
                  ${isCollapsed ? 'justify-center' : ''}
                `}
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                {!isCollapsed && <span className="font-bold text-xs sm:text-sm tracking-tight text-left flex-1">ออกจากระบบ</span>}
              </button>
            </form>

            {/* Desktop Collapse */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex w-full mt-4 items-center justify-center p-3 rounded-xl border border-white/5 hover:bg-white/5 text-zinc-600 hover:text-zinc-300 transition-all shadow-inner"
            >
              {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
