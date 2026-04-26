'use client'

import { useEffect, useState, useRef } from 'react'
import {
  Menu as MenuIcon, GripVertical, Eye, EyeOff, Save, Loader2, CheckCircle,
  Smartphone, ChevronRight, ChevronDown, ChevronUp, RotateCcw, ArrowUp, ArrowDown,
  Home, Globe, CreditCard, Trophy, Star, AlertTriangle, Users, Megaphone,
  BookOpen, Calendar, Activity, Percent,
  Crown, Target, Gift, Bell, ShoppingBag, Wifi, Clock, ArrowRightLeft,
  History, User, Ticket, MessageSquare, Store, LayoutDashboard,
  Plus, Minus, Layers,
  Zap, Play, Pause, Monitor, ArrowRight, ArrowLeft,
  Maximize2, Download, Upload,
  ToggleLeft, ToggleRight,
  // Icon Picker 100+
  Heart, ThumbsUp, ThumbsDown, Bookmark, Share2, Send, Search,
  Settings, Shield, Lock, Unlock, Key, Link2, ExternalLink,
  Image, Camera, Video, Music, Headphones, Mic,
  Mail, Phone, MapPin, Navigation, Compass,
  FileText, File, Folder, Clipboard, PenTool,
  Cloud, Sun, Moon, Flame, Snowflake, Droplets,
  Coffee, Pizza, Cake, Apple, Wine,
  Car, Plane, Rocket, Anchor, Ship,
  Code, Terminal, Database, Server, Cpu, HardDrive,
  Palette, Paintbrush, Sparkles, Wand2, PartyPopper, X,
  Tag, Hash, AtSign, QrCode, Fingerprint, ScanLine,
  Gamepad2, Dumbbell, GraduationCap, Stethoscope, Briefcase, Building2,
  Newspaper, Radio, Tv, Projector, Presentation,
  TrendingUp, TrendingDown, BarChart3, PieChart, LineChart,
  Package, Truck, Box, ShoppingCart, Receipt, Banknote, Coins, Wallet,
  AlertCircle, Info, HelpCircle, Ban, CheckCircle2, XCircle,
  Power, RefreshCw, Repeat, Shuffle, FastForward, Rewind,
  Volume2, VolumeX, BellRing, BellOff,
  UserPlus, UserMinus, UserCheck, UsersRound,
  FolderOpen, FileCheck, FilePlus, FileX,
  Eye as EyeIcon, Glasses, Scan, Focus,
  Lightbulb, Gem, Diamond, Award, Medal, BadgeCheck,
  // เพิ่มอีกเพื่อให้ครบ 100+
  Tent, TreePine, Mountain, Waves, Wind, Umbrella,
  Bug, Cat, Dog, Fish, Bird, Flower2,
  Shirt, Watch, Scissors, Wrench, Hammer, Plug,
  Pencil, Eraser, Ruler, Calculator, Binary,
  Globe2, Languages, Flag, Map, Milestone,
  Inbox, MailOpen, Forward, Reply, Archive,
  Clapperboard, Drama, Popcorn, Theater,
  Siren, ShieldAlert, ShieldCheck, KeyRound,
  CircleDot, Circle, Square, Triangle, Hexagon, Octagon, Pentagon, Star as StarIcon,
  WifiOff, Bluetooth, Signal, SignalHigh,
  Battery, BatteryCharging, BatteryFull,
  Thermometer, Gauge, Timer, Hourglass, AlarmClock,
  Stamp, Sticker, Type, Bold, Italic,
  ListOrdered, ListChecks, ListTree,
  PanelLeft, PanelRight, PanelTop, SidebarOpen,
  Ratio, Proportions, Rows3, Columns3, Grid3x3,
  Bone, Brain, Ear, HandMetal, Footprints,
  type LucideIcon,
} from 'lucide-react'

// ===== Types =====
interface MenuItemConfig {
  href: string
  label: string
  iconName: string
  color: string
  section: string
  visible: boolean
  isNew: boolean
}

interface SectionConfig {
  id: string
  label: string
  color: string
  items: MenuItemConfig[]
}

interface HamburgerConfig {
  sections: SectionConfig[]
  menuStyle?: MenuStyleConfig
  navbarIcons?: NavbarIconsConfig
}

interface NavbarIconsConfig {
  walletIcon: string
  menuIcon: string
  menuCloseIcon: string
}

const defaultNavbarIcons: NavbarIconsConfig = {
  walletIcon: 'Wallet',
  menuIcon: 'Menu',
  menuCloseIcon: 'X',
}

interface MenuStyleConfig {
  animation: string
  animationEnabled: boolean
  backdropBlur: boolean
  backdropOpacity: number
  position: string // 'right' | 'left' | 'full'
}

const defaultMenuStyle: MenuStyleConfig = {
  animation: 'slide-right',
  animationEnabled: true,
  backdropBlur: true,
  backdropOpacity: 80,
  position: 'right',
}

// Animation options
const animationOptions: { id: string; label: string; labelTh: string; icon: string; description: string }[] = [
  { id: 'slide-right', label: 'Slide Right', labelTh: 'เลื่อนจากขวา', icon: '→', description: 'เมนูเลื่อนเข้ามาจากขวา (ค่าเริ่มต้น)' },
  { id: 'slide-left', label: 'Slide Left', labelTh: 'เลื่อนจากซ้าย', icon: '←', description: 'เมนูเลื่อนเข้ามาจากซ้าย' },
  { id: 'slide-bottom', label: 'Slide Up', labelTh: 'เลื่อนขึ้นจากล่าง', icon: '↑', description: 'เมนูเลื่อนขึ้นมาจากด้านล่าง' },
  { id: 'slide-top', label: 'Slide Down', labelTh: 'เลื่อนลงจากบน', icon: '↓', description: 'เมนูเลื่อนลงมาจากด้านบน' },
  { id: 'fade', label: 'Fade', labelTh: 'จางเข้า', icon: '◐', description: 'เมนูค่อยๆ ปรากฏ' },
  { id: 'scale', label: 'Scale', labelTh: 'ซูมเข้า', icon: '⊕', description: 'เมนูขยายจากเล็กไปใหญ่' },
  { id: 'flip', label: 'Flip 3D', labelTh: 'พลิก 3 มิติ', icon: '↻', description: 'เมนูพลิกเข้ามาแบบ 3 มิติ' },
  { id: 'blur', label: 'Blur', labelTh: 'เบลอเข้า', icon: '◉', description: 'เมนูจากเบลอเป็นชัด' },
  { id: 'bounce', label: 'Bounce', labelTh: 'เด้ง', icon: '⇥', description: 'เมนูเด้งเข้ามาจากขวา' },
  { id: 'none', label: 'None', labelTh: 'ไม่มี', icon: '—', description: 'ไม่มีอนิเมชัน แสดงทันที' },
]

const positionOptions: { id: string; label: string; labelTh: string; description: string }[] = [
  { id: 'right', label: 'Right', labelTh: 'ขวา', description: 'เมนูเปิดจากด้านขวา (ค่าเริ่มต้น)' },
  { id: 'left', label: 'Left', labelTh: 'ซ้าย', description: 'เมนูเปิดจากด้านซ้าย' },
  { id: 'full', label: 'Full Width', labelTh: 'เต็มจอ', description: 'เมนูเปิดเต็มความกว้าง' },
]

// ===== Icon map (100+ icons) =====
const iconMap: Record<string, React.ElementType> = {
  // ทั่วไป
  Home, Globe, Globe2, Star, Heart, Bookmark, Share2, Send, Search, Eye: EyeIcon, Glasses,
  Lightbulb, Zap, Power, Sparkles, Wand2, PartyPopper, Flag,
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
  Image, Camera, Video, Music, Headphones, FileText, File, FileCheck, FilePlus, FileX,
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
  Sun, Moon, Flame, Snowflake, Droplets, Cloud, Wind, Umbrella, Waves, Mountain, TreePine, Tent,
  Flower2, Bug, Cat, Dog, Fish, Bird,
  // อาหาร & เครื่องดื่ม
  Coffee, Pizza, Cake, Apple, Wine,
  // ยานพาหนะ
  Car, Plane, Rocket, Anchor, Ship,
  // ความบันเทิง & กีฬา
  Gamepad2, Dumbbell, Trophy, Gift, Shuffle,
  // แฟชั่น & ร่างกาย
  Shirt, Watch, Bone, Brain, Ear, HandMetal, Footprints,
  // Layout & UI
  Menu: MenuIcon, PanelLeft, PanelRight, PanelTop, SidebarOpen,
  Grid3x3, Rows3, Columns3, Ratio,
  ListOrdered, ListChecks, ListTree,
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
  Building2, Scan, Focus, ThumbsUp, ThumbsDown, Plus, Minus, Maximize2, Download, Upload,
  FastForward, Rewind, Play, Pause,
}

// ===== Icon categories สำหรับ Picker =====
interface IconCategory {
  label: string
  icons: string[]
}
const iconCategories: IconCategory[] = [
  { label: 'ทั่วไป', icons: ['Home', 'Globe', 'Globe2', 'Star', 'Heart', 'Bookmark', 'Share2', 'Send', 'Search', 'Eye', 'Glasses', 'Lightbulb', 'Zap', 'Power', 'Sparkles', 'Wand2', 'PartyPopper', 'Flag', 'ThumbsUp', 'ThumbsDown'] },
  { label: 'ช็อป & การเงิน', icons: ['CreditCard', 'ShoppingBag', 'ShoppingCart', 'Store', 'Wallet', 'Banknote', 'Coins', 'Receipt', 'Package', 'Truck', 'Box', 'Tag', 'Percent'] },
  { label: 'สื่อสาร', icons: ['MessageSquare', 'Mail', 'MailOpen', 'Phone', 'Bell', 'BellRing', 'BellOff', 'Megaphone', 'Ticket', 'Mic', 'Radio', 'Inbox', 'Forward', 'Reply', 'Archive'] },
  { label: 'สถานะ & ความปลอดภัย', icons: ['AlertTriangle', 'AlertCircle', 'Info', 'HelpCircle', 'Ban', 'CheckCircle2', 'XCircle', 'Shield', 'ShieldAlert', 'ShieldCheck', 'Lock', 'Unlock', 'Key', 'KeyRound', 'Fingerprint', 'ScanLine', 'Siren'] },
  { label: 'ผู้ใช้', icons: ['User', 'Users', 'UsersRound', 'UserPlus', 'UserMinus', 'UserCheck', 'Crown', 'BadgeCheck', 'GraduationCap', 'Briefcase', 'Stethoscope'] },
  { label: 'สื่อ & ไฟล์', icons: ['Image', 'Camera', 'Video', 'Music', 'Headphones', 'FileText', 'File', 'FileCheck', 'FilePlus', 'FileX', 'Folder', 'FolderOpen', 'Clipboard', 'PenTool', 'Pencil', 'Eraser', 'BookOpen', 'Newspaper', 'Tv', 'Clapperboard', 'Projector', 'Presentation', 'Drama'] },
  { label: 'เทค & เครื่องมือ', icons: ['Settings', 'Monitor', 'Code', 'Terminal', 'Database', 'Server', 'Cpu', 'HardDrive', 'Wifi', 'WifiOff', 'Cloud', 'QrCode', 'LayoutDashboard', 'Layers', 'Link2', 'ExternalLink', 'Plug', 'Wrench', 'Hammer', 'Scissors', 'Calculator', 'Binary', 'Ruler'] },
  { label: 'กราฟ & สถิติ', icons: ['TrendingUp', 'TrendingDown', 'BarChart3', 'PieChart', 'LineChart', 'Activity', 'Target', 'Gauge'] },
  { label: 'เวลา', icons: ['Clock', 'Calendar', 'History', 'RefreshCw', 'RotateCcw', 'Repeat', 'Timer', 'Hourglass', 'AlarmClock'] },
  { label: 'ทิศทาง & แผนที่', icons: ['ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft', 'ArrowRightLeft', 'Navigation', 'Compass', 'MapPin', 'Map', 'Milestone'] },
  { label: 'ธรรมชาติ & สัตว์', icons: ['Sun', 'Moon', 'Flame', 'Snowflake', 'Droplets', 'Wind', 'Umbrella', 'Waves', 'Mountain', 'TreePine', 'Tent', 'Flower2', 'Bug', 'Cat', 'Dog', 'Fish', 'Bird'] },
  { label: 'อาหาร & เครื่องดื่ม', icons: ['Coffee', 'Pizza', 'Cake', 'Apple', 'Wine'] },
  { label: 'ยานพาหนะ', icons: ['Car', 'Plane', 'Rocket', 'Anchor', 'Ship'] },
  { label: 'กีฬา & บันเทิง', icons: ['Gamepad2', 'Dumbbell', 'Trophy', 'Gift', 'Shuffle', 'Drama', 'Clapperboard'] },
  { label: 'แฟชั่น & ร่างกาย', icons: ['Shirt', 'Watch', 'Bone', 'Brain', 'Ear', 'HandMetal', 'Footprints'] },
  { label: 'Layout & UI', icons: ['Menu', 'PanelLeft', 'PanelRight', 'PanelTop', 'SidebarOpen', 'Grid3x3', 'Rows3', 'Columns3', 'Ratio', 'ListOrdered', 'ListChecks', 'ListTree', 'Maximize2'] },
  { label: 'รูปทรง', icons: ['CircleDot', 'Circle', 'Square', 'Triangle', 'Hexagon', 'Octagon', 'Pentagon'] },
  { label: 'อุปกรณ์', icons: ['Battery', 'BatteryCharging', 'BatteryFull', 'Signal', 'SignalHigh', 'Bluetooth', 'Thermometer', 'Volume2', 'VolumeX'] },
  { label: 'รางวัล & เครื่องประดับ', icons: ['Award', 'Medal', 'Gem', 'Diamond', 'Palette', 'Paintbrush', 'Building2', 'Scan', 'Focus'] },
]

function getIcon(name: string): React.ElementType {
  return iconMap[name] || Home
}

// ===== Default config (mirrors current Navbar.tsx menuItems) =====
const defaultSections: SectionConfig[] = [
  {
    id: 'main',
    label: 'เมนูหลัก',
    color: 'text-zinc-500',
    items: [
      { href: '/', label: 'หน้าแรก', iconName: 'Home', color: 'text-zinc-400', section: 'main', visible: true, isNew: false },
      { href: '/public-vless', label: 'Free VLESS', iconName: 'Globe', color: 'text-emerald-400', section: 'main', visible: true, isNew: false },
      { href: '/setup-guide', label: 'โปรเสริมที่ต้องสมัคร', iconName: 'Smartphone', color: 'text-cyan-400', section: 'main', visible: true, isNew: true },
      { href: '/topup', label: 'เติมเงินเข้าระบบ', iconName: 'CreditCard', color: 'text-amber-400', section: 'main', visible: true, isNew: false },
      { href: '/leaderboard', label: 'อันดับผู้ใช้', iconName: 'Trophy', color: 'text-yellow-400', section: 'main', visible: true, isNew: true },
      { href: '/reviews', label: 'รีวิวจากผู้ใช้', iconName: 'Star', color: 'text-violet-400', section: 'main', visible: true, isNew: true },
      { href: '/report-slow', label: 'แจ้งปัญหาเน็ตช้า', iconName: 'AlertTriangle', color: 'text-rose-400', section: 'main', visible: true, isNew: true },
      { href: '/contacts', label: 'รายชื่อแอดมิน', iconName: 'Users', color: 'text-blue-400', section: 'main', visible: true, isNew: true },
      { href: '/announcements', label: 'ประกาศข่าวสาร', iconName: 'Megaphone', color: 'text-cyan-400', section: 'main', visible: true, isNew: true },
      { href: '/blog', label: 'บทความ & เคล็ดลับ', iconName: 'BookOpen', color: 'text-cyan-400', section: 'main', visible: true, isNew: true },
      { href: '/lucky-wheel', label: 'กงล้อนำโชค', iconName: 'RotateCcw', color: 'text-yellow-400', section: 'main', visible: true, isNew: true },
      { href: '/daily-checkin', label: 'เช็คอินรายวัน', iconName: 'Calendar', color: 'text-emerald-400', section: 'main', visible: true, isNew: true },
      { href: '/server-compare', label: 'เปรียบเทียบเซิร์ฟเวอร์', iconName: 'Activity', color: 'text-blue-400', section: 'main', visible: true, isNew: true },
      { href: '/coupons', label: 'คูปองส่วนลด', iconName: 'Percent', color: 'text-amber-400', section: 'main', visible: true, isNew: true },
      { href: '/referral-leaderboard', label: 'อันดับนักแนะนำ', iconName: 'Trophy', color: 'text-pink-400', section: 'main', visible: true, isNew: true },
      { href: '/premium-apps', label: 'ซื้อของ', iconName: 'Package', color: 'text-violet-400', section: 'main', visible: true, isNew: true },
    ],
  },
  {
    id: 'account',
    label: 'บัญชีของฉัน',
    color: 'text-zinc-500',
    items: [
      { href: '/vip', label: 'สมาชิก VIP', iconName: 'Crown', color: 'text-amber-400', section: 'account', visible: true, isNew: true },
      { href: '/missions', label: 'ภารกิจ & ความสำเร็จ', iconName: 'Target', color: 'text-violet-400', section: 'account', visible: true, isNew: true },
      { href: '/gift', label: 'ส่งของขวัญ', iconName: 'Gift', color: 'text-pink-400', section: 'account', visible: true, isNew: true },
      { href: '/notifications', label: 'แจ้งเตือน', iconName: 'Bell', color: 'text-blue-400', section: 'account', visible: true, isNew: true },
      { href: '/profile/orders', label: 'รายการสั่งซื้อ VPN', iconName: 'ShoppingBag', color: 'text-zinc-400', section: 'account', visible: true, isNew: false },
      { href: '/profile/connections', label: 'การเชื่อมต่อ VPN', iconName: 'Wifi', color: 'text-violet-400', section: 'account', visible: true, isNew: true },
      { href: '/profile/renew', label: 'ต่ออายุ VPN', iconName: 'Clock', color: 'text-cyan-400', section: 'account', visible: true, isNew: false },
      { href: '/profile/exchange', label: 'แลกเปลี่ยนเซิร์ฟเวอร์', iconName: 'ArrowRightLeft', color: 'text-orange-400', section: 'account', visible: true, isNew: true },
      { href: '/profile/topups', label: 'ประวัติการเติมเงิน', iconName: 'History', color: 'text-zinc-400', section: 'account', visible: true, isNew: false },
      { href: '/profile', label: 'ตั้งค่าโปรไฟล์', iconName: 'User', color: 'text-zinc-400', section: 'account', visible: true, isNew: false },
      { href: '/profile/referral', label: 'เชิญเพื่อน', iconName: 'Gift', color: 'text-pink-400', section: 'account', visible: true, isNew: false },
      { href: '/tickets', label: 'ติดต่อแอดมิน', iconName: 'Ticket', color: 'text-violet-400', section: 'account', visible: true, isNew: false },
      { href: '/chat', label: 'แชทสด', iconName: 'MessageSquare', color: 'text-cyan-400', section: 'account', visible: true, isNew: false },
    ],
  },
  {
    id: 'marketplace',
    label: 'ตลาดซื้อขาย',
    color: 'text-emerald-500/60',
    items: [

      { href: '/ads', label: 'ลงโฆษณา', iconName: 'Megaphone', color: 'text-orange-400', section: 'marketplace', visible: true, isNew: true },
    ],
  },
]

// ===== Icon Picker Modal =====
function IconPickerModal({ 
  isOpen, onClose, onSelect, currentIcon 
}: { 
  isOpen: boolean; onClose: () => void; onSelect: (name: string) => void; currentIcon: string 
}) {
  const [search, setSearch] = useState('')

  if (!isOpen) return null

  const q = search.toLowerCase()

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h3 className="text-sm font-bold text-white">เลือกไอคอน</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-white/5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาไอคอน..."
              className="w-full pl-9 pr-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-600 outline-none focus:border-orange-500/30"
              autoFocus
            />
          </div>
        </div>

        {/* Icons grid */}
        <div className="px-5 py-4 overflow-y-auto max-h-[55vh] space-y-4">
          {iconCategories.map((cat) => {
            const filtered = cat.icons.filter(name => {
              if (!q) return true
              return name.toLowerCase().includes(q)
            })
            if (filtered.length === 0) return null

            return (
              <div key={cat.label}>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">{cat.label}</p>
                <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5">
                  {filtered.map((name) => {
                    const Icon = iconMap[name] || Home
                    const isSelected = currentIcon === name
                    return (
                      <button
                        key={name}
                        onClick={() => { onSelect(name); onClose() }}
                        title={name}
                        className={`group relative w-9 h-9 flex items-center justify-center rounded-lg border transition-all hover:scale-110 active:scale-95 ${
                          isSelected
                            ? 'bg-orange-500/20 border-orange-500/40 text-orange-400 ring-1 ring-orange-500/30'
                            : 'bg-zinc-900/50 border-white/5 text-zinc-400 hover:text-white hover:border-white/20 hover:bg-zinc-800'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {isSelected && <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-orange-400" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {iconCategories.every(cat => cat.icons.filter(n => n.toLowerCase().includes(q)).length === 0) && (
            <div className="text-center py-8 text-zinc-600 text-sm">ไม่พบไอคอนที่ค้นหา</div>
          )}
        </div>
      </div>
    </div>
  )
}

// ===== Drag-drop helper (no library needed) =====

export default function HamburgerMenuPage() {
  const [sections, setSections] = useState<SectionConfig[]>(defaultSections)
  const [menuStyle, setMenuStyle] = useState<MenuStyleConfig>(defaultMenuStyle)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ main: true, account: true, marketplace: true })
  const [activeTab, setActiveTab] = useState<'menu' | 'style' | 'navbar'>('menu')
  const [navbarIcons, setNavbarIcons] = useState<NavbarIconsConfig>(defaultNavbarIcons)
  const [navbarIconPicker, setNavbarIconPicker] = useState<'walletIcon' | 'menuIcon' | 'menuCloseIcon' | null>(null)
  const [previewAnim, setPreviewAnim] = useState(false)

  // Drag state
  const [dragItem, setDragItem] = useState<{ sectionIdx: number; itemIdx: number } | null>(null)
  const [dragOverItem, setDragOverItem] = useState<{ sectionIdx: number; itemIdx: number } | null>(null)

  // Icon picker state
  const [iconPickerTarget, setIconPickerTarget] = useState<{ sectionIdx: number; itemIdx: number } | null>(null)

  // Saved config for comparison
  const savedConfigRef = useRef<string>('')

  useEffect(() => {
    fetch('/api/admin/hamburger-menu')
      .then(res => res.json())
      .then(data => {
        if (data.config?.sections && Array.isArray(data.config.sections)) {
          setSections(data.config.sections)
        }
        if (data.config?.menuStyle) {
          setMenuStyle({ ...defaultMenuStyle, ...data.config.menuStyle })
        }
        if (data.config?.navbarIcons) {
          setNavbarIcons({ ...defaultNavbarIcons, ...data.config.navbarIcons })
        }
        savedConfigRef.current = JSON.stringify({
          sections: data.config?.sections || defaultSections,
          menuStyle: data.config?.menuStyle || defaultMenuStyle,
          navbarIcons: data.config?.navbarIcons || defaultNavbarIcons,
        })
      })
      .catch(() => {
        savedConfigRef.current = JSON.stringify({ sections: defaultSections, menuStyle: defaultMenuStyle, navbarIcons: defaultNavbarIcons })
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const currentConfig = JSON.stringify({ sections, menuStyle, navbarIcons })
    setHasChanges(currentConfig !== savedConfigRef.current)
  }, [sections, menuStyle, navbarIcons])

  // Save
  async function handleSave() {
    setSaving(true)
    setSaved(false)
    try {
      const config: HamburgerConfig = { sections, menuStyle, navbarIcons }
      const res = await fetch('/api/admin/hamburger-menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      })
      if (res.ok) {
        savedConfigRef.current = JSON.stringify({ sections, menuStyle, navbarIcons })
        setHasChanges(false)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch {
      // error
    } finally {
      setSaving(false)
    }
  }

  // Reset to default
  function handleReset() {
    setSections(JSON.parse(JSON.stringify(defaultSections)))
    setMenuStyle({ ...defaultMenuStyle })
    setNavbarIcons({ ...defaultNavbarIcons })
  }

  // Toggle visibility
  function toggleVisibility(sectionIdx: number, itemIdx: number) {
    setSections(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      next[sectionIdx].items[itemIdx].visible = !next[sectionIdx].items[itemIdx].visible
      return next
    })
  }

  // Toggle NEW badge
  function toggleNew(sectionIdx: number, itemIdx: number) {
    setSections(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      next[sectionIdx].items[itemIdx].isNew = !next[sectionIdx].items[itemIdx].isNew
      return next
    })
  }

  // Move item up/down within section
  function moveItem(sectionIdx: number, itemIdx: number, direction: 'up' | 'down') {
    setSections(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      const items = next[sectionIdx].items
      const targetIdx = direction === 'up' ? itemIdx - 1 : itemIdx + 1
      if (targetIdx < 0 || targetIdx >= items.length) return prev
      ;[items[itemIdx], items[targetIdx]] = [items[targetIdx], items[itemIdx]]
      return next
    })
  }

  // Move item to different section
  function moveToSection(sectionIdx: number, itemIdx: number, targetSectionId: string) {
    setSections(prev => {
      const next: SectionConfig[] = JSON.parse(JSON.stringify(prev))
      const targetSectionIdx = next.findIndex(s => s.id === targetSectionId)
      if (targetSectionIdx === -1 || targetSectionIdx === sectionIdx) return prev
      const [item] = next[sectionIdx].items.splice(itemIdx, 1)
      item.section = targetSectionId
      next[targetSectionIdx].items.push(item)
      return next
    })
  }

  // Edit section label
  function editSectionLabel(sectionIdx: number, newLabel: string) {
    setSections(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      next[sectionIdx].label = newLabel
      return next
    })
  }

  // Edit item icon
  function editItemIcon(sectionIdx: number, itemIdx: number, iconName: string) {
    setSections(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      next[sectionIdx].items[itemIdx].iconName = iconName
      return next
    })
  }

  // Toggle section expand
  function toggleSection(sectionId: string) {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }))
  }

  // Drag handlers (within section)
  function handleDragStart(sectionIdx: number, itemIdx: number) {
    setDragItem({ sectionIdx, itemIdx })
  }

  function handleDragOver(e: React.DragEvent, sectionIdx: number, itemIdx: number) {
    e.preventDefault()
    setDragOverItem({ sectionIdx, itemIdx })
  }

  function handleDrop(sectionIdx: number, itemIdx: number) {
    if (!dragItem) return
    if (dragItem.sectionIdx === sectionIdx) {
      // Same section reorder
      setSections(prev => {
        const next: SectionConfig[] = JSON.parse(JSON.stringify(prev))
        const items = next[sectionIdx].items
        const [dragged] = items.splice(dragItem.itemIdx, 1)
        items.splice(itemIdx, 0, dragged)
        return next
      })
    } else {
      // Cross-section move
      setSections(prev => {
        const next: SectionConfig[] = JSON.parse(JSON.stringify(prev))
        const [dragged] = next[dragItem.sectionIdx].items.splice(dragItem.itemIdx, 1)
        dragged.section = next[sectionIdx].id
        next[sectionIdx].items.splice(itemIdx, 0, dragged)
        return next
      })
    }
    setDragItem(null)
    setDragOverItem(null)
  }

  function handleDragEnd() {
    setDragItem(null)
    setDragOverItem(null)
  }

  // Count visible items
  const totalVisible = sections.reduce((acc, s) => acc + s.items.filter(i => i.visible).length, 0)
  const totalItems = sections.reduce((acc, s) => acc + s.items.length, 0)

  // Export config
  function handleExport() {
    const config: HamburgerConfig = { sections, menuStyle, navbarIcons }
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hamburger-menu-config-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Import config
  function handleImport() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string)
          if (data.sections && Array.isArray(data.sections)) {
            setSections(data.sections)
          }
          if (data.menuStyle) {
            setMenuStyle({ ...defaultMenuStyle, ...data.menuStyle })
          }
          if (data.navbarIcons) {
            setNavbarIcons({ ...defaultNavbarIcons, ...data.navbarIcons })
          }
        } catch {
          alert('ไฟล์ JSON ไม่ถูกต้อง')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  // Preview animation trigger
  function triggerPreview() {
    setPreviewAnim(false)
    setTimeout(() => setPreviewAnim(true), 50)
    setTimeout(() => setPreviewAnim(false), 2000)
  }

  // Animation class map for preview
  const animClassMap: Record<string, string> = {
    'slide-right': 'animate-hb-slide-right',
    'slide-left': 'animate-hb-slide-left',
    'slide-bottom': 'animate-hb-slide-bottom',
    'slide-top': 'animate-hb-slide-top',
    'fade': 'animate-hb-fade',
    'scale': 'animate-hb-scale',
    'flip': 'animate-hb-flip',
    'blur': 'animate-hb-blur',
    'bounce': 'animate-hb-bounce',
    'none': '',
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500/20 to-rose-500/20 border border-orange-500/20 rounded-xl flex items-center justify-center">
              <MenuIcon className="w-4.5 h-4.5 text-orange-400" />
            </div>
            จัดเรียงเมนูผู้ใช้
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1 ml-[46px]">ลากเพื่อจัดเรียง เปิด/ปิด เมนูแฮมเบอร์เกอร์ของผู้ใช้</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Import */}
          <button
            onClick={handleImport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">นำเข้า</span>
          </button>

          {/* Export */}
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ส่งออก</span>
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">รีเซ็ต</span>
          </button>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              saved
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                : hasChanges
                  ? 'bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-white shadow-lg shadow-orange-500/20'
                  : 'bg-zinc-900 border border-white/5 text-zinc-600 cursor-not-allowed'
            }`}
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> กำลังบันทึก...</>
            ) : saved ? (
              <><CheckCircle className="w-4 h-4" /> บันทึกแล้ว</>
            ) : (
              <><Save className="w-4 h-4" /> บันทึก</>
            )}
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-zinc-900/50 border border-white/5 rounded-xl p-1 gap-1 mb-6">
        <button
          onClick={() => setActiveTab('menu')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'menu'
              ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
              : 'text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <GripVertical className="w-4 h-4" />
          <span className="hidden sm:inline">จัดเรียงเมนู</span>
          <span className="sm:hidden">เมนู</span>
        </button>
        <button
          onClick={() => setActiveTab('style')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'style'
              ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
              : 'text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span className="hidden sm:inline">UI & อนิเมชัน</span>
          <span className="sm:hidden">อนิเมชัน</span>
        </button>
        <button
          onClick={() => setActiveTab('navbar')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'navbar'
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
              : 'text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span className="hidden sm:inline">ไอคอน Navbar</span>
          <span className="sm:hidden">Navbar</span>
        </button>
      </div>

      {/* Stats bar */}
      <div className="mb-6 px-4 py-3 rounded-xl bg-zinc-900/50 border border-white/5 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-zinc-500" />
          <span className="text-xs text-zinc-500">{sections.length} เซ็คชัน</span>
        </div>
        <div className="w-px h-4 bg-zinc-800" />
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-emerald-500" />
          <span className="text-xs text-zinc-500">{totalVisible} / {totalItems} เมนูที่แสดง</span>
        </div>
        <div className="w-px h-4 bg-zinc-800" />
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-violet-400" />
          <span className="text-xs text-zinc-500">
            อนิเมชัน: {menuStyle.animationEnabled
              ? animationOptions.find(a => a.id === menuStyle.animation)?.labelTh || menuStyle.animation
              : 'ปิด'
            }
          </span>
        </div>
        {hasChanges && (
          <>
            <div className="w-px h-4 bg-zinc-800" />
            <div className="flex items-center gap-1.5 text-amber-400">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-medium">มีการเปลี่ยนแปลง</span>
            </div>
          </>
        )}
      </div>

      {/* ===== STYLE TAB ===== */}
      {activeTab === 'style' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Animation Toggle */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-violet-500/10 border border-violet-500/20 rounded-xl flex items-center justify-center">
                    <Zap className="w-4 h-4 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">อนิเมชันเปิดเมนู</h3>
                    <p className="text-[11px] text-zinc-500">เลือกรูปแบบอนิเมชันตอนเปิดเมนูแฮมเบอร์เกอร์</p>
                  </div>
                </div>
                <button
                  onClick={() => setMenuStyle(prev => ({ ...prev, animationEnabled: !prev.animationEnabled }))}
                  className="shrink-0"
                >
                  {menuStyle.animationEnabled ? (
                    <ToggleRight className="w-10 h-10 text-violet-400 hover:text-violet-300 transition-colors" />
                  ) : (
                    <ToggleLeft className="w-10 h-10 text-zinc-600 hover:text-zinc-400 transition-colors" />
                  )}
                </button>
              </div>

              {/* Animation Cards */}
              {menuStyle.animationEnabled && (
                <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {animationOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setMenuStyle(prev => ({ ...prev, animation: opt.id }))
                        triggerPreview()
                      }}
                      className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border transition-all hover:scale-[1.02] active:scale-95 ${
                        menuStyle.animation === opt.id
                          ? 'bg-violet-500/10 border-violet-500/30 text-violet-400 shadow-lg shadow-violet-500/10'
                          : 'bg-zinc-900/50 border-white/5 text-zinc-500 hover:text-white hover:border-white/10'
                      }`}
                    >
                      <span className="text-2xl leading-none">{opt.icon}</span>
                      <span className="text-[10px] font-bold tracking-tight">{opt.labelTh}</span>
                      <span className="text-[8px] opacity-60">{opt.label}</span>
                      {menuStyle.animation === opt.id && (
                        <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-violet-400" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Menu Position */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
                <div className="w-9 h-9 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
                  <Monitor className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">ตำแหน่งเมนู</h3>
                  <p className="text-[11px] text-zinc-500">เลือกตำแหน่งที่เมนูจะเปิดออก</p>
                </div>
              </div>
              <div className="p-4 grid grid-cols-3 gap-3">
                {positionOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setMenuStyle(prev => ({ ...prev, position: opt.id }))
                      triggerPreview()
                    }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all hover:scale-[1.02] active:scale-95 ${
                      menuStyle.position === opt.id
                        ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                        : 'bg-zinc-900/50 border-white/5 text-zinc-500 hover:text-white hover:border-white/10'
                    }`}
                  >
                    <div className="w-12 h-8 rounded border border-current/30 flex items-center justify-center relative overflow-hidden">
                      {opt.id === 'right' && <div className="absolute right-0 top-0 bottom-0 w-4 bg-current/20 rounded-l" />}
                      {opt.id === 'left' && <div className="absolute left-0 top-0 bottom-0 w-4 bg-current/20 rounded-r" />}
                      {opt.id === 'full' && <div className="absolute inset-0 bg-current/20" />}
                    </div>
                    <span className="text-xs font-bold">{opt.labelTh}</span>
                    <span className="text-[9px] opacity-50">{opt.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Backdrop Settings */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
                <div className="w-9 h-9 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center">
                  <Layers className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">พื้นหลัง Overlay</h3>
                  <p className="text-[11px] text-zinc-500">ตั้งค่าฉากหลังเมื่อเปิดเมนู</p>
                </div>
              </div>
              <div className="p-5 space-y-5">
                {/* Blur toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">เบลอพื้นหลัง</p>
                    <p className="text-[11px] text-zinc-500">ทำให้พื้นหลังเบลอเมื่อเปิดเมนู</p>
                  </div>
                  <button
                    onClick={() => setMenuStyle(prev => ({ ...prev, backdropBlur: !prev.backdropBlur }))}
                  >
                    {menuStyle.backdropBlur ? (
                      <ToggleRight className="w-8 h-8 text-cyan-400 hover:text-cyan-300 transition-colors" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-zinc-600 hover:text-zinc-400 transition-colors" />
                    )}
                  </button>
                </div>

                {/* Opacity slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-white">ความทึบพื้นหลัง</p>
                    <span className="text-xs text-zinc-400 font-mono">{menuStyle.backdropOpacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={menuStyle.backdropOpacity}
                    onChange={(e) => setMenuStyle(prev => ({ ...prev, backdropOpacity: Number(e.target.value) }))}
                    className="w-full accent-cyan-500 h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer"
                  />
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-zinc-600">โปร่งใส</span>
                    <span className="text-[10px] text-zinc-600">ทึบแสง</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Phone Preview with animation demo */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-zinc-500" />
                  <h3 className="text-sm font-bold text-white">ตัวอย่างอนิเมชัน</h3>
                </div>
                <button
                  onClick={triggerPreview}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-violet-500/10 border border-violet-500/20 text-violet-400 hover:bg-violet-500/20 transition-all"
                >
                  <Play className="w-3 h-3" />
                  เล่นซ้ำ
                </button>
              </div>

              {/* Phone mockup */}
              <div className="relative w-full max-w-[280px] mx-auto">
                <div className="bg-black rounded-[28px] border-2 border-zinc-700 p-2 shadow-2xl shadow-black/50">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-b-2xl z-20" />
                  <div className="bg-zinc-950 rounded-[20px] overflow-hidden relative">
                    {/* Mini Navbar */}
                    <div className="flex items-center justify-between px-3 py-2.5 border-b border-zinc-800">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-md bg-zinc-800" />
                        <span className="text-[8px] font-black text-white">VPN</span>
                      </div>
                      <div className="w-5 h-5 rounded-md bg-white flex items-center justify-center">
                        <MenuIcon className="w-3 h-3 text-black" />
                      </div>
                    </div>

                    {/* Backdrop overlay preview */}
                    <div
                      className="absolute inset-0 top-[33px] z-10 transition-all duration-300"
                      style={{
                        backgroundColor: `rgba(0,0,0,${previewAnim ? menuStyle.backdropOpacity / 100 : 0})`,
                        backdropFilter: previewAnim && menuStyle.backdropBlur ? 'blur(8px)' : 'none',
                        opacity: previewAnim ? 1 : 0,
                      }}
                    />

                    {/* Menu panel preview */}
                    {previewAnim && (
                      <div
                        className={`absolute top-[33px] bottom-0 z-20 bg-zinc-950 border-zinc-800 overflow-hidden ${
                          menuStyle.position === 'left' ? 'left-0 border-r w-3/4' :
                          menuStyle.position === 'full' ? 'left-0 right-0' :
                          'right-0 border-l w-3/4'
                        } ${menuStyle.animationEnabled ? (animClassMap[menuStyle.animation] || '') : ''}`}
                      >
                        {/* Mini menu items */}
                        <div className="p-2 space-y-0.5">
                          <p className="text-[6px] text-zinc-500 uppercase tracking-wider px-1.5 py-1">เมนูหลัก</p>
                          {[1,2,3,4,5].map(i => (
                            <div key={i} className="flex items-center gap-1.5 px-1.5 py-1 rounded">
                              <div className="w-3.5 h-3.5 rounded bg-zinc-800" />
                              <div className={`h-1.5 rounded bg-zinc-700`} style={{ width: `${40 + i * 8}px` }} />
                            </div>
                          ))}
                          <p className="text-[6px] text-zinc-500 uppercase tracking-wider px-1.5 py-1 mt-1">บัญชีของฉัน</p>
                          {[1,2,3].map(i => (
                            <div key={i} className="flex items-center gap-1.5 px-1.5 py-1 rounded">
                              <div className="w-3.5 h-3.5 rounded bg-zinc-800" />
                              <div className={`h-1.5 rounded bg-zinc-700`} style={{ width: `${35 + i * 10}px` }} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Placeholder content */}
                    {!previewAnim && (
                      <div className="px-3 py-6 flex flex-col items-center gap-2 text-center">
                        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                          <Play className="w-5 h-5 text-zinc-600" />
                        </div>
                        <p className="text-[9px] text-zinc-600 font-medium">กด &ldquo;เล่นซ้ำ&rdquo; เพื่อดูตัวอย่าง</p>
                        <p className="text-[8px] text-zinc-700">
                          {animationOptions.find(a => a.id === menuStyle.animation)?.labelTh || 'Slide Right'}
                          {' '}• {positionOptions.find(p => p.id === menuStyle.position)?.labelTh || 'ขวา'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Current style summary */}
              <div className="mt-4 p-3 rounded-xl bg-zinc-900/50 border border-white/5 space-y-2">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">ตั้งค่าปัจจุบัน</p>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">อนิเมชัน</span>
                    <span className={menuStyle.animationEnabled ? 'text-violet-400 font-medium' : 'text-zinc-600'}>
                      {menuStyle.animationEnabled
                        ? animationOptions.find(a => a.id === menuStyle.animation)?.labelTh
                        : 'ปิด'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">ตำแหน่ง</span>
                    <span className="text-blue-400 font-medium">{positionOptions.find(p => p.id === menuStyle.position)?.labelTh}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">เบลอพื้นหลัง</span>
                    <span className={menuStyle.backdropBlur ? 'text-cyan-400' : 'text-zinc-600'}>{menuStyle.backdropBlur ? 'เปิด' : 'ปิด'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">ความทึบ</span>
                    <span className="text-zinc-300 font-mono">{menuStyle.backdropOpacity}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== NAVBAR ICONS TAB ===== */}
      {activeTab === 'navbar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Wallet Icon */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center">
                    {(() => { const WIcon = getIcon(navbarIcons.walletIcon); return <WIcon className="w-4 h-4 text-amber-400" /> })()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">ไอคอนยอดเงิน (Wallet)</h3>
                    <p className="text-[11px] text-zinc-500">ไอคอนที่แสดงข้างยอดเงินบน Navbar — ค่าเริ่มต้น: Wallet</p>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setNavbarIconPicker('walletIcon')}
                    className="group/icon relative w-16 h-16 rounded-2xl bg-zinc-900 border-2 border-dashed border-white/10 hover:border-amber-500/40 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    {(() => { const WIcon = getIcon(navbarIcons.walletIcon); return <WIcon className="w-7 h-7 text-amber-400 group-hover/icon:opacity-30 transition-opacity" /> })()}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/icon:opacity-100 transition-opacity">
                      <PenTool className="w-5 h-5 text-amber-400" />
                    </div>
                  </button>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">{navbarIcons.walletIcon}</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">กดที่ไอคอนเพื่อเปลี่ยน</p>
                    {navbarIcons.walletIcon !== 'Wallet' && (
                      <button
                        onClick={() => setNavbarIcons(prev => ({ ...prev, walletIcon: 'Wallet' }))}
                        className="mt-2 text-[10px] text-amber-400/60 hover:text-amber-400 underline transition-colors"
                      >
                        รีเซ็ตเป็นค่าเริ่มต้น (Wallet)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Open Icon */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center">
                    {(() => { const MIcon = getIcon(navbarIcons.menuIcon); return <MIcon className="w-4 h-4 text-emerald-400" /> })()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">ไอคอนเปิดเมนู (Menu)</h3>
                    <p className="text-[11px] text-zinc-500">ไอคอนปุ่มเปิดเมนูแฮมเบอร์เกอร์ — ค่าเริ่มต้น: Menu</p>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setNavbarIconPicker('menuIcon')}
                    className="group/icon relative w-16 h-16 rounded-2xl bg-zinc-900 border-2 border-dashed border-white/10 hover:border-emerald-500/40 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    {(() => { const MIcon = getIcon(navbarIcons.menuIcon); return <MIcon className="w-7 h-7 text-emerald-400 group-hover/icon:opacity-30 transition-opacity" /> })()}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/icon:opacity-100 transition-opacity">
                      <PenTool className="w-5 h-5 text-emerald-400" />
                    </div>
                  </button>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">{navbarIcons.menuIcon}</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">กดที่ไอคอนเพื่อเปลี่ยน</p>
                    {navbarIcons.menuIcon !== 'Menu' && (
                      <button
                        onClick={() => setNavbarIcons(prev => ({ ...prev, menuIcon: 'Menu' }))}
                        className="mt-2 text-[10px] text-emerald-400/60 hover:text-emerald-400 underline transition-colors"
                      >
                        รีเซ็ตเป็นค่าเริ่มต้น (Menu)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Close Icon */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-center">
                    {(() => { const CIcon = getIcon(navbarIcons.menuCloseIcon); return <CIcon className="w-4 h-4 text-rose-400" /> })()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">ไอคอนปิดเมนู (Close)</h3>
                    <p className="text-[11px] text-zinc-500">ไอคอนปุ่มปิดเมนูแฮมเบอร์เกอร์ — ค่าเริ่มต้น: X</p>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setNavbarIconPicker('menuCloseIcon')}
                    className="group/icon relative w-16 h-16 rounded-2xl bg-zinc-900 border-2 border-dashed border-white/10 hover:border-rose-500/40 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    {(() => { const CIcon = getIcon(navbarIcons.menuCloseIcon); return <CIcon className="w-7 h-7 text-rose-400 group-hover/icon:opacity-30 transition-opacity" /> })()}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/icon:opacity-100 transition-opacity">
                      <PenTool className="w-5 h-5 text-rose-400" />
                    </div>
                  </button>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">{navbarIcons.menuCloseIcon}</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">กดที่ไอคอนเพื่อเปลี่ยน</p>
                    {navbarIcons.menuCloseIcon !== 'X' && (
                      <button
                        onClick={() => setNavbarIcons(prev => ({ ...prev, menuCloseIcon: 'X' }))}
                        className="mt-2 text-[10px] text-rose-400/60 hover:text-rose-400 underline transition-colors"
                      >
                        รีเซ็ตเป็นค่าเริ่มต้น (X)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Info note */}
            <div className="px-4 py-3 rounded-xl bg-cyan-500/5 border border-cyan-500/10 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div className="text-[11px] text-cyan-400/80 space-y-1">
                <p><strong className="text-cyan-300">ไอคอนยอดเงิน</strong> — แสดงข้างตัวเลขยอดเงินของผู้ใช้ (ทั้งมือถือ+คอม)</p>
                <p><strong className="text-cyan-300">ไอคอนเปิดเมนู</strong> — แสดงเมื่อเมนูยังไม่ได้เปิด (ปุ่มแฮมเบอร์เกอร์)</p>
                <p><strong className="text-cyan-300">ไอคอนปิดเมนู</strong> — แสดงเมื่อเมนูเปิดอยู่ (ปุ่มปิด)</p>
              </div>
            </div>
          </div>

          {/* Right: Phone Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="flex items-center gap-2 mb-3">
                <Smartphone className="w-4 h-4 text-zinc-500" />
                <h3 className="text-sm font-bold text-white">ตัวอย่าง Navbar</h3>
              </div>

              {/* Phone mockup */}
              <div className="relative w-full max-w-[280px] mx-auto">
                <div className="bg-black rounded-[28px] border-2 border-zinc-700 p-2 shadow-2xl shadow-black/50">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-b-2xl z-20" />
                  <div className="bg-zinc-950 rounded-[20px] overflow-hidden">
                    {/* Mini Navbar - closed state */}
                    <div className="flex items-center justify-between px-3 py-3 border-b border-zinc-800">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-md bg-zinc-800" />
                        <span className="text-[8px] font-black text-white">VPN</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Wallet icon preview */}
                        <div className="flex items-center gap-1 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-lg">
                          {(() => { const WIcon = getIcon(navbarIcons.walletIcon); return <WIcon className="w-3 h-3 text-zinc-400" /> })()}
                          <span className="text-[8px] font-bold text-white">1,250</span>
                        </div>
                        {/* Menu icon preview */}
                        <div className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                          {(() => { const MIcon = getIcon(navbarIcons.menuIcon); return <MIcon className="w-3.5 h-3.5 text-zinc-400" /> })()}
                        </div>
                      </div>
                    </div>

                    {/* Fake page content */}
                    <div className="px-3 py-4 space-y-3">
                      <div className="h-20 rounded-xl bg-zinc-900 border border-zinc-800" />
                      <div className="grid grid-cols-2 gap-2">
                        <div className="h-12 rounded-lg bg-zinc-900 border border-zinc-800" />
                        <div className="h-12 rounded-lg bg-zinc-900 border border-zinc-800" />
                      </div>
                      <div className="h-8 rounded-lg bg-zinc-900/50 border border-zinc-800" />
                    </div>

                    {/* Divider label */}
                    <div className="px-3 py-2 border-t border-zinc-800">
                      <p className="text-[7px] text-zinc-600 text-center font-medium">เมนูปิด</p>
                    </div>

                    {/* Mini Navbar - open state */}
                    <div className="flex items-center justify-between px-3 py-3 border-t border-b border-zinc-800 bg-zinc-900/30">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-md bg-zinc-800" />
                        <span className="text-[8px] font-black text-white">VPN</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Wallet icon preview */}
                        <div className="flex items-center gap-1 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-lg">
                          {(() => { const WIcon = getIcon(navbarIcons.walletIcon); return <WIcon className="w-3 h-3 text-zinc-400" /> })()}
                          <span className="text-[8px] font-bold text-white">1,250</span>
                        </div>
                        {/* Close icon preview (white bg like real) */}
                        <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center">
                          {(() => { const CIcon = getIcon(navbarIcons.menuCloseIcon); return <CIcon className="w-3.5 h-3.5 text-black" /> })()}
                        </div>
                      </div>
                    </div>
                    <div className="px-3 py-2">
                      <p className="text-[7px] text-zinc-600 text-center font-medium">เมนูเปิด</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current config summary */}
              <div className="mt-4 p-3 rounded-xl bg-zinc-900/50 border border-white/5 space-y-2">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">ไอคอนปัจจุบัน</p>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">ยอดเงิน</span>
                    <div className="flex items-center gap-1.5">
                      {(() => { const WIcon = getIcon(navbarIcons.walletIcon); return <WIcon className="w-3.5 h-3.5 text-amber-400" /> })()}
                      <span className="text-amber-400 font-medium">{navbarIcons.walletIcon}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">เปิดเมนู</span>
                    <div className="flex items-center gap-1.5">
                      {(() => { const MIcon = getIcon(navbarIcons.menuIcon); return <MIcon className="w-3.5 h-3.5 text-emerald-400" /> })()}
                      <span className="text-emerald-400 font-medium">{navbarIcons.menuIcon}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">ปิดเมนู</span>
                    <div className="flex items-center gap-1.5">
                      {(() => { const CIcon = getIcon(navbarIcons.menuCloseIcon); return <CIcon className="w-3.5 h-3.5 text-rose-400" /> })()}
                      <span className="text-rose-400 font-medium">{navbarIcons.menuCloseIcon}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navbar Icon Picker Modal */}
      <IconPickerModal
        isOpen={navbarIconPicker !== null}
        onClose={() => setNavbarIconPicker(null)}
        currentIcon={navbarIconPicker ? navbarIcons[navbarIconPicker] : ''}
        onSelect={(name) => {
          if (navbarIconPicker) {
            setNavbarIcons(prev => ({ ...prev, [navbarIconPicker]: name }))
          }
        }}
      />

      {/* ===== MENU TAB ===== */}
      {activeTab === 'menu' && (
      <>
      {/* Hint */}
      <div className="mb-4 px-4 py-2.5 rounded-xl bg-orange-500/5 border border-orange-500/10 flex items-center gap-2">
        <PenTool className="w-3.5 h-3.5 text-orange-400 shrink-0" />
        <span className="text-[11px] text-orange-400/80">กดที่ <strong className="text-orange-300">ไอคอนของเมนู</strong> เพื่อเปลี่ยนไอคอนได้ (50+ แบบ)</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Section editor (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          {sections.map((section, sIdx) => (
            <div key={section.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.01] overflow-hidden">
              {/* Section header */}
              <div
                className="flex items-center gap-3 px-4 py-3 bg-zinc-900/50 border-b border-white/5 cursor-pointer hover:bg-zinc-900/80 transition-all"
                onClick={() => toggleSection(section.id)}
              >
                {expandedSections[section.id] ? (
                  <ChevronDown className="w-4 h-4 text-zinc-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                )}
                <input
                  type="text"
                  value={section.label}
                  onChange={(e) => editSectionLabel(sIdx, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-transparent border-none outline-none text-sm font-bold text-white flex-1 min-w-0"
                  placeholder="ชื่อเซ็คชัน"
                />
                <span className="text-[10px] text-zinc-600 shrink-0">
                  {section.items.filter(i => i.visible).length}/{section.items.length} แสดง
                </span>
              </div>

              {/* Items */}
              {expandedSections[section.id] && (
                <div className="divide-y divide-white/[0.03]">
                  {section.items.map((item, iIdx) => {
                    const Icon = getIcon(item.iconName)
                    const isDragging = dragItem?.sectionIdx === sIdx && dragItem?.itemIdx === iIdx
                    const isDragOver = dragOverItem?.sectionIdx === sIdx && dragOverItem?.itemIdx === iIdx

                    return (
                      <div
                        key={item.href}
                        draggable
                        onDragStart={() => handleDragStart(sIdx, iIdx)}
                        onDragOver={(e) => handleDragOver(e, sIdx, iIdx)}
                        onDrop={() => handleDrop(sIdx, iIdx)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center gap-2.5 px-3 py-2.5 transition-all ${
                          isDragging ? 'opacity-30 scale-95' : ''
                        } ${isDragOver ? 'bg-orange-500/10 border-l-2 border-orange-500' : ''
                        } ${!item.visible ? 'opacity-40' : ''
                        } hover:bg-white/[0.02]`}
                      >
                        {/* Drag handle */}
                        <GripVertical className="w-4 h-4 text-zinc-700 hover:text-zinc-400 cursor-grab shrink-0" />

                        {/* Icon (clickable to change) */}
                        <button
                          onClick={() => setIconPickerTarget({ sectionIdx: sIdx, itemIdx: iIdx })}
                          title="กดเพื่อเปลี่ยนไอคอน"
                          className={`group/icon relative w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 ${item.color} hover:ring-2 hover:ring-orange-500/40 hover:bg-zinc-700 transition-all cursor-pointer`}
                        >
                          <Icon className="w-4 h-4 group-hover/icon:opacity-30 transition-opacity" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/icon:opacity-100 transition-opacity">
                            <PenTool className="w-3.5 h-3.5 text-orange-400" />
                          </div>
                        </button>

                        {/* Label + href */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${item.visible ? 'text-white' : 'text-zinc-600 line-through'}`}>
                            {item.label}
                          </p>
                          <p className="text-[10px] text-zinc-600 truncate">{item.href}</p>
                        </div>

                        {/* NEW badge toggle */}
                        <button
                          onClick={() => toggleNew(sIdx, iIdx)}
                          className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider transition-all shrink-0 ${
                            item.isNew
                              ? 'bg-white/10 border border-white/20 text-white'
                              : 'bg-zinc-900 border border-zinc-800 text-zinc-700 hover:text-zinc-400'
                          }`}
                        >
                          NEW
                        </button>

                        {/* Move to section */}
                        <select
                          value={section.id}
                          onChange={(e) => moveToSection(sIdx, iIdx, e.target.value)}
                          className="bg-zinc-900 border border-zinc-800 rounded-lg px-1.5 py-1 text-[10px] text-zinc-400 outline-none shrink-0 max-w-[80px]"
                        >
                          {sections.map(s => (
                            <option key={s.id} value={s.id}>{s.label}</option>
                          ))}
                        </select>

                        {/* Move up/down */}
                        <div className="flex flex-col gap-0.5 shrink-0">
                          <button
                            onClick={() => moveItem(sIdx, iIdx, 'up')}
                            disabled={iIdx === 0}
                            className="p-0.5 rounded hover:bg-zinc-800 text-zinc-600 hover:text-zinc-300 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => moveItem(sIdx, iIdx, 'down')}
                            disabled={iIdx === section.items.length - 1}
                            className="p-0.5 rounded hover:bg-zinc-800 text-zinc-600 hover:text-zinc-300 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Visibility toggle */}
                        <button
                          onClick={() => toggleVisibility(sIdx, iIdx)}
                          className={`p-1.5 rounded-lg transition-all shrink-0 ${
                            item.visible
                              ? 'text-emerald-400 hover:bg-emerald-500/10'
                              : 'text-zinc-600 hover:bg-zinc-800 hover:text-zinc-400'
                          }`}
                        >
                          {item.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                      </div>
                    )
                  })}

                  {section.items.length === 0 && (
                    <div className="px-4 py-8 text-center text-zinc-600 text-xs">
                      ไม่มีเมนูในเซ็คชันนี้ - ลากเมนูมาวางที่นี่
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right: Phone Preview (1 col) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <div className="flex items-center gap-2 mb-3">
              <Smartphone className="w-4 h-4 text-zinc-500" />
              <h3 className="text-sm font-bold text-white">ตัวอย่างเมนู</h3>
            </div>

            {/* Phone mockup */}
            <div className="relative w-full max-w-[280px] mx-auto">
              {/* Phone frame */}
              <div className="bg-black rounded-[28px] border-2 border-zinc-700 p-2 shadow-2xl shadow-black/50">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-b-2xl z-20" />

                {/* Screen */}
                <div className="bg-zinc-950 rounded-[20px] overflow-hidden">
                  {/* Mini Navbar */}
                  <div className="flex items-center justify-between px-3 py-2.5 border-b border-zinc-800">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-md bg-zinc-800" />
                      <span className="text-[8px] font-black text-white">VPN</span>
                    </div>
                    <div className="w-5 h-5 rounded-md bg-white flex items-center justify-center">
                      <MenuIcon className="w-3 h-3 text-black" />
                    </div>
                  </div>

                  {/* User card */}
                  <div className="px-3 pt-3 pb-2">
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[8px] font-bold text-white">U</div>
                      <div>
                        <p className="text-[7px] text-zinc-500">ยินดีต้อนรับ</p>
                        <p className="text-[9px] font-bold text-white">Username</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu sections */}
                  <div className="px-3 pb-4 max-h-[350px] overflow-y-auto space-y-3">
                    {sections.map((section) => {
                      const visibleItems = section.items.filter(i => i.visible)
                      if (visibleItems.length === 0) return null

                      return (
                        <div key={section.id}>
                          <p className={`text-[7px] font-medium uppercase tracking-wider px-2 mb-1 ${section.color}`}>
                            {section.label}
                          </p>
                          <div className="space-y-0.5">
                            {visibleItems.map((item) => {
                              const Icon = getIcon(item.iconName)
                              return (
                                <div key={item.href} className="flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-zinc-800 group">
                                  <div className={`w-5 h-5 rounded bg-zinc-800 flex items-center justify-center ${item.color}`}>
                                    <Icon className="w-2.5 h-2.5" />
                                  </div>
                                  <span className={`text-[8px] font-medium flex-1 ${item.color === 'text-zinc-400' ? 'text-zinc-400' : item.color}`}>
                                    {item.label}
                                  </span>
                                  {item.isNew && (
                                    <span className="px-1 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-[5px] font-black text-zinc-300">NEW</span>
                                  )}
                                  <ChevronRight className="w-2.5 h-2.5 text-zinc-700" />
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Logout button */}
                  <div className="px-3 pb-3 pt-1 border-t border-zinc-800">
                    <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-md">
                      <span className="text-[8px] font-medium text-rose-400">ออกจากระบบ</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </>
      )}

      {/* Bottom save bar (mobile) */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 lg:hidden z-50 p-4 bg-zinc-950/90 backdrop-blur-xl border-t border-white/5">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/20"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> กำลังบันทึก...</>
            ) : (
              <><Save className="w-4 h-4" /> บันทึกเมนู</>
            )}
          </button>
        </div>
      )}

      {/* Icon Picker Modal */}
      <IconPickerModal
        isOpen={iconPickerTarget !== null}
        onClose={() => setIconPickerTarget(null)}
        currentIcon={iconPickerTarget ? sections[iconPickerTarget.sectionIdx]?.items[iconPickerTarget.itemIdx]?.iconName || '' : ''}
        onSelect={(name) => {
          if (iconPickerTarget) {
            editItemIcon(iconPickerTarget.sectionIdx, iconPickerTarget.itemIdx, name)
          }
        }}
      />
    </div>
  )
}
