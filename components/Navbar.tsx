'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Menu, X, Wifi, LogOut, LogIn, User, Shield, Server, 
  ChevronRight, Home, Users, PlusCircle, Wallet, History, ShoppingBag, Settings,
  Globe, LayoutDashboard, CreditCard, Gift
} from 'lucide-react'
import { logoutAction } from '@/lib/actions'

interface NavbarProps {
  user?: {
    name: string
    email: string
    balance?: number
  } | null
  isAdmin?: boolean
}

export default function Navbar({ user, isAdmin = false }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [balance, setBalance] = useState(user?.balance || 0)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fetch balance every 5 seconds if user is logged in
  useEffect(() => {
    if (!user) return
    
    async function fetchBalance() {
      try {
        const res = await fetch('/api/user/me')
        const data = await res.json()
        if (data.user) {
          setBalance(data.user.balance)
        }
      } catch (error) {
        console.error('Failed to fetch balance')
      }
    }

    fetchBalance()
    const interval = setInterval(fetchBalance, 5000)
    return () => clearInterval(interval)
  }, [user])

  const formatBalance = (bal?: number) => {
    if (bal === undefined || bal === null) return '0'
    return bal.toLocaleString('th-TH')
  }

  return (
    <nav 
      className={`sticky top-0 z-[100] transition-colors duration-200 ${
        scrolled 
          ? 'bg-black border-b border-zinc-800 py-2' 
          : 'bg-black py-3'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 p-0.5 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="https://i.postimg.cc/7PC1vHmY/812-removebg-preview.png" 
                  alt="simonvpnshop" 
                  className="w-full h-full object-contain p-1 scale-125 brightness-110"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-black text-lg lg:text-xl tracking-tighter leading-none group-hover:text-cyan-400 transition-colors italic">
                SIMON<span className="text-cyan-400">VPN</span>
              </span>
              <span className="text-[8px] text-zinc-500 font-medium tracking-wider uppercase leading-none mt-1">
                VPN Service
              </span>
            </div>
          </Link>

          {/* Desktop Navigation - More Compact */}
          <div className="hidden lg:flex items-center gap-1">
            {[
              { label: 'HOME', href: '/', icon: Home },
              { label: 'FREE VLESS', href: '/public-vless', icon: Globe, color: 'text-cyan-400' },
              { label: 'TOPUP', href: '/topup', icon: CreditCard, color: 'text-pink-400', protected: true },
            ].map((link) => (
              (!link.protected || user) && (
                <Link 
                  key={link.href}
                  href={link.href} 
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-black flex items-center gap-1.5 transition-all hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/20 ${link.color || 'text-zinc-400 hover:text-white'}`}
                >
                  <link.icon className="w-3.5 h-3.5" />
                  {link.label}
                </Link>
              )
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Balance Card - Desktop */}
            {user && (
              <Link 
                href="/profile/topups"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl hover:bg-cyan-500/10 transition-all group animate-border-glow"
              >
                <div className="w-6 h-6 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <Wallet className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[7px] text-zinc-500 font-black uppercase leading-none">BALANCE</span>
                  <span className="text-cyan-400 font-black text-xs leading-none mt-0.5">
                    {formatBalance(balance)} <span className="text-[8px] opacity-60">฿</span>
                  </span>
                </div>
              </Link>
            )}
            
            {/* Balance Badge - Mobile */}
            {user && (
              <Link 
                href="/profile/topups"
                className="flex sm:hidden items-center gap-1.5 px-2.5 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-lg hover:bg-cyan-500/20 transition-all"
              >
                <Wallet className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-cyan-400 font-bold text-xs">
                  {formatBalance(balance)}
                </span>
              </Link>
            )}

            {/* Auth Buttons or User Menu */}
            {!user ? (
              <div className="flex items-center gap-1.5">
                <Link 
                  href="/login" 
                  className="px-3 py-1.5 text-zinc-400 hover:text-white text-[11px] font-black transition-all"
                >
                  LOGIN
                </Link>
                <Link 
                  href="/register" 
                  className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-black hover:scale-105 rounded-xl text-[11px] font-black transition-all shadow-lg shadow-cyan-500/20 active:scale-95 italic"
                >
                  JOIN NOW
                </Link>
              </div>
            ) : (
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-xl transition-all border ${
                  isOpen 
                    ? 'bg-cyan-500 border-cyan-400 text-black shadow-lg shadow-cyan-500/30' 
                    : 'bg-white/5 border-white/5 text-zinc-400 hover:text-cyan-400 hover:bg-cyan-500/10'
                }`}
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modern Fullscreen-ish Mobile/User Menu Overlay */}
      <div className={`fixed inset-0 top-[72px] lg:top-[88px] z-40 bg-black/60 backdrop-blur-xl transition-all duration-500 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`} onClick={() => setIsOpen(false)}>
        <div 
          className={`absolute top-0 right-0 bottom-0 w-full max-w-sm bg-[#0a0a0a] border-l border-white/5 shadow-2xl p-6 transition-transform duration-500 ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={e => e.stopPropagation()}
        >
          {user ? (
            <div className="flex flex-col h-full">
              {/* User Identity */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-lg font-semibold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-zinc-500 text-[8px] font-medium uppercase tracking-wider">ยินดีต้อนรับ</span>
                  <span className="text-white font-medium text-sm">{user.name}</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1 h-1 rounded-full bg-emerald-500" />
                    <span className="text-emerald-500 text-[8px]">Online</span>
                  </div>
                </div>
              </div>

              {/* Menu Sections */}
              <div className="space-y-6 flex-1 overflow-y-auto pr-2">
                {/* Main Section */}
                <div>
                  <h4 className="text-zinc-600 text-[8px] font-medium uppercase tracking-wider px-4 mb-1.5">เมนูหลัก</h4>
                  <div className="space-y-1">
                    <MenuLink href="/" icon={Home} label="หน้าแรก" onClick={() => setIsOpen(false)} />
                    <MenuLink href="/public-vless" icon={Globe} label="Free VLESS" color="text-emerald-400" onClick={() => setIsOpen(false)} />
                    <MenuLink href="/topup" icon={CreditCard} label="เติมเงินเข้าระบบ" color="text-amber-400" onClick={() => setIsOpen(false)} />
                  </div>
                </div>

                {/* Account Section */}
                <div>
                  <h4 className="text-zinc-600 text-[8px] font-medium uppercase tracking-wider px-4 mb-1.5">บัญชีของฉัน</h4>
                  <div className="space-y-1">
                    <MenuLink href="/profile/orders" icon={ShoppingBag} label="รายการสั่งซื้อ VPN" onClick={() => setIsOpen(false)} />
                    <MenuLink href="/profile/topups" icon={History} label="ประวัติการเติมเงิน" onClick={() => setIsOpen(false)} />
                    <MenuLink href="/profile" icon={User} label="ตั้งค่าโปรไฟล์" onClick={() => setIsOpen(false)} />
                    <MenuLink href="/profile/referral" icon={Gift} label="เชิญเพื่อน" color="text-pink-400" onClick={() => setIsOpen(false)} />
                  </div>
                </div>

                {/* Admin Section */}
                {isAdmin && (
                  <div>
                    <h4 className="text-purple-500 text-[8px] font-medium uppercase tracking-wider px-4 mb-1.5">ผู้ดูแลระบบ</h4>
                    <div className="space-y-1">
                      <MenuLink href="/admin" icon={LayoutDashboard} label="แดชบอร์ดแอดมิน" color="text-purple-400" onClick={() => setIsOpen(false)} />
                      <MenuLink href="/admin/vpn" icon={Server} label="จัดการเซิร์ฟเวอร์" color="text-purple-400" onClick={() => setIsOpen(false)} />
                      <MenuLink href="/admin/users" icon={Users} label="จัดการสมาชิก" color="text-purple-400" onClick={() => setIsOpen(false)} />
                    </div>
                  </div>
                )}
              </div>

              {/* Logout Footer */}
              <div className="mt-auto pt-6 border-t border-white/5">
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 rounded-lg transition-all text-xs font-medium group"
                  >
                    <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                    ออกจากระบบ
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full justify-center text-center p-8">
              <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-8">
                <User className="w-12 h-12 text-zinc-600" />
              </div>
              <h3 className="text-base font-medium text-white mb-1">เข้าสู่ระบบ</h3>
              <p className="text-zinc-500 text-xs mb-6">เพื่อใช้งานบริการ</p>
              <div className="space-y-2">
                <Link 
                  href="/login" 
                  onClick={() => setIsOpen(false)}
                  className="block w-full py-2.5 bg-white text-black rounded-lg font-medium text-xs transition-all active:scale-95"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link 
                  href="/register" 
                  onClick={() => setIsOpen(false)}
                  className="block w-full py-2.5 bg-white/5 border border-white/10 text-white rounded-lg font-medium text-xs hover:bg-white/10 transition-all active:scale-95"
                >
                  สมัครสมาชิก
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

function MenuLink({ href, icon: Icon, label, color = "text-zinc-400", onClick }: any) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all hover:bg-white/5 group`}
    >
      <div className={`w-7 h-7 rounded-md bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform ${color}`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <span className={`text-xs font-medium transition-colors group-hover:text-white ${color === 'text-zinc-400' ? '' : color}`}>
        {label}
      </span>
      <ChevronRight className="w-3.5 h-3.5 ml-auto text-zinc-700 group-hover:text-zinc-400 transition-colors" />
    </Link>
  )
}
