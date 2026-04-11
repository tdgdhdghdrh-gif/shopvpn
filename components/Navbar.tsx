'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Menu, X, Wifi, LogOut, LogIn, User, Shield, Server, 
  ChevronRight, Home, Users, PlusCircle, Wallet, History, ShoppingBag, Settings,
  Globe, LayoutDashboard, CreditCard, Gift, Ticket, Store, ShoppingCart, MessageSquare,
  Info, Check, Clock, ArrowRightLeft, Trophy, Star, AlertTriangle, Smartphone, Megaphone,
  BookOpen, FileText, Image as ImageIcon, Maximize2,
  RotateCcw, Calendar, Crown, Target, Activity, Bell, Percent,
  // Icon Picker 100+
  Heart, ThumbsUp, ThumbsDown, Bookmark, Share2, Send, Search,
  Lock, Unlock, Key, Link2, ExternalLink,
  Camera, Video, Music, Headphones, Mic,
  Mail, Phone, MapPin, Navigation, Compass,
  File, Folder, FolderOpen, Clipboard, PenTool,
  Cloud, Sun, Moon, Flame, Snowflake, Droplets,
  Coffee, Pizza, Cake, Apple, Wine,
  Car, Plane, Rocket, Anchor, Ship,
  Code, Terminal, Database, Cpu, HardDrive,
  Palette, Paintbrush, Sparkles, Wand2, PartyPopper,
  Tag, Hash, AtSign, QrCode, Fingerprint, ScanLine,
  Gamepad2, Dumbbell, GraduationCap, Stethoscope, Briefcase, Building2,
  Newspaper, Radio, Tv, Projector, Presentation,
  TrendingUp, TrendingDown, BarChart3, PieChart, LineChart,
  Package, Truck, Box, Receipt, Banknote, Coins,
  AlertCircle, HelpCircle, Ban, CheckCircle2, XCircle,
  Power, RefreshCw, Repeat, Shuffle, FastForward, Rewind,
  Volume2, VolumeX, BellRing, BellOff,
  UserPlus, UserMinus, UserCheck, UsersRound,
  Layers, Scan, Focus, Lightbulb, Gem, Diamond, Award, Medal, BadgeCheck,
  Monitor, Play, Pause, Download, Upload,
  ToggleLeft, ToggleRight,
  Globe2, Languages, Flag, Map, Milestone,
  Inbox, MailOpen, Forward, Reply, Archive,
  Clapperboard, Drama, Popcorn,
  Siren, ShieldAlert, ShieldCheck, KeyRound,
  CircleDot, Circle, Square, Triangle, Hexagon, Octagon, Pentagon,
  WifiOff, Bluetooth, Signal, SignalHigh,
  Battery, BatteryCharging, BatteryFull,
  Thermometer, Gauge, Timer, Hourglass, AlarmClock,
  Stamp, Sticker, Type, Bold, Italic,
  ListOrdered, ListChecks, ListTree,
  PanelLeft, PanelRight, PanelTop, SidebarOpen,
  Ratio, Rows3, Columns3, Grid3x3,
  Bone, Brain, Ear, HandMetal, Footprints,
  Tent, TreePine, Mountain, Waves, Wind, Umbrella,
  Bug, Cat, Dog, Fish, Bird, Flower2,
  Shirt, Watch, Scissors, Wrench, Hammer, Plug,
  Pencil, Eraser, Ruler, Calculator, Binary,
  ArrowUp, ArrowDown, ArrowRight, ArrowLeft,
  GripVertical,
} from 'lucide-react'
import { logoutAction } from '@/lib/actions'
import OnboardingAutoTour from '@/components/OnboardingAutoTour'
import { useSettings } from '@/components/SettingsProvider'

interface MenuItem {
  href: string
  icon: any
  label: string
  color?: string
  section?: string
  description: string
  menuId: string
  isNew?: boolean
}

// Icon map for dynamic config (string name -> component) — รองรับ 100+ icons จาก Icon Picker
const iconMap: Record<string, any> = {
  // ทั่วไป
  Home, Globe, Globe2, Star, Heart, Bookmark, Share2, Send, Search, Glasses: Focus,
  Lightbulb, Zap: Activity, Power, Sparkles, Wand2, PartyPopper, Flag,
  ThumbsUp, ThumbsDown,
  // ช็อป & การเงิน
  CreditCard, ShoppingBag, ShoppingCart, Store, Wallet, Banknote, Coins, Receipt, Package, Truck, Box, Tag, Percent,
  // สื่อสาร
  MessageSquare, Mail, MailOpen, Phone, Bell, BellRing, BellOff, Megaphone, Ticket, Mic, Radio,
  Inbox, Forward, Reply, Archive,
  // สถานะ & ความปลอดภัย
  AlertTriangle, AlertCircle, Info, HelpCircle, Ban, CheckCircle2, XCircle,
  Shield, ShieldAlert, ShieldCheck, Lock, Unlock, Key, KeyRound, Fingerprint, ScanLine, Siren,
  // ผู้ใช้
  User, Users, UsersRound, UserPlus, UserMinus, UserCheck, Crown, BadgeCheck,
  GraduationCap, Briefcase, Stethoscope,
  // สื่อ & ไฟล์
  Image: ImageIcon, Camera, Video, Music, Headphones, FileText, File,
  Folder, FolderOpen, Clipboard, PenTool, Pencil, Eraser,
  BookOpen, Newspaper, Tv, Clapperboard, Projector, Presentation, Drama,
  // เครื่องมือ & เทค
  Settings, Monitor, Code, Terminal, Database, Server, Cpu, HardDrive, Wifi, WifiOff, Cloud, QrCode,
  LayoutDashboard, Layers, Link2, ExternalLink, Plug, Wrench, Hammer, Scissors,
  Calculator, Binary, Ruler,
  // กราฟ & สถิติ
  TrendingUp, TrendingDown, BarChart3, PieChart, LineChart, Activity, Target, Gauge,
  // เวลา & ปฏิทิน
  Clock, Calendar, History, RefreshCw, RotateCcw, Repeat, Timer, Hourglass, AlarmClock,
  // ลูกศร & ทิศทาง
  ArrowUp, ArrowDown, ArrowRight, ArrowLeft, ArrowRightLeft, Navigation, Compass, MapPin,
  Map, Milestone,
  // ธรรมชาติ & สัตว์
  Sun, Moon, Flame, Snowflake, Droplets, Wind, Umbrella, Waves, Mountain, TreePine, Tent,
  Flower2, Bug, Cat, Dog, Fish, Bird,
  // อาหาร & เครื่องดื่ม
  Coffee, Pizza, Cake, Apple, Wine,
  // ยานพาหนะ
  Car, Plane, Rocket, Anchor, Ship,
  // ความบันเทิง & กีฬา
  Gamepad2, Dumbbell, Trophy, Gift, Shuffle, Play, Pause,
  // แฟชั่น & ร่างกาย
  Shirt, Watch, Bone, Brain, Ear, HandMetal, Footprints,
  // Layout & UI
  Menu, PanelLeft, PanelRight, PanelTop, SidebarOpen,
  Grid3x3, Rows3, Columns3, Ratio,
  ListOrdered, ListChecks, ListTree, Maximize2, GripVertical,
  // ข้อความ & ฟอนต์
  Type, Bold, Italic, Stamp, Sticker, Languages,
  // รูปทรง
  CircleDot, Circle, Square, Triangle, Hexagon, Octagon, Pentagon,
  // แบตเตอรี่ & สัญญาณ
  Battery, BatteryCharging, BatteryFull, Signal, SignalHigh, Bluetooth, Thermometer,
  // เสียง
  Volume2, VolumeX,
  // อื่นๆ
  Hash, AtSign, Palette, Paintbrush, Gem, Diamond, Award, Medal,
  Building2, Scan, Focus, Download, Upload,
  FastForward, Rewind, X, Smartphone,
  Plus: PlusCircle, Minus: Info, Eye: Info,
  // Navbar-specific icons
  LogOut, LogIn,
}

// Config types from hamburger-menu admin
interface HamburgerMenuItemConfig {
  href: string
  label: string
  iconName: string
  color: string
  section: string
  visible: boolean
  isNew: boolean
}

interface HamburgerSectionConfig {
  id: string
  label: string
  color: string
  items: HamburgerMenuItemConfig[]
}

interface HamburgerConfig {
  sections: HamburgerSectionConfig[]
  menuStyle?: {
    animation: string
    animationEnabled: boolean
    backdropBlur: boolean
    backdropOpacity: number
    position: string // 'right' | 'left' | 'full'
  }
  navbarIcons?: {
    walletIcon: string
    menuIcon: string
    menuCloseIcon: string
  }
}

// Animation class map
const animationClassMap: Record<string, string> = {
  'slide-right': 'animate-hb-slide-right',
  'slide-left': 'animate-hb-slide-left',
  'slide-bottom': 'animate-hb-slide-bottom',
  'slide-top': 'animate-hb-slide-top',
  'fade': 'animate-hb-fade',
  'scale': 'animate-hb-scale',
  'flip': 'animate-hb-flip',
  'blur': 'animate-hb-blur',
  'bounce': 'animate-hb-bounce',
  'none': 'animate-hb-none',
}

const menuItems: MenuItem[] = [
  { href: '/', icon: Home, label: 'หน้าแรก', section: 'main', description: 'หน้าหลัก - เลือกเซิร์ฟเวอร์ VPN', menuId: 'menu-home' },
  { href: '/public-vless', icon: Globe, label: 'Free VLESS', color: 'text-emerald-400', section: 'main', description: 'ทดลองใช้ VPN ฟรี', menuId: 'menu-public-vless' },
  { href: '/setup-guide', icon: Smartphone, label: 'โปรเสริมที่ต้องสมัคร', color: 'text-cyan-400', section: 'main', description: 'สมัครโปรกันรั่ว AIS / True Zoom ก่อนใช้ VPN', menuId: 'menu-setup-guide', isNew: true },
  { href: '/topup', icon: CreditCard, label: 'เติมเงินเข้าระบบ', color: 'text-amber-400', section: 'main', description: 'เติมเงินขั้นต่ำ 50 บาท ผ่าน TrueMoney หรือสลิปธนาคาร', menuId: 'menu-topup' },
  { href: '/leaderboard', icon: Trophy, label: 'อันดับผู้ใช้', color: 'text-yellow-400', section: 'main', description: 'อันดับผู้ใช้เติมเงินสูงสุด พร้อมสลิป', menuId: 'menu-leaderboard', isNew: true },
  { href: '/reviews', icon: Star, label: 'รีวิวจากผู้ใช้', color: 'text-violet-400', section: 'main', description: 'อ่านรีวิวจากผู้ใช้งานจริง ให้ดาว ไลค์ แนบรูป', menuId: 'menu-reviews', isNew: true },
  { href: '/report-slow', icon: AlertTriangle, label: 'แจ้งปัญหาเน็ตช้า', color: 'text-rose-400', section: 'main', description: 'โหวตเซิร์ฟเวอร์ที่มีปัญหา ช่วยแอดมินแก้ไข', menuId: 'menu-report-slow', isNew: true },
  { href: '/contacts', icon: Users, label: 'รายชื่อแอดมิน', color: 'text-blue-400', section: 'main', description: 'ติดต่อแอดมินผ่าน Facebook ได้ตลอด 24 ชม.', menuId: 'menu-contacts', isNew: true },
  { href: '/announcements', icon: Megaphone, label: 'ประกาศข่าวสาร', color: 'text-cyan-400', section: 'main', description: 'ข่าวสาร อัพเดท โปรโมชั่น', menuId: 'menu-announcements', isNew: true },
  { href: '/blog', icon: BookOpen, label: 'บทความ & เคล็ดลับ', color: 'text-cyan-400', section: 'main', description: 'อ่านบทความ เคล็ดลับ VPN รีวิวแอป', menuId: 'menu-blog', isNew: true },
  { href: '/lucky-wheel', icon: RotateCcw, label: 'กงล้อนำโชค', color: 'text-yellow-400', section: 'main', description: 'หมุนฟรีวันละ 1 ครั้ง ลุ้นรางวัลมากมาย!', menuId: 'menu-lucky-wheel', isNew: true },
  { href: '/daily-checkin', icon: Calendar, label: 'เช็คอินรายวัน', color: 'text-emerald-400', section: 'main', description: 'เช็คอินทุกวันรับเครดิตฟรี!', menuId: 'menu-daily-checkin', isNew: true },
  { href: '/server-compare', icon: Activity, label: 'เปรียบเทียบเซิร์ฟเวอร์', color: 'text-blue-400', section: 'main', description: 'เทียบ Ping, Speed, Load ก่อนซื้อ', menuId: 'menu-server-compare', isNew: true },
  { href: '/coupons', icon: Percent, label: 'คูปองส่วนลด', color: 'text-amber-400', section: 'main', description: 'กรอกโค้ดคูปองรับเครดิตฟรี!', menuId: 'menu-coupons', isNew: true },
  { href: '/referral-leaderboard', icon: Trophy, label: 'อันดับนักแนะนำ', color: 'text-pink-400', section: 'main', description: 'ชวนเพื่อนมาใช้งาน ลุ้นอันดับ!', menuId: 'menu-referral-leaderboard', isNew: true },
  { href: '/premium-apps', icon: Package, label: 'ซื้อของ', color: 'text-violet-400', section: 'main', description: 'ซื้อสินค้าคุณภาพ ใช้ได้ทันที', menuId: 'menu-premium-apps', isNew: true },
  { href: '/vip', icon: Crown, label: 'สมาชิก VIP', color: 'text-amber-400', section: 'account', description: 'ดูระดับ VIP และสิทธิพิเศษของคุณ', menuId: 'menu-vip', isNew: true },
  { href: '/missions', icon: Target, label: 'ภารกิจ & ความสำเร็จ', color: 'text-violet-400', section: 'account', description: 'สะสม Badge ปลดล็อกความสำเร็จ!', menuId: 'menu-missions', isNew: true },
  { href: '/gift', icon: Gift, label: 'ส่งของขวัญ', color: 'text-pink-400', section: 'account', description: 'ส่งเครดิตให้เพื่อนด้วยรหัสของขวัญ', menuId: 'menu-gift', isNew: true },
  { href: '/notifications', icon: Bell, label: 'แจ้งเตือน', color: 'text-blue-400', section: 'account', description: 'ดูการแจ้งเตือนและข้อความของคุณ', menuId: 'menu-notifications', isNew: true },
  { href: '/profile/orders', icon: ShoppingBag, label: 'รายการสั่งซื้อ VPN', section: 'account', description: 'ดูประวัติการซื้อ VPN ของคุณ', menuId: 'menu-profile-orders' },
  { href: '/profile/connections', icon: Wifi, label: 'การเชื่อมต่อ VPN', color: 'text-violet-400', section: 'account', description: 'ดู IP ที่เชื่อมต่อ, เปิด/ปิด VPN, ดูสถิติ Traffic', menuId: 'menu-profile-connections', isNew: true },
  { href: '/profile/renew', icon: Clock, label: 'ต่ออายุ VPN', color: 'text-cyan-400', section: 'account', description: 'ต่ออายุโค้ด VPN ที่มีอยู่', menuId: 'menu-profile-renew' },
  { href: '/profile/exchange', icon: ArrowRightLeft, label: 'แลกเปลี่ยนเซิร์ฟเวอร์', color: 'text-orange-400', section: 'account', description: 'ย้าย VPN ไปเซิร์ฟเวอร์อื่น', menuId: 'menu-profile-exchange', isNew: true },
  { href: '/profile/topups', icon: History, label: 'ประวัติการเติมเงิน', section: 'account', description: 'ดูรายละเอียดการเติมเงินของคุณ', menuId: 'menu-profile-topups' },
  { href: '/profile', icon: User, label: 'ตั้งค่าโปรไฟล์', section: 'account', description: 'แก้ไขข้อมูลส่วนตัวและรหัสผ่าน', menuId: 'menu-profile' },
  { href: '/profile/referral', icon: Gift, label: 'เชิญเพื่อน', color: 'text-pink-400', section: 'account', description: 'แนะนำเพื่อนรับ 20 บาทต่อคน', menuId: 'menu-profile-referral' },
  { href: '/tickets', icon: Ticket, label: 'ติดต่อแอดมิน', color: 'text-violet-400', section: 'account', description: 'สร้างตั๋วติดต่อทีมงาน 24/7', menuId: 'menu-tickets' },
  { href: '/chat', icon: MessageSquare, label: 'แชทสด', color: 'text-cyan-400', section: 'account', description: 'พูดคุยกับทีมงานได้ทันที', menuId: 'menu-chat' },
  { href: '/reseller/register', icon: Store, label: 'ลงทะเบียนฝากขาย', color: 'text-emerald-400', section: 'marketplace', description: 'สมัครเป็นตัวแทนจำหน่าย รับค่าคอมมิชชั่น', menuId: 'menu-reseller-register' },
  { href: '/reseller/panel', icon: LayoutDashboard, label: 'จัดการร้านค้า', color: 'text-emerald-400', section: 'marketplace', description: 'หน้าจัดการร้านค้าของคุณ', menuId: 'menu-reseller-panel' },
  { href: '/ads', icon: Megaphone, label: 'ลงโฆษณา', color: 'text-orange-400', section: 'marketplace', description: 'ฝากลงโฆษณาบนเว็บไซต์ วันละ 3 บาท', menuId: 'menu-ads', isNew: true },
]

const adminMenuItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'แดชบอร์ดแอดมิน', color: 'text-purple-400', description: 'ภาพรวมระบบ ดูสถิติต่างๆ', menuId: 'menu-admin' },
  { href: '/admin/vpn', icon: Server, label: 'จัดการเซิร์ฟเวอร์', color: 'text-purple-400', description: 'เพิ่ม แก้ไข ลบเซิร์ฟเวอร์', menuId: 'menu-admin-vpn' },
  { href: '/admin/users', icon: Users, label: 'จัดการสมาชิก', color: 'text-purple-400', description: 'ดูและจัดการผู้ใช้งาน', menuId: 'menu-admin-users' },
  { href: '/admin/withdrawals', icon: Wallet, label: 'คำขอถอนเงิน', color: 'text-purple-400', description: 'อนุมัติ/ปฏิเสธการถอนเงิน', menuId: 'menu-admin-withdrawals' },
  { href: '/admin/blog', icon: FileText, label: 'จัดการบทความ', color: 'text-purple-400', description: 'เขียน แก้ไข จัดการบทความ Blog', menuId: 'menu-admin-blog' },
  { href: '/admin/banners', icon: ImageIcon, label: 'แบนเนอร์โปรโมชั่น', color: 'text-purple-400', description: 'จัดการป้ายโปรโมทหน้าแรก', menuId: 'menu-admin-banners' },
  { href: '/admin/popups', icon: Maximize2, label: 'Popup โปรโมชั่น', color: 'text-purple-400', description: 'จัดการป๊อปอัพเต็มจอตอนเข้าเว็บ', menuId: 'menu-admin-popups' },
]

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
  const [isReseller, setIsReseller] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [userAvatar, setUserAvatar] = useState<string | null>(null)
  const [disabledUserMenus, setDisabledUserMenus] = useState<string[]>([])
  const [hamburgerConfig, setHamburgerConfig] = useState<HamburgerConfig | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { settings } = useSettings()

  useEffect(() => {
    if (!user) return
    
    async function fetchBalance() {
      try {
        const res = await fetch('/api/user/me')
        const data = await res.json()
        if (data.user) {
          setBalance(data.user.balance)
          if (data.user.avatar) {
            setUserAvatar(data.user.avatar)
          }
        }
      } catch (error) {
        console.error('Failed to fetch balance')
      }
    }

    // Check onboarding only once on mount
    async function checkOnboarding() {
      try {
        const res = await fetch('/api/user/me')
        const data = await res.json()
        if (data.user?.showOnboarding) {
          setShowOnboarding(true)
        }
      } catch {}
    }

    fetchBalance()
    checkOnboarding()
    const interval = setInterval(fetchBalance, 5000)
    return () => clearInterval(interval)
  }, [user])

  useEffect(() => {
    if (!user) return
    
    async function checkReseller() {
      try {
        const res = await fetch('/api/reseller/register')
        const data = await res.json()
        if (data.success && data.profile?.status === 'approved') {
          setIsReseller(true)
        }
      } catch {}
    }
    checkReseller()
  }, [user])

  // Fetch disabled user menus
  useEffect(() => {
    async function fetchDisabledMenus() {
      try {
        const res = await fetch('/api/settings/menus')
        const data = await res.json()
        if (Array.isArray(data.disabledUserMenus)) {
          setDisabledUserMenus(data.disabledUserMenus)
        }
      } catch {}
    }
    fetchDisabledMenus()
  }, [])

  // Fetch hamburger menu config (custom order/visibility from admin)
  useEffect(() => {
    async function fetchHamburgerConfig() {
      try {
        const res = await fetch('/api/settings/hamburger-menu')
        const data = await res.json()
        if (data.config && data.config.sections) {
          // Auto-merge: add any hardcoded menuItems that are missing from DB config
          const config = data.config as HamburgerConfig
          const allDbHrefs = new Set<string>()
          for (const section of config.sections) {
            for (const item of section.items) {
              allDbHrefs.add(item.href)
            }
          }
          // Find hardcoded items not in DB config and add them to their matching section
          for (const hcItem of menuItems) {
            if (!allDbHrefs.has(hcItem.href)) {
              const targetSection = config.sections.find(s => s.id === (hcItem.section || 'main'))
              if (targetSection) {
                targetSection.items.push({
                  href: hcItem.href,
                  label: hcItem.label,
                  iconName: hcItem.icon?.displayName || hcItem.label,
                  color: hcItem.color || 'text-zinc-400',
                  section: hcItem.section || 'main',
                  visible: true,
                  isNew: hcItem.isNew || false,
                })
              }
            }
          }
          setHamburgerConfig(config)
        }
      } catch {}
    }
    fetchHamburgerConfig()
  }, [])


  // Helper to check if a menu path is disabled
  const isMenuDisabled = (href: string) => disabledUserMenus.includes(href)

  const handleMenuOpen = () => {
    setIsOpen(true)
  }

  const dismissOnboarding = async () => {
    setShowOnboarding(false)
    try {
      await fetch('/api/user/onboarding', { method: 'POST' })
    } catch (error) {
      console.error('Failed to dismiss onboarding:', error)
    }
  }

  const formatBalance = (bal?: number) => {
    if (bal === undefined || bal === null) return '0'
    return bal.toLocaleString('th-TH')
  }

  return (
    <>
      <nav 
        className="sticky top-0 z-[100] border-b py-2.5"
        style={{
          backgroundColor: 'var(--theme-nav-bg, #000000)',
          borderColor: 'var(--theme-nav-border, #27272a)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-zinc-600 to-zinc-700 p-0.1 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={settings.siteLogo || "/icon-192x192.png"} 
                    alt={settings.siteName || "VPN"} 
                    className="w-full h-full object-contain p-1 scale-125 brightness-110"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-black text-lg lg:text-xl tracking-tighter leading-none group-hover:text-zinc-300 transition-colors italic" style={{ color: 'var(--theme-text, #ffffff)' }}>
                  {(settings.siteName || 'VPN').replace(/shop$/i, '').toUpperCase()}<span style={{ color: 'var(--theme-text, #ffffff)' }}>{(settings.siteName || 'VPN').match(/shop$/i) ? '' : ''}</span>
                </span>
                <span className="text-[8px] font-medium tracking-wider uppercase leading-none mt-1" style={{ color: 'var(--theme-text-dim, #71717a)' }}>
                  VPN Service
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {[
                { label: 'HOME', href: '/', icon: Home },
                { label: 'FREE VLESS', href: '/public-vless', icon: Globe, color: 'text-zinc-400' },
                { label: 'BLOG', href: '/blog', icon: BookOpen, color: 'text-cyan-400' },
                { label: 'TOPUP', href: '/topup', icon: CreditCard, color: 'text-pink-400', protected: true },
              ].filter((link) => !isMenuDisabled(link.href)).map((link) => (
                (!link.protected || user) && (
                  <Link 
                    key={link.href}
                    href={link.href} 
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-black flex items-center gap-1.5 transition-all hover:bg-zinc-800 border border-transparent hover:border-zinc-700 ${link.color || 'text-zinc-400 hover:text-white'}`}
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
              {user && (() => {
                const WalletIcon = (hamburgerConfig?.navbarIcons?.walletIcon && iconMap[hamburgerConfig.navbarIcons.walletIcon]) || Wallet
                return (
                <Link 
                  href="/profile/topups"
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-all group"
                >
                  <div className="w-6 h-6 rounded-lg bg-zinc-800 flex items-center justify-center">
                    <WalletIcon className="w-3.5 h-3.5 text-zinc-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[7px] text-zinc-500 font-black uppercase leading-none">BALANCE</span>
                    <span className="text-white font-black text-xs leading-none mt-0.5">
                      {formatBalance(balance)} <span className="text-[8px] opacity-60">฿</span>
                    </span>
                  </div>
                </Link>
                )
              })()}
              
              {/* Balance Badge - Mobile */}
              {user && (() => {
                const WalletIcon = (hamburgerConfig?.navbarIcons?.walletIcon && iconMap[hamburgerConfig.navbarIcons.walletIcon]) || Wallet
                return (
                <Link 
                  href="/profile/topups"
                  className="flex sm:hidden items-center gap-1.5 px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition-all"
                >
                  <WalletIcon className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-white font-bold text-xs">
                    {formatBalance(balance)}
                  </span>
                </Link>
                )
              })()}

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
                    className="px-4 py-2 bg-white text-black hover:scale-105 rounded-xl text-[11px] font-black transition-all shadow-lg active:scale-95 italic"
                  >
                    JOIN NOW
                  </Link>
                </div>
              ) : (
                (() => {
                  const MenuOpenIcon = (hamburgerConfig?.navbarIcons?.menuIcon && iconMap[hamburgerConfig.navbarIcons.menuIcon]) || Menu
                  const MenuCloseIcon = (hamburgerConfig?.navbarIcons?.menuCloseIcon && iconMap[hamburgerConfig.navbarIcons.menuCloseIcon]) || X
                  return (
                    <button
                      onClick={() => setIsOpen(!isOpen)}
                      className={`p-2 rounded-xl transition-all border ${
                        isOpen 
                          ? 'bg-white border-zinc-300 text-black shadow-lg' 
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
                      }`}
                    >
                      {isOpen ? <MenuCloseIcon className="w-5 h-5" /> : <MenuOpenIcon className="w-5 h-5" />}
                    </button>
                  )
                })()
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay - only render backdrop when open to avoid scroll jank */}
        {isOpen && (() => {
          const ms = hamburgerConfig?.menuStyle
          const blurEnabled = ms?.backdropBlur !== false
          const opacity = ms?.backdropOpacity ?? 80
          return (
            <div 
              className={`fixed inset-0 top-[72px] lg:top-[88px] z-[110] animate-fade-overlay ${blurEnabled ? 'backdrop-blur-xl' : ''}`}
              style={{ backgroundColor: `rgba(0,0,0,${opacity / 100})` }}
              onClick={() => setIsOpen(false)} 
            />
          )
        })()}
        {isOpen && (() => {
          const ms = hamburgerConfig?.menuStyle
          const animEnabled = ms?.animationEnabled !== false
          const animStyle = ms?.animation || 'slide-right'
          const animClass = animEnabled ? (animationClassMap[animStyle] || 'animate-hb-slide-right') : ''
          const position = ms?.position || 'right'

          // Position classes
          let posClass = 'right-0 border-l max-w-sm'
          if (position === 'left') posClass = 'left-0 border-r max-w-sm'
          else if (position === 'full') posClass = 'left-0 right-0'

          return (
            <div 
              ref={menuRef}
              className={`fixed top-[72px] lg:top-[88px] bottom-0 w-full shadow-2xl z-[111] ${posClass} ${animClass}`}
              style={{
                backgroundColor: 'var(--theme-card, #09090b)',
                borderColor: 'var(--theme-border, #27272a)',
              }}
            >
            {user ? (
              <div className="flex flex-col h-full p-6">
                {/* User Identity */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-900 border border-zinc-800 mb-4">
                  {userAvatar ? (
                    <div className="w-10 h-10 rounded-xl overflow-hidden ring-1 ring-blue-500/30 flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={userAvatar} alt={user.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-lg font-semibold text-white flex-shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
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
                <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                  {hamburgerConfig ? (
                    // Dynamic menu from admin config
                    <>
                      {hamburgerConfig.sections.map((section) => {
                        const visibleItems = section.items.filter(
                          (item) => item.visible && !isMenuDisabled(item.href)
                        )
                        if (visibleItems.length === 0) return null
                        const sectionLabelColor = section.id === 'marketplace' ? 'text-emerald-500/60' : 'text-zinc-500'
                        return (
                          <div key={section.id}>
                            <h4 className={`${sectionLabelColor} text-[8px] font-medium uppercase tracking-wider px-4 mb-1.5`}>
                              {section.label}
                            </h4>
                            <div className="space-y-1">
                              {visibleItems.map((item) => {
                                const Icon = iconMap[item.iconName] || Home
                                // Find the original menuId from hardcoded list
                                const original = menuItems.find(m => m.href === item.href)
                                return (
                                  <MenuLink
                                    key={item.href}
                                    href={item.href}
                                    icon={Icon}
                                    label={item.label}
                                    color={item.color}
                                    section={item.section}
                                    description={original?.description || ''}
                                    menuId={original?.menuId || `menu-${item.href.replace(/\//g, '-')}`}
                                    isNew={item.isNew}
                                    onClick={() => !showOnboarding && setIsOpen(false)}
                                  />
                                )
                              })}
                              {section.id === 'marketplace' && !isReseller && (
                                <div className="px-3 py-2 text-[10px] text-zinc-500 italic">
                                  ลงทะเบียนฝากขายเพื่อเปิดร้านค้า
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </>
                  ) : (
                    // Fallback: hardcoded menu (original)
                    <>
                      {/* Main Section */}
                      <div>
                        <h4 className="text-zinc-500 text-[8px] font-medium uppercase tracking-wider px-4 mb-1.5">เมนูหลัก</h4>
                        <div className="space-y-1">
                          {menuItems.filter(m => m.section === 'main' && !isMenuDisabled(m.href)).map((item) => (
                            <MenuLink 
                              key={item.href} 
                              {...item} 
                              onClick={() => !showOnboarding && setIsOpen(false)} 
                            />
                          ))}
                        </div>
                      </div>

                      {/* Account Section */}
                      <div>
                        <h4 className="text-zinc-500 text-[8px] font-medium uppercase tracking-wider px-4 mb-1.5">บัญชีของฉัน</h4>
                        <div className="space-y-1">
                          {menuItems.filter(m => m.section === 'account' && !isMenuDisabled(m.href)).map((item) => (
                            <MenuLink 
                              key={item.href} 
                              {...item} 
                              onClick={() => !showOnboarding && setIsOpen(false)} 
                            />
                          ))}
                        </div>
                      </div>

                      {/* Marketplace Section */}
                      <div>
                        <h4 className="text-emerald-500/60 text-[8px] font-medium uppercase tracking-wider px-4 mb-1.5">ตลาดซื้อขาย</h4>
                        <div className="space-y-1">
                          {menuItems.filter(m => m.section === 'marketplace' && !isMenuDisabled(m.href)).map((item) => (
                            <MenuLink 
                              key={item.href} 
                              {...item} 
                              onClick={() => !showOnboarding && setIsOpen(false)} 
                            />
                          ))}
                          {!isReseller && (
                            <div className="px-3 py-2 text-[10px] text-zinc-500 italic">
                              ลงทะเบียนฝากขายเพื่อเปิดร้านค้า
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Admin Section */}
                  {isAdmin && (
                    <div>
                      <h4 className="text-purple-500 text-[8px] font-medium uppercase tracking-wider px-4 mb-1.5">ผู้ดูแลระบบ</h4>
                      <div className="space-y-1">
                        {adminMenuItems.map((item) => (
                          <MenuLink 
                            key={item.href} 
                            {...item} 
                            onClick={() => !showOnboarding && setIsOpen(false)} 
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Logout Footer */}
                <div className="mt-auto pt-6 border-t border-zinc-800">
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
                <div className="w-24 h-24 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-8">
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
                    className="block w-full py-2.5 bg-zinc-800 border border-zinc-700 text-white rounded-lg font-medium text-xs hover:bg-zinc-700 transition-all active:scale-95"
                  >
                    สมัครสมาชิก
                  </Link>
                </div>
              </div>
            )}
          </div>
          )
        })()}
      </nav>

      {/* Onboarding Auto Tour */}
      {showOnboarding && user && (
        <OnboardingAutoTour 
          onComplete={() => setShowOnboarding(false)} 
          onMenuOpen={handleMenuOpen}
          menuRef={menuRef}
        />
      )}
    </>
  )
}

function MenuLink({ 
  href, 
  icon: Icon, 
  label, 
  color = "text-zinc-400", 
  menuId,
  isNew,
  onClick 
}: MenuItem & { onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      data-menu-id={menuId}
      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all hover:bg-zinc-800 group`}
    >
      <div className={`relative w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform ${color}`}>
        <Icon className="w-4 h-4" />
        {isNew && (
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.4)] animate-pulse" />
        )}
      </div>
      <span className={`text-sm font-medium transition-colors group-hover:text-white ${color === 'text-zinc-400' ? 'text-zinc-400' : color}`}>
        {label}
      </span>
      {isNew && (
        <span className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded-md text-[8px] font-black text-zinc-300 uppercase tracking-wider animate-pulse">
          NEW
        </span>
      )}
      <ChevronRight className="w-4 h-4 ml-auto text-zinc-700 group-hover:text-zinc-400 transition-colors" />
    </Link>
  )
}
