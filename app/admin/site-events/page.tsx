'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Plus, Save, Loader2, CheckCircle, Trash2, Edit3, Eye, EyeOff,
  Calendar, Image as ImageIcon, X, Upload, Sparkles,
  ArrowUp, ArrowDown, Clock
} from 'lucide-react'

interface SiteEvent {
  id: string
  title: string
  description: string | null
  imageUrl: string | null
  startDate: string | null
  endDate: string | null
  isActive: boolean
  sortOrder: number
  createdAt: string
}

const defaultForm = {
  title: '',
  description: '',
  imageUrl: '',
  startDate: '',
  endDate: '',
  isActive: true,
  sortOrder: 0,
}

export default function AdminSiteEventsPage() {
  const [events, setEvents] = useState<SiteEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [form, setForm] = useState(defaultForm)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { fetchEvents() }, [])

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(t)
    }
  }, [toast])

  async function fetchEvents() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/site-events')
      const data = await res.json()
      if (data.success) setEvents(data.events)
    } catch { } finally { setLoading(false) }
  }

  function resetForm() {
    setForm({ ...defaultForm })
    setEditingId(null)
    setShowForm(false)
  }

  function startEdit(event: SiteEvent) {
    setForm({
      title: event.title,
      description: event.description || '',
      imageUrl: event.imageUrl || '',
      startDate: event.startDate ? new Date(event.startDate).toISOString().split('T')[0] : '',
      endDate: event.endDate ? new Date(event.endDate).toISOString().split('T')[0] : '',
      isActive: event.isActive,
      sortOrder: event.sortOrder,
    })
    setEditingId(event.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit() {
    if (!form.title.trim()) { setToast({ type: 'error', message: 'กรุณาระบุชื่อกิจกรรม' }); return }

    setSaving(true)
    try {
      const method = editingId ? 'PUT' : 'POST'
      const body = editingId ? { id: editingId, ...form } : form
      const res = await fetch('/api/admin/site-events', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.success) {
        setToast({ type: 'success', message: editingId ? 'อัปเดตกิจกรรมสำเร็จ' : 'เพิ่มกิจกรรมสำเร็จ' })
        resetForm()
        fetchEvents()
      } else {
        setToast({ type: 'error', message: data.error || 'เกิดข้อผิดพลาด' })
      }
    } catch {
      setToast({ type: 'error', message: 'เกิดข้อผิดพลาด' })
    } finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm('ลบกิจกรรมนี้?')) return
    setDeleting(id)
    try {
      const res = await fetch('/api/admin/site-events', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const data = await res.json()
      if (data.success) {
        setToast({ type: 'success', message: 'ลบกิจกรรมสำเร็จ' })
        fetchEvents()
      }
    } catch { } finally { setDeleting(null) }
  }

  async function handleToggleActive(event: SiteEvent) {
    try {
      await fetch('/api/admin/site-events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: event.id, isActive: !event.isActive }),
      })
      fetchEvents()
    } catch { }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setToast({ type: 'error', message: 'กรุณาเลือกไฟล์รูปภาพ' }); return }
    if (file.size > 10 * 1024 * 1024) { setToast({ type: 'error', message: 'ไฟล์ใหญ่เกิน 10MB' }); return }

    setUploading(true)
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const base64 = reader.result as string
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64 }),
        })
        const data = await res.json()
        if (data.success && data.url) {
          setForm(p => ({ ...p, imageUrl: data.url }))
          setToast({ type: 'success', message: 'อัปโหลดรูปสำเร็จ' })
        } else {
          setToast({ type: 'error', message: 'อัปโหลดไม่สำเร็จ' })
        }
      } catch {
        setToast({ type: 'error', message: 'เกิดข้อผิดพลาด' })
      } finally { setUploading(false) }
    }
    reader.readAsDataURL(file)
  }

  async function handleMove(idx: number, dir: 'up' | 'down') {
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= events.length) return
    const currentOrder = events[idx].sortOrder
    const swapOrder = events[swapIdx].sortOrder
    await Promise.all([
      fetch('/api/admin/site-events', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: events[idx].id, sortOrder: swapOrder }) }),
      fetch('/api/admin/site-events', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: events[swapIdx].id, sortOrder: currentOrder }) }),
    ])
    fetchEvents()
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[9999] flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-2xl ${
          toast.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-500/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5 text-pink-400" />
            </div>
            จัดการกิจกรรม
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1 ml-[46px]">เพิ่ม/แก้ไข/ลบ กิจกรรมที่แสดงในหน้ากิจกรรม</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/events"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-zinc-300 transition-all"
          >
            <Eye className="w-4 h-4" />
            ดูหน้าเว็บ
          </Link>
          <button
            onClick={() => { resetForm(); setShowForm(true) }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white shadow-lg shadow-pink-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            เพิ่มกิจกรรม
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-6 rounded-2xl border border-white/[0.06] bg-white/[0.01] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-zinc-900/30">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              {editingId ? <Edit3 className="w-4 h-4 text-amber-400" /> : <Plus className="w-4 h-4 text-pink-400" />}
              {editingId ? 'แก้ไขกิจกรรม' : 'เพิ่มกิจกรรมใหม่'}
            </h3>
            <button onClick={resetForm} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            <div>
              <label className="text-xs font-bold text-zinc-400 mb-1.5 block">ชื่อกิจกรรม *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="เช่น กิจกรรมลุ้นรับ VPN ฟรี..."
                className="w-full px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-600 outline-none focus:border-pink-500/30 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 mb-1.5 block">รายละเอียด</label>
              <textarea
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                rows={3}
                placeholder="อธิบายรายละเอียดกิจกรรม..."
                className="w-full px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-600 outline-none focus:border-pink-500/30 transition-colors resize-none"
              />
            </div>

            {/* Image */}
            <div>
              <label className="text-xs font-bold text-zinc-400 mb-1.5 block">รูปภาพกิจกรรม</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-white/10 hover:border-pink-500/30 rounded-xl cursor-pointer transition-all bg-zinc-900/30 hover:bg-zinc-900/50"
                >
                  {uploading ? (
                    <Loader2 className="w-6 h-6 text-pink-400 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-zinc-600" />
                      <p className="text-[11px] text-zinc-500 text-center">คลิกเลือก หรือ ลากไฟล์มาวาง<br /><span className="text-zinc-600">PNG, JPG, WEBP (ไม่เกิน 10MB)</span></p>
                    </>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={form.imageUrl}
                    onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))}
                    placeholder="หรือวาง URL รูปภาพ..."
                    className="w-full px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-600 outline-none focus:border-pink-500/30 transition-colors"
                  />
                  {form.imageUrl && (
                    <div className="relative w-full h-28 rounded-xl overflow-hidden border border-white/10 bg-zinc-900">
                      <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setForm(p => ({ ...p, imageUrl: '' }))}
                        className="absolute top-1 right-1 p-1 rounded-lg bg-black/60 text-zinc-400 hover:text-white transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-400 mb-1.5 block">วันเริ่มต้น</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-pink-500/30 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 mb-1.5 block">วันสิ้นสุด</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-pink-500/30 transition-colors"
                />
              </div>
            </div>

            {/* Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))}
                className="flex items-center gap-2"
              >
                {form.isActive ? (
                  <div className="w-10 h-6 bg-emerald-500/20 rounded-full relative">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-emerald-400 rounded-full" />
                  </div>
                ) : (
                  <div className="w-10 h-6 bg-zinc-700 rounded-full relative">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-zinc-400 rounded-full" />
                  </div>
                )}
                <span className={`text-sm font-medium ${form.isActive ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  {form.isActive ? 'เปิดแสดง' : 'ซ่อน'}
                </span>
              </button>
            </div>

            {/* Submit */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white shadow-lg shadow-pink-500/20 transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingId ? 'อัปเดต' : 'เพิ่มกิจกรรม'}
              </button>
              <button
                onClick={resetForm}
                className="px-4 py-2.5 rounded-xl text-sm font-bold text-zinc-400 hover:text-white bg-zinc-900 border border-white/5 hover:bg-zinc-800 transition-all"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Events List */}
      {events.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 text-sm">ยังไม่มีกิจกรรม กดเพิ่มกิจกรรมใหม่เลย!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((event, idx) => (
            <div
              key={event.id}
              className={`rounded-2xl border overflow-hidden transition-all ${
                event.isActive ? 'border-white/[0.06] bg-white/[0.01]' : 'border-white/[0.03] bg-zinc-950/50 opacity-60'
              }`}
            >
              <div className="flex flex-col sm:flex-row gap-4 p-4">
                <div className="relative w-full sm:w-32 h-24 sm:h-20 rounded-xl overflow-hidden bg-zinc-900 border border-white/5 shrink-0">
                  {event.imageUrl ? (
                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-zinc-700" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-white truncate">{event.title}</h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {event.startDate && (
                          <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(event.startDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                        {event.endDate && (
                          <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(event.endDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleMove(idx, 'up')} disabled={idx === 0} className="p-1 rounded hover:bg-white/5 text-zinc-500 disabled:opacity-20">
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button onClick={() => handleMove(idx, 'down')} disabled={idx === events.length - 1} className="p-1 rounded hover:bg-white/5 text-zinc-500 disabled:opacity-20">
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  {event.description && (
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{event.description}</p>
                  )}
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <button onClick={() => startEdit(event)} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white transition-all">
                      <Edit3 className="w-3 h-3" /> แก้ไข
                    </button>
                    <button onClick={() => handleToggleActive(event)} className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${event.isActive ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-zinc-900 border-white/5 text-zinc-500'}`}>
                      {event.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {event.isActive ? 'แสดง' : 'ซ่อน'}
                    </button>
                    <button onClick={() => handleDelete(event.id)} disabled={deleting === event.id} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-rose-500/5 border border-rose-500/10 text-rose-400/60 hover:text-rose-400 ml-auto">
                      {deleting === event.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                      ลบ
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
