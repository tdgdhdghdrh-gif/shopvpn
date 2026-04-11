'use client'

import { useEffect, useState } from 'react'
import {
  Home, Globe, User, ShoppingCart, Wallet, Crown, Gift, Ticket,
  Trophy, Star, BookOpen, Megaphone, Phone, Server, Tag, Compass,
  Bell, FileText, CheckCircle2, AlertCircle, Loader2, Save,
  Sparkles, Target, Layout, Wifi, RefreshCw, ArrowLeftRight,
  Receipt, Users, Store, ShoppingBag, Image, AlertTriangle,
  Zap, Link2,
} from 'lucide-react'

interface HomePageOption {
  value: string
  label: string
  desc: string
  icon: React.ElementType
  color: string
  section: string
}

const HOME_PAGE_OPTIONS: HomePageOption[] = [
  // ── เมนูหลัก ──
  { value: '/', label: 'หน้าแรก (Landing)', desc: 'หน้า Landing ปกติตามเดิม', icon: Home, color: 'blue', section: 'เมนูหลัก' },
  { value: '/vpn', label: 'ซื้อ VPN', desc: 'หน้าซื้อ VPN เลือกเซิร์ฟเวอร์', icon: Globe, color: 'cyan', section: 'เมนูหลัก' },
  { value: '/public-vless', label: 'Free VLESS', desc: 'ทดลองใช้ VPN ฟรี', icon: Zap, color: 'emerald', section: 'เมนูหลัก' },
  { value: '/setup-guide', label: 'โปรเสริมที่ต้องสมัคร', desc: 'สมัครโปรกันรั่ว AIS / True Zoom', icon: Compass, color: 'blue', section: 'เมนูหลัก' },
  { value: '/topup', label: 'เติมเงินเข้าระบบ', desc: 'เติมเงินผ่าน TrueMoney หรือสลิป', icon: Wallet, color: 'emerald', section: 'เมนูหลัก' },
  { value: '/topup/slip', label: 'เติมเงินผ่านสลิป', desc: 'เติมเงินผ่านสลิปธนาคาร', icon: Receipt, color: 'emerald', section: 'เมนูหลัก' },
  { value: '/topup/wallet', label: 'เติมเงินผ่าน TrueMoney', desc: 'เติมเงินผ่าน TrueMoney Wallet', icon: Wallet, color: 'red', section: 'เมนูหลัก' },
  { value: '/leaderboard', label: 'อันดับผู้ใช้', desc: 'อันดับผู้ใช้เติมเงินสูงสุด', icon: Trophy, color: 'amber', section: 'เมนูหลัก' },
  { value: '/referral-leaderboard', label: 'อันดับนักแนะนำ', desc: 'ชวนเพื่อนมาใช้งาน ลุ้นอันดับ!', icon: Users, color: 'indigo', section: 'เมนูหลัก' },
  { value: '/reviews', label: 'รีวิวจากผู้ใช้', desc: 'อ่านรีวิวจากผู้ใช้งานจริง', icon: Star, color: 'yellow', section: 'เมนูหลัก' },
  { value: '/report-slow', label: 'แจ้งปัญหาเน็ตช้า', desc: 'โหวตเซิร์ฟเวอร์ที่มีปัญหา', icon: AlertTriangle, color: 'orange', section: 'เมนูหลัก' },
  { value: '/contacts', label: 'รายชื่อแอดมิน', desc: 'ติดต่อแอดมินผ่าน Facebook 24 ชม.', icon: Phone, color: 'sky', section: 'เมนูหลัก' },
  { value: '/announcements', label: 'ประกาศข่าวสาร', desc: 'ข่าวสาร อัพเดท โปรโมชั่น', icon: Megaphone, color: 'purple', section: 'เมนูหลัก' },
  { value: '/blog', label: 'บทความ & เคล็ดลับ', desc: 'อ่านบทความ เคล็ดลับ VPN รีวิวแอป', icon: BookOpen, color: 'teal', section: 'เมนูหลัก' },
  { value: '/lucky-wheel', label: 'กงล้อนำโชค', desc: 'หมุนฟรีวันละ 1 ครั้ง ลุ้นรางวัล!', icon: Sparkles, color: 'pink', section: 'เมนูหลัก' },
  { value: '/daily-checkin', label: 'เช็คอินรายวัน', desc: 'เช็คอินทุกวันรับเครดิตฟรี!', icon: CheckCircle2, color: 'green', section: 'เมนูหลัก' },
  { value: '/server-compare', label: 'เปรียบเทียบเซิร์ฟเวอร์', desc: 'เทียบ Ping, Speed, Load ก่อนซื้อ', icon: Server, color: 'slate', section: 'เมนูหลัก' },
  { value: '/coupons', label: 'คูปองส่วนลด', desc: 'กรอกโค้ดคูปองรับเครดิตฟรี!', icon: Tag, color: 'lime', section: 'เมนูหลัก' },
  { value: '/premium-apps', label: 'ซื้อของ', desc: 'ซื้อสินค้าคุณภาพ ใช้ได้ทันที', icon: ShoppingBag, color: 'amber', section: 'เมนูหลัก' },

  // ── บัญชีของฉัน ──
  { value: '/vip', label: 'สมาชิก VIP', desc: 'ดูระดับ VIP และสิทธิพิเศษ', icon: Crown, color: 'yellow', section: 'บัญชีของฉัน' },
  { value: '/missions', label: 'ภารกิจ & ความสำเร็จ', desc: 'สะสม Badge ปลดล็อกความสำเร็จ!', icon: Target, color: 'orange', section: 'บัญชีของฉัน' },
  { value: '/gift', label: 'ส่งของขวัญ', desc: 'ส่งเครดิตให้เพื่อนด้วยรหัสของขวัญ', icon: Gift, color: 'rose', section: 'บัญชีของฉัน' },
  { value: '/notifications', label: 'แจ้งเตือน', desc: 'ดูการแจ้งเตือนและข้อความของคุณ', icon: Bell, color: 'orange', section: 'บัญชีของฉัน' },
  { value: '/profile/orders', label: 'รายการสั่งซื้อ VPN', desc: 'ดูประวัติการซื้อ VPN ของคุณ', icon: ShoppingCart, color: 'violet', section: 'บัญชีของฉัน' },
  { value: '/profile/connections', label: 'การเชื่อมต่อ VPN', desc: 'ดู IP ที่เชื่อมต่อ เปิด/ปิด VPN สถิติ Traffic', icon: Wifi, color: 'cyan', section: 'บัญชีของฉัน' },
  { value: '/profile/renew', label: 'ต่ออายุ VPN', desc: 'ต่ออายุโค้ด VPN ที่มีอยู่', icon: RefreshCw, color: 'emerald', section: 'บัญชีของฉัน' },
  { value: '/profile/exchange', label: 'แลกเปลี่ยนเซิร์ฟเวอร์', desc: 'ย้าย VPN ไปเซิร์ฟเวอร์อื่น', icon: ArrowLeftRight, color: 'blue', section: 'บัญชีของฉัน' },
  { value: '/profile/topups', label: 'ประวัติการเติมเงิน', desc: 'ดูรายละเอียดการเติมเงินของคุณ', icon: Receipt, color: 'purple', section: 'บัญชีของฉัน' },
  { value: '/profile', label: 'ตั้งค่าโปรไฟล์', desc: 'แก้ไขข้อมูลส่วนตัวและรหัสผ่าน', icon: User, color: 'indigo', section: 'บัญชีของฉัน' },
  { value: '/profile/referral', label: 'เชิญเพื่อน', desc: 'แนะนำเพื่อนรับ 20 บาทต่อคน', icon: Link2, color: 'teal', section: 'บัญชีของฉัน' },
  { value: '/tickets', label: 'ติดต่อแอดมิน', desc: 'สร้างตั๋วติดต่อทีมงาน 24/7', icon: Ticket, color: 'red', section: 'บัญชีของฉัน' },

  // ── ตลาดซื้อขาย ──
  { value: '/reseller/register', label: 'ลงทะเบียนฝากขาย', desc: 'สมัครเป็นตัวแทนจำหน่าย', icon: Store, color: 'emerald', section: 'ตลาดซื้อขาย' },
  { value: '/reseller/panel', label: 'จัดการร้านค้า', desc: 'หน้าจัดการร้านค้าของคุณ', icon: ShoppingBag, color: 'blue', section: 'ตลาดซื้อขาย' },
  { value: '/ads', label: 'ลงโฆษณา', desc: 'ฝากลงโฆษณาบนเว็บไซต์ วันละ 3 บาท', icon: Image, color: 'pink', section: 'ตลาดซื้อขาย' },
]

const COLOR_MAP: Record<string, { card: string; cardActive: string; icon: string; iconActive: string; ring: string }> = {
  blue:    { card: 'hover:border-blue-500/20 hover:bg-blue-500/[0.03]', cardActive: 'border-blue-500/40 bg-blue-500/[0.08] ring-2 ring-blue-500/20', icon: 'text-blue-400/60 bg-blue-500/10 border-blue-500/15', iconActive: 'text-blue-400 bg-blue-500/15 border-blue-500/30', ring: 'bg-blue-500' },
  cyan:    { card: 'hover:border-cyan-500/20 hover:bg-cyan-500/[0.03]', cardActive: 'border-cyan-500/40 bg-cyan-500/[0.08] ring-2 ring-cyan-500/20', icon: 'text-cyan-400/60 bg-cyan-500/10 border-cyan-500/15', iconActive: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30', ring: 'bg-cyan-500' },
  indigo:  { card: 'hover:border-indigo-500/20 hover:bg-indigo-500/[0.03]', cardActive: 'border-indigo-500/40 bg-indigo-500/[0.08] ring-2 ring-indigo-500/20', icon: 'text-indigo-400/60 bg-indigo-500/10 border-indigo-500/15', iconActive: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30', ring: 'bg-indigo-500' },
  violet:  { card: 'hover:border-violet-500/20 hover:bg-violet-500/[0.03]', cardActive: 'border-violet-500/40 bg-violet-500/[0.08] ring-2 ring-violet-500/20', icon: 'text-violet-400/60 bg-violet-500/10 border-violet-500/15', iconActive: 'text-violet-400 bg-violet-500/15 border-violet-500/30', ring: 'bg-violet-500' },
  emerald: { card: 'hover:border-emerald-500/20 hover:bg-emerald-500/[0.03]', cardActive: 'border-emerald-500/40 bg-emerald-500/[0.08] ring-2 ring-emerald-500/20', icon: 'text-emerald-400/60 bg-emerald-500/10 border-emerald-500/15', iconActive: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30', ring: 'bg-emerald-500' },
  amber:   { card: 'hover:border-amber-500/20 hover:bg-amber-500/[0.03]', cardActive: 'border-amber-500/40 bg-amber-500/[0.08] ring-2 ring-amber-500/20', icon: 'text-amber-400/60 bg-amber-500/10 border-amber-500/15', iconActive: 'text-amber-400 bg-amber-500/15 border-amber-500/30', ring: 'bg-amber-500' },
  green:   { card: 'hover:border-green-500/20 hover:bg-green-500/[0.03]', cardActive: 'border-green-500/40 bg-green-500/[0.08] ring-2 ring-green-500/20', icon: 'text-green-400/60 bg-green-500/10 border-green-500/15', iconActive: 'text-green-400 bg-green-500/15 border-green-500/30', ring: 'bg-green-500' },
  pink:    { card: 'hover:border-pink-500/20 hover:bg-pink-500/[0.03]', cardActive: 'border-pink-500/40 bg-pink-500/[0.08] ring-2 ring-pink-500/20', icon: 'text-pink-400/60 bg-pink-500/10 border-pink-500/15', iconActive: 'text-pink-400 bg-pink-500/15 border-pink-500/30', ring: 'bg-pink-500' },
  orange:  { card: 'hover:border-orange-500/20 hover:bg-orange-500/[0.03]', cardActive: 'border-orange-500/40 bg-orange-500/[0.08] ring-2 ring-orange-500/20', icon: 'text-orange-400/60 bg-orange-500/10 border-orange-500/15', iconActive: 'text-orange-400 bg-orange-500/15 border-orange-500/30', ring: 'bg-orange-500' },
  yellow:  { card: 'hover:border-yellow-500/20 hover:bg-yellow-500/[0.03]', cardActive: 'border-yellow-500/40 bg-yellow-500/[0.08] ring-2 ring-yellow-500/20', icon: 'text-yellow-400/60 bg-yellow-500/10 border-yellow-500/15', iconActive: 'text-yellow-400 bg-yellow-500/15 border-yellow-500/30', ring: 'bg-yellow-500' },
  red:     { card: 'hover:border-red-500/20 hover:bg-red-500/[0.03]', cardActive: 'border-red-500/40 bg-red-500/[0.08] ring-2 ring-red-500/20', icon: 'text-red-400/60 bg-red-500/10 border-red-500/15', iconActive: 'text-red-400 bg-red-500/15 border-red-500/30', ring: 'bg-red-500' },
  teal:    { card: 'hover:border-teal-500/20 hover:bg-teal-500/[0.03]', cardActive: 'border-teal-500/40 bg-teal-500/[0.08] ring-2 ring-teal-500/20', icon: 'text-teal-400/60 bg-teal-500/10 border-teal-500/15', iconActive: 'text-teal-400 bg-teal-500/15 border-teal-500/30', ring: 'bg-teal-500' },
  purple:  { card: 'hover:border-purple-500/20 hover:bg-purple-500/[0.03]', cardActive: 'border-purple-500/40 bg-purple-500/[0.08] ring-2 ring-purple-500/20', icon: 'text-purple-400/60 bg-purple-500/10 border-purple-500/15', iconActive: 'text-purple-400 bg-purple-500/15 border-purple-500/30', ring: 'bg-purple-500' },
  sky:     { card: 'hover:border-sky-500/20 hover:bg-sky-500/[0.03]', cardActive: 'border-sky-500/40 bg-sky-500/[0.08] ring-2 ring-sky-500/20', icon: 'text-sky-400/60 bg-sky-500/10 border-sky-500/15', iconActive: 'text-sky-400 bg-sky-500/15 border-sky-500/30', ring: 'bg-sky-500' },
  slate:   { card: 'hover:border-slate-500/20 hover:bg-slate-500/[0.03]', cardActive: 'border-slate-500/40 bg-slate-500/[0.08] ring-2 ring-slate-500/20', icon: 'text-slate-400/60 bg-slate-500/10 border-slate-500/15', iconActive: 'text-slate-400 bg-slate-500/15 border-slate-500/30', ring: 'bg-slate-500' },
  rose:    { card: 'hover:border-rose-500/20 hover:bg-rose-500/[0.03]', cardActive: 'border-rose-500/40 bg-rose-500/[0.08] ring-2 ring-rose-500/20', icon: 'text-rose-400/60 bg-rose-500/10 border-rose-500/15', iconActive: 'text-rose-400 bg-rose-500/15 border-rose-500/30', ring: 'bg-rose-500' },
  lime:    { card: 'hover:border-lime-500/20 hover:bg-lime-500/[0.03]', cardActive: 'border-lime-500/40 bg-lime-500/[0.08] ring-2 ring-lime-500/20', icon: 'text-lime-400/60 bg-lime-500/10 border-lime-500/15', iconActive: 'text-lime-400 bg-lime-500/15 border-lime-500/30', ring: 'bg-lime-500' },
}

// จัดกลุ่มตาม section
const SECTIONS = ['เมนูหลัก', 'บัญชีของฉัน', 'ตลาดซื้อขาย']
const SECTION_COLORS: Record<string, { badge: string; border: string }> = {
  'เมนูหลัก': { badge: 'text-blue-400 bg-blue-500/10 border-blue-500/20', border: 'border-blue-500/10' },
  'บัญชีของฉัน': { badge: 'text-purple-400 bg-purple-500/10 border-purple-500/20', border: 'border-purple-500/10' },
  'ตลาดซื้อขาย': { badge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', border: 'border-emerald-500/10' },
}

export default function DefaultHomepagePage() {
  const [selected, setSelected] = useState('/')
  const [saved, setSaved] = useState('/')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchCurrent()
  }, [])

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  async function fetchCurrent() {
    try {
      const res = await fetch('/api/admin/settings')
      const data = await res.json()
      if (data.settings?.defaultHomePage) {
        setSelected(data.settings.defaultHomePage)
        setSaved(data.settings.defaultHomePage)
      }
    } catch {
      setMessage({ type: 'error', text: 'ไม่สามารถดึงข้อมูลได้' })
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setMessage({ type: '', text: '' })
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ defaultHomePage: selected }),
      })
      const data = await res.json()
      if (data.success) {
        setSaved(selected)
        setMessage({ type: 'success', text: 'บันทึกหน้าแรกเริ่มต้นเรียบร้อยแล้ว' })
      } else {
        setMessage({ type: 'error', text: data.error || 'การบันทึกล้มเหลว' })
      }
    } catch {
      setMessage({ type: 'error', text: 'การเชื่อมต่อล้มเหลว' })
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = selected !== saved
  const currentOption = HOME_PAGE_OPTIONS.find(o => o.value === saved)

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-widest">กำลังโหลด...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-28 sm:pb-12">
      {/* Toast */}
      {message.text && (
        <div className={`fixed bottom-20 sm:bottom-8 right-4 sm:right-8 left-4 sm:left-auto z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl transition-all animate-in slide-in-from-right-10 ${
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
            <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20">
              <Home className="w-4 h-4 text-blue-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">เปลี่ยนหน้าแรก</h2>
          </div>
          <p className="text-zinc-500 text-xs sm:text-sm font-medium">เลือกหน้าที่ผู้ใช้จะเห็นเป็นหน้าแรกหลังล็อกอิน ({HOME_PAGE_OPTIONS.length} ตัวเลือก)</p>
        </div>
        {/* Desktop save button */}
        <button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-blue-600 border border-blue-500/30 rounded-xl text-sm font-bold text-white hover:bg-blue-500 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'กำลังบันทึก...' : hasChanges ? 'บันทึกการเปลี่ยนแปลง' : 'ไม่มีการเปลี่ยนแปลง'}
        </button>
      </div>

      {/* Current Selection Info */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5 flex items-center gap-4">
        <div className="w-10 h-10 sm:w-11 sm:h-11 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
          <Layout className="w-5 h-5 text-blue-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">หน้าแรกปัจจุบัน</p>
          <p className="text-sm sm:text-base font-bold text-white truncate">{currentOption?.label || saved}</p>
          <p className="text-[11px] text-zinc-500 font-medium">{currentOption?.desc}</p>
        </div>
        {saved !== '/' && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <span className="text-xs font-bold text-blue-400">{saved}</span>
          </div>
        )}
      </div>

      {/* Sections with Card Grid */}
      {SECTIONS.map((sectionName) => {
        const sectionOptions = HOME_PAGE_OPTIONS.filter(o => o.section === sectionName)
        const sc = SECTION_COLORS[sectionName]
        if (sectionOptions.length === 0) return null

        return (
          <div key={sectionName}>
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border ${sc.badge}`}>
                {sectionName}
              </span>
              <div className={`flex-1 h-px ${sc.border}`} />
              <span className="text-[10px] font-bold text-zinc-600">{sectionOptions.length} รายการ</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
              {sectionOptions.map((option) => {
                const isActive = selected === option.value
                const colors = COLOR_MAP[option.color] || COLOR_MAP.blue
                const Icon = option.icon

                return (
                  <button
                    key={option.value}
                    onClick={() => setSelected(option.value)}
                    className={`relative text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 group active:scale-[0.98]
                      ${isActive
                        ? `${colors.cardActive}`
                        : `border-white/5 bg-zinc-900/50 ${colors.card}`
                      }
                    `}
                  >
                    {/* Active indicator dot */}
                    {isActive && (
                      <div className={`absolute top-3 right-3 w-2.5 h-2.5 ${colors.ring} rounded-full shadow-lg`}>
                        <div className={`absolute inset-0 ${colors.ring} rounded-full animate-ping opacity-40`} />
                      </div>
                    )}

                    <div className="flex items-start gap-3.5">
                      <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl border flex items-center justify-center shrink-0 transition-all
                        ${isActive ? colors.iconActive : colors.icon}
                      `}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className={`text-sm font-bold tracking-tight transition-colors ${isActive ? 'text-white' : 'text-zinc-300 group-hover:text-white'}`}>
                          {option.label}
                        </h3>
                        <p className={`text-[11px] font-medium mt-0.5 transition-colors ${isActive ? 'text-zinc-400' : 'text-zinc-600 group-hover:text-zinc-500'}`}>
                          {option.desc}
                        </p>
                        <p className={`text-[10px] font-mono mt-1.5 transition-colors ${isActive ? 'text-zinc-500' : 'text-zinc-700 group-hover:text-zinc-600'}`}>
                          {option.value}
                        </p>
                      </div>
                    </div>

                    {/* Current badge */}
                    {option.value === saved && (
                      <div className="mt-3 flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg w-fit">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">ใช้งานอยู่</span>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Mobile Floating Save Bar */}
      <div className="fixed bottom-0 left-0 right-0 sm:hidden z-50 p-3 bg-black/80 backdrop-blur-xl border-t border-white/5">
        <button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 border border-blue-500/30 rounded-xl text-sm font-bold text-white active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'กำลังบันทึก...' : hasChanges ? 'บันทึกการเปลี่ยนแปลง' : 'ไม่มีการเปลี่ยนแปลง'}
        </button>
      </div>
    </div>
  )
}
