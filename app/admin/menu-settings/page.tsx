'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  LayoutDashboard, Users, Settings, Globe, PieChart, TrendingUp,
  Tag, Ticket, Store, Wallet, Shield, Monitor, Link2, Key, Server,
  AlertTriangle, Megaphone, FileText, Image, Maximize2,
  Eye, EyeOff, Save, Loader2, CheckCircle2, AlertCircle,
  Construction, ToggleLeft, ToggleRight, Search,
  Home, CreditCard, Trophy, Star, Smartphone, BookOpen,
  ShoppingBag, Wifi, Clock, ArrowRightLeft, History, User, Gift,
  MessageSquare, RotateCcw, Calendar, Crown, Target, Activity,
  Bell, Percent, Palette, Sparkles, GripVertical, Sliders,
  UserCog, ChevronDown, ChevronUp, X, RotateCw, Code2, Wand2
} from 'lucide-react'

interface MenuItem {
  name: string
  href: string
  icon: React.ElementType
  section: string
  description: string
}

interface AdminUser {
  id: string
  name: string
  email: string
  isAdmin: boolean
  isSuperAdmin: boolean
  isRevenueAdmin: boolean
  isAgent: boolean
  adminMenuAccess: string[] | null
}

// ====== Admin Menus ======
const allAdminMenuItems: MenuItem[] = [
  { name: 'ภาพรวม', href: '/admin', icon: LayoutDashboard, section: 'admin', description: 'หน้าแดชบอร์ดหลัก' },
  { name: 'โหนดเครือข่าย', href: '/admin/vpn', icon: Globe, section: 'admin', description: 'จัดการเซิร์ฟเวอร์ VPN' },
  { name: 'จัดการ Panel', href: '/admin/panel', icon: Monitor, section: 'admin', description: 'จัดการ 3X-UI Panel' },
  { name: 'ผู้ใช้ระบบ', href: '/admin/users', icon: Users, section: 'admin', description: 'จัดการผู้ใช้ทั้งหมด' },
  { name: 'ธุรกรรมการเงิน', href: '/admin/topups', icon: PieChart, section: 'admin', description: 'ดูรายการเติมเงิน' },
  { name: 'รายได้เซิร์ฟเวอร์', href: '/admin/revenue', icon: TrendingUp, section: 'admin', description: 'สรุปรายได้ทั้งหมด' },
  { name: 'อีเวนท์ลดราคา', href: '/admin/events', icon: Tag, section: 'admin', description: 'จัดการอีเวนท์ส่วนลด' },
  { name: 'ลิงก์ลดราคา', href: '/admin/promo-links', icon: Link2, section: 'admin', description: 'จัดการลิงก์โปรโมชั่น' },
  { name: 'ตัวแทนขาย', href: '/admin/resellers', icon: Store, section: 'admin', description: 'จัดการตัวแทนจำหน่าย' },
  { name: 'คำขอถอนเงิน', href: '/admin/withdrawals', icon: Wallet, section: 'admin', description: 'อนุมัติ/ปฏิเสธการถอนเงิน' },
  { name: 'Ticket', href: '/admin/tickets', icon: Ticket, section: 'admin', description: 'ระบบ Ticket ช่วยเหลือ' },
  { name: 'รายงานเน็ตช้า', href: '/admin/slow-reports', icon: AlertTriangle, section: 'admin', description: 'รายงานปัญหาเครือข่าย' },
  { name: 'ประกาศข่าวสาร', href: '/admin/announcements', icon: Megaphone, section: 'admin', description: 'จัดการประกาศ' },
  { name: 'แบนเนอร์โปรโมชั่น', href: '/admin/banners', icon: Image, section: 'admin', description: 'จัดการแบนเนอร์หน้าเว็บ' },
  { name: 'Popup โปรโมชั่น', href: '/admin/popups', icon: Maximize2, section: 'admin', description: 'จัดการ Popup โปรโมชั่น' },
  { name: 'จัดการบทความ', href: '/admin/blog', icon: FileText, section: 'admin', description: 'เขียน/แก้ไขบทความ Blog' },
  { name: 'รายชื่อแอดมิน', href: '/admin/contacts', icon: Users, section: 'admin', description: 'จัดการรายชื่อผู้ดูแล' },
  { name: 'IP Security', href: '/admin/ip-logs', icon: Shield, section: 'admin', description: 'ตรวจสอบและบล็อก IP' },
  { name: 'จัดการกงล้อนำโชค', href: '/admin/lucky-wheel', icon: RotateCcw, section: 'admin', description: 'จัดการรางวัลกงล้อนำโชค + สถิติ' },
  { name: 'จัดการคูปอง', href: '/admin/coupons', icon: Tag, section: 'admin', description: 'สร้างและจัดการคูปองส่วนลด' },
  { name: 'จัดการโฆษณา', href: '/admin/ads', icon: Megaphone, section: 'admin', description: 'อนุมัติ/ปฏิเสธโฆษณาจากผู้ใช้' },
  { name: 'ตกแต่งหน้าแรก', href: '/admin/homepage', icon: LayoutDashboard, section: 'admin', description: 'จัดการ Layout หน้าแรก — เพิ่ม/ลบ/ย้าย sections, ปุ่มลัด, สถิติ' },
  { name: 'รูปแบบหน้าแรก', href: '/admin/landing-template', icon: Palette, section: 'admin', description: 'เลือกรูปแบบ Landing Page สำหรับผู้เยี่ยมชม' },
  { name: 'เอฟเฟกต์เว็บ', href: '/admin/web-effects', icon: Sparkles, section: 'admin', description: 'จัดการเอฟเฟกต์พิเศษบนหน้าเว็บ เช่น หิมะ ฝน หิ่งห้อย' },
  { name: 'เอฟเฟกต์คลิก', href: '/admin/menu-click-effect', icon: Wand2, section: 'admin', description: 'เอฟเฟกต์แอนิเมชันเมื่อคลิก/แตะหน้าจอ เช่น Ripple, Particle, Neon' },
  { name: 'จัดเรียงเมนูผู้ใช้', href: '/admin/hamburger-menu', icon: GripVertical, section: 'admin', description: 'จัดลำดับ เปิด/ปิด เมนูแฮมเบอร์เกอร์ของผู้ใช้' },
  { name: 'ขายของ', href: '/admin/premium-apps', icon: ShoppingBag, section: 'admin', description: 'จัดการสินค้า เพิ่ม/แก้ไข/ลบ ตั้งราคา สต็อก' },
  { name: 'เปลี่ยนหน้าแรก', href: '/admin/default-homepage', icon: Home, section: 'admin', description: 'กำหนดหน้าแรกเริ่มต้นหลังล็อกอิน' },
  { name: 'สร้างเว็บ', href: '/admin/custom-pages', icon: Code2, section: 'admin', description: 'สร้างหน้าเว็บจาก HTML แล้วแชร์ลิงก์' },
  { name: 'ข้อมูลเซิร์ฟเวอร์', href: '/admin/server-info', icon: Server, section: 'super', description: 'ข้อมูลเซิร์ฟเวอร์ระบบ' },
  { name: 'จัดการรายได้เซิฟ', href: '/admin/super-revenue', icon: Shield, section: 'super', description: 'ล็อก/จัดการรายได้เซิร์ฟเวอร์' },
  { name: 'API Keys', href: '/admin/api-keys', icon: Key, section: 'super', description: 'จัดการ API Key ภายนอก' },
  { name: 'Branding & Theme', href: '/admin/branding', icon: Palette, section: 'super', description: 'จัดการโลโก้ ชื่อเว็บ พื้นหลัง ธีมสี' },
  { name: 'จัดการ UI/Theme', href: '/admin/theme-editor', icon: Sliders, section: 'super', description: 'ปรับแต่งขอบ ความทึบ สี ตัวหนังสือ ของทั้งเว็บ' },
  { name: 'ตั้งค่าระบบ', href: '/admin/settings', icon: Settings, section: 'super', description: 'ตั้งค่าเว็บไซต์ทั้งหมด' },
]

// ====== User Menus ======
const allUserMenuItems: MenuItem[] = [
  { name: 'หน้าแรก', href: '/', icon: Home, section: 'main', description: 'หน้าหลัก - เลือกเซิร์ฟเวอร์ VPN' },
  { name: 'Free VLESS', href: '/public-vless', icon: Globe, section: 'main', description: 'ทดลองใช้ VPN ฟรี' },
  { name: 'โปรเสริมที่ต้องสมัคร', href: '/setup-guide', icon: Smartphone, section: 'main', description: 'สมัครโปรกันรั่ว AIS / True Zoom' },
  { name: 'เติมเงินเข้าระบบ', href: '/topup', icon: CreditCard, section: 'main', description: 'เติมเงินผ่าน TrueMoney / สลิป' },
  { name: 'อันดับผู้ใช้', href: '/leaderboard', icon: Trophy, section: 'main', description: 'อันดับผู้ใช้เติมเงินสูงสุด' },
  { name: 'รีวิวจากผู้ใช้', href: '/reviews', icon: Star, section: 'main', description: 'อ่านรีวิวจากผู้ใช้งานจริง' },
  { name: 'แจ้งปัญหาเน็ตช้า', href: '/report-slow', icon: AlertTriangle, section: 'main', description: 'โหวตเซิร์ฟเวอร์ที่มีปัญหา' },
  { name: 'รายชื่อแอดมิน', href: '/contacts', icon: Users, section: 'main', description: 'ติดต่อแอดมินผ่าน Facebook' },
  { name: 'ประกาศข่าวสาร', href: '/announcements', icon: Megaphone, section: 'main', description: 'ข่าวสาร อัพเดท โปรโมชั่น' },
  { name: 'บทความ & เคล็ดลับ', href: '/blog', icon: BookOpen, section: 'main', description: 'บทความ เคล็ดลับ VPN' },
  { name: 'กงล้อนำโชค', href: '/lucky-wheel', icon: RotateCcw, section: 'main', description: 'หมุนฟรีวันละ 1 ครั้ง ลุ้นรางวัลมากมาย!' },
  { name: 'เช็คอินรายวัน', href: '/daily-checkin', icon: Calendar, section: 'main', description: 'เช็คอินทุกวันรับเครดิตฟรี!' },
  { name: 'เปรียบเทียบเซิร์ฟเวอร์', href: '/server-compare', icon: Activity, section: 'main', description: 'เทียบ Ping, Speed, Load ก่อนซื้อ' },
  { name: 'คูปองส่วนลด', href: '/coupons', icon: Percent, section: 'main', description: 'กรอกโค้ดคูปองรับเครดิตฟรี!' },
  { name: 'อันดับนักแนะนำ', href: '/referral-leaderboard', icon: Trophy, section: 'main', description: 'ชวนเพื่อนมาใช้งาน ลุ้นอันดับ!' },
  { name: 'ซื้อของ', href: '/premium-apps', icon: ShoppingBag, section: 'main', description: 'ซื้อสินค้าคุณภาพ ใช้ได้ทันที' },
  { name: 'รายการสั่งซื้อ VPN', href: '/profile/orders', icon: ShoppingBag, section: 'account', description: 'ดูประวัติการซื้อ VPN' },
  { name: 'การเชื่อมต่อ VPN', href: '/profile/connections', icon: Wifi, section: 'account', description: 'ดู IP ที่เชื่อมต่อ' },
  { name: 'ต่ออายุ VPN', href: '/profile/renew', icon: Clock, section: 'account', description: 'ต่ออายุโค้ด VPN ที่มีอยู่' },
  { name: 'แลกเปลี่ยนเซิร์ฟเวอร์', href: '/profile/exchange', icon: ArrowRightLeft, section: 'account', description: 'ย้าย VPN ไปเซิร์ฟเวอร์อื่น' },
  { name: 'ประวัติการเติมเงิน', href: '/profile/topups', icon: History, section: 'account', description: 'ดูรายละเอียดการเติมเงิน' },
  { name: 'ตั้งค่าโปรไฟล์', href: '/profile', icon: User, section: 'account', description: 'แก้ไขข้อมูลส่วนตัว' },
  { name: 'สมาชิก VIP', href: '/vip', icon: Crown, section: 'account', description: 'ดูระดับ VIP และสิทธิพิเศษ' },
  { name: 'ภารกิจ & ความสำเร็จ', href: '/missions', icon: Target, section: 'account', description: 'สะสม Badge ปลดล็อกความสำเร็จ!' },
  { name: 'ส่งของขวัญ', href: '/gift', icon: Gift, section: 'account', description: 'ส่งเครดิตให้เพื่อนด้วยรหัสของขวัญ' },
  { name: 'แจ้งเตือน', href: '/notifications', icon: Bell, section: 'account', description: 'ดูการแจ้งเตือนและข้อความ' },
  { name: 'เชิญเพื่อน', href: '/profile/referral', icon: Gift, section: 'account', description: 'แนะนำเพื่อนรับ 20 บาทต่อคน' },
  { name: 'ติดต่อแอดมิน (Ticket)', href: '/tickets', icon: Ticket, section: 'account', description: 'สร้างตั๋วติดต่อทีมงาน' },
  { name: 'แชทสด', href: '/chat', icon: MessageSquare, section: 'account', description: 'พูดคุยกับทีมงานได้ทันที' },
  { name: 'ลงทะเบียนฝากขาย', href: '/reseller/register', icon: Store, section: 'marketplace', description: 'สมัครเป็นตัวแทนจำหน่าย' },
  { name: 'จัดการร้านค้า', href: '/reseller/panel', icon: LayoutDashboard, section: 'marketplace', description: 'หน้าจัดการร้านค้า' },
  { name: 'ลงโฆษณา', href: '/ads', icon: Megaphone, section: 'marketplace', description: 'ฝากลงโฆษณาบนเว็บไซต์ วันละ 3 บาท' },
]

// Protected menus that cannot be disabled
const protectedAdminMenus = ['/admin', '/admin/settings', '/admin/menu-settings']
const protectedUserMenus = ['/']

// All admin-accessible menus (section admin only, not super)
const allAdminHrefs = allAdminMenuItems.filter(m => m.section === 'admin').map(m => m.href)

// Default role configs (fallback)
const defaultRoleMenus: Record<string, string[]> = {
  admin: allAdminHrefs,
  agent: ['/admin', '/admin/vpn', '/admin/revenue'],
  revenueAdmin: ['/admin', '/admin/revenue'],
}

function getRoleBadge(user: AdminUser) {
  if (user.isSuperAdmin) return { label: 'Super Admin', color: 'bg-amber-500/10 border-amber-500/20 text-amber-400' }
  if (user.isAdmin) return { label: 'Admin', color: 'bg-blue-500/10 border-blue-500/20 text-blue-400' }
  if (user.isAgent) return { label: 'Agent', color: 'bg-purple-500/10 border-purple-500/20 text-purple-400' }
  if (user.isRevenueAdmin) return { label: 'Revenue', color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' }
  return { label: 'Unknown', color: 'bg-zinc-500/10 border-zinc-500/20 text-zinc-400' }
}

function getRoleKey(user: AdminUser): string {
  if (user.isAdmin) return 'admin'
  if (user.isAgent) return 'agent'
  if (user.isRevenueAdmin) return 'revenueAdmin'
  return 'admin'
}

export default function MenuSettingsPage() {
  const [disabledMenus, setDisabledMenus] = useState<string[]>([])
  const [savedDisabledMenus, setSavedDisabledMenus] = useState<string[]>([])
  const [disabledUserMenus, setDisabledUserMenus] = useState<string[]>([])
  const [savedDisabledUserMenus, setSavedDisabledUserMenus] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'admin' | 'user' | 'permissions'>('admin')

  // Permissions tab state
  const [roleMenus, setRoleMenus] = useState<Record<string, string[]>>(defaultRoleMenus)
  const [savedRoleMenus, setSavedRoleMenus] = useState<Record<string, string[]>>(defaultRoleMenus)
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [userMenuAccess, setUserMenuAccess] = useState<string[]>([])
  const [savingUser, setSavingUser] = useState(false)
  const [activeRole, setActiveRole] = useState<'admin' | 'agent' | 'revenueAdmin'>('admin')
  const [userSearch, setUserSearch] = useState('')

  const hasMenuChanges =
    JSON.stringify([...disabledMenus].sort()) !== JSON.stringify([...savedDisabledMenus].sort()) ||
    JSON.stringify([...disabledUserMenus].sort()) !== JSON.stringify([...savedDisabledUserMenus].sort())

  const hasRoleChanges = JSON.stringify(roleMenus) !== JSON.stringify(savedRoleMenus)
  const hasChanges = hasMenuChanges || hasRoleChanges

  useEffect(() => {
    fetchMenuSettings()
  }, [])

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  useEffect(() => {
    if (activeTab === 'permissions' && adminUsers.length === 0) {
      fetchAdminUsers()
    }
  }, [activeTab])

  async function fetchMenuSettings() {
    try {
      const res = await fetch('/api/admin/menu-settings')
      const data = await res.json()
      if (data.disabledMenus) {
        setDisabledMenus(data.disabledMenus)
        setSavedDisabledMenus(data.disabledMenus)
      }
      if (data.disabledUserMenus) {
        setDisabledUserMenus(data.disabledUserMenus)
        setSavedDisabledUserMenus(data.disabledUserMenus)
      }
      if (data.adminRoleMenus) {
        const merged = { ...defaultRoleMenus, ...data.adminRoleMenus }
        setRoleMenus(merged)
        setSavedRoleMenus(merged)
      }
    } catch {
      setMessage({ type: 'error', text: 'ไม่สามารถดึงข้อมูลเมนูได้' })
    } finally {
      setLoading(false)
    }
  }

  async function fetchAdminUsers() {
    setLoadingUsers(true)
    try {
      const res = await fetch('/api/admin/menu-settings?action=users')
      const data = await res.json()
      if (data.adminUsers) setAdminUsers(data.adminUsers)
    } catch {
      setMessage({ type: 'error', text: 'ไม่สามารถดึงรายชื่อแอดมินได้' })
    } finally {
      setLoadingUsers(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setMessage({ type: '', text: '' })
    try {
      const body: any = {}
      if (hasMenuChanges) {
        body.disabledMenus = disabledMenus
        body.disabledUserMenus = disabledUserMenus
      }
      if (hasRoleChanges) {
        body.adminRoleMenus = roleMenus
      }

      const res = await fetch('/api/admin/menu-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.success) {
        setSavedDisabledMenus([...disabledMenus])
        setSavedDisabledUserMenus([...disabledUserMenus])
        setSavedRoleMenus({ ...roleMenus })
        setMessage({ type: 'success', text: 'บันทึกการตั้งค่าเรียบร้อยแล้ว' })
      } else {
        setMessage({ type: 'error', text: data.error || 'การบันทึกล้มเหลว' })
      }
    } catch {
      setMessage({ type: 'error', text: 'การเชื่อมต่อล้มเหลว' })
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveUserAccess() {
    if (!selectedUser) return
    setSavingUser(true)
    try {
      const res = await fetch('/api/admin/menu-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id, adminMenuAccess: userMenuAccess.length > 0 ? userMenuAccess : null }),
      })
      const data = await res.json()
      if (data.success) {
        setAdminUsers(prev => prev.map(u => u.id === selectedUser.id ? data.user : u))
        setMessage({ type: 'success', text: `บันทึกสิทธิ์ ${selectedUser.name} เรียบร้อย` })
        setSelectedUser(null)
      } else {
        setMessage({ type: 'error', text: data.error || 'บันทึกล้มเหลว' })
      }
    } catch {
      setMessage({ type: 'error', text: 'การเชื่อมต่อล้มเหลว' })
    } finally {
      setSavingUser(false)
    }
  }

  function resetUserAccess() {
    if (!selectedUser) return
    handleSaveUserAccessReset()
  }

  async function handleSaveUserAccessReset() {
    if (!selectedUser) return
    setSavingUser(true)
    try {
      const res = await fetch('/api/admin/menu-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id, adminMenuAccess: null }),
      })
      const data = await res.json()
      if (data.success) {
        setAdminUsers(prev => prev.map(u => u.id === selectedUser.id ? data.user : u))
        setMessage({ type: 'success', text: `รีเซ็ตสิทธิ์ ${selectedUser.name} กลับเป็นค่าเริ่มต้นของยศ` })
        setSelectedUser(null)
      } else {
        setMessage({ type: 'error', text: data.error || 'รีเซ็ตล้มเหลว' })
      }
    } catch {
      setMessage({ type: 'error', text: 'การเชื่อมต่อล้มเหลว' })
    } finally {
      setSavingUser(false)
    }
  }

  function toggleAdminMenu(href: string) {
    if (protectedAdminMenus.includes(href)) return
    setDisabledMenus(prev =>
      prev.includes(href) ? prev.filter(m => m !== href) : [...prev, href]
    )
  }

  function toggleUserMenu(href: string) {
    if (protectedUserMenus.includes(href)) return
    setDisabledUserMenus(prev =>
      prev.includes(href) ? prev.filter(m => m !== href) : [...prev, href]
    )
  }

  function toggleAllAdmin(section: string, enable: boolean) {
    const sectionMenus = allAdminMenuItems
      .filter(m => m.section === section && !protectedAdminMenus.includes(m.href))
      .map(m => m.href)
    if (enable) {
      setDisabledMenus(prev => prev.filter(m => !sectionMenus.includes(m)))
    } else {
      setDisabledMenus(prev => [...new Set([...prev, ...sectionMenus])])
    }
  }

  function toggleAllUser(section: string, enable: boolean) {
    const sectionMenus = allUserMenuItems
      .filter(m => m.section === section && !protectedUserMenus.includes(m.href))
      .map(m => m.href)
    if (enable) {
      setDisabledUserMenus(prev => prev.filter(m => !sectionMenus.includes(m)))
    } else {
      setDisabledUserMenus(prev => [...new Set([...prev, ...sectionMenus])])
    }
  }

  function toggleRoleMenu(role: string, href: string) {
    setRoleMenus(prev => {
      const current = prev[role] || []
      if (current.includes(href)) {
        // Don't remove /admin — always required
        if (href === '/admin') return prev
        return { ...prev, [role]: current.filter(m => m !== href) }
      } else {
        return { ...prev, [role]: [...current, href] }
      }
    })
  }

  function setRoleAllMenus(role: string, enable: boolean) {
    if (enable) {
      setRoleMenus(prev => ({ ...prev, [role]: [...allAdminHrefs] }))
    } else {
      setRoleMenus(prev => ({ ...prev, [role]: ['/admin'] }))
    }
  }

  function selectUserForEdit(user: AdminUser) {
    setSelectedUser(user)
    if (user.adminMenuAccess && Array.isArray(user.adminMenuAccess)) {
      setUserMenuAccess([...user.adminMenuAccess])
    } else {
      // Pre-fill with role default
      const roleKey = getRoleKey(user)
      setUserMenuAccess([...(roleMenus[roleKey] || defaultRoleMenus[roleKey] || [])])
    }
  }

  function toggleUserMenuAccess(href: string) {
    if (href === '/admin') return
    setUserMenuAccess(prev =>
      prev.includes(href) ? prev.filter(m => m !== href) : [...prev, href]
    )
  }

  // Filter by search
  const filteredAdminMenus = allAdminMenuItems.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.href.toLowerCase().includes(search.toLowerCase()) ||
    item.description.toLowerCase().includes(search.toLowerCase())
  )
  const filteredUserMenus = allUserMenuItems.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.href.toLowerCase().includes(search.toLowerCase()) ||
    item.description.toLowerCase().includes(search.toLowerCase())
  )

  const adminRegular = filteredAdminMenus.filter(m => m.section === 'admin')
  const adminSuper = filteredAdminMenus.filter(m => m.section === 'super')
  const userMain = filteredUserMenus.filter(m => m.section === 'main')
  const userAccount = filteredUserMenus.filter(m => m.section === 'account')
  const userMarketplace = filteredUserMenus.filter(m => m.section === 'marketplace')

  const adminEnabledCount = allAdminMenuItems.filter(m => !disabledMenus.includes(m.href)).length
  const adminDisabledCount = disabledMenus.length
  const userEnabledCount = allUserMenuItems.filter(m => !disabledUserMenus.includes(m.href)).length
  const userDisabledCount = disabledUserMenus.length

  const filteredAdminUsers = adminUsers.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
        <p className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-widest">กำลังโหลดการตั้งค่าเมนู...</p>
      </div>
    )
  }

  function MenuRow({ item, isDisabled, isProtected, onToggle, colorActive, colorDisabled }: {
    item: MenuItem; isDisabled: boolean; isProtected: boolean;
    onToggle: () => void; colorActive: string; colorDisabled: string;
  }) {
    const Icon = item.icon
    return (
      <div
        className={`flex items-center gap-3 sm:gap-4 px-5 sm:px-6 py-4 transition-all ${
          isProtected ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/[0.02] cursor-pointer'
        }`}
        onClick={() => !isProtected && onToggle()}
      >
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
          isDisabled ? colorDisabled : colorActive
        }`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold tracking-tight truncate ${isDisabled ? 'text-zinc-600 line-through' : 'text-white'}`}>
              {item.name}
            </span>
            {isProtected && (
              <span className="px-1.5 py-0.5 bg-zinc-800 border border-white/10 rounded text-[9px] font-bold text-zinc-500 uppercase tracking-wider shrink-0">
                ล็อก
              </span>
            )}
            {isDisabled && !isProtected && (
              <span className="px-1.5 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-[9px] font-bold text-red-400 uppercase tracking-wider shrink-0">
                ปิดปรับปรุง
              </span>
            )}
          </div>
          <p className="text-[11px] text-zinc-600 font-medium truncate">{item.description} &bull; {item.href}</p>
        </div>
        <button
          disabled={isProtected}
          onClick={(e) => { e.stopPropagation(); if (!isProtected) onToggle() }}
          className="shrink-0"
        >
          {isDisabled ? (
            <ToggleLeft className="w-8 h-8 text-zinc-600 hover:text-zinc-400 transition-colors" />
          ) : (
            <ToggleRight className="w-8 h-8 text-emerald-400 hover:text-emerald-300 transition-colors" />
          )}
        </button>
      </div>
    )
  }

  function SectionBlock({ title, subtitle, items, disabledList, protectedList, onToggle, onToggleAll, sectionKey, iconColor, Icon: SectionIcon }: {
    title: string; subtitle: string; items: MenuItem[];
    disabledList: string[]; protectedList: string[];
    onToggle: (href: string) => void;
    onToggleAll: (section: string, enable: boolean) => void;
    sectionKey: string; iconColor: string; Icon: React.ElementType;
  }) {
    return (
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 sm:w-11 sm:h-11 ${iconColor} rounded-xl flex items-center justify-center shrink-0`}>
              <SectionIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">{title}</h3>
              <p className="text-[11px] sm:text-xs text-zinc-500 font-medium">{subtitle} ({items.length} เมนู)</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onToggleAll(sectionKey, true)}
              className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[11px] font-bold text-emerald-400 hover:bg-emerald-500/20 transition-all"
            >
              เปิดทั้งหมด
            </button>
            <button
              onClick={() => onToggleAll(sectionKey, false)}
              className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-[11px] font-bold text-red-400 hover:bg-red-500/20 transition-all"
            >
              ปิดทั้งหมด
            </button>
          </div>
        </div>
        <div className="divide-y divide-white/[0.03]">
          {items.map((item) => (
            <MenuRow
              key={item.href}
              item={item}
              isDisabled={disabledList.includes(item.href)}
              isProtected={protectedList.includes(item.href)}
              onToggle={() => onToggle(item.href)}
              colorActive={iconColor}
              colorDisabled="bg-red-500/10 border-red-500/20 text-red-400"
            />
          ))}
        </div>
      </div>
    )
  }

  // ===== Compact menu checkbox for permissions tab =====
  function MenuCheckbox({ item, checked, onChange, disabled }: {
    item: MenuItem; checked: boolean; onChange: () => void; disabled?: boolean;
  }) {
    const Icon = item.icon
    return (
      <div
        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
          disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-white/[0.03]'
        }`}
        onClick={() => !disabled && onChange()}
      >
        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
          checked
            ? 'bg-cyan-500 border-cyan-500'
            : 'bg-transparent border-zinc-600'
        }`}>
          {checked && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <Icon className={`w-4 h-4 shrink-0 ${checked ? 'text-zinc-300' : 'text-zinc-600'}`} />
        <span className={`text-xs font-medium truncate ${checked ? 'text-white' : 'text-zinc-500'}`}>
          {item.name}
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-28 sm:pb-12">
      {/* Toast */}
      {message.text && (
        <div className={`fixed bottom-20 sm:bottom-8 right-4 sm:right-8 left-4 sm:left-auto z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl transition-all ${
          message.type === 'success'
            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
            : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span className="font-semibold text-xs sm:text-sm">{message.text}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center border border-amber-500/20">
              <Construction className="w-4 h-4 text-amber-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">จัดการเมนู</h2>
          </div>
          <p className="text-zinc-500 text-xs sm:text-sm font-medium">เปิด/ปิดเมนู จัดการสิทธิ์เข้าถึงตามยศและรายบุคคล</p>
        </div>
        {(activeTab === 'admin' || activeTab === 'user' || hasRoleChanges) && (
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-amber-600 border border-amber-500/30 rounded-xl text-sm font-bold text-white hover:bg-amber-500 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'กำลังบันทึก...' : hasChanges ? 'บันทึกการเปลี่ยนแปลง' : 'ไม่มีการเปลี่ยนแปลง'}
          </button>
        )}
      </div>

      {/* Tab Switcher — 3 tabs */}
      <div className="flex bg-zinc-900/50 border border-white/5 rounded-xl p-1 gap-1">
        <button
          onClick={() => setActiveTab('admin')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-2 sm:px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'admin'
              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
              : 'text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">เมนู</span>แอดมิน
          {adminDisabledCount > 0 && (
            <span className="px-1.5 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-[9px] font-bold text-red-400">{adminDisabledCount}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('user')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-2 sm:px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'user'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">เมนู</span>ผู้ใช้
          {userDisabledCount > 0 && (
            <span className="px-1.5 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-[9px] font-bold text-red-400">{userDisabledCount}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('permissions')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-2 sm:px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'permissions'
              ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
              : 'text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <UserCog className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          จัดการสิทธิ์
        </button>
      </div>

      {/* ═══════════════ ADMIN MENU TAB ═══════════════ */}
      {activeTab === 'admin' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5 flex items-center gap-3">
              <div className="w-10 h-10 text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-zinc-500 font-medium truncate">เมนูแอดมินทั้งหมด</p>
                <p className="text-sm sm:text-base font-bold text-white">{allAdminMenuItems.length} เมนู</p>
              </div>
            </div>
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5 flex items-center gap-3">
              <div className="w-10 h-10 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center shrink-0">
                <Eye className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-zinc-500 font-medium truncate">เปิดใช้งาน</p>
                <p className="text-sm sm:text-base font-bold text-emerald-400">{adminEnabledCount} เมนู</p>
              </div>
            </div>
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5 flex items-center gap-3 col-span-2 lg:col-span-1">
              <div className="w-10 h-10 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center shrink-0">
                <EyeOff className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-zinc-500 font-medium truncate">ปิดปรับปรุง</p>
                <p className="text-sm sm:text-base font-bold text-red-400">{adminDisabledCount} เมนู</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาเมนูแอดมิน..."
              className="w-full bg-zinc-900/50 border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:border-amber-500/50 transition-all font-medium"
            />
          </div>

          <div className="space-y-5 sm:space-y-6">
            <SectionBlock
              title="เมนูแอดมินทั่วไป"
              subtitle="เมนูหลักในแผงควบคุม"
              items={adminRegular}
              disabledList={disabledMenus}
              protectedList={protectedAdminMenus}
              onToggle={toggleAdminMenu}
              onToggleAll={toggleAllAdmin}
              sectionKey="admin"
              iconColor="text-blue-400 bg-blue-500/10 border border-blue-500/20"
              Icon={LayoutDashboard}
            />
            <SectionBlock
              title="เมนู Super Admin"
              subtitle="เมนูสำหรับผู้ดูแลระบบระดับสูง"
              items={adminSuper}
              disabledList={disabledMenus}
              protectedList={protectedAdminMenus}
              onToggle={toggleAdminMenu}
              onToggleAll={toggleAllAdmin}
              sectionKey="super"
              iconColor="text-amber-400 bg-amber-500/10 border border-amber-500/20"
              Icon={Shield}
            />
          </div>
        </>
      )}

      {/* ═══════════════ USER MENU TAB ═══════════════ */}
      {activeTab === 'user' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5 flex items-center gap-3">
              <div className="w-10 h-10 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-zinc-500 font-medium truncate">เมนูผู้ใช้ทั้งหมด</p>
                <p className="text-sm sm:text-base font-bold text-white">{allUserMenuItems.length} เมนู</p>
              </div>
            </div>
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5 flex items-center gap-3">
              <div className="w-10 h-10 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center shrink-0">
                <Eye className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-zinc-500 font-medium truncate">เปิดใช้งาน</p>
                <p className="text-sm sm:text-base font-bold text-emerald-400">{userEnabledCount} เมนู</p>
              </div>
            </div>
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5 flex items-center gap-3 col-span-2 lg:col-span-1">
              <div className="w-10 h-10 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center shrink-0">
                <EyeOff className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-zinc-500 font-medium truncate">ปิดปรับปรุง</p>
                <p className="text-sm sm:text-base font-bold text-red-400">{userDisabledCount} เมนู</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาเมนูผู้ใช้..."
              className="w-full bg-zinc-900/50 border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:border-amber-500/50 transition-all font-medium"
            />
          </div>

          <div className="space-y-5 sm:space-y-6">
            <SectionBlock
              title="เมนูหลัก"
              subtitle="เมนูสาธารณะสำหรับผู้ใช้ทั่วไป"
              items={userMain}
              disabledList={disabledUserMenus}
              protectedList={protectedUserMenus}
              onToggle={toggleUserMenu}
              onToggleAll={toggleAllUser}
              sectionKey="main"
              iconColor="text-blue-400 bg-blue-500/10 border border-blue-500/20"
              Icon={Home}
            />
            <SectionBlock
              title="บัญชีของฉัน"
              subtitle="เมนูสำหรับผู้ใช้ที่ล็อกอินแล้ว"
              items={userAccount}
              disabledList={disabledUserMenus}
              protectedList={protectedUserMenus}
              onToggle={toggleUserMenu}
              onToggleAll={toggleAllUser}
              sectionKey="account"
              iconColor="text-violet-400 bg-violet-500/10 border border-violet-500/20"
              Icon={User}
            />
            <SectionBlock
              title="ตลาดซื้อขาย"
              subtitle="ระบบตัวแทนจำหน่าย"
              items={userMarketplace}
              disabledList={disabledUserMenus}
              protectedList={protectedUserMenus}
              onToggle={toggleUserMenu}
              onToggleAll={toggleAllUser}
              sectionKey="marketplace"
              iconColor="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
              Icon={Store}
            />
          </div>
        </>
      )}

      {/* ═══════════════ PERMISSIONS TAB ═══════════════ */}
      {activeTab === 'permissions' && (
        <div className="space-y-6 sm:space-y-8">
          {/* ---- Section 1: Role-based permissions ---- */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-violet-500/10 rounded-lg flex items-center justify-center border border-violet-500/20">
                <Shield className="w-4 h-4 text-violet-400" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">สิทธิ์ตามยศ</h3>
                <p className="text-[11px] sm:text-xs text-zinc-500 font-medium">กำหนดเมนูที่แต่ละยศเข้าถึงได้ (Super Admin เข้าถึงทุกเมนูเสมอ)</p>
              </div>
            </div>

            {/* Role tabs */}
            <div className="flex bg-zinc-900/50 border border-white/5 rounded-xl p-1 gap-1">
              <button
                onClick={() => setActiveRole('admin')}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  activeRole === 'admin'
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    : 'text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                Admin
                <span className="text-[10px] font-mono text-zinc-600">
                  {(roleMenus.admin || []).length}/{allAdminHrefs.length}
                </span>
              </button>
              <button
                onClick={() => setActiveRole('agent')}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  activeRole === 'agent'
                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                    : 'text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                Agent
                <span className="text-[10px] font-mono text-zinc-600">
                  {(roleMenus.agent || []).length}/{allAdminHrefs.length}
                </span>
              </button>
              <button
                onClick={() => setActiveRole('revenueAdmin')}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  activeRole === 'revenueAdmin'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <span className="hidden sm:inline">Revenue</span> Admin
                <span className="text-[10px] font-mono text-zinc-600">
                  {(roleMenus.revenueAdmin || []).length}/{allAdminHrefs.length}
                </span>
              </button>
            </div>

            {/* Role menu checkboxes */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight">
                    เมนูที่ {activeRole === 'admin' ? 'Admin' : activeRole === 'agent' ? 'Agent' : 'Revenue Admin'} เข้าถึงได้
                  </h4>
                  <p className="text-[11px] text-zinc-500 font-medium">
                    เลือก {(roleMenus[activeRole] || []).length} จาก {allAdminHrefs.length} เมนู
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setRoleAllMenus(activeRole, true)}
                    className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[11px] font-bold text-emerald-400 hover:bg-emerald-500/20 transition-all"
                  >
                    เลือกทั้งหมด
                  </button>
                  <button
                    onClick={() => setRoleAllMenus(activeRole, false)}
                    className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-[11px] font-bold text-red-400 hover:bg-red-500/20 transition-all"
                  >
                    ล้างทั้งหมด
                  </button>
                  <button
                    onClick={() => setRoleMenus(prev => ({ ...prev, [activeRole]: [...(defaultRoleMenus[activeRole] || [])] }))}
                    className="px-3 py-1.5 bg-zinc-800 border border-white/10 rounded-lg text-[11px] font-bold text-zinc-400 hover:text-white transition-all"
                  >
                    ค่าเริ่มต้น
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 p-2 sm:p-3 gap-0.5">
                {allAdminMenuItems.filter(m => m.section === 'admin').map(item => (
                  <MenuCheckbox
                    key={item.href}
                    item={item}
                    checked={(roleMenus[activeRole] || []).includes(item.href)}
                    onChange={() => toggleRoleMenu(activeRole, item.href)}
                    disabled={item.href === '/admin'}
                  />
                ))}
              </div>
            </div>

            {/* Save role changes */}
            {hasRoleChanges && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-violet-600 border border-violet-500/30 rounded-xl text-sm font-bold text-white hover:bg-violet-500 transition-all active:scale-95 disabled:opacity-40"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                บันทึกสิทธิ์ตามยศ
              </button>
            )}
          </div>

          {/* ---- Section 2: Per-user permissions ---- */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-cyan-500/10 rounded-lg flex items-center justify-center border border-cyan-500/20">
                <UserCog className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">สิทธิ์รายบุคคล</h3>
                <p className="text-[11px] sm:text-xs text-zinc-500 font-medium">กำหนดเมนูเฉพาะสำหรับแอดมินแต่ละคน (จะ override สิทธิ์ตามยศ)</p>
              </div>
            </div>

            {loadingUsers ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* User search */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="ค้นหาชื่อหรืออีเมลแอดมิน..."
                    className="w-full bg-zinc-900/50 border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:border-cyan-500/50 transition-all font-medium"
                  />
                </div>

                {/* User cards */}
                <div className="space-y-2.5">
                  {filteredAdminUsers.map(user => {
                    const badge = getRoleBadge(user)
                    const hasCustom = user.adminMenuAccess && Array.isArray(user.adminMenuAccess)
                    const roleKey = getRoleKey(user)
                    const roleDefault = roleMenus[roleKey] || defaultRoleMenus[roleKey] || []
                    const currentAccess = hasCustom ? (user.adminMenuAccess as string[]) : roleDefault

                    return (
                      <div
                        key={user.id}
                        className={`bg-zinc-900/50 border rounded-2xl transition-all ${
                          selectedUser?.id === user.id
                            ? 'border-cyan-500/30 ring-1 ring-cyan-500/10'
                            : 'border-white/5 hover:border-white/10'
                        }`}
                      >
                        <div
                          className={`flex items-center gap-3 sm:gap-4 p-4 sm:p-5 ${user.isSuperAdmin ? 'opacity-50' : 'cursor-pointer'}`}
                          onClick={() => !user.isSuperAdmin && (selectedUser?.id === user.id ? setSelectedUser(null) : selectUserForEdit(user))}
                        >
                          <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 border ${badge.color}`}>
                            <User className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-white truncate">{user.name}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border shrink-0 ${badge.color}`}>
                                {badge.label}
                              </span>
                              {hasCustom && (
                                <span className="px-1.5 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded text-[9px] font-bold text-cyan-400 uppercase tracking-wider shrink-0">
                                  กำหนดเอง
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-zinc-600 font-medium truncate">{user.email}</p>
                            <p className="text-[10px] text-zinc-700 font-medium mt-0.5">
                              เข้าถึง {currentAccess.length} เมนู
                              {user.isSuperAdmin && ' (ทุกเมนู)'}
                            </p>
                          </div>
                          {!user.isSuperAdmin && (
                            <div className="shrink-0">
                              {selectedUser?.id === user.id ? (
                                <ChevronUp className="w-5 h-5 text-cyan-400" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-zinc-600" />
                              )}
                            </div>
                          )}
                        </div>

                        {/* Expanded user menu editor */}
                        {selectedUser?.id === user.id && !user.isSuperAdmin && (
                          <div className="border-t border-white/5 p-4 sm:p-5 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <p className="text-xs text-zinc-400 font-medium">
                                เลือกเมนูที่ <span className="text-white font-bold">{user.name}</span> สามารถเข้าถึงได้
                              </p>
                              <div className="flex gap-2 flex-wrap">
                                <button
                                  onClick={() => setUserMenuAccess([...allAdminHrefs])}
                                  className="px-2.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[10px] font-bold text-emerald-400 hover:bg-emerald-500/20 transition-all"
                                >
                                  เลือกทั้งหมด
                                </button>
                                <button
                                  onClick={() => setUserMenuAccess(['/admin'])}
                                  className="px-2.5 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-[10px] font-bold text-red-400 hover:bg-red-500/20 transition-all"
                                >
                                  ล้าง
                                </button>
                                <button
                                  onClick={() => setUserMenuAccess([...(roleMenus[roleKey] || defaultRoleMenus[roleKey] || [])])}
                                  className="px-2.5 py-1.5 bg-zinc-800 border border-white/10 rounded-lg text-[10px] font-bold text-zinc-400 hover:text-white transition-all"
                                >
                                  ค่าเริ่มต้นยศ
                                </button>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0.5 bg-white/[0.01] rounded-xl p-1.5">
                              {allAdminMenuItems.filter(m => m.section === 'admin').map(item => (
                                <MenuCheckbox
                                  key={item.href}
                                  item={item}
                                  checked={userMenuAccess.includes(item.href)}
                                  onChange={() => toggleUserMenuAccess(item.href)}
                                  disabled={item.href === '/admin'}
                                />
                              ))}
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                              <button
                                onClick={handleSaveUserAccess}
                                disabled={savingUser}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-600 border border-cyan-500/30 rounded-xl text-xs sm:text-sm font-bold text-white hover:bg-cyan-500 transition-all active:scale-[0.98] disabled:opacity-40"
                              >
                                {savingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                บันทึกสิทธิ์ {user.name}
                              </button>
                              {hasCustom && (
                                <button
                                  onClick={resetUserAccess}
                                  disabled={savingUser}
                                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-800 border border-white/10 rounded-xl text-xs sm:text-sm font-bold text-zinc-400 hover:text-white transition-all active:scale-[0.98] disabled:opacity-40"
                                >
                                  <RotateCw className="w-3.5 h-3.5" />
                                  รีเซ็ตกลับเป็นค่ายศ
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {filteredAdminUsers.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-10 h-10 text-zinc-800 mx-auto mb-3" />
                    <p className="text-sm text-zinc-600 font-medium">
                      {userSearch ? 'ไม่พบแอดมินที่ค้นหา' : 'ไม่มีแอดมินในระบบ'}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Info box */}
      {activeTab !== 'permissions' && (
        <div className="bg-gradient-to-br from-amber-600/[0.06] to-transparent border border-amber-500/10 rounded-2xl p-5 sm:p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">คำแนะนำ</h3>
          </div>
          <ul className="text-xs text-zinc-400 font-medium leading-relaxed space-y-1.5 ml-12">
            <li>&bull; <span className="text-blue-400 font-bold">เมนูแอดมิน</span> ที่ปิดจะแสดงป้าย &quot;ปิด&quot; ใน Sidebar และแอดมินทั่วไปจะไม่สามารถเข้าถึงได้ (Super Admin ยังเข้าได้)</li>
            <li>&bull; <span className="text-emerald-400 font-bold">เมนูผู้ใช้</span> ที่ปิดจะถูกซ่อนจาก Navbar ของผู้ใช้ทั้งหมด และเมนูบนหน้าเว็บจะไม่แสดง</li>
            <li>&bull; เมนู <span className="text-amber-400 font-bold">หน้าแรก</span>, <span className="text-amber-400 font-bold">ภาพรวม</span>, <span className="text-amber-400 font-bold">ตั้งค่าระบบ</span> ไม่สามารถปิดได้</li>
          </ul>
        </div>
      )}

      {activeTab === 'permissions' && (
        <div className="bg-gradient-to-br from-violet-600/[0.06] to-transparent border border-violet-500/10 rounded-2xl p-5 sm:p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-violet-500/10 border border-violet-500/20 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-violet-400" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">วิธีทำงาน</h3>
          </div>
          <ul className="text-xs text-zinc-400 font-medium leading-relaxed space-y-1.5 ml-12">
            <li>&bull; <span className="text-violet-400 font-bold">สิทธิ์ตามยศ</span> — กำหนดเมนูเริ่มต้นสำหรับแต่ละยศ (Admin / Agent / Revenue Admin)</li>
            <li>&bull; <span className="text-cyan-400 font-bold">สิทธิ์รายบุคคล</span> — กำหนดเมนูเฉพาะสำหรับแอดมินคนใดคนหนึ่ง (จะ override สิทธิ์ยศ)</li>
            <li>&bull; <span className="text-amber-400 font-bold">Super Admin</span> เข้าถึงทุกเมนูเสมอ ไม่สามารถจำกัดสิทธิ์ได้</li>
            <li>&bull; เมนู &quot;ภาพรวม&quot; (<span className="font-mono text-zinc-500">/admin</span>) เป็นเมนูบังคับ ทุกยศต้องมี</li>
            <li>&bull; ถ้าตั้ง &quot;สิทธิ์รายบุคคล&quot; แล้วต้องการกลับไปใช้สิทธิ์ตามยศ กดปุ่ม &quot;รีเซ็ตกลับเป็นค่ายศ&quot;</li>
          </ul>
        </div>
      )}

      {/* Mobile Floating Save Bar */}
      {(activeTab === 'admin' || activeTab === 'user' || hasRoleChanges) && (
        <div className="fixed bottom-0 left-0 right-0 sm:hidden z-50 p-3 bg-black/80 backdrop-blur-xl border-t border-white/5">
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="w-full flex items-center justify-center gap-2 py-3 bg-amber-600 border border-amber-500/30 rounded-xl text-sm font-bold text-white active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'กำลังบันทึก...' : hasChanges ? 'บันทึกการเปลี่ยนแปลง' : 'ไม่มีการเปลี่ยนแปลง'}
          </button>
        </div>
      )}
    </div>
  )
}
