'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Globe,
  ShoppingBag,
  Settings, 
  Wallet,
  LogOut,
  ChevronLeft,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  Command,
} from 'lucide-react'
import { logoutAction } from '@/lib/actions'

const menuItems = [
  { name: 'แดชบอร์ด', href: '/reseller/panel', icon: LayoutDashboard },
  { name: 'จัดการเซิร์ฟเวอร์', href: '/reseller/panel/servers', icon: Globe },
  { name: 'รายการขาย', href: '/reseller/panel/orders', icon: ShoppingBag },
  { name: 'แก้ไขข้อมูลร้าน', href: '/reseller/panel/profile', icon: Settings },
  { name: 'ถอนเงิน', href: '/reseller/panel/withdraw', icon: Wallet },
]

export default function ResellerSidebar({ shopName }: { shopName: string }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <>
      {/* Mobile Toggle - integrated into header area */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-3 left-3 z-[60] p-2 bg-zinc-900/90 backdrop-blur-sm border border-white/10 rounded-xl text-zinc-400 hover:text-white transition-all active:scale-95"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-[50]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-[55] h-dvh transition-all duration-300 bg-zinc-950 border-r border-white/5
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'w-[72px]' : 'w-[240px]'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Brand */}
          <div className={`flex items-center gap-3 px-4 h-14 border-b border-white/5 ${isCollapsed ? 'justify-center px-2' : ''}`}>
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Command className="w-4 h-4 text-white" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-black text-sm tracking-tight text-white uppercase leading-tight truncate">{shopName || 'RESELLER'}</span>
                <span className="text-[9px] uppercase tracking-[0.15em] text-emerald-500/80 font-bold">Reseller Panel</span>
              </div>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/reseller/panel' && pathname.startsWith(item.href))
              const Icon = item.icon
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                    ${isCollapsed ? 'justify-center px-2' : ''}
                    ${isActive 
                      ? 'bg-emerald-500/10 text-emerald-400' 
                      : 'text-zinc-500 hover:text-white hover:bg-white/5'}
                  `}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${isActive ? 'text-emerald-400' : 'text-zinc-600 group-hover:text-white'}`} />
                  {!isCollapsed && (
                    <span className="font-semibold text-[13px] tracking-tight flex-1 truncate">{item.name}</span>
                  )}
                  {!isCollapsed && isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="px-2 py-3 border-t border-white/5 space-y-0.5">
            {!isCollapsed && (
              <Link 
                href="/" 
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 transition-all"
              >
                <ExternalLink className="w-[18px] h-[18px] flex-shrink-0" />
                <span className="font-semibold text-[13px] tracking-tight">หน้าบ้าน</span>
              </Link>
            )}

            <form action={logoutAction}>
              <button
                type="submit"
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500/50 hover:text-red-400 hover:bg-red-500/10 transition-all
                  ${isCollapsed ? 'justify-center px-2' : ''}
                `}
                title={isCollapsed ? 'ออกจากระบบ' : undefined}
              >
                <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
                {!isCollapsed && <span className="font-semibold text-[13px] tracking-tight text-left flex-1">ออกจากระบบ</span>}
              </button>
            </form>

            {/* Desktop Collapse */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex w-full mt-1 items-center justify-center p-2 rounded-lg border border-white/5 hover:bg-white/5 text-zinc-600 hover:text-zinc-300 transition-all"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
