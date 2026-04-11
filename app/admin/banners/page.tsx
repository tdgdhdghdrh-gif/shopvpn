'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Image as ImageIcon, Plus, Trash2, Edit2, Save, X, Eye, EyeOff,
  Loader2, AlertCircle, CheckCircle2, ArrowUp, ArrowDown,
  ExternalLink, Upload, Link2, Info, MousePointerClick,
  Hash, Clock, Sparkles, Type, AlignLeft, MousePointer2,
} from 'lucide-react'

interface Banner {
  id: string
  title: string
  imageUrl: string
  linkUrl: string | null
  isActive: boolean
  sortOrder: number
  aspectRatio: string
  overlayTitle: string | null
  overlaySubtitle: string | null
  buttonText: string | null
  buttonLink: string | null
  createdBy: string
  createdAt: string
  updatedAt: string
}

const ASPECT_RATIOS = [
  { label: '16:9', value: '16:9', css: '16/9', desc: '947×530' },
  { label: '3:2', value: '3:2', css: '3/2', desc: '900×600' },
  { label: '4:3', value: '4:3', css: '4/3', desc: '800×600' },
  { label: '21:9', value: '21:9', css: '21/9', desc: 'Ultrawide' },
  { label: '1:1', value: '1:1', css: '1/1', desc: 'สี่เหลี่ยม' },
]

function getAspectCss(ratio: string): string {
  const found = ASPECT_RATIOS.find(r => r.value === ratio)
  return found?.css || '16/9'
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

export default function BannersAdminPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [form, setForm] = useState({
    title: '',
    imageUrl: '',
    linkUrl: '',
    isActive: true,
    sortOrder: 0,
    aspectRatio: '16:9',
    overlayTitle: '',
    overlaySubtitle: '',
    buttonText: '',
    buttonLink: '',
  })

  useEffect(() => {
    fetchBanners()
  }, [])

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(t)
    }
  }, [toast])

  async function fetchBanners() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/banners')
      const data = await res.json()
      if (data.success) setBanners(data.banners)
    } catch {
      setToast({ type: 'error', message: 'โหลดข้อมูลไม่สำเร็จ' })
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setForm({ title: '', imageUrl: '', linkUrl: '', isActive: true, sortOrder: 0, aspectRatio: '16:9', overlayTitle: '', overlaySubtitle: '', buttonText: '', buttonLink: '' })
    setEditingId(null)
    setShowForm(false)
  }

  function startEdit(b: Banner) {
    setForm({
      title: b.title,
      imageUrl: b.imageUrl,
      linkUrl: b.linkUrl || '',
      isActive: b.isActive,
      sortOrder: b.sortOrder,
      aspectRatio: b.aspectRatio || '16:9',
      overlayTitle: b.overlayTitle || '',
      overlaySubtitle: b.overlaySubtitle || '',
      buttonText: b.buttonText || '',
      buttonLink: b.buttonLink || '',
    })
    setEditingId(b.id)
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
      setToast({ type: 'error', message: 'กรุณากรอกชื่อแบนเนอร์' })
      return
    }
    if (!form.imageUrl.trim()) {
      setToast({ type: 'error', message: 'กรุณาอัพโหลดรูปหรือใส่ URL รูปแบนเนอร์' })
      return
    }

    setSaving(true)
    try {
      const method = editingId ? 'PUT' : 'POST'
      const body = editingId ? { id: editingId, ...form } : form

      const res = await fetch('/api/admin/banners', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()

      if (data.success) {
        setToast({ type: 'success', message: `${editingId ? 'แก้ไข' : 'สร้าง'}แบนเนอร์สำเร็จ` })
        resetForm()
        fetchBanners()
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
    if (!confirm('ยืนยันลบแบนเนอร์นี้?')) return
    setDeleting(id)
    try {
      const res = await fetch('/api/admin/banners', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const data = await res.json()
      if (data.success) {
        setToast({ type: 'success', message: 'ลบแบนเนอร์สำเร็จ' })
        fetchBanners()
      }
    } catch {
      setToast({ type: 'error', message: 'ลบไม่สำเร็จ' })
    } finally {
      setDeleting(null)
    }
  }

  async function handleToggleActive(b: Banner) {
    try {
      const res = await fetch('/api/admin/banners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: b.id, isActive: !b.isActive }),
      })
      const data = await res.json()
      if (data.success) {
        setToast({ type: 'success', message: b.isActive ? 'ซ่อนแบนเนอร์แล้ว' : 'แสดงแบนเนอร์แล้ว' })
        fetchBanners()
      }
    } catch {}
  }

  async function handleReorder(id: string, direction: 'up' | 'down') {
    const idx = banners.findIndex(b => b.id === id)
    if (idx < 0) return
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= banners.length) return

    const currentOrder = banners[idx].sortOrder
    const swapOrder = banners[swapIdx].sortOrder

    try {
      await Promise.all([
        fetch('/api/admin/banners', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: banners[idx].id, sortOrder: swapOrder }),
        }),
        fetch('/api/admin/banners', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: banners[swapIdx].id, sortOrder: currentOrder }),
        }),
      ])
      fetchBanners()
    } catch {}
  }

  // Stats
  const totalActive = banners.filter(b => b.isActive).length
  const totalInactive = banners.filter(b => !b.isActive).length
  const totalWithLink = banners.filter(b => b.linkUrl).length

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
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center">
              <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
            </div>
            แบนเนอร์โปรโมชั่น
          </h1>
          <p className="text-xs text-zinc-500 mt-1">จัดการป้ายโปรโมทที่แสดงเป็น Carousel ในหน้าแรก</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-bold transition-all active:scale-95 shadow-lg shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4" />
          เพิ่มแบนเนอร์
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="ทั้งหมด" value={banners.length} icon={ImageIcon} color="cyan" />
        <StatCard label="กำลังแสดง" value={totalActive} icon={Eye} color="emerald" />
        <StatCard label="ซ่อนอยู่" value={totalInactive} icon={EyeOff} color="amber" />
        <StatCard label="มีลิงก์" value={totalWithLink} sub="คลิกได้" icon={MousePointerClick} color="blue" />
      </div>

      {/* Info Tip */}
      <div className="flex items-start gap-3 px-4 py-3 bg-cyan-500/5 border border-cyan-500/10 rounded-xl">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-[11px] text-zinc-400 leading-relaxed">
          <span className="text-cyan-400 font-bold">รองรับหลายอัตราส่วน + ข้อความซ้อน:</span> เลือก ratio ได้ (16:9, 3:2, 4:3, 21:9, 1:1) และเพิ่มหัวข้อ คำอธิบาย ปุ่ม CTA ซ้อนบนรูปได้ แบนเนอร์แสดงเป็น Carousel พร้อมตัวนับ slide
        </div>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-zinc-900/80 border border-white/10 rounded-2xl overflow-hidden">
          {/* Form Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              {editingId ? <Edit2 className="w-4 h-4 text-amber-400" /> : <Sparkles className="w-4 h-4 text-cyan-400" />}
              {editingId ? 'แก้ไขแบนเนอร์' : 'เพิ่มแบนเนอร์ใหม่'}
            </h2>
            <button onClick={resetForm} className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-5">
            {/* Title */}
            <div>
              <label className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider block mb-1.5">ชื่อแบนเนอร์</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="เช่น โปรโมชั่นส่งท้ายปี, ลด 50% ทุกเซิร์ฟเวอร์..."
                className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>

            {/* Image Upload - Drag & Drop Zone */}
            <div>
              <label className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider block mb-1.5">รูปแบนเนอร์</label>
              
              {!form.imageUrl ? (
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                    dragOver
                      ? 'border-cyan-400 bg-cyan-500/5'
                      : 'border-white/10 hover:border-cyan-500/30 hover:bg-cyan-500/5'
                  }`}
                >
                  {uploading ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
                      <p className="text-sm text-cyan-400 font-medium">กำลังอัพโหลด...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center">
                        <Upload className="w-6 h-6 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">ลากไฟล์มาวางตรงนี้ หรือ <span className="text-cyan-400">คลิกเลือกไฟล์</span></p>
                        <p className="text-[11px] text-zinc-500 mt-1">PNG, JPG, WebP — สูงสุด 10MB</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-white/10 bg-zinc-900 group">
                  <div style={{ aspectRatio: getAspectCss(form.aspectRatio) }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={form.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" fill="%23111"><rect width="800" height="450"/><text x="50%" y="50%" fill="%23555" font-size="24" text-anchor="middle" dy=".3em">Invalid Image URL</text></svg>'
                      }}
                    />
                  </div>
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all"
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
                  <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-lg text-[10px] text-zinc-400 font-mono">
                    {form.aspectRatio}
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
                  className="w-full pl-9 pr-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 transition-all"
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
                  placeholder="https://... หรือ /topup เป็นต้น (ไม่บังคับ)"
                  className="w-full pl-9 pr-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 transition-all"
                />
              </div>
              {form.linkUrl && (
                <p className="text-[10px] text-cyan-500/60 mt-1.5 flex items-center gap-1">
                  <MousePointerClick className="w-3 h-3" />
                  ผู้ใช้สามารถกดที่แบนเนอร์เพื่อไปยัง {form.linkUrl}
                </p>
              )}
            </div>

            {/* Aspect Ratio Selector */}
            <div>
              <label className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider block mb-1.5">อัตราส่วนรูป</label>
              <div className="flex flex-wrap gap-2">
                {ASPECT_RATIOS.map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm({ ...form, aspectRatio: r.value })}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                      form.aspectRatio === r.value
                        ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'
                        : 'bg-black/30 border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-300'
                    }`}
                  >
                    <span>{r.label}</span>
                    <span className={`text-[9px] font-medium ${form.aspectRatio === r.value ? 'text-cyan-500/60' : 'text-zinc-600'}`}>{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* === Overlay Content Section === */}
            <div className="border border-purple-500/15 bg-purple-500/5 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center justify-center">
                  <Type className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-purple-300">ข้อความซ้อนบนแบนเนอร์</h3>
                  <p className="text-[10px] text-zinc-500">เพิ่มหัวข้อ คำอธิบาย และปุ่ม CTA ที่แสดงบนรูป (ไม่บังคับ)</p>
                </div>
              </div>

              {/* Overlay Title */}
              <div>
                <label className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider block mb-1.5">หัวข้อ (Overlay Title)</label>
                <div className="relative">
                  <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input
                    type="text"
                    value={form.overlayTitle}
                    onChange={e => setForm({ ...form, overlayTitle: e.target.value })}
                    placeholder="เช่น ความเร็วแรง เสถียร ปลอดภัย..."
                    className="w-full pl-9 pr-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 transition-all"
                  />
                </div>
              </div>

              {/* Overlay Subtitle */}
              <div>
                <label className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider block mb-1.5">คำอธิบาย (Overlay Subtitle)</label>
                <div className="relative">
                  <AlignLeft className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />
                  <textarea
                    value={form.overlaySubtitle}
                    onChange={e => setForm({ ...form, overlaySubtitle: e.target.value })}
                    placeholder="เช่น รองรับงานสตรีม เล่นเกม และใช้งานทั่วไปได้ลื่นไหล..."
                    rows={2}
                    className="w-full pl-9 pr-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 transition-all resize-none"
                  />
                </div>
              </div>

              {/* Button Text + Button Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider block mb-1.5">ข้อความปุ่ม CTA</label>
                  <div className="relative">
                    <MousePointer2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input
                      type="text"
                      value={form.buttonText}
                      onChange={e => setForm({ ...form, buttonText: e.target.value })}
                      placeholder="เช่น เริ่มใช้งาน"
                      className="w-full pl-9 pr-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider block mb-1.5">ลิงก์ปุ่ม CTA</label>
                  <div className="relative">
                    <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input
                      type="text"
                      value={form.buttonLink}
                      onChange={e => setForm({ ...form, buttonLink: e.target.value })}
                      placeholder="เช่น /topup หรือ https://..."
                      className="w-full pl-9 pr-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-600 mt-1">ถ้าไม่กรอก จะใช้ &quot;ลิงก์ปลายทาง&quot; แทน</p>
                </div>
              </div>

              {/* Live Preview of overlay */}
              {(form.overlayTitle || form.overlaySubtitle || form.buttonText) && form.imageUrl && (
                <div className="mt-3">
                  <label className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider block mb-1.5">ตัวอย่างข้อความบนรูป</label>
                  <div className="relative rounded-xl overflow-hidden border border-white/10">
                    <div style={{ aspectRatio: getAspectCss(form.aspectRatio) }} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      {/* Text content */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                        {form.overlayTitle && (
                          <h3 className="text-base sm:text-xl font-black text-white drop-shadow-lg leading-tight mb-1">{form.overlayTitle}</h3>
                        )}
                        {form.overlaySubtitle && (
                          <p className="text-xs sm:text-sm text-white/80 drop-shadow-md mb-3 line-clamp-2">{form.overlaySubtitle}</p>
                        )}
                        {form.buttonText && (
                          <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-full text-xs sm:text-sm font-bold shadow-lg">
                            {form.buttonText}
                          </span>
                        )}
                      </div>
                      {/* Slide counter preview */}
                      <div className="absolute bottom-3 right-4 text-xs font-bold text-white/70">1 / 1</div>
                    </div>
                  </div>
                </div>
              )}
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
                    className="w-full pl-9 pr-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
                  />
                </div>
                <p className="text-[10px] text-zinc-600 mt-1">เลขน้อย = แสดงก่อน</p>
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
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all active:scale-95 shadow-lg shadow-cyan-500/20"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingId ? 'บันทึกการแก้ไข' : 'สร้างแบนเนอร์'}
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

      {/* Banners List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center py-16 sm:py-20">
          <div className="w-16 h-16 bg-zinc-900 border border-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-8 h-8 text-zinc-700" />
          </div>
          <p className="text-zinc-400 text-sm font-medium">ยังไม่มีแบนเนอร์</p>
          <p className="text-zinc-600 text-xs mt-1">กดปุ่ม &quot;เพิ่มแบนเนอร์&quot; เพื่อสร้างป้ายโปรโมทในหน้าแรก</p>
          <button
            onClick={() => { resetForm(); setShowForm(true) }}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            สร้างแบนเนอร์แรก
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((b, idx) => (
            <div
              key={b.id}
              className={`bg-zinc-900/50 border rounded-2xl overflow-hidden transition-all ${
                !b.isActive ? 'border-white/5 opacity-50' : 'border-white/5 hover:border-cyan-500/20'
              }`}
            >
              <div className="flex flex-col sm:flex-row">
                {/* Thumbnail with overlay badges */}
                <div className="relative sm:w-64 shrink-0 bg-zinc-900">
                  <div style={{ aspectRatio: getAspectCss(b.aspectRatio || '16:9') }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={b.imageUrl}
                      alt={b.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Order badge */}
                  <div className="absolute top-2 left-2 w-7 h-7 bg-black/70 backdrop-blur-sm rounded-lg flex items-center justify-center text-xs font-bold text-white border border-white/10">
                    {idx + 1}
                  </div>
                  {/* Status badge */}
                  <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-lg text-[9px] font-bold backdrop-blur-sm ${
                    b.isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-black/70 text-zinc-400 border border-white/10'
                  }`}>
                    {b.isActive ? 'ACTIVE' : 'HIDDEN'}
                  </div>
                  {/* Link indicator */}
                  {b.linkUrl && (
                    <div className="absolute bottom-2 right-2 w-6 h-6 bg-black/70 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/10">
                      <ExternalLink className="w-3 h-3 text-cyan-400" />
                    </div>
                  )}
                </div>

                {/* Info + Actions */}
                <div className="flex-1 min-w-0 p-4 sm:p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white leading-tight mb-1.5">{b.title}</h3>

                    {/* Overlay content indicator */}
                    {(b.overlayTitle || b.overlaySubtitle || b.buttonText) && (
                      <div className="flex items-center gap-1.5 text-[10px] text-purple-400/70 mb-1.5">
                        <Type className="w-3 h-3 shrink-0" />
                        <span className="truncate">
                          {[b.overlayTitle, b.buttonText && `ปุ่ม: ${b.buttonText}`].filter(Boolean).join(' · ')}
                        </span>
                      </div>
                    )}

                    {b.linkUrl && (
                      <div className="flex items-center gap-1.5 text-[11px] text-cyan-400/60 mb-2">
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span className="truncate">{b.linkUrl}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-3 text-[10px] text-zinc-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(b.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        ลำดับ {b.sortOrder}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/5">
                    <button
                      onClick={() => startEdit(b)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-[11px] font-medium transition-all"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span className="hidden sm:inline">แก้ไข</span>
                    </button>
                    <button
                      onClick={() => handleToggleActive(b)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                        b.isActive ? 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                      }`}
                    >
                      {b.isActive ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span className="hidden sm:inline">{b.isActive ? 'ซ่อน' : 'แสดง'}</span>
                    </button>

                    {/* Reorder buttons */}
                    <div className="flex items-center bg-white/5 rounded-lg overflow-hidden">
                      <button
                        onClick={() => handleReorder(b.id, 'up')}
                        disabled={idx === 0}
                        className="flex items-center px-2 py-1.5 hover:bg-white/10 text-zinc-400 hover:text-white text-[11px] transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                        title="เลื่อนขึ้น"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <div className="w-px h-4 bg-white/10" />
                      <button
                        onClick={() => handleReorder(b.id, 'down')}
                        disabled={idx === banners.length - 1}
                        className="flex items-center px-2 py-1.5 hover:bg-white/10 text-zinc-400 hover:text-white text-[11px] transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                        title="เลื่อนลง"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleDelete(b.id)}
                      disabled={deleting === b.id}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[11px] font-medium transition-all ml-auto disabled:opacity-50"
                    >
                      {deleting === b.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                      <span className="hidden sm:inline">ลบ</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
