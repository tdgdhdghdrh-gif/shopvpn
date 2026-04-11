'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Maximize2, Plus, Trash2, Edit2, Save, X, Eye, EyeOff,
  Loader2, AlertCircle, CheckCircle2, ArrowUp, ArrowDown,
  ExternalLink, Upload, Link2, Info, MousePointerClick,
  Hash, Clock, Sparkles, Timer, CalendarClock, CalendarX2,
  CalendarCheck, AlertTriangle,
} from 'lucide-react'

interface Popup {
  id: string
  title: string
  imageUrl: string
  linkUrl: string | null
  isActive: boolean
  sortOrder: number
  startDate: string | null
  endDate: string | null
  createdBy: string
  createdAt: string
  updatedAt: string
}

function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string | number; sub?: string; icon: React.ElementType; color: string
}) {
  const c: Record<string, string> = {
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    pink: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
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

// Helper: convert Date to local datetime-local input value
function toLocalDatetime(d: string | null): string {
  if (!d) return ''
  const date = new Date(d)
  if (isNaN(date.getTime())) return ''
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

function getPopupStatus(p: Popup): { label: string; color: string; icon: React.ElementType } {
  if (!p.isActive) return { label: 'ซ่อนอยู่', color: 'zinc', icon: EyeOff }
  const now = new Date()
  if (p.startDate && new Date(p.startDate) > now) return { label: 'รอเริ่ม', color: 'blue', icon: CalendarClock }
  if (p.endDate && new Date(p.endDate) <= now) return { label: 'หมดอายุ', color: 'red', icon: CalendarX2 }
  return { label: 'กำลังแสดง', color: 'emerald', icon: Eye }
}

export default function PopupsAdminPage() {
  const [popups, setPopups] = useState<Popup[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    title: '',
    imageUrl: '',
    linkUrl: '',
    isActive: true,
    sortOrder: 0,
    startDate: '',
    endDate: '',
  })

  useEffect(() => { fetchPopups() }, [])

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(t)
    }
  }, [toast])

  async function fetchPopups() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/popups')
      const data = await res.json()
      if (data.success) setPopups(data.popups)
    } catch {
      setToast({ type: 'error', message: 'โหลดข้อมูลไม่สำเร็จ' })
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setForm({ title: '', imageUrl: '', linkUrl: '', isActive: true, sortOrder: 0, startDate: '', endDate: '' })
    setEditingId(null)
    setShowForm(false)
  }

  function startEdit(p: Popup) {
    setForm({
      title: p.title,
      imageUrl: p.imageUrl,
      linkUrl: p.linkUrl || '',
      isActive: p.isActive,
      sortOrder: p.sortOrder,
      startDate: toLocalDatetime(p.startDate),
      endDate: toLocalDatetime(p.endDate),
    })
    setEditingId(p.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function processFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setToast({ type: 'error', message: 'กรุณาเลือกไฟล์รูปภาพเท่านั้น' })
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setToast({ type: 'error', message: 'ไฟล์ใหญ่เกินไป (สูงสุด 10MB)' })
      return
    }
    setUploading(true)
    try {
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = reader.result as string
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64 }),
        })
        const data = await res.json()
        if (data.success && data.url) {
          setForm(prev => ({ ...prev, imageUrl: data.url }))
          setToast({ type: 'success', message: 'อัพโหลดรูปสำเร็จ' })
        } else {
          setToast({ type: 'error', message: data.error || 'อัพโหลดไม่สำเร็จ' })
        }
        setUploading(false)
      }
      reader.onerror = () => {
        setToast({ type: 'error', message: 'อ่านไฟล์ไม่สำเร็จ' })
        setUploading(false)
      }
      reader.readAsDataURL(file)
    } catch {
      setToast({ type: 'error', message: 'อัพโหลดไม่สำเร็จ' })
      setUploading(false)
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    await processFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  async function handleSubmit() {
    if (!form.title.trim()) {
      setToast({ type: 'error', message: 'กรุณากรอกชื่อ Popup' })
      return
    }
    if (!form.imageUrl.trim()) {
      setToast({ type: 'error', message: 'กรุณาอัพโหลดรูปหรือใส่ URL รูป Popup' })
      return
    }
    // Validate dates
    if (form.startDate && form.endDate) {
      if (new Date(form.startDate) >= new Date(form.endDate)) {
        setToast({ type: 'error', message: 'วันหมดอายุต้องอยู่หลังวันเริ่มแสดง' })
        return
      }
    }

    setSaving(true)
    try {
      const method = editingId ? 'PUT' : 'POST'
      const payload: any = {
        title: form.title,
        imageUrl: form.imageUrl,
        linkUrl: form.linkUrl,
        isActive: form.isActive,
        sortOrder: form.sortOrder,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
      }
      if (editingId) payload.id = editingId

      const res = await fetch('/api/admin/popups', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        setToast({ type: 'success', message: `${editingId ? 'แก้ไข' : 'สร้าง'} Popup สำเร็จ` })
        resetForm()
        fetchPopups()
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
    if (!confirm('ยืนยันลบ Popup นี้?')) return
    setDeleting(id)
    try {
      const res = await fetch('/api/admin/popups', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const data = await res.json()
      if (data.success) {
        setToast({ type: 'success', message: 'ลบ Popup สำเร็จ' })
        fetchPopups()
      }
    } catch {
      setToast({ type: 'error', message: 'ลบไม่สำเร็จ' })
    } finally {
      setDeleting(null)
    }
  }

  async function handleToggleActive(p: Popup) {
    try {
      const res = await fetch('/api/admin/popups', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: p.id, isActive: !p.isActive }),
      })
      const data = await res.json()
      if (data.success) {
        setToast({ type: 'success', message: p.isActive ? 'ซ่อน Popup แล้ว' : 'แสดง Popup แล้ว' })
        fetchPopups()
      }
    } catch {}
  }

  async function handleReorder(id: string, direction: 'up' | 'down') {
    const idx = popups.findIndex(p => p.id === id)
    if (idx < 0) return
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= popups.length) return
    const currentOrder = popups[idx].sortOrder
    const swapOrder = popups[swapIdx].sortOrder
    try {
      await Promise.all([
        fetch('/api/admin/popups', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: popups[idx].id, sortOrder: swapOrder }),
        }),
        fetch('/api/admin/popups', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: popups[swapIdx].id, sortOrder: currentOrder }),
        }),
      ])
      fetchPopups()
    } catch {}
  }

  const now = new Date()
  const totalActive = popups.filter(p => {
    if (!p.isActive) return false
    if (p.startDate && new Date(p.startDate) > now) return false
    if (p.endDate && new Date(p.endDate) <= now) return false
    return true
  }).length
  const totalExpired = popups.filter(p => p.endDate && new Date(p.endDate) <= now).length
  const totalScheduled = popups.filter(p => p.isActive && p.startDate && new Date(p.startDate) > now).length
  const totalWithLink = popups.filter(p => p.linkUrl).length

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

  function formatShortDate(d: string | null) {
    if (!d) return '-'
    return new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

  // How much time left until endDate
  function timeLeft(endDate: string | null): string | null {
    if (!endDate) return null
    const end = new Date(endDate).getTime()
    const diff = end - Date.now()
    if (diff <= 0) return 'หมดอายุแล้ว'
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    if (days > 0) return `อีก ${days} วัน ${hours} ชม.`
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    if (hours > 0) return `อีก ${hours} ชม. ${mins} นาที`
    return `อีก ${mins} นาที`
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
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-pink-500/10 border border-pink-500/20 rounded-xl flex items-center justify-center">
              <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400" />
            </div>
            Popup โปรโมชั่น
          </h1>
          <p className="text-xs text-zinc-500 mt-1">ป๊อปอัพเต็มจอเมื่อเข้าเว็บ — รองรับตั้งเวลาเริ่ม/หมดอายุอัตโนมัติ</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-sm font-bold transition-all active:scale-95 shadow-lg shadow-pink-500/20"
        >
          <Plus className="w-4 h-4" />
          เพิ่ม Popup
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard label="ทั้งหมด" value={popups.length} icon={Maximize2} color="pink" />
        <StatCard label="กำลังแสดง" value={totalActive} icon={Eye} color="emerald" />
        <StatCard label="รอเริ่ม" value={totalScheduled} icon={CalendarClock} color="blue" />
        <StatCard label="หมดอายุ" value={totalExpired} icon={CalendarX2} color="red" />
        <StatCard label="มีลิงก์" value={totalWithLink} sub="คลิกได้" icon={MousePointerClick} color="amber" />
      </div>

      {/* Info Tips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex items-start gap-3 px-4 py-3 bg-pink-500/5 border border-pink-500/10 rounded-xl">
          <Info className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
          <div className="text-[11px] text-zinc-400 leading-relaxed">
            <span className="text-pink-400 font-bold">ขนาดรูป:</span> แนะนำ 1080 x 1350 px หรือ 1080 x 1080 px — รูปจะแสดงเต็มขนาดไม่ถูกครอป
          </div>
        </div>
        <div className="flex items-start gap-3 px-4 py-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
          <Timer className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-[11px] text-zinc-400 leading-relaxed">
            <span className="text-amber-400 font-bold">Cooldown:</span> ปิดแล้วไม่แสดงอีก 30 นาที — มีปุ่ม &quot;ถัดไป&quot; ถ้ามีหลายรูป
          </div>
        </div>
        <div className="flex items-start gap-3 px-4 py-3 bg-blue-500/5 border border-blue-500/10 rounded-xl">
          <CalendarClock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div className="text-[11px] text-zinc-400 leading-relaxed">
            <span className="text-blue-400 font-bold">ตั้งเวลา:</span> กำหนดวันเริ่ม/หมดอายุ — Popup จะเปิด/ปิดเองอัตโนมัติตามเวลา
          </div>
        </div>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-zinc-900/80 border border-white/10 rounded-2xl overflow-hidden">
          {/* Form Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              {editingId ? <Edit2 className="w-4 h-4 text-amber-400" /> : <Sparkles className="w-4 h-4 text-pink-400" />}
              {editingId ? 'แก้ไข Popup' : 'เพิ่ม Popup ใหม่'}
            </h2>
            <button onClick={resetForm} className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-5">
            {/* Title */}
            <div>
              <label className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider block mb-1.5">ชื่อ Popup</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="เช่น โปร Flash Sale, คูปองส่วนลด..."
                className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-pink-500/50 transition-all"
              />
            </div>

            {/* Image Upload - Drag & Drop Zone */}
            <div>
              <label className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider block mb-1.5">รูป Popup</label>
              
              {!form.imageUrl ? (
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                    dragOver
                      ? 'border-pink-400 bg-pink-500/5'
                      : 'border-white/10 hover:border-pink-500/30 hover:bg-pink-500/5'
                  }`}
                >
                  {uploading ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-10 h-10 text-pink-400 animate-spin" />
                      <p className="text-sm text-pink-400 font-medium">กำลังอัพโหลด...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 bg-pink-500/10 border border-pink-500/20 rounded-2xl flex items-center justify-center">
                        <Upload className="w-6 h-6 text-pink-400" />
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">ลากไฟล์มาวางตรงนี้ หรือ <span className="text-pink-400">คลิกเลือกไฟล์</span></p>
                        <p className="text-[11px] text-zinc-500 mt-1">PNG, JPG, WebP — สูงสุด 10MB — แนะนำ 1080 x 1350 px</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-white/10 bg-zinc-900 max-w-sm mx-auto group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.imageUrl}
                    alt="Preview"
                    className="w-full h-auto max-h-[400px] object-contain bg-zinc-950"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" fill="%23111"><rect width="400" height="400"/><text x="50%" y="50%" fill="%23555" font-size="20" text-anchor="middle" dy=".3em">Invalid Image</text></svg>'
                    }}
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold transition-all"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      เปลี่ยนรูป
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, imageUrl: '' }))}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      ลบรูป
                    </button>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {/* URL Input below */}
              <div className="mt-3 relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type="text"
                  value={form.imageUrl}
                  onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="หรือวาง URL รูปภาพตรงนี้..."
                  className="w-full pl-9 pr-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-pink-500/50 transition-all"
                />
              </div>
            </div>

            {/* Link URL */}
            <div>
              <label className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider block mb-1.5">ลิงก์ปลายทาง (ถ้ามี)</label>
              <div className="relative">
                <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type="text"
                  value={form.linkUrl}
                  onChange={e => setForm({ ...form, linkUrl: e.target.value })}
                  placeholder="https://... หรือ /topup (ไม่บังคับ)"
                  className="w-full pl-9 pr-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-pink-500/50 transition-all"
                />
              </div>
              {form.linkUrl && (
                <p className="text-[10px] text-pink-500/60 mt-1.5 flex items-center gap-1">
                  <MousePointerClick className="w-3 h-3" />
                  กดที่รูป Popup จะเปิดไปยัง {form.linkUrl}
                </p>
              )}
            </div>

            {/* Schedule: Start Date + End Date */}
            <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <CalendarClock className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-blue-400">ตั้งเวลาแสดง</span>
                <span className="text-[10px] text-zinc-600 ml-1">ไม่บังคับ — เว้นว่างจะแสดงทันทีไม่มีหมดอายุ</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider block mb-1.5">
                    <CalendarCheck className="w-3 h-3 inline mr-1" />
                    เริ่มแสดง
                  </label>
                  <input
                    type="datetime-local"
                    value={form.startDate}
                    onChange={e => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-3 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all [color-scheme:dark]"
                  />
                  <p className="text-[10px] text-zinc-600 mt-1">เว้นว่าง = แสดงทันที</p>
                </div>
                <div>
                  <label className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider block mb-1.5">
                    <CalendarX2 className="w-3 h-3 inline mr-1" />
                    หมดอายุ
                  </label>
                  <input
                    type="datetime-local"
                    value={form.endDate}
                    onChange={e => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-3 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all [color-scheme:dark]"
                  />
                  <p className="text-[10px] text-zinc-600 mt-1">เว้นว่าง = ไม่มีหมดอายุ</p>
                </div>
              </div>

              {/* Quick presets */}
              <div>
                <p className="text-[10px] text-zinc-600 mb-2">ตั้งหมดอายุเร็ว:</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: '1 ชม.', hours: 1 },
                    { label: '6 ชม.', hours: 6 },
                    { label: '12 ชม.', hours: 12 },
                    { label: '1 วัน', hours: 24 },
                    { label: '3 วัน', hours: 72 },
                    { label: '7 วัน', hours: 168 },
                    { label: '14 วัน', hours: 336 },
                    { label: '30 วัน', hours: 720 },
                  ].map(preset => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        const end = new Date(Date.now() + preset.hours * 60 * 60 * 1000)
                        const offset = end.getTimezoneOffset()
                        const local = new Date(end.getTime() - offset * 60000)
                        setForm(prev => ({
                          ...prev,
                          startDate: prev.startDate || '', // keep as-is
                          endDate: local.toISOString().slice(0, 16),
                        }))
                      }}
                      className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[10px] text-blue-400 font-bold hover:bg-blue-500/20 transition-all"
                    >
                      {preset.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, startDate: '', endDate: '' }))}
                    className="px-2.5 py-1 bg-zinc-800 border border-white/10 rounded-lg text-[10px] text-zinc-500 font-bold hover:bg-zinc-700 transition-all"
                  >
                    ล้าง
                  </button>
                </div>
              </div>
            </div>

            {/* Sort Order + Active */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider block mb-1.5">ลำดับการแสดง</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={e => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full pl-9 pr-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-pink-500/50 transition-all"
                  />
                </div>
                <p className="text-[10px] text-zinc-600 mt-1">ถ้ามีหลาย Popup เลขน้อย = แสดงก่อน</p>
              </div>
              <div>
                <label className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider block mb-1.5">สถานะ</label>
                <button
                  onClick={() => setForm({ ...form, isActive: !form.isActive })}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                    form.isActive
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-zinc-800 border-white/10 text-zinc-500'
                  }`}
                >
                  {form.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  {form.isActive ? 'แสดงทันที' : 'ซ่อนไว้ก่อน'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all active:scale-95 shadow-lg shadow-pink-500/20"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingId ? 'บันทึกการแก้ไข' : 'สร้าง Popup'}
              </button>
              <button
                onClick={resetForm}
                className="px-4 py-2.5 border border-white/10 text-zinc-400 hover:text-white rounded-xl text-sm font-medium transition-all"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popups List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-pink-400 animate-spin" />
        </div>
      ) : popups.length === 0 ? (
        <div className="text-center py-16 sm:py-20">
          <div className="w-16 h-16 bg-zinc-900 border border-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Maximize2 className="w-8 h-8 text-zinc-700" />
          </div>
          <p className="text-zinc-400 text-sm font-medium">ยังไม่มี Popup</p>
          <p className="text-zinc-600 text-xs mt-1">กดปุ่ม &quot;เพิ่ม Popup&quot; เพื่อสร้างป๊อปอัพโปรโมชั่น</p>
          <button
            onClick={() => { resetForm(); setShowForm(true) }}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            สร้าง Popup แรก
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {popups.map((p, idx) => {
            const status = getPopupStatus(p)
            const remaining = timeLeft(p.endDate)
            const isExpired = p.endDate && new Date(p.endDate) <= now
            const isScheduled = p.isActive && p.startDate && new Date(p.startDate) > now

            return (
              <div
                key={p.id}
                className={`bg-zinc-900/50 border rounded-2xl overflow-hidden transition-all ${
                  isExpired
                    ? 'border-red-500/20 opacity-60'
                    : !p.isActive
                    ? 'border-white/5 opacity-50'
                    : isScheduled
                    ? 'border-blue-500/20'
                    : 'border-white/5 hover:border-pink-500/20'
                }`}
              >
                {/* Image */}
                <div className="relative bg-zinc-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    className="w-full h-auto max-h-[300px] object-contain"
                  />
                  {/* Order badge */}
                  <div className="absolute top-2 left-2 w-7 h-7 bg-black/70 backdrop-blur-sm rounded-lg flex items-center justify-center text-xs font-bold text-white border border-white/10">
                    {idx + 1}
                  </div>
                  {/* Status badge */}
                  <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-lg text-[9px] font-bold backdrop-blur-sm flex items-center gap-1 ${
                    status.color === 'emerald'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : status.color === 'red'
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                      : status.color === 'blue'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'bg-black/70 text-zinc-400 border border-white/10'
                  }`}>
                    <status.icon className="w-2.5 h-2.5" />
                    {status.label}
                  </div>
                  {/* Link indicator */}
                  {p.linkUrl && (
                    <div className="absolute bottom-2 right-2 w-6 h-6 bg-black/70 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/10">
                      <ExternalLink className="w-3 h-3 text-pink-400" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-sm font-bold text-white leading-tight mb-1.5 truncate">{p.title}</h3>

                  {p.linkUrl && (
                    <div className="flex items-center gap-1.5 text-[11px] text-pink-400/60 mb-2">
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      <span className="truncate">{p.linkUrl}</span>
                    </div>
                  )}

                  {/* Date info */}
                  <div className="space-y-1 mb-2">
                    {p.startDate && (
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <CalendarCheck className="w-3 h-3 text-blue-400 shrink-0" />
                        <span className="text-zinc-500">เริ่ม:</span>
                        <span className="text-zinc-400">{formatShortDate(p.startDate)}</span>
                      </div>
                    )}
                    {p.endDate && (
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <CalendarX2 className={`w-3 h-3 shrink-0 ${isExpired ? 'text-red-400' : 'text-amber-400'}`} />
                        <span className="text-zinc-500">หมด:</span>
                        <span className={isExpired ? 'text-red-400' : 'text-zinc-400'}>{formatShortDate(p.endDate)}</span>
                      </div>
                    )}
                    {remaining && (
                      <div className={`flex items-center gap-1.5 text-[10px] font-medium ${
                        isExpired ? 'text-red-400' : 'text-amber-400'
                      }`}>
                        {isExpired ? <AlertTriangle className="w-3 h-3 shrink-0" /> : <Timer className="w-3 h-3 shrink-0" />}
                        {remaining}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[10px] text-zinc-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(p.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Hash className="w-3 h-3" />
                      ลำดับ {p.sortOrder}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/5">
                    <button
                      onClick={() => startEdit(p)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-[11px] font-medium transition-all"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span className="hidden sm:inline">แก้ไข</span>
                    </button>
                    <button
                      onClick={() => handleToggleActive(p)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                        p.isActive ? 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                      }`}
                    >
                      {p.isActive ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>

                    {/* Reorder buttons */}
                    <div className="flex items-center bg-white/5 rounded-lg overflow-hidden">
                      <button
                        onClick={() => handleReorder(p.id, 'up')}
                        disabled={idx === 0}
                        className="flex items-center px-1.5 py-1.5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <div className="w-px h-4 bg-white/10" />
                      <button
                        onClick={() => handleReorder(p.id, 'down')}
                        disabled={idx === popups.length - 1}
                        className="flex items-center px-1.5 py-1.5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleDelete(p.id)}
                      disabled={deleting === p.id}
                      className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[11px] font-medium transition-all ml-auto disabled:opacity-50"
                    >
                      {deleting === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
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
