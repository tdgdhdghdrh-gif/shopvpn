'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  LayoutDashboard, Eye, EyeOff, ChevronUp, ChevronDown,
  Plus, Trash2, Edit3, Save, X, Loader2, Check,
  Shield, Clock, Globe, UserPlus, CreditCard, ShoppingBag, Ticket,
  BookOpen, Zap, Heart, Star, AlertTriangle, Bell, Gift, Trophy,
  Palette, Monitor, Smartphone, BarChart3, RefreshCw,
  Type, Image, Link2, Code, Home, MessageSquare, Volume2,
  Megaphone, Headphones, Map, Phone, Mail, Send, Download,
  ExternalLink, Play, Music, Film, Camera, Wifi, Lock, Settings,
  Search, Users, CalendarDays, Tag, Percent, Crown, Flame,
  Info, HelpCircle, FileText, Package, Rocket, ThumbsUp, Share2,
  Wallet, Server,
} from 'lucide-react'

// ==================== Icon Map ====================
const ICON_MAP: Record<string, any> = {
  Shield, Clock, Globe, UserPlus, CreditCard, ShoppingBag, Ticket,
  BookOpen, Zap, Heart, Star, AlertTriangle, Bell, Gift, Trophy,
  Palette, Monitor, Smartphone, BarChart3, Eye, Settings, Sparkles: Flame,
  LayoutDashboard, Image, Link2, Code, RefreshCw, Plus, Edit3, Save,
  Type, Home, MessageSquare, Volume2, Megaphone, Headphones, Map,
  Phone, Mail, Send, Download, ExternalLink, Play, Music, Film,
  Camera, Wifi, Lock, Search, Users, CalendarDays, Tag, Percent,
  Crown, Flame, Info, HelpCircle, FileText, Package, Rocket, ThumbsUp, Share2,
  Wallet, Server,
}

// จัดกลุ่ม icon สำหรับ picker
const ICON_GROUPS = [
  { label: 'ทั่วไป', icons: ['Home', 'Star', 'Heart', 'Zap', 'Crown', 'Flame', 'Trophy', 'Gift', 'Rocket', 'ThumbsUp'] },
  { label: 'ช็อป/เงิน', icons: ['CreditCard', 'ShoppingBag', 'Tag', 'Percent', 'Package', 'Wallet'] },
  { label: 'สื่อสาร', icons: ['MessageSquare', 'Bell', 'Mail', 'Send', 'Phone', 'Megaphone', 'Share2'] },
  { label: 'สถานะ', icons: ['Shield', 'Clock', 'Globe', 'Wifi', 'Lock', 'AlertTriangle', 'Info', 'Eye'] },
  { label: 'สื่อ/ไฟล์', icons: ['Image', 'Camera', 'Film', 'Music', 'Play', 'FileText', 'Download'] },
  { label: 'ผู้ใช้', icons: ['Users', 'UserPlus', 'Headphones', 'BookOpen', 'HelpCircle'] },
  { label: 'อื่นๆ', icons: ['Settings', 'Search', 'Map', 'CalendarDays', 'BarChart3', 'Monitor', 'Palette', 'Code', 'Link2', 'ExternalLink'] },
]

const ALL_ICON_NAMES = Object.keys(ICON_MAP)

// ==================== Color Options ====================
const COLOR_OPTIONS = [
  { name: 'cyan', label: 'ฟ้า', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400', dot: 'bg-cyan-400' },
  { name: 'emerald', label: 'เขียว', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  { name: 'amber', label: 'เหลือง', bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', dot: 'bg-amber-400' },
  { name: 'pink', label: 'ชมพู', bg: 'bg-pink-500/10', border: 'border-pink-500/20', text: 'text-pink-400', dot: 'bg-pink-400' },
  { name: 'blue', label: 'น้ำเงิน', bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', dot: 'bg-blue-400' },
  { name: 'violet', label: 'ม่วง', bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400', dot: 'bg-violet-400' },
  { name: 'red', label: 'แดง', bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', dot: 'bg-red-400' },
  { name: 'orange', label: 'ส้ม', bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400', dot: 'bg-orange-400' },
]

function getCC(colorName: string) {
  return COLOR_OPTIONS.find(c => c.name === colorName) || COLOR_OPTIONS[0]
}

function IconRender({ name, className }: { name: string; className?: string }) {
  const IC = ICON_MAP[name]
  if (!IC) return <Zap className={className} />
  return <IC className={className} />
}

// ==================== Section Labels (ภาษาไทย) ====================
const SECTION_LABELS: Record<string, string> = {
  hero: 'การ์ดต้อนรับ',
  stats: 'สถิติภาพรวม',
  quick_actions: 'ปุ่มลัด',
  banners: 'แบนเนอร์โปรโมชั่น',
  ads: 'โฆษณาผู้ใช้',
  expiry_warning: 'แจ้งเตือน VPN ใกล้หมด',
  recent_orders: 'รายการซื้อล่าสุด',
  servers: 'เลือกเซิร์ฟเวอร์',
  custom_text: 'ข้อความกำหนดเอง',
  custom_image: 'รูปภาพกำหนดเอง',
  custom_html: 'HTML กำหนดเอง',
  custom_link: 'ลิงก์กำหนดเอง',
}
const SECTION_ICONS: Record<string, string> = {
  hero: 'Home', stats: 'BarChart3', quick_actions: 'Zap', banners: 'Image', ads: 'Megaphone',
  expiry_warning: 'AlertTriangle', recent_orders: 'ShoppingBag', servers: 'Globe',
  custom_text: 'Type', custom_image: 'Image', custom_html: 'Code', custom_link: 'Link2',
}
const SECTION_DESCS: Record<string, string> = {
  hero: 'ชื่อ, อวาตาร์, ยอดเงิน, ปุ่มจัดการ',
  stats: 'VPN ที่ใช้, หมดอายุ, เซิร์ฟเวอร์, แนะนำเพื่อน',
  quick_actions: 'ปุ่มเติมเงิน, คำสั่งซื้อ, แจ้งปัญหา ฯลฯ',
  banners: 'สไลด์โปรโมชั่นอัตโนมัติ',
  ads: 'โฆษณาที่ผู้ใช้ฝากลงและได้รับอนุมัติ',
  expiry_warning: 'แจ้งเตือนเมื่อ VPN จะหมดภายใน 7 วัน',
  recent_orders: 'แถบวิ่งแสดงการซื้อล่าสุด',
  servers: 'รายการเซิร์ฟเวอร์ทั้งหมด',
}

// ==================== Section Templates ====================
const SECTION_TEMPLATES = [
  {
    id: 'custom_text',
    icon: 'Type',
    label: 'กล่องข้อความ',
    desc: 'เพิ่มข้อความ ประกาศ หรือคำอธิบาย',
    color: 'blue',
    defaults: { type: 'custom_text', title: 'ประกาศ', content: 'เนื้อหาที่ต้องการแสดง...' },
  },
  {
    id: 'custom_image',
    icon: 'Image',
    label: 'รูปภาพ/แบนเนอร์',
    desc: 'แสดงรูปภาพ กดไปลิงก์ได้',
    color: 'pink',
    defaults: { type: 'custom_image', title: 'แบนเนอร์' },
  },
  {
    id: 'custom_link',
    icon: 'Link2',
    label: 'ปุ่มลิงก์',
    desc: 'แถบลิงก์ กดไปหน้าอื่นหรือเว็บนอก',
    color: 'emerald',
    defaults: { type: 'custom_link', title: 'ลิงก์', linkUrl: '/', icon: 'ExternalLink' },
  },
  {
    id: 'custom_html',
    icon: 'Code',
    label: 'HTML กำหนดเอง',
    desc: 'ใส่โค้ด HTML ได้ตามต้องการ',
    color: 'violet',
    defaults: { type: 'custom_html', title: 'HTML' },
  },
]

// ==================== Quick Action Presets ====================
const QA_PRESETS = [
  { label: 'เติมเงิน', href: '/topup', icon: 'CreditCard', color: 'cyan' },
  { label: 'คำสั่งซื้อ', href: '/profile/orders', icon: 'ShoppingBag', color: 'emerald' },
  { label: 'แจ้งปัญหา', href: '/tickets', icon: 'Ticket', color: 'amber' },
  { label: 'วิธีใช้', href: '/setup-guide', icon: 'BookOpen', color: 'pink' },
  { label: 'ต่ออายุ', href: '/profile/renew', icon: 'RefreshCw', color: 'blue' },
  { label: 'แนะนำเพื่อน', href: '/profile/referral', icon: 'UserPlus', color: 'violet' },
  { label: 'กงล้อนำโชค', href: '/lucky-wheel', icon: 'Gift', color: 'orange' },
  { label: 'เช็คอินรายวัน', href: '/daily-checkin', icon: 'CalendarDays', color: 'emerald' },
  { label: 'คูปอง', href: '/coupons', icon: 'Tag', color: 'red' },
  { label: 'VIP', href: '/vip', icon: 'Crown', color: 'amber' },
  { label: 'ลีดเดอร์บอร์ด', href: '/leaderboard', icon: 'Trophy', color: 'orange' },
  { label: 'บทความ', href: '/blog', icon: 'FileText', color: 'blue' },
  { label: 'ติดต่อแอดมิน', href: '/contacts', icon: 'Phone', color: 'pink' },
  { label: 'เซิร์ฟเวอร์เปรียบเทียบ', href: '/server-compare', icon: 'BarChart3', color: 'violet' },
  { label: 'ทดลองใช้ฟรี', href: '/public-vless', icon: 'Wifi', color: 'cyan' },
  { label: 'รีวิว', href: '/reviews', icon: 'Star', color: 'amber' },
]

// ==================== Stat Card Presets (20 ประเภท) ====================
const STAT_PRESETS = [
  { type: 'active_vpn', label: 'VPN ที่ใช้อยู่', icon: 'Shield', color: 'emerald', desc: 'จำนวน VPN ที่ผู้ใช้กำลังใช้งาน', category: 'ส่วนตัว' },
  { type: 'nearest_expiry', label: 'หมดอายุเร็วสุด', icon: 'Clock', color: 'amber', desc: 'VPN ที่ใกล้หมดอายุที่สุดของผู้ใช้', category: 'ส่วนตัว' },
  { type: 'servers', label: 'เซิร์ฟเวอร์', icon: 'Globe', color: 'blue', desc: 'จำนวนเซิร์ฟเวอร์ทั้งหมด', category: 'ส่วนตัว' },
  { type: 'referrals', label: 'แนะนำเพื่อน', icon: 'UserPlus', color: 'violet', desc: 'จำนวนคนที่ผู้ใช้แนะนำ', category: 'ส่วนตัว' },
  { type: 'total_users', label: 'ผู้ใช้ทั้งหมด', icon: 'Users', color: 'cyan', desc: 'จำนวนสมาชิกทั้งหมดในระบบ', category: 'ระบบ' },
  { type: 'total_topups_amount', label: 'ยอดเติมเงินรวม', icon: 'Wallet', color: 'emerald', desc: 'ยอดเติมเงินสำเร็จทั้งหมด (฿)', category: 'การเงิน' },
  { type: 'total_sales', label: 'ยอดขายรวม', icon: 'ShoppingBag', color: 'pink', desc: 'ยอดขาย VPN ทั้งหมด (฿)', category: 'การเงิน' },
  { type: 'product_stock', label: 'สต๊อกสินค้า', icon: 'Package', color: 'orange', desc: 'สต๊อกสินค้าคงเหลือทั้งหมด', category: 'ระบบ' },
  { type: 'active_vpn_all', label: 'VPN ใช้งาน (ทั้งระบบ)', icon: 'Shield', color: 'emerald', desc: 'VPN ที่ active ทั้งระบบ', category: 'ระบบ' },
  { type: 'total_orders', label: 'ออเดอร์ทั้งหมด', icon: 'ShoppingBag', color: 'blue', desc: 'จำนวน VPN order ทั้งหมด', category: 'ระบบ' },
  { type: 'new_users_today', label: 'สมาชิกใหม่วันนี้', icon: 'UserPlus', color: 'cyan', desc: 'จำนวนผู้ใช้ที่สมัครวันนี้', category: 'ระบบ' },
  { type: 'new_users_month', label: 'สมาชิกใหม่เดือนนี้', icon: 'Users', color: 'blue', desc: 'จำนวนผู้ใช้ที่สมัครเดือนนี้', category: 'ระบบ' },
  { type: 'total_balance', label: 'ยอดเงินรวมผู้ใช้', icon: 'Wallet', color: 'amber', desc: 'ผลรวมยอดเงินคงเหลือของผู้ใช้ทุกคน (฿)', category: 'การเงิน' },
  { type: 'revenue_today', label: 'รายได้วันนี้', icon: 'CreditCard', color: 'emerald', desc: 'ยอดเติมเงินสำเร็จวันนี้ (฿)', category: 'การเงิน' },
  { type: 'revenue_month', label: 'รายได้เดือนนี้', icon: 'BarChart3', color: 'violet', desc: 'ยอดเติมเงินสำเร็จเดือนนี้ (฿)', category: 'การเงิน' },
  { type: 'active_servers', label: 'เซิร์ฟเวอร์ออนไลน์', icon: 'Wifi', color: 'emerald', desc: 'จำนวนเซิร์ฟเวอร์ที่เปิดใช้งาน', category: 'ระบบ' },
  { type: 'total_tickets', label: 'ตั๋วทั้งหมด', icon: 'Ticket', color: 'amber', desc: 'จำนวนตั๋วแจ้งปัญหาทั้งหมด', category: 'ระบบ' },
  { type: 'open_tickets', label: 'ตั๋วที่เปิดอยู่', icon: 'Ticket', color: 'red', desc: 'ตั๋วที่ยังไม่ปิด (open/pending)', category: 'ระบบ' },
  { type: 'total_blog_posts', label: 'บทความทั้งหมด', icon: 'BookOpen', color: 'blue', desc: 'จำนวนบทความในระบบ', category: 'ระบบ' },
  { type: 'total_reviews', label: 'รีวิวทั้งหมด', icon: 'Star', color: 'amber', desc: 'จำนวนรีวิวจากผู้ใช้', category: 'ระบบ' },
]

const STAT_CATEGORIES = ['ส่วนตัว', 'ระบบ', 'การเงิน']

// ==================== Types ====================
interface Section {
  id: string; type: string; title: string | null; isVisible: boolean; sortOrder: number
  content?: string | null; imageUrl?: string | null; linkUrl?: string | null
  bgColor?: string | null; textColor?: string | null; borderColor?: string | null
  icon?: string | null; config?: any
}
interface QuickAction {
  id: string; label: string; href: string; icon: string; color: string; isVisible: boolean; sortOrder: number
}
interface StatCard {
  id: string; type: string; label: string; icon: string; color: string; isVisible: boolean; sortOrder: number
}

// ==================== Toast ====================
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 2500); return () => clearTimeout(t) }, [onClose])
  return (
    <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-2.5 rounded-xl text-xs font-bold shadow-2xl border ${
      type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
    }`}>
      <div className="flex items-center gap-2">
        {type === 'success' ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
        {message}
      </div>
    </div>
  )
}

// ==================== Icon Picker Modal ====================
function IconPicker({ value, onChange, onClose }: { value: string; onChange: (v: string) => void; onClose: () => void }) {
  const [search, setSearch] = useState('')
  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[80vh] sm:max-h-[70vh] bg-zinc-900 border border-white/10 rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h3 className="text-sm font-bold text-white">เลือกไอคอน</h3>
          <button onClick={onClose} className="p-1 text-zinc-500 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <div className="px-4 pt-3">
          <input
            className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50"
            placeholder="ค้นหาไอคอน..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {ICON_GROUPS.map(group => {
            const filtered = group.icons.filter(i => ICON_MAP[i] && (!search || i.toLowerCase().includes(search.toLowerCase())))
            if (filtered.length === 0) return null
            return (
              <div key={group.label}>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2">{group.label}</p>
                <div className="grid grid-cols-5 sm:grid-cols-8 gap-1.5">
                  {filtered.map(iconName => (
                    <button
                      key={iconName}
                      onClick={() => { onChange(iconName); onClose() }}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                        value === iconName
                          ? 'bg-blue-500/15 border border-blue-500/30 text-blue-400 ring-1 ring-blue-500/20'
                          : 'border border-transparent hover:bg-white/5 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <IconRender name={iconName} className="w-5 h-5" />
                      <span className="text-[8px] leading-tight truncate w-full text-center">{iconName}</span>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ==================== Color Picker Inline ====================
function ColorPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {COLOR_OPTIONS.map(c => (
        <button
          key={c.name}
          onClick={() => onChange(c.name)}
          title={c.label}
          className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${
            value === c.name ? `${c.border} ring-2 ring-offset-1 ring-offset-black/80 ${c.dot.replace('bg-', 'ring-')}` : 'border-white/10 hover:border-white/20'
          } ${c.bg}`}
        >
          <div className={`w-3 h-3 rounded-full ${c.dot}`} />
        </button>
      ))}
    </div>
  )
}

// ==================== Shared Styles ====================
const inputClass = "w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
const labelClass = "text-[11px] text-zinc-500 font-bold mb-1.5 block"
const btnPrimary = "px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all active:scale-95 flex items-center gap-1.5"
const btnGhost = "px-4 py-2.5 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all active:scale-95"

// ==================== MAIN PAGE ====================
export default function HomepageBuilderPage() {
  const [sections, setSections] = useState<Section[]>([])
  const [quickActions, setQuickActions] = useState<QuickAction[]>([])
  const [statCards, setStatCards] = useState<StatCard[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [activeTab, setActiveTab] = useState<'sections' | 'quick_actions' | 'stats'>('sections')

  // Editing states
  const [editingSection, setEditingSection] = useState<Section | null>(null)
  const [editingQA, setEditingQA] = useState<QuickAction | null>(null)
  const [editingStat, setEditingStat] = useState<StatCard | null>(null)

  // Add modals
  const [showAddSection, setShowAddSection] = useState(false)
  const [showAddQA, setShowAddQA] = useState(false)
  const [showAddStat, setShowAddStat] = useState(false)
  const [showIconPicker, setShowIconPicker] = useState<{ target: 'qa' | 'stat' | 'section'; field?: string } | null>(null)

  const showToast = useCallback((msg: string, type: 'success' | 'error') => setToast({ message: msg, type }), [])

  // ============ Fetch ============
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/homepage')
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setSections(data.sections || [])
      setQuickActions(data.quickActions || [])
      setStatCards(data.statCards || [])
    } catch (err: any) {
      showToast(err.message || 'โหลดข้อมูลไม่สำเร็จ', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => { fetchData() }, [fetchData])

  // ============ API Helper ============
  const api = async (method: string, body?: any, params?: string) => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/homepage' + (params || ''), {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || 'ไม่สำเร็จ')
      return data
    } finally {
      setSaving(false)
    }
  }

  // ============ Section Handlers ============
  const moveSection = async (idx: number, dir: 'up' | 'down') => {
    const items = [...sections]
    const t = dir === 'up' ? idx - 1 : idx + 1
    if (t < 0 || t >= items.length) return
    ;[items[idx], items[t]] = [items[t], items[idx]]
    const reordered = items.map((item, i) => ({ ...item, sortOrder: i }))
    setSections(reordered)
    try {
      await api('PUT', { action: 'reorder_sections', items: reordered.map(s => ({ id: s.id, sortOrder: s.sortOrder })) })
      showToast('ย้ายตำแหน่งแล้ว', 'success')
    } catch { showToast('ย้ายไม่สำเร็จ', 'error') }
  }

  const toggleSection = async (id: string, vis: boolean) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, isVisible: vis } : s))
    try {
      await api('PUT', { action: 'toggle_section', id, isVisible: vis })
      showToast(vis ? 'เปิดแสดง' : 'ซ่อนแล้ว', 'success')
    } catch { showToast('ไม่สำเร็จ', 'error') }
  }

  const saveSection = async (s: Section) => {
    try {
      await api('PUT', { action: 'update_section', ...s })
      setSections(prev => prev.map(x => x.id === s.id ? s : x))
      setEditingSection(null)
      showToast('บันทึกแล้ว', 'success')
    } catch { showToast('บันทึกไม่สำเร็จ', 'error') }
  }

  const addSectionFromTemplate = async (tpl: typeof SECTION_TEMPLATES[0]) => {
    try {
      await api('POST', { target: 'section', ...tpl.defaults })
      showToast('เพิ่มแล้ว', 'success')
      setShowAddSection(false)
      fetchData()
    } catch { showToast('เพิ่มไม่สำเร็จ', 'error') }
  }

  const deleteSection = async (id: string) => {
    if (!confirm('ลบส่วนนี้?')) return
    try {
      await api('DELETE', undefined, `?target=section&id=${id}`)
      setSections(prev => prev.filter(s => s.id !== id))
      showToast('ลบแล้ว', 'success')
    } catch (e: any) { showToast(e.message || 'ลบไม่ได้', 'error') }
  }

  // ============ Quick Action Handlers ============
  const moveQA = async (idx: number, dir: 'up' | 'down') => {
    const items = [...quickActions]
    const t = dir === 'up' ? idx - 1 : idx + 1
    if (t < 0 || t >= items.length) return
    ;[items[idx], items[t]] = [items[t], items[idx]]
    const reordered = items.map((item, i) => ({ ...item, sortOrder: i }))
    setQuickActions(reordered)
    try {
      await api('PUT', { action: 'reorder_quick_actions', items: reordered.map(q => ({ id: q.id, sortOrder: q.sortOrder })) })
      showToast('ย้ายตำแหน่งแล้ว', 'success')
    } catch { showToast('ย้ายไม่สำเร็จ', 'error') }
  }

  const toggleQA = async (id: string, vis: boolean) => {
    setQuickActions(prev => prev.map(q => q.id === id ? { ...q, isVisible: vis } : q))
    try {
      await api('PUT', { action: 'toggle_quick_action', id, isVisible: vis })
      showToast(vis ? 'เปิดแสดง' : 'ซ่อนแล้ว', 'success')
    } catch { showToast('ไม่สำเร็จ', 'error') }
  }

  const saveQA = async (qa: QuickAction) => {
    try {
      await api('PUT', { action: 'update_quick_action', ...qa })
      setQuickActions(prev => prev.map(q => q.id === qa.id ? qa : q))
      setEditingQA(null)
      showToast('บันทึกแล้ว', 'success')
    } catch { showToast('บันทึกไม่สำเร็จ', 'error') }
  }

  const addQAFromPreset = async (preset: typeof QA_PRESETS[0]) => {
    try {
      await api('POST', { target: 'quick_action', ...preset })
      showToast('เพิ่มแล้ว', 'success')
      setShowAddQA(false)
      fetchData()
    } catch { showToast('เพิ่มไม่สำเร็จ', 'error') }
  }

  const deleteQA = async (id: string) => {
    if (!confirm('ลบปุ่มนี้?')) return
    try {
      await api('DELETE', undefined, `?target=quick_action&id=${id}`)
      setQuickActions(prev => prev.filter(q => q.id !== id))
      showToast('ลบแล้ว', 'success')
    } catch { showToast('ลบไม่สำเร็จ', 'error') }
  }

  // ============ Stat Card Handlers ============
  const moveStat = async (idx: number, dir: 'up' | 'down') => {
    const items = [...statCards]
    const t = dir === 'up' ? idx - 1 : idx + 1
    if (t < 0 || t >= items.length) return
    ;[items[idx], items[t]] = [items[t], items[idx]]
    const reordered = items.map((item, i) => ({ ...item, sortOrder: i }))
    setStatCards(reordered)
    try {
      await api('PUT', { action: 'reorder_stat_cards', items: reordered.map(s => ({ id: s.id, sortOrder: s.sortOrder })) })
      showToast('ย้ายตำแหน่งแล้ว', 'success')
    } catch { showToast('ย้ายไม่สำเร็จ', 'error') }
  }

  const toggleStat = async (id: string, vis: boolean) => {
    setStatCards(prev => prev.map(s => s.id === id ? { ...s, isVisible: vis } : s))
    try {
      await api('PUT', { action: 'toggle_stat_card', id, isVisible: vis })
      showToast(vis ? 'เปิดแสดง' : 'ซ่อนแล้ว', 'success')
    } catch { showToast('ไม่สำเร็จ', 'error') }
  }

  const saveStat = async (stat: StatCard) => {
    try {
      await api('PUT', { action: 'update_stat_card', ...stat })
      setStatCards(prev => prev.map(s => s.id === stat.id ? stat : s))
      setEditingStat(null)
      showToast('บันทึกแล้ว', 'success')
    } catch { showToast('บันทึกไม่สำเร็จ', 'error') }
  }

  const addStatFromPreset = async (preset: typeof STAT_PRESETS[0]) => {
    try {
      await api('POST', { target: 'stat_card', type: preset.type, label: preset.label, icon: preset.icon, color: preset.color })
      showToast('เพิ่มแล้ว', 'success')
      setShowAddStat(false)
      fetchData()
    } catch { showToast('เพิ่มไม่สำเร็จ', 'error') }
  }

  const deleteStat = async (id: string) => {
    if (!confirm('ลบการ์ดสถิตินี้?')) return
    try {
      await api('DELETE', undefined, `?target=stat_card&id=${id}`)
      setStatCards(prev => prev.filter(s => s.id !== id))
      showToast('ลบแล้ว', 'success')
    } catch { showToast('ลบไม่สำเร็จ', 'error') }
  }

  // ============ Loading ============
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-zinc-500">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-sm font-medium">กำลังโหลด...</span>
        </div>
      </div>
    )
  }

  // ============ RENDER ============
  return (
    <div className="space-y-5">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Icon Picker Modal */}
      {showIconPicker && (
        <IconPicker
          value={
            showIconPicker.target === 'qa' ? (editingQA?.icon || '') :
            showIconPicker.target === 'stat' ? (editingStat?.icon || '') :
            (editingSection?.icon || '')
          }
          onChange={(v) => {
            if (showIconPicker.target === 'qa' && editingQA) setEditingQA({ ...editingQA, icon: v })
            if (showIconPicker.target === 'stat' && editingStat) setEditingStat({ ...editingStat, icon: v })
            if (showIconPicker.target === 'section' && editingSection) setEditingSection({ ...editingSection, icon: v })
          }}
          onClose={() => setShowIconPicker(null)}
        />
      )}

      {/* ===== Header ===== */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">ตกแต่งหน้าแรก</h1>
            <p className="text-[11px] text-zinc-500 mt-0.5">จัดการ Section, ปุ่มลัด, สถิติ บนหน้าแรกของผู้ใช้</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchData} className="p-2.5 rounded-xl bg-zinc-800 border border-white/10 text-zinc-400 hover:text-white transition-all active:scale-95">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <a href="/" target="_blank" className="hidden sm:flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 text-xs font-bold transition-all">
              <ExternalLink className="w-3.5 h-3.5" />
              ดูหน้าแรก
            </a>
          </div>
        </div>
      </div>

      {/* ===== Tabs ===== */}
      <div className="flex gap-1 p-1 bg-zinc-900/80 border border-white/5 rounded-xl overflow-x-auto no-scrollbar">
        {([
          { key: 'sections' as const, label: 'ส่วนแสดง', icon: LayoutDashboard, count: sections.length },
          { key: 'quick_actions' as const, label: 'ปุ่มลัด', icon: Zap, count: quickActions.length },
          { key: 'stats' as const, label: 'สถิติ', icon: BarChart3, count: statCards.length },
        ]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex-1 sm:flex-none justify-center sm:justify-start ${
              activeTab === tab.key
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                : 'text-zinc-500 hover:text-white border border-transparent'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.label}</span>
            <span className={`ml-auto sm:ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${
              activeTab === tab.key ? 'bg-blue-500/20 text-blue-300' : 'bg-zinc-800 text-zinc-500'
            }`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* ============================================ */}
      {/* ===== TAB: ส่วนแสดง (Sections) ===== */}
      {/* ============================================ */}
      {activeTab === 'sections' && (
        <div className="space-y-3">
          {/* Preview bar */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-3 sm:p-4">
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2">ลำดับที่แสดง</p>
            <div className="flex flex-wrap gap-1.5">
              {sections.filter(s => s.isVisible).sort((a, b) => a.sortOrder - b.sortOrder).map((s, i) => (
                <span key={s.id} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-400 font-bold">
                  {i + 1}. {SECTION_LABELS[s.type] || s.title || s.type}
                </span>
              ))}
              {sections.filter(s => !s.isVisible).map(s => (
                <span key={s.id} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-800/50 border border-white/5 text-[10px] text-zinc-600 font-bold line-through">
                  {SECTION_LABELS[s.type] || s.title || s.type}
                </span>
              ))}
            </div>
          </div>

          {/* Section list */}
          <div className="space-y-2">
            {sections.map((section, idx) => {
              const isBuiltIn = !section.type.startsWith('custom_')
              const isEditing = editingSection?.id === section.id
              const iconName = SECTION_ICONS[section.type] || section.icon || 'Zap'

              return (
                <div
                  key={section.id}
                  className={`bg-zinc-900/80 border rounded-2xl transition-all ${
                    section.isVisible ? 'border-white/[0.06]' : 'border-white/[0.03] opacity-50'
                  } ${isEditing ? 'ring-1 ring-blue-500/30 border-blue-500/20' : ''}`}
                >
                  {/* Row */}
                  <div className="flex items-center gap-2 px-3 py-3 sm:px-4">
                    {/* Move arrows */}
                    <div className="flex flex-col gap-0.5 shrink-0">
                      <button onClick={() => moveSection(idx, 'up')} disabled={idx === 0 || saving} className="p-0.5 text-zinc-600 hover:text-white disabled:opacity-20 transition-colors">
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button onClick={() => moveSection(idx, 'down')} disabled={idx === sections.length - 1 || saving} className="p-0.5 text-zinc-600 hover:text-white disabled:opacity-20 transition-colors">
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Icon */}
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      section.isVisible ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' : 'bg-zinc-800 border border-white/5 text-zinc-600'
                    }`}>
                      <IconRender name={iconName} className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold text-white truncate">
                          {section.title || SECTION_LABELS[section.type] || section.type}
                        </span>
                        {isBuiltIn && (
                          <span className="px-1.5 py-0.5 rounded-md text-[8px] font-bold bg-zinc-800 text-zinc-500 shrink-0">ระบบ</span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-600 mt-0.5 truncate">
                        {SECTION_DESCS[section.type] || (section.content ? section.content.slice(0, 40) + '...' : section.type)}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        onClick={() => toggleSection(section.id, !section.isVisible)}
                        className={`p-2 rounded-xl transition-all ${section.isVisible ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-zinc-600 hover:bg-zinc-800'}`}
                        title={section.isVisible ? 'ซ่อน' : 'แสดง'}
                      >
                        {section.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      {!isBuiltIn && (
                        <>
                          <button
                            onClick={() => setEditingSection(isEditing ? null : { ...section })}
                            className="p-2 rounded-xl text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                            title="แก้ไข"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteSection(section.id)}
                            className="p-2 rounded-xl text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            title="ลบ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Edit panel for custom sections */}
                  {isEditing && editingSection && (
                    <div className="border-t border-white/5 p-3 sm:p-4 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className={labelClass}>ชื่อ Section</label>
                          <input className={inputClass} value={editingSection.title || ''} onChange={e => setEditingSection({ ...editingSection, title: e.target.value })} placeholder="ชื่อที่จะแสดง" />
                        </div>
                        <div>
                          <label className={labelClass}>ไอคอน</label>
                          <button
                            onClick={() => setShowIconPicker({ target: 'section' })}
                            className="w-full flex items-center gap-2 px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white hover:border-blue-500/30 transition-all"
                          >
                            <IconRender name={editingSection.icon || 'Zap'} className="w-4 h-4 text-blue-400" />
                            <span className="text-zinc-400">{editingSection.icon || 'เลือกไอคอน...'}</span>
                          </button>
                        </div>
                      </div>
                      {section.type === 'custom_text' && (
                        <div>
                          <label className={labelClass}>เนื้อหา</label>
                          <textarea className={`${inputClass} min-h-[80px]`} value={editingSection.content || ''} onChange={e => setEditingSection({ ...editingSection, content: e.target.value })} placeholder="ข้อความที่จะแสดง..." />
                        </div>
                      )}
                      {section.type === 'custom_html' && (
                        <div>
                          <label className={labelClass}>โค้ด HTML</label>
                          <textarea className={`${inputClass} min-h-[100px] font-mono text-xs`} value={editingSection.content || ''} onChange={e => setEditingSection({ ...editingSection, content: e.target.value })} placeholder="<div>...</div>" />
                        </div>
                      )}
                      {(section.type === 'custom_image' || section.type === 'custom_text') && (
                        <div>
                          <label className={labelClass}>URL รูปภาพ</label>
                          <input className={inputClass} value={editingSection.imageUrl || ''} onChange={e => setEditingSection({ ...editingSection, imageUrl: e.target.value })} placeholder="https://example.com/image.jpg" />
                          {editingSection.imageUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={editingSection.imageUrl} alt="" className="mt-2 rounded-xl max-h-32 border border-white/10" />
                          )}
                        </div>
                      )}
                      {(section.type === 'custom_link' || section.type === 'custom_image') && (
                        <div>
                          <label className={labelClass}>ลิงก์ปลายทาง</label>
                          <input className={inputClass} value={editingSection.linkUrl || ''} onChange={e => setEditingSection({ ...editingSection, linkUrl: e.target.value })} placeholder="/page หรือ https://..." />
                        </div>
                      )}
                      {section.type === 'custom_link' && (
                        <div>
                          <label className={labelClass}>คำอธิบาย</label>
                          <input className={inputClass} value={editingSection.content || ''} onChange={e => setEditingSection({ ...editingSection, content: e.target.value })} placeholder="คำอธิบายสั้นๆ" />
                        </div>
                      )}
                      <div className="flex items-center gap-2 pt-1">
                        <button onClick={() => saveSection(editingSection)} disabled={saving} className={btnPrimary}>
                          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                          บันทึก
                        </button>
                        <button onClick={() => setEditingSection(null)} className={btnGhost}>ยกเลิก</button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Add Section — template picker */}
          <button
            onClick={() => setShowAddSection(true)}
            className="w-full py-3.5 rounded-2xl bg-zinc-900/50 border-2 border-dashed border-white/10 text-zinc-500 hover:text-blue-400 hover:border-blue-500/30 flex items-center justify-center gap-2 text-xs font-bold transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            เพิ่ม Section ใหม่
          </button>

          {/* Add Section Modal */}
          {showAddSection && (
            <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center">
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowAddSection(false)} />
              <div className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-t-2xl sm:rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                  <h3 className="text-sm font-bold text-white">เลือกประเภท Section</h3>
                  <button onClick={() => setShowAddSection(false)} className="p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-white/5"><X className="w-4 h-4" /></button>
                </div>
                <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SECTION_TEMPLATES.map(tpl => {
                    const cc = getCC(tpl.color)
                    return (
                      <button
                        key={tpl.id}
                        onClick={() => addSectionFromTemplate(tpl)}
                        disabled={saving}
                        className="flex items-start gap-3 p-3.5 rounded-xl bg-black/30 border border-white/[0.06] hover:border-blue-500/30 hover:bg-blue-500/5 transition-all text-left active:scale-[0.98] group"
                      >
                        <div className={`w-10 h-10 rounded-xl ${cc.bg} border ${cc.border} flex items-center justify-center shrink-0`}>
                          <IconRender name={tpl.icon} className={`w-5 h-5 ${cc.text}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">{tpl.label}</p>
                          <p className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed">{tpl.desc}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
                <div className="p-3 pt-0 pb-[max(12px,env(safe-area-inset-bottom))]" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================ */}
      {/* ===== TAB: ปุ่มลัด (Quick Actions) ===== */}
      {/* ============================================ */}
      {activeTab === 'quick_actions' && (
        <div className="space-y-3">
          {/* Preview */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-3 sm:p-4">
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2">ตัวอย่างแสดงผล</p>
            <div className="grid grid-cols-4 gap-2 max-w-sm">
              {quickActions.filter(q => q.isVisible).sort((a, b) => a.sortOrder - b.sortOrder).map(q => {
                const cc = getCC(q.color)
                return (
                  <div key={q.id} className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-zinc-900/80 border border-white/[0.06]">
                    <div className={`w-9 h-9 ${cc.bg} ${cc.border} border rounded-xl flex items-center justify-center`}>
                      <IconRender name={q.icon} className={`w-4 h-4 ${cc.text}`} />
                    </div>
                    <span className="text-[9px] text-zinc-400 font-medium">{q.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Quick Action list */}
          <div className="space-y-2">
            {quickActions.map((qa, idx) => {
              const cc = getCC(qa.color)
              const isEditing = editingQA?.id === qa.id

              return (
                <div key={qa.id} className={`bg-zinc-900/80 border rounded-2xl transition-all ${
                  qa.isVisible ? 'border-white/[0.06]' : 'border-white/[0.03] opacity-50'
                } ${isEditing ? 'ring-1 ring-blue-500/30 border-blue-500/20' : ''}`}>
                  <div className="flex items-center gap-2 px-3 py-3 sm:px-4">
                    <div className="flex flex-col gap-0.5 shrink-0">
                      <button onClick={() => moveQA(idx, 'up')} disabled={idx === 0 || saving} className="p-0.5 text-zinc-600 hover:text-white disabled:opacity-20"><ChevronUp className="w-4 h-4" /></button>
                      <button onClick={() => moveQA(idx, 'down')} disabled={idx === quickActions.length - 1 || saving} className="p-0.5 text-zinc-600 hover:text-white disabled:opacity-20"><ChevronDown className="w-4 h-4" /></button>
                    </div>
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${cc.bg} border ${cc.border}`}>
                      <IconRender name={qa.icon} className={`w-4.5 h-4.5 sm:w-5 sm:h-5 ${cc.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs sm:text-sm font-bold text-white truncate block">{qa.label}</span>
                      <p className="text-[10px] text-zinc-600 truncate">{qa.href}</p>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button onClick={() => toggleQA(qa.id, !qa.isVisible)} className={`p-2 rounded-xl transition-all ${qa.isVisible ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-zinc-600 hover:bg-zinc-800'}`}>
                        {qa.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button onClick={() => setEditingQA(isEditing ? null : { ...qa })} className="p-2 rounded-xl text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteQA(qa.id)} className="p-2 rounded-xl text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Edit */}
                  {isEditing && editingQA && (
                    <div className="border-t border-white/5 p-3 sm:p-4 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className={labelClass}>ชื่อปุ่ม</label>
                          <input className={inputClass} value={editingQA.label} onChange={e => setEditingQA({ ...editingQA, label: e.target.value })} placeholder="ชื่อปุ่ม" />
                        </div>
                        <div>
                          <label className={labelClass}>ลิงก์ (href)</label>
                          <input className={inputClass} value={editingQA.href} onChange={e => setEditingQA({ ...editingQA, href: e.target.value })} placeholder="/topup" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className={labelClass}>ไอคอน</label>
                          <button
                            onClick={() => setShowIconPicker({ target: 'qa' })}
                            className="w-full flex items-center gap-2 px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm hover:border-blue-500/30 transition-all"
                          >
                            <IconRender name={editingQA.icon} className="w-4 h-4 text-blue-400" />
                            <span className="text-zinc-400 text-xs">{editingQA.icon}</span>
                            <span className="ml-auto text-[10px] text-zinc-600">แตะเพื่อเปลี่ยน</span>
                          </button>
                        </div>
                        <div>
                          <label className={labelClass}>สี</label>
                          <ColorPicker value={editingQA.color} onChange={v => setEditingQA({ ...editingQA, color: v })} />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <button onClick={() => saveQA(editingQA)} disabled={saving} className={btnPrimary}>
                          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                          บันทึก
                        </button>
                        <button onClick={() => setEditingQA(null)} className={btnGhost}>ยกเลิก</button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Add Quick Action — preset picker */}
          <button
            onClick={() => setShowAddQA(true)}
            className="w-full py-3.5 rounded-2xl bg-zinc-900/50 border-2 border-dashed border-white/10 text-zinc-500 hover:text-blue-400 hover:border-blue-500/30 flex items-center justify-center gap-2 text-xs font-bold transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            เพิ่มปุ่มลัดใหม่
          </button>

          {/* Add QA Modal */}
          {showAddQA && (
            <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center">
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowAddQA(false)} />
              <div className="relative w-full max-w-lg max-h-[85vh] bg-zinc-900 border border-white/10 rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                  <h3 className="text-sm font-bold text-white">เลือกปุ่มลัดที่ต้องการเพิ่ม</h3>
                  <button onClick={() => setShowAddQA(false)} className="p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-white/5"><X className="w-4 h-4" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 sm:p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {QA_PRESETS.map(preset => {
                      const cc = getCC(preset.color)
                      const alreadyExists = quickActions.some(q => q.href === preset.href)
                      return (
                        <button
                          key={preset.href}
                          onClick={() => !alreadyExists && addQAFromPreset(preset)}
                          disabled={saving || alreadyExists}
                          className={`flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl border transition-all text-center active:scale-[0.97] ${
                            alreadyExists
                              ? 'border-white/[0.03] opacity-30 cursor-not-allowed'
                              : 'border-white/[0.06] bg-black/30 hover:border-blue-500/30 hover:bg-blue-500/5'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl ${cc.bg} border ${cc.border} flex items-center justify-center`}>
                            <IconRender name={preset.icon} className={`w-5 h-5 ${cc.text}`} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">{preset.label}</p>
                            <p className="text-[9px] text-zinc-600 mt-0.5">{preset.href}</p>
                          </div>
                          {alreadyExists && (
                            <span className="text-[9px] text-zinc-600 font-bold">เพิ่มแล้ว</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div className="p-3 pt-0 pb-[max(12px,env(safe-area-inset-bottom))]" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================ */}
      {/* ===== TAB: สถิติ (Stat Cards) ===== */}
      {/* ============================================ */}
      {activeTab === 'stats' && (
        <div className="space-y-3">
          {/* Preview */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-3 sm:p-4">
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2">ตัวอย่างแสดงผล</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 max-w-2xl">
              {statCards.filter(s => s.isVisible).sort((a, b) => a.sortOrder - b.sortOrder).map(s => {
                const cc = getCC(s.color)
                return (
                  <div key={s.id} className="bg-zinc-900/80 border border-white/[0.06] rounded-2xl p-3 flex items-center gap-2.5">
                    <div className={`w-9 h-9 ${cc.bg} border ${cc.border} ${cc.text} rounded-xl flex items-center justify-center shrink-0`}>
                      <IconRender name={s.icon} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-zinc-500 font-medium">{s.label}</p>
                      <p className="text-xs font-bold text-white">--</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Stat card list */}
          <div className="space-y-2">
            {statCards.map((stat, idx) => {
              const cc = getCC(stat.color)
              const isEditing = editingStat?.id === stat.id

              return (
                <div key={stat.id} className={`bg-zinc-900/80 border rounded-2xl transition-all ${
                  stat.isVisible ? 'border-white/[0.06]' : 'border-white/[0.03] opacity-50'
                } ${isEditing ? 'ring-1 ring-blue-500/30 border-blue-500/20' : ''}`}>
                  <div className="flex items-center gap-2 px-3 py-3 sm:px-4">
                    <div className="flex flex-col gap-0.5 shrink-0">
                      <button onClick={() => moveStat(idx, 'up')} disabled={idx === 0 || saving} className="p-0.5 text-zinc-600 hover:text-white disabled:opacity-20"><ChevronUp className="w-4 h-4" /></button>
                      <button onClick={() => moveStat(idx, 'down')} disabled={idx === statCards.length - 1 || saving} className="p-0.5 text-zinc-600 hover:text-white disabled:opacity-20"><ChevronDown className="w-4 h-4" /></button>
                    </div>
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${cc.bg} border ${cc.border}`}>
                      <IconRender name={stat.icon} className={`w-4.5 h-4.5 sm:w-5 sm:h-5 ${cc.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs sm:text-sm font-bold text-white truncate block">{stat.label}</span>
                      <p className="text-[10px] text-zinc-600">
                        {STAT_PRESETS.find(p => p.type === stat.type)?.desc || stat.type}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button onClick={() => toggleStat(stat.id, !stat.isVisible)} className={`p-2 rounded-xl transition-all ${stat.isVisible ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-zinc-600 hover:bg-zinc-800'}`}>
                        {stat.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button onClick={() => setEditingStat(isEditing ? null : { ...stat })} className="p-2 rounded-xl text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteStat(stat.id)} className="p-2 rounded-xl text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {isEditing && editingStat && (
                    <div className="border-t border-white/5 p-3 sm:p-4 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className={labelClass}>ชื่อที่แสดง</label>
                          <input className={inputClass} value={editingStat.label} onChange={e => setEditingStat({ ...editingStat, label: e.target.value })} placeholder="เช่น VPN ที่ใช้อยู่" />
                        </div>
                        <div>
                          <label className={labelClass}>ไอคอน</label>
                          <button
                            onClick={() => setShowIconPicker({ target: 'stat' })}
                            className="w-full flex items-center gap-2 px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm hover:border-blue-500/30 transition-all"
                          >
                            <IconRender name={editingStat.icon} className="w-4 h-4 text-blue-400" />
                            <span className="text-zinc-400 text-xs">{editingStat.icon}</span>
                            <span className="ml-auto text-[10px] text-zinc-600">แตะเพื่อเปลี่ยน</span>
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>สี</label>
                        <ColorPicker value={editingStat.color} onChange={v => setEditingStat({ ...editingStat, color: v })} />
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <button onClick={() => saveStat(editingStat)} disabled={saving} className={btnPrimary}>
                          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                          บันทึก
                        </button>
                        <button onClick={() => setEditingStat(null)} className={btnGhost}>ยกเลิก</button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-3">
            <p className="text-[10px] text-zinc-500 leading-relaxed">
              การ์ดสถิติรองรับ 20 ประเภท — ทั้งข้อมูลส่วนตัว (VPN, หมดอายุ, แนะนำเพื่อน) และข้อมูลระบบ (ผู้ใช้, ยอดเงิน, ออเดอร์ ฯลฯ) สามารถเพิ่ม/ลบ, เปลี่ยนลำดับ, ซ่อน/แสดง, เปลี่ยนไอคอนและสี ได้ตามต้องการ
            </p>
          </div>

          {/* Add Stat Card Button */}
          <button
            onClick={() => setShowAddStat(true)}
            className="w-full py-3.5 rounded-2xl bg-zinc-900/50 border-2 border-dashed border-white/10 text-zinc-500 hover:text-blue-400 hover:border-blue-500/30 flex items-center justify-center gap-2 text-xs font-bold transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            เพิ่มสถิติใหม่
          </button>

          {/* Add Stat Modal */}
          {showAddStat && (
            <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center">
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowAddStat(false)} />
              <div className="relative w-full max-w-lg max-h-[85vh] bg-zinc-900 border border-white/10 rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                  <h3 className="text-sm font-bold text-white">เลือกสถิติที่ต้องการเพิ่ม</h3>
                  <button onClick={() => setShowAddStat(false)} className="p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-white/5"><X className="w-4 h-4" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
                  {STAT_CATEGORIES.map(cat => {
                    const presets = STAT_PRESETS.filter(p => p.category === cat)
                    return (
                      <div key={cat}>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2">{cat}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {presets.map(preset => {
                            const cc = getCC(preset.color)
                            const alreadyExists = statCards.some(s => s.type === preset.type)
                            return (
                              <button
                                key={preset.type}
                                onClick={() => !alreadyExists && addStatFromPreset(preset)}
                                disabled={saving || alreadyExists}
                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left active:scale-[0.97] ${
                                  alreadyExists
                                    ? 'border-white/[0.03] opacity-30 cursor-not-allowed'
                                    : 'border-white/[0.06] bg-black/30 hover:border-blue-500/30 hover:bg-blue-500/5'
                                }`}
                              >
                                <div className={`w-10 h-10 rounded-xl ${cc.bg} border ${cc.border} flex items-center justify-center shrink-0`}>
                                  <IconRender name={preset.icon} className={`w-5 h-5 ${cc.text}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-white">{preset.label}</p>
                                  <p className="text-[9px] text-zinc-600 mt-0.5">{preset.desc}</p>
                                </div>
                                {alreadyExists && (
                                  <span className="text-[9px] text-zinc-600 font-bold shrink-0">เพิ่มแล้ว</span>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="p-3 pt-0 pb-[max(12px,env(safe-area-inset-bottom))]" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
