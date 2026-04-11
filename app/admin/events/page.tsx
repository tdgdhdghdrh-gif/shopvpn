'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Calendar, Percent, Type, FileText, Plus, Trash2, Edit2, Save,
  X, AlertCircle, CheckCircle2, Tag, Clock, Loader2, Zap,
  CalendarDays, ToggleLeft, ToggleRight, Megaphone, Timer, Gift,
  ChevronDown, Search,
} from 'lucide-react'

interface DiscountEvent {
  id: string
  name: string
  description: string | null
  marqueeText: string
  discountPercent: number
  minimumDays: number
  startDate: string
  endDate: string
  isActive: boolean
  createdAt: string
}

const EMPTY_FORM = {
  name: '',
  description: '',
  marqueeText: '🔥 ลดราคาพิเศษ! ลด {percent}% เมื่อซื้อ {minimumDays} วันขึ้นไป! 🔥',
  discountPercent: 10,
  minimumDays: 10,
  startDate: '',
  endDate: '',
}

function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string | number; sub?: string; icon: React.ElementType; color: string
}) {
  const c: Record<string, string> = {
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  }
  return (
    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
      <div className={`w-10 h-10 sm:w-11 sm:h-11 ${c[color] || c.purple} border rounded-xl flex items-center justify-center shrink-0`}>
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

export default function EventsAdminPage() {
  const [events, setEvents] = useState<DiscountEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => { fetchEvents() }, [])

  useEffect(() => {
    if (message.text) {
      const t = setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      return () => clearTimeout(t)
    }
  }, [message])

  async function fetchEvents() {
    try {
      const res = await fetch('/api/admin/events')
      const data = await res.json()
      if (data.success) setEvents(data.events)
    } catch { /* ignore */ } finally { setLoading(false) }
  }

  /* ── helpers ── */
  function isActive(ev: DiscountEvent) {
    const now = new Date()
    return ev.isActive && now >= new Date(ev.startDate) && now <= new Date(ev.endDate)
  }
  function isExpired(ev: DiscountEvent) {
    return new Date() > new Date(ev.endDate)
  }
  function isPending(ev: DiscountEvent) {
    return !isExpired(ev) && !isActive(ev)
  }
  function fmtDate(d: string) {
    return new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })
  }
  function fmtDateTime(d: string) {
    return new Date(d).toLocaleString('th-TH', { day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' })
  }
  function fmtDateInput(d: string) {
    return new Date(d).toISOString().slice(0, 16)
  }
  function timeLeft(d: string) {
    const diff = new Date(d).getTime() - Date.now()
    if (diff <= 0) return 'หมดเวลาแล้ว'
    const days = Math.floor(diff / 86400000)
    const hrs = Math.floor((diff % 86400000) / 3600000)
    if (days > 0) return `เหลือ ${days} วัน ${hrs} ชม.`
    return `เหลือ ${hrs} ชม.`
  }

  const stats = useMemo(() => {
    const total = events.length
    const active = events.filter(isActive).length
    const expired = events.filter(isExpired).length
    const pending = events.filter(isPending).length
    const best = events.filter(e => isActive(e)).sort((a, b) => b.discountPercent - a.discountPercent)[0]
    return { total, active, expired, pending, best }
  }, [events])

  const filtered = useMemo(() => {
    if (!search.trim()) return events
    const q = search.toLowerCase()
    return events.filter(e => e.name.toLowerCase().includes(q) || e.description?.toLowerCase().includes(q))
  }, [events, search])

  /* ── CRUD ── */
  function handleEdit(ev: DiscountEvent) {
    setEditingId(ev.id)
    setFormData({
      name: ev.name,
      description: ev.description || '',
      marqueeText: ev.marqueeText,
      discountPercent: ev.discountPercent,
      minimumDays: ev.minimumDays,
      startDate: fmtDateInput(ev.startDate),
      endDate: fmtDateInput(ev.endDate),
    })
    setShowForm(true)
  }

  function resetForm() {
    setFormData(EMPTY_FORM)
    setEditingId(null)
    setShowForm(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.name || !formData.startDate || !formData.endDate) {
      setMessage({ type: 'error', text: 'กรุณากรอกข้อมูลให้ครบถ้วน' }); return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/events', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, id: editingId }),
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: editingId ? 'แก้ไขอีเวนท์สำเร็จ' : 'สร้างอีเวนท์สำเร็จ' })
        resetForm(); fetchEvents()
      } else {
        setMessage({ type: 'error', text: data.error || 'เกิดข้อผิดพลาด' })
      }
    } catch { setMessage({ type: 'error', text: 'การเชื่อมต่อล้มเหลว' }) }
    finally { setSubmitting(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบอีเวนท์นี้?')) return
    try {
      const res = await fetch(`/api/admin/events?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) { setMessage({ type: 'success', text: 'ลบอีเวนท์สำเร็จ' }); fetchEvents() }
      else setMessage({ type: 'error', text: data.error || 'เกิดข้อผิดพลาด' })
    } catch { setMessage({ type: 'error', text: 'การเชื่อมต่อล้มเหลว' }) }
  }

  async function toggleActive(id: string, current: boolean) {
    try {
      const res = await fetch('/api/admin/events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !current }),
      })
      const data = await res.json()
      if (data.success) fetchEvents()
    } catch { /* ignore */ }
  }

  /* ── Status badge ── */
  function StatusBadge({ ev }: { ev: DiscountEvent }) {
    if (isActive(ev)) return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] sm:text-xs font-bold rounded-lg">
        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />กำลังใช้งาน
      </span>
    )
    if (isExpired(ev)) return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800 border border-white/5 text-zinc-500 text-[10px] sm:text-xs font-bold rounded-lg">
        หมดเวลา
      </span>
    )
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] sm:text-xs font-bold rounded-lg">
        <Clock className="w-3 h-3" />รอเริ่ม
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
        <p className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-widest">กำลังโหลดอีเวนท์...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-8">
      {/* ── Toast ── */}
      {message.text && (
        <div className={`fixed bottom-4 sm:bottom-8 right-4 sm:right-8 left-4 sm:left-auto z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl transition-all animate-in slide-in-from-right-10 ${
          message.type === 'success'
            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
            : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span className="font-semibold text-xs sm:text-sm">{message.text}</span>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center border border-purple-500/20">
              <Tag className="w-4 h-4 text-purple-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">จัดการอีเวนท์</h2>
          </div>
          <p className="text-zinc-500 text-xs sm:text-sm font-medium">สร้างและจัดการอีเวนท์ส่วนลดสำหรับลูกค้า</p>
        </div>
        <button
          onClick={() => { if (showForm) resetForm(); else setShowForm(true) }}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${
            showForm
              ? 'bg-zinc-800 border border-white/5 text-zinc-400 hover:text-white'
              : 'bg-purple-600 border border-purple-500/30 text-white hover:bg-purple-500'
          }`}
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'ยกเลิก' : 'สร้างอีเวนท์'}
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="อีเวนท์ทั้งหมด" value={stats.total} icon={Tag} color="purple" />
        <StatCard label="กำลังใช้งาน" value={stats.active} icon={Zap} color="emerald" />
        <StatCard label="รอเริ่ม" value={stats.pending} icon={Timer} color="orange" />
        <StatCard label="ส่วนลดสูงสุด" value={stats.best ? `${stats.best.discountPercent}%` : '-'} sub={stats.best?.name} icon={Percent} color="blue" />
      </div>

      {/* ── Create/Edit Form Modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={resetForm} />
          <div className="relative bg-zinc-950 border border-white/10 rounded-t-3xl sm:rounded-2xl w-full max-w-xl max-h-[92vh] sm:max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-white/5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center">
                  {editingId ? <Edit2 className="w-4 h-4 text-purple-400" /> : <Plus className="w-4 h-4 text-purple-400" />}
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">{editingId ? 'แก้ไขอีเวนท์' : 'สร้างอีเวนท์ใหม่'}</h3>
                  <p className="text-[11px] text-zinc-500 font-medium">กำหนดส่วนลดและช่วงเวลา</p>
                </div>
              </div>
              <button onClick={resetForm} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              {/* Row 1: name + percent */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">ชื่ออีเวนท์ *</label>
                  <div className="relative group">
                    <Type className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-purple-400 transition-colors" />
                    <input
                      type="text" value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="เช่น ลดราคาพิเศษ"
                      className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all font-medium placeholder:text-zinc-700"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">ส่วนลด (%)</label>
                  <div className="relative group">
                    <Percent className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-purple-400 transition-colors" />
                    <input
                      type="number" min="1" max="99" value={formData.discountPercent}
                      onChange={(e) => setFormData({ ...formData, discountPercent: parseInt(e.target.value) || 0 })}
                      className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all font-medium"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">รายละเอียด</label>
                <div className="relative group">
                  <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-600 group-focus-within:text-purple-400 transition-colors" />
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="รายละเอียดเพิ่มเติม (ไม่บังคับ)"
                    rows={2}
                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all font-medium placeholder:text-zinc-700 resize-none"
                  />
                </div>
              </div>

              {/* Minimum days */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">จำนวนวันขั้นต่ำ</label>
                <div className="relative group">
                  <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-purple-400 transition-colors" />
                  <input
                    type="number" min="1" max="365" value={formData.minimumDays}
                    onChange={(e) => setFormData({ ...formData, minimumDays: parseInt(e.target.value) || 1 })}
                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all font-medium"
                    required
                  />
                </div>
                <p className="text-[10px] text-zinc-600 ml-0.5">ซื้อครบจำนวนวันนี้ขึ้นไปถึงจะได้ส่วนลด</p>
              </div>

              {/* Marquee */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">ข้อความวิ่ง (Marquee)</label>
                <div className="relative group">
                  <Megaphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-purple-400 transition-colors" />
                  <input
                    type="text" value={formData.marqueeText}
                    onChange={(e) => setFormData({ ...formData, marqueeText: e.target.value })}
                    placeholder="ข้อความที่แสดงวิ่งในหน้าซื้อ"
                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all font-medium placeholder:text-zinc-700"
                  />
                </div>
                <p className="text-[10px] text-zinc-600 ml-0.5">ใช้ {'{percent}'} แสดง % ลด และ {'{minimumDays}'} แสดงวันขั้นต่ำ</p>
              </div>

              {/* Date range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">วันเริ่มต้น *</label>
                  <div className="relative group">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-purple-400 transition-colors" />
                    <input
                      type="datetime-local" value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all font-medium [color-scheme:dark]"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">วันสิ้นสุด *</label>
                  <div className="relative group">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-purple-400 transition-colors" />
                    <input
                      type="datetime-local" value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all font-medium [color-scheme:dark]"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Marquee preview */}
              {formData.marqueeText && (
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">ตัวอย่างข้อความวิ่ง</p>
                  <p className="text-xs text-purple-300 font-medium">
                    {formData.marqueeText
                      .replace('{percent}', formData.discountPercent.toString())
                      .replace('{minimumDays}', formData.minimumDays.toString())}
                  </p>
                </div>
              )}
            </form>

            {/* Modal Footer */}
            <div className="p-5 sm:p-6 border-t border-white/5 flex gap-3 shrink-0">
              <button
                type="button" onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-purple-600 border border-purple-500/30 rounded-xl text-sm font-bold text-white hover:bg-purple-500 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {submitting ? 'กำลังบันทึก...' : editingId ? 'บันทึกการแก้ไข' : 'สร้างอีเวนท์'}
              </button>
              <button
                type="button" onClick={resetForm}
                className="px-5 py-3 bg-zinc-800 border border-white/5 rounded-xl text-sm font-bold text-zinc-400 hover:text-white transition-all"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 sm:gap-6">
        {/* ── Left (2/3) ── */}
        <div className="xl:col-span-2 space-y-5 sm:space-y-6">

          {/* Search */}
          {events.length > 0 && (
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input
                type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาอีเวนท์..."
                className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/30 transition-all font-medium placeholder:text-zinc-700"
              />
            </div>
          )}

          {/* ── Desktop Table ── */}
          <div className="hidden sm:block bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-5 py-3.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">อีเวนท์</th>
                    <th className="px-5 py-3.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider text-center">ส่วนลด</th>
                    <th className="px-5 py-3.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider text-center">ขั้นต่ำ</th>
                    <th className="px-5 py-3.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">ช่วงเวลา</th>
                    <th className="px-5 py-3.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider text-center">สถานะ</th>
                    <th className="px-5 py-3.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 bg-white/[0.03] border border-white/5 rounded-xl flex items-center justify-center">
                            <Gift className="w-5 h-5 text-zinc-600" />
                          </div>
                          <p className="text-sm text-zinc-500 font-medium">{search ? 'ไม่พบอีเวนท์ที่ค้นหา' : 'ยังไม่มีอีเวนท์'}</p>
                          {!search && (
                            <button onClick={() => setShowForm(true)} className="text-xs text-purple-400 hover:text-purple-300 font-bold">
                              + สร้างอีเวนท์แรก
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : filtered.map(ev => (
                    <tr key={ev.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-sm font-bold text-white">{ev.name}</p>
                          {ev.description && <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-1">{ev.description}</p>}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold rounded-lg">
                          {ev.discountPercent}%
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="text-xs text-zinc-400 font-medium">{ev.minimumDays} วัน</span>
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-xs text-zinc-400 font-medium">{fmtDate(ev.startDate)} - {fmtDate(ev.endDate)}</p>
                          {isActive(ev) && <p className="text-[10px] text-emerald-500 font-bold mt-0.5">{timeLeft(ev.endDate)}</p>}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <StatusBadge ev={ev} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => toggleActive(ev.id, ev.isActive)}
                            className={`p-2 rounded-lg transition-colors ${
                              ev.isActive
                                ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                                : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
                            }`}
                            title={ev.isActive ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                          >
                            {ev.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleEdit(ev)}
                            className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(ev.id)}
                            className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Mobile Card List ── */}
          <div className="sm:hidden space-y-3">
            {filtered.length === 0 ? (
              <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-8 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-white/[0.03] border border-white/5 rounded-xl flex items-center justify-center">
                    <Gift className="w-5 h-5 text-zinc-600" />
                  </div>
                  <p className="text-sm text-zinc-500 font-medium">{search ? 'ไม่พบอีเวนท์' : 'ยังไม่มีอีเวนท์'}</p>
                  {!search && (
                    <button onClick={() => setShowForm(true)} className="text-xs text-purple-400 hover:text-purple-300 font-bold">
                      + สร้างอีเวนท์แรก
                    </button>
                  )}
                </div>
              </div>
            ) : filtered.map(ev => {
              const isExpanded = expandedId === ev.id
              return (
                <div key={ev.id} className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
                  {/* Card Header - tap to expand */}
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : ev.id)}
                    className="w-full p-4 flex items-center gap-3 text-left"
                  >
                    {/* Discount badge */}
                    <div className="w-11 h-11 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center shrink-0">
                      <span className="text-xs font-black text-purple-400">{ev.discountPercent}%</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-bold text-white truncate">{ev.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge ev={ev} />
                        <span className="text-[10px] text-zinc-600 font-medium">
                          {fmtDate(ev.startDate)} - {fmtDate(ev.endDate)}
                        </span>
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-zinc-600 transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3 animate-in slide-in-from-top-2 duration-200">
                      {ev.description && (
                        <p className="text-xs text-zinc-400">{ev.description}</p>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white/[0.02] rounded-lg p-2.5">
                          <p className="text-[10px] text-zinc-600 font-bold uppercase">ส่วนลด</p>
                          <p className="text-sm text-purple-400 font-bold">{ev.discountPercent}%</p>
                        </div>
                        <div className="bg-white/[0.02] rounded-lg p-2.5">
                          <p className="text-[10px] text-zinc-600 font-bold uppercase">ขั้นต่ำ</p>
                          <p className="text-sm text-orange-400 font-bold">{ev.minimumDays} วัน</p>
                        </div>
                        <div className="bg-white/[0.02] rounded-lg p-2.5 col-span-2">
                          <p className="text-[10px] text-zinc-600 font-bold uppercase">ช่วงเวลา</p>
                          <p className="text-xs text-zinc-400 font-medium mt-0.5">
                            {fmtDateTime(ev.startDate)} - {fmtDateTime(ev.endDate)}
                          </p>
                          {isActive(ev) && <p className="text-[10px] text-emerald-500 font-bold mt-1">{timeLeft(ev.endDate)}</p>}
                        </div>
                      </div>
                      {/* Marquee preview */}
                      <div className="bg-white/[0.02] rounded-lg p-2.5">
                        <p className="text-[10px] text-zinc-600 font-bold uppercase mb-1">ข้อความวิ่ง</p>
                        <p className="text-[11px] text-purple-300 font-medium leading-relaxed">
                          {ev.marqueeText.replace('{percent}', ev.discountPercent.toString()).replace('{minimumDays}', ev.minimumDays.toString())}
                        </p>
                      </div>
                      {/* Action buttons */}
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => toggleActive(ev.id, ev.isActive)}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                            ev.isActive
                              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                              : 'bg-zinc-800 border border-white/5 text-zinc-500'
                          }`}
                        >
                          {ev.isActive ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                          {ev.isActive ? 'เปิดอยู่' : 'ปิดอยู่'}
                        </button>
                        <button
                          onClick={() => handleEdit(ev)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs font-bold text-blue-400 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> แก้ไข
                        </button>
                        <button
                          onClick={() => handleDelete(ev.id)}
                          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs font-bold text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Sidebar (1/3) ── */}
        <div className="space-y-5 sm:space-y-6">

          {/* Active event highlight */}
          {stats.best && isActive(stats.best) && (
            <div className="bg-gradient-to-br from-emerald-600/[0.08] to-transparent border border-emerald-500/10 rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center">
                  <Zap className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">อีเวนท์ที่กำลังใช้งาน</h3>
                  <p className="text-[11px] text-zinc-500 font-medium">{timeLeft(stats.best.endDate)}</p>
                </div>
              </div>
              <div className="space-y-2.5">
                <p className="text-base font-bold text-white">{stats.best.name}</p>
                {stats.best.description && <p className="text-xs text-zinc-400">{stats.best.description}</p>}
                <div className="flex gap-3">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                    <p className="text-[10px] text-zinc-500 font-bold uppercase">ส่วนลด</p>
                    <p className="text-lg font-black text-emerald-400">{stats.best.discountPercent}%</p>
                  </div>
                  <div className="bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2">
                    <p className="text-[10px] text-zinc-500 font-bold uppercase">ขั้นต่ำ</p>
                    <p className="text-lg font-black text-white">{stats.best.minimumDays} <span className="text-xs text-zinc-500">วัน</span></p>
                  </div>
                </div>
              </div>
              {/* Countdown progress */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">ระยะเวลาเหลือ</span>
                </div>
                <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all"
                    style={{ width: `${Math.max(0, Math.min(100, ((new Date(stats.best.endDate).getTime() - Date.now()) / (new Date(stats.best.endDate).getTime() - new Date(stats.best.startDate).getTime())) * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* All events summary */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-white/5">
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-purple-400" /> สรุปอีเวนท์
              </h3>
            </div>
            <div className="p-4 sm:p-5 space-y-3">
              {events.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-4">ยังไม่มีข้อมูล</p>
              ) : (
                <>
                  {events.slice(0, 5).map(ev => (
                    <div key={ev.id} className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${
                        isActive(ev) ? 'bg-emerald-400' : isExpired(ev) ? 'bg-zinc-600' : 'bg-orange-400'
                      }`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-zinc-300 truncate">{ev.name}</p>
                      </div>
                      <span className="text-[10px] font-bold text-purple-400 shrink-0">{ev.discountPercent}%</span>
                    </div>
                  ))}
                  {events.length > 5 && (
                    <p className="text-[10px] text-zinc-600 text-center pt-1">+ อีก {events.length - 5} อีเวนท์</p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Tips card */}
          <div className="bg-gradient-to-br from-purple-600/[0.06] to-transparent border border-purple-500/10 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center">
                <Gift className="w-4 h-4 text-purple-400" />
              </div>
              <h3 className="text-sm font-bold text-white tracking-tight">เคล็ดลับ</h3>
            </div>
            <div className="space-y-2.5">
              <div className="flex gap-2">
                <span className="text-purple-400 text-xs mt-0.5 shrink-0">1.</span>
                <p className="text-xs text-zinc-400 leading-relaxed">ตั้งส่วนลดที่ดึงดูดลูกค้า เช่น 15-30% สำหรับวันหยุดยาว</p>
              </div>
              <div className="flex gap-2">
                <span className="text-purple-400 text-xs mt-0.5 shrink-0">2.</span>
                <p className="text-xs text-zinc-400 leading-relaxed">กำหนดวันขั้นต่ำเพื่อจูงใจให้ซื้อแพ็คเกจยาวขึ้น</p>
              </div>
              <div className="flex gap-2">
                <span className="text-purple-400 text-xs mt-0.5 shrink-0">3.</span>
                <p className="text-xs text-zinc-400 leading-relaxed">ข้อความวิ่งที่มี emoji จะดึงดูดความสนใจลูกค้ามากขึ้น</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
