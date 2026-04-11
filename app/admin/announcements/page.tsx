'use client'

import { useState, useEffect } from 'react'
import {
  Megaphone, Plus, Trash2, Edit2, Save, X, Pin, PinOff,
  Send, Bell, Eye, EyeOff, Clock, Loader2, AlertCircle,
  CheckCircle2, Tag, Zap, Wrench, Gift, AlertTriangle,
  ChevronDown, Search, RefreshCw, Users,
} from 'lucide-react'

interface Announcement {
  id: string
  title: string
  content: string
  category: string
  priority: string
  isPinned: boolean
  isActive: boolean
  sendPush: boolean
  pushSentAt: string | null
  pushCount: number
  createdBy: string
  createdAt: string
  updatedAt: string
}

const CATEGORIES = [
  { value: 'general', label: 'ทั่วไป', icon: Megaphone, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  { value: 'update', label: 'อัพเดท', icon: Zap, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  { value: 'maintenance', label: 'ปิดปรับปรุง', icon: Wrench, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  { value: 'promo', label: 'โปรโมชั่น', icon: Gift, color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
  { value: 'urgent', label: 'ด่วน', icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
]

const PRIORITIES = [
  { value: 'low', label: 'ต่ำ', color: 'text-zinc-400' },
  { value: 'normal', label: 'ปกติ', color: 'text-blue-400' },
  { value: 'high', label: 'สูง', color: 'text-amber-400' },
  { value: 'urgent', label: 'ด่วนมาก', color: 'text-red-400' },
]

function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string | number; sub?: string; icon: React.ElementType; color: string
}) {
  const c: Record<string, string> = {
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    pink: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
  }
  return (
    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
      <div className={`w-10 h-10 sm:w-11 sm:h-11 ${c[color] || c.blue} border rounded-xl flex items-center justify-center shrink-0`}>
        <Icon className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-zinc-500 font-medium truncate">{label}</p>
        <p className="text-sm sm:text-base font-bold text-white truncate">{value}</p>
        {sub && <p className="text-[10px] text-zinc-600 font-medium truncate">{sub}</p>}
      </div>
    </div>
  )
}

export default function AnnouncementsAdminPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [sendingPush, setSendingPush] = useState<string | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [filterCategory, setFilterCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Form state
  const [form, setForm] = useState({
    title: '',
    content: '',
    category: 'general',
    priority: 'normal',
    isPinned: false,
    sendPush: true,
  })

  useEffect(() => {
    fetchAnnouncements()
  }, [filterCategory])

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(t)
    }
  }, [toast])

  async function fetchAnnouncements() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterCategory !== 'all') params.set('category', filterCategory)
      params.set('limit', '100')
      const res = await fetch(`/api/admin/announcements?${params}`)
      const data = await res.json()
      if (data.success) setAnnouncements(data.announcements)
    } catch {
      setToast({ type: 'error', message: 'โหลดข้อมูลไม่สำเร็จ' })
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setForm({ title: '', content: '', category: 'general', priority: 'normal', isPinned: false, sendPush: true })
    setEditingId(null)
    setShowForm(false)
  }

  function startEdit(a: Announcement) {
    setForm({
      title: a.title,
      content: a.content,
      category: a.category,
      priority: a.priority,
      isPinned: a.isPinned,
      sendPush: false,
    })
    setEditingId(a.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit() {
    if (!form.title.trim() || !form.content.trim()) {
      setToast({ type: 'error', message: 'กรุณากรอกหัวข้อและเนื้อหา' })
      return
    }
    setSaving(true)
    try {
      const url = '/api/admin/announcements'
      const method = editingId ? 'PUT' : 'POST'
      const body = editingId ? { id: editingId, ...form } : form

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()

      if (data.success) {
        const pushInfo = data.pushStats ? ` (ส่ง push ${data.pushStats.sent} คน)` : ''
        setToast({ type: 'success', message: `${editingId ? 'แก้ไข' : 'สร้าง'}ประกาศสำเร็จ${pushInfo}` })
        resetForm()
        fetchAnnouncements()
      } else {
        setToast({ type: 'error', message: data.error || 'เกิดข้อผิดพลาด' })
      }
    } catch {
      setToast({ type: 'error', message: 'เกิดข้อผิดพลาด' })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('ยืนยันลบประกาศนี้?')) return
    setDeleting(id)
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const data = await res.json()
      if (data.success) {
        setToast({ type: 'success', message: 'ลบประกาศสำเร็จ' })
        fetchAnnouncements()
      }
    } catch {
      setToast({ type: 'error', message: 'ลบไม่สำเร็จ' })
    } finally {
      setDeleting(null)
    }
  }

  async function handleToggleActive(a: Announcement) {
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: a.id, isActive: !a.isActive }),
      })
      const data = await res.json()
      if (data.success) {
        setToast({ type: 'success', message: a.isActive ? 'ซ่อนประกาศแล้ว' : 'แสดงประกาศแล้ว' })
        fetchAnnouncements()
      }
    } catch {}
  }

  async function handleTogglePin(a: Announcement) {
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: a.id, isPinned: !a.isPinned }),
      })
      const data = await res.json()
      if (data.success) {
        setToast({ type: 'success', message: a.isPinned ? 'ยกเลิกปักหมุดแล้ว' : 'ปักหมุดแล้ว' })
        fetchAnnouncements()
      }
    } catch {}
  }

  async function handleResendPush(a: Announcement) {
    if (!confirm('ส่ง Push Notification ประกาศนี้ไปยังผู้ใช้ทุกคน?')) return
    setSendingPush(a.id)
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: a.id, resendPush: true }),
      })
      const data = await res.json()
      if (data.success && data.pushStats) {
        setToast({ type: 'success', message: `ส่ง Push สำเร็จ ${data.pushStats.sent} คน` })
        fetchAnnouncements()
      }
    } catch {
      setToast({ type: 'error', message: 'ส่ง Push ไม่สำเร็จ' })
    } finally {
      setSendingPush(null)
    }
  }

  // Filter by search
  const filtered = announcements.filter(a =>
    !searchQuery || a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Stats
  const totalActive = announcements.filter(a => a.isActive).length
  const totalPinned = announcements.filter(a => a.isPinned).length
  const totalPushSent = announcements.reduce((s, a) => s + a.pushCount, 0)

  const getCat = (cat: string) => CATEGORIES.find(c => c.value === cat) || CATEGORIES[0]

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border shadow-2xl text-sm font-medium animate-slide-in ${
          toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-blue-400" />
            ประกาศข่าวสาร
          </h1>
          <p className="text-xs text-zinc-500 mt-1">สร้างประกาศและส่งแจ้งเตือนไปมือถือผู้ใช้</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          สร้างประกาศใหม่
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="ทั้งหมด" value={announcements.length} icon={Megaphone} color="blue" />
        <StatCard label="กำลังแสดง" value={totalActive} icon={Eye} color="emerald" />
        <StatCard label="ปักหมุด" value={totalPinned} icon={Pin} color="amber" />
        <StatCard label="Push ส่งแล้ว" value={totalPushSent} sub="ครั้ง" icon={Bell} color="pink" />
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-zinc-900/80 border border-white/10 rounded-2xl p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              {editingId ? <Edit2 className="w-4 h-4 text-amber-400" /> : <Plus className="w-4 h-4 text-blue-400" />}
              {editingId ? 'แก้ไขประกาศ' : 'สร้างประกาศใหม่'}
            </h2>
            <button onClick={resetForm} className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Title */}
          <div>
            <label className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider block mb-1.5">หัวข้อ</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="เช่น ปิดปรับปรุงเซิร์ฟเวอร์ 12, อัพเดทแอพเวอร์ชั่นใหม่..."
              className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 transition-all"
            />
          </div>

          {/* Content */}
          <div>
            <label className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider block mb-1.5">เนื้อหา</label>
            <textarea
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
              rows={4}
              placeholder="รายละเอียดประกาศ..."
              className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 transition-all resize-none"
            />
          </div>

          {/* Category + Priority Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider block mb-1.5">หมวดหมู่</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setForm({ ...form, category: cat.value })}
                    className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl border text-[10px] font-bold transition-all ${
                      form.category === cat.value
                        ? `${cat.bg} ${cat.color}`
                        : 'border-white/5 text-zinc-500 hover:border-white/10 hover:text-zinc-300'
                    }`}
                  >
                    <cat.icon className="w-3.5 h-3.5" />
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider block mb-1.5">ความสำคัญ</label>
              <div className="grid grid-cols-4 gap-1.5">
                {PRIORITIES.map(p => (
                  <button
                    key={p.value}
                    onClick={() => setForm({ ...form, priority: p.value })}
                    className={`px-2 py-2 rounded-xl border text-[10px] font-bold transition-all ${
                      form.priority === p.value
                        ? `${p.color} border-current bg-current/10`
                        : 'border-white/5 text-zinc-500 hover:border-white/10'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setForm({ ...form, isPinned: !form.isPinned })}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                form.isPinned ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'border-white/10 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Pin className="w-3.5 h-3.5" />
              ปักหมุด
            </button>
            <button
              onClick={() => setForm({ ...form, sendPush: !form.sendPush })}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                form.sendPush ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'border-white/10 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              ส่ง Push แจ้งเตือน
            </button>
          </div>

          {form.sendPush && (
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/5 border border-blue-500/20 rounded-xl">
              <Send className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="text-[11px] text-blue-300">จะส่ง Push Notification ไปมือถือผู้ใช้ทุกคนที่เปิดรับแจ้งเตือนทันที</span>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all active:scale-95"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editingId ? 'บันทึกการแก้ไข' : 'สร้างประกาศ'}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2.5 border border-white/10 text-zinc-400 hover:text-white rounded-xl text-sm font-medium transition-all"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {/* Filter + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ค้นหาประกาศ..."
            className="w-full pl-9 pr-4 py-2.5 bg-zinc-900/50 border border-white/5 rounded-xl text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 transition-all"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
              filterCategory === 'all' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            ทั้งหมด
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setFilterCategory(cat.value)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
                filterCategory === cat.value ? `${cat.bg} ${cat.color}` : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <cat.icon className="w-3 h-3" />
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Megaphone className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 text-sm">ยังไม่มีประกาศ</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(a => {
            const cat = getCat(a.category)
            const CatIcon = cat.icon
            return (
              <div
                key={a.id}
                className={`bg-zinc-900/50 border rounded-2xl overflow-hidden transition-all ${
                  !a.isActive ? 'border-white/5 opacity-50' : a.isPinned ? 'border-amber-500/20' : 'border-white/5'
                }`}
              >
                {/* Card Header */}
                <div className="p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    {/* Category Icon */}
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${cat.bg} ${cat.color}`}>
                      <CatIcon className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {a.isPinned && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-md text-amber-400 text-[9px] font-bold">
                            <Pin className="w-2.5 h-2.5" /> ปักหมุด
                          </span>
                        )}
                        <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold ${cat.bg} ${cat.color}`}>
                          {cat.label}
                        </span>
                        {a.priority === 'urgent' && (
                          <span className="px-1.5 py-0.5 bg-red-500/10 border border-red-500/20 rounded-md text-red-400 text-[9px] font-bold animate-pulse">
                            ด่วนมาก
                          </span>
                        )}
                        {a.priority === 'high' && (
                          <span className="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-md text-amber-400 text-[9px] font-bold">
                            สำคัญ
                          </span>
                        )}
                        {!a.isActive && (
                          <span className="px-1.5 py-0.5 bg-zinc-800 border border-white/10 rounded-md text-zinc-500 text-[9px] font-bold">
                            ซ่อนอยู่
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-white leading-tight">{a.title}</h3>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2 whitespace-pre-wrap">{a.content}</p>

                      {/* Meta */}
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-zinc-600">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(a.createdAt)}
                        </span>
                        {a.pushSentAt && (
                          <span className="flex items-center gap-1 text-blue-500/60">
                            <Bell className="w-3 h-3" />
                            Push {a.pushCount} คน
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/5">
                    <button
                      onClick={() => startEdit(a)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-[11px] font-medium transition-all"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span className="hidden sm:inline">แก้ไข</span>
                    </button>
                    <button
                      onClick={() => handleTogglePin(a)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                        a.isPinned ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20' : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {a.isPinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                      <span className="hidden sm:inline">{a.isPinned ? 'เลิกปักหมุด' : 'ปักหมุด'}</span>
                    </button>
                    <button
                      onClick={() => handleToggleActive(a)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                        a.isActive ? 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                      }`}
                    >
                      {a.isActive ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span className="hidden sm:inline">{a.isActive ? 'ซ่อน' : 'แสดง'}</span>
                    </button>
                    <button
                      onClick={() => handleResendPush(a)}
                      disabled={sendingPush === a.id}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[11px] font-medium transition-all disabled:opacity-50"
                    >
                      {sendingPush === a.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                      <span className="hidden sm:inline">ส่ง Push</span>
                    </button>
                    <button
                      onClick={() => handleDelete(a.id)}
                      disabled={deleting === a.id}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[11px] font-medium transition-all ml-auto disabled:opacity-50"
                    >
                      {deleting === a.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                      <span className="hidden sm:inline">ลบ</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
