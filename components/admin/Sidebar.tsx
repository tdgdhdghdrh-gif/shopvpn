'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut,
  ChevronLeft,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  Globe,
  PieChart,
  Command,
  TrendingUp,
  Tag,
  Ticket,
  Store,
  Wallet,
  Shield,
  Lock,
  Monitor,
  Link2,
  Key,
  Server,
  AlertTriangle,
  Megaphone,
  FileText,
  Image,
  Maximize2,
  Construction,
  RotateCcw,
  Palette,
  Sparkles,
  GripVertical,
  Package,
  Sliders,
  ShieldCheck,
  Home,
  Code2,
  Wand2,
  Download,
  CalendarClock,
} from 'lucide-react'
import { logoutAction } from '@/lib/actions'

const menuItems = [
  { name: 'ภาพรวม', href: '/admin', icon: LayoutDashboard },
  { name: 'โหนดเครือข่าย', href: '/admin/vpn', icon: Globe },
  { name: 'จัดการ Panel', href: '/admin/panel', icon: Monitor },
  { name: 'ผู้ใช้ระบบ', href: '/admin/users', icon: Users },
  { name: 'ธุรกรรมการเงิน', href: '/admin/topups', icon: PieChart },
  { name: 'รายได้เซิร์ฟเวอร์', href: '/admin/revenue', icon: TrendingUp },
  { name: 'อีเวนท์ลดราคา', href: '/admin/events', icon: Tag },
  { name: 'ลิงก์ลดราคา', href: '/admin/promo-links', icon: Link2 },
  { name: 'ตัวแทนขาย', href: '/admin/resellers', icon: Store },
  { name: 'คำขอถอนเงิน', href: '/admin/withdrawals', icon: Wallet },
  { name: 'Ticket', href: '/admin/tickets', icon: Ticket },
  { name: 'รายงานเน็ตช้า', href: '/admin/slow-reports', icon: AlertTriangle },
  { name: 'ประกาศข่าวสาร', href: '/admin/announcements', icon: Megaphone },
  { name: 'แบนเนอร์โปรโมชั่น', href: '/admin/banners', icon: Image },
  { name: 'Popup โปรโมชั่น', href: '/admin/popups', icon: Maximize2 },
  { name: 'จัดการบทความ', href: '/admin/blog', icon: FileText },
  { name: 'รายชื่อแอดมิน', href: '/admin/contacts', icon: Users },
  { name: 'IP Security', href: '/admin/ip-logs', icon: Shield },
  { name: 'จัดการกงล้อนำโชค', href: '/admin/lucky-wheel', icon: RotateCcw },
  { name: 'จัดการคูปอง', href: '/admin/coupons', icon: Tag },
  { name: 'จัดการโฆษณา', href: '/admin/ads', icon: Megaphone },
  { name: 'ตกแต่งหน้าแรก', href: '/admin/homepage', icon: LayoutDashboard },
  { name: 'รูปแบบหน้าแรก', href: '/admin/landing-template', icon: Palette },
  { name: 'เอฟเฟกต์เว็บ', href: '/admin/web-effects', icon: Sparkles },
  { name: 'เอฟเฟกต์คลิก', href: '/admin/menu-click-effect', icon: Wand2 },
  { name: 'จัดเรียงเมนูผู้ใช้', href: '/admin/hamburger-menu', icon: GripVertical },
  { name: 'ขายของ', href: '/admin/premium-apps', icon: Package },
  { name: 'เปลี่ยนหน้าแรก', href: '/admin/default-homepage', icon: Home },
  { name: 'สร้างเว็บ', href: '/admin/custom-pages', icon: Code2 },
  { name: 'รูปแบบหน้าเซิร์ฟเวอร์', href: '/admin/server-template', icon: Image },
  { name: 'IP ที่อนุญาต', href: '/admin/allowed-ips', icon: ShieldCheck },
]

const superAdminMenuItems = [
  { name: 'ข้อมูลเซิร์ฟเวอร์', href: '/admin/server-info', icon: Server },
  { name: 'จัดการรายได้เซิฟ', href: '/admin/super-revenue', icon: Shield },
  { name: 'API Keys', href: '/admin/api-keys', icon: Key },
  { name: 'Branding & Theme', href: '/admin/branding', icon: Palette },
  { name: 'จัดการ UI/Theme', href: '/admin/theme-editor', icon: Sliders },
  { name: 'reCAPTCHA', href: '/admin/recaptcha', icon: ShieldCheck },
  { name: 'ตั้งค่าระบบ', href: '/admin/settings', icon: Settings },
  { name: 'จัดการเมนู', href: '/admin/menu-settings', icon: Construction },
  { name: 'อัพเดทเว็บ', href: '/admin/update-site', icon: Download },
  { name: 'ต่ออายุเว็บ', href: '/admin/site-license', icon: CalendarClock },
]

interface SidebarProps {
  isSuperAdmin?: boolean
  isAdmin?: boolean
  isRevenueAdmin?: boolean
  isAgent?: boolean
  userMenuAccess?: string[] | null
}

export default function Sidebar({ isSuperAdmin = false, isAdmin = false, isRevenueAdmin = false, isAgent = false, userMenuAccess = null }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [disabledMenus, setDisabledMenus] = useState<string[]>([])
  const [roleMenus, setRoleMenus] = useState<Record<string, string[]> | null>(null)
  const [isLicenseServer, setIsLicenseServer] = useState(false)

  // Fetch disabled menus + role menus from settings
  useEffect(() => {
    fetch('/api/admin/menu-settings')
      .then(res => res.json())
      .then(data => {
        if (data.disabledMenus && Array.isArray(data.disabledMenus)) {
          setDisabledMenus(data.disabledMenus)
        }
        if (data.adminRoleMenus && typeof data.adminRoleMenus === 'object') {
          setRoleMenus(data.adminRoleMenus)
        }
      })
      .catch(() => {})
    // เช็คว่าเป็น license server หรือไม่ (ซ่อนเมนู "ต่ออายุเว็บ" ในเว็บลูกค้า)
    fetch('/api/license/activate')
      .then(res => res.json())
      .then(data => {
        if (data.isLicenseServer) setIsLicenseServer(true)
      })
      .catch(() => {})
  }, [])


  // กรองเมนูตามระดับยศ — ใช้ per-user override ก่อน, ถ้าไม่มีใช้ role config จาก DB, ถ้าไม่มีใช้ fallback hardcode
  const adminAllowedHrefsFallback = ['/admin', '/admin/vpn', '/admin/panel', '/admin/users', '/admin/revenue', '/admin/events', '/admin/tickets', '/admin/slow-reports', '/admin/contacts', '/admin/ip-logs', '/admin/promo-links', '/admin/announcements', '/admin/banners', '/admin/popups', '/admin/blog', '/admin/lucky-wheel', '/admin/coupons', '/admin/ads', '/admin/landing-template', '/admin/web-effects', '/admin/hamburger-menu', '/admin/homepage', '/admin/premium-apps', '/admin/default-homepage', '/admin/custom-pages', '/admin/server-template', '/admin/allowed-ips']
  const agentAllowedHrefsFallback = ['/admin', '/admin/vpn', '/admin/revenue']
  const revenueAllowedHrefsFallback = ['/admin', '/admin/revenue']

  const getAllowedHrefs = (): string[] => {
    if (isSuperAdmin) return menuItems.map(m => m.href)

    // Per-user override takes priority
    if (userMenuAccess && Array.isArray(userMenuAccess) && userMenuAccess.length > 0) {
      return userMenuAccess
    }

    // Role-based config from DB
    if (roleMenus) {
      if (isAdmin && roleMenus.admin) return roleMenus.admin
      if (isAgent && roleMenus.agent) return roleMenus.agent
      if (isRevenueAdmin && roleMenus.revenueAdmin) return roleMenus.revenueAdmin
    }

    // Fallback to hardcoded defaults
    if (isAdmin) return adminAllowedHrefsFallback
    if (isAgent) return agentAllowedHrefsFallback
    if (isRevenueAdmin) return revenueAllowedHrefsFallback
    return []
  }

  const allowedHrefs = getAllowedHrefs()

  const filteredMenuItems = isSuperAdmin 
    ? menuItems 
    : menuItems.filter(item => allowedHrefs.includes(item.href))

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
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Command className="w-4 h-4 text-white" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-black text-sm tracking-tight text-white uppercase leading-tight">CORE<span className="text-zinc-500">ADMIN</span></span>
                <span className="text-[9px] uppercase tracking-[0.15em] text-blue-500/80 font-bold">Nexus Engine</span>
              </div>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
            {filteredMenuItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
              const isMenuDisabled = disabledMenus.includes(item.href) && !isSuperAdmin
              const showDisabledBadge = disabledMenus.includes(item.href)
              const Icon = item.icon
              
              if (isMenuDisabled) {
                return (
                  <div
                    key={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group opacity-40 cursor-not-allowed
                      ${isCollapsed ? 'justify-center px-2' : ''}
                    `}
                    title={isCollapsed ? `${item.name} (ปิดปรับปรุง)` : undefined}
                  >
                    <Icon className="w-[18px] h-[18px] flex-shrink-0 text-zinc-700" />
                    {!isCollapsed && (
                      <span className="font-semibold text-[13px] tracking-tight flex-1 truncate text-zinc-700 line-through">{item.name}</span>
                    )}
                    {!isCollapsed && (
                      <span className="px-1 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-[8px] font-bold text-red-500 uppercase tracking-wider shrink-0 leading-tight">ปิด</span>
                    )}
                  </div>
                )
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                    ${isCollapsed ? 'justify-center px-2' : ''}
                    ${isActive 
                      ? 'bg-blue-500/10 text-blue-400' 
                      : 'text-zinc-500 hover:text-white hover:bg-white/5'}
                  `}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${isActive ? 'text-blue-400' : 'text-zinc-600 group-hover:text-white'}`} />
                  {!isCollapsed && (
                    <span className="font-semibold text-[13px] tracking-tight flex-1 truncate">{item.name}</span>
                  )}
                  {!isCollapsed && showDisabledBadge && isSuperAdmin && (
                    <span className="px-1 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[8px] font-bold text-amber-400 uppercase tracking-wider shrink-0 leading-tight">ปิด</span>
                  )}
                  {!isCollapsed && isActive && !showDisabledBadge && (
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                  )}
                </Link>
              )
            })}

            {/* Super Admin Section */}
            {isSuperAdmin && (
              <>
                {!isCollapsed && (
                  <div className="pt-4 pb-1 px-3">
                    <span className="text-[9px] font-black text-amber-500/60 uppercase tracking-[0.2em]">Super Admin</span>
                  </div>
                )}
                {isCollapsed && <div className="pt-2 border-t border-amber-500/20 mt-2" />}
                {superAdminMenuItems.filter(item => {
                  // ซ่อนเมนู "ต่ออายุเว็บ" ถ้าไม่ใช่ license server (เว็บต้นทาง)
                  if (item.href === '/admin/site-license' && !isLicenseServer) return false
                  return true
                }).map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href)
                  const showDisabledBadge = disabledMenus.includes(item.href)
                  const Icon = item.icon
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                        ${isCollapsed ? 'justify-center px-2' : ''}
                        ${isActive 
                          ? 'bg-amber-500/10 text-amber-400' 
                          : 'text-zinc-500 hover:text-amber-400 hover:bg-amber-500/5'}
                      `}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <Icon className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${isActive ? 'text-amber-400' : 'text-zinc-600 group-hover:text-amber-400'}`} />
                      {!isCollapsed && (
                        <span className="font-semibold text-[13px] tracking-tight flex-1 truncate">{item.name}</span>
                      )}
                      {!isCollapsed && showDisabledBadge && (
                        <span className="px-1 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[8px] font-bold text-amber-400 uppercase tracking-wider shrink-0 leading-tight">ปิด</span>
                      )}
                      {!isCollapsed && isActive && !showDisabledBadge && (
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                      )}
                    </Link>
                  )
                })}
              </>
            )}

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
