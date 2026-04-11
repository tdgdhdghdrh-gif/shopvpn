'use client'

import { useEffect, useState, useRef } from 'react'
import {
  Package, Plus, Save, Loader2, CheckCircle, Trash2, Edit3, Eye, EyeOff,
  Star, ArrowUp, ArrowDown, Search, Upload, Image as ImageIcon, X,
  Smartphone, Monitor, Apple, Gamepad2, Music, BookOpen, Globe, Shield,
  Video, Sparkles, Crown, Tag, ShoppingCart, ToggleLeft, ToggleRight,
  Download, ExternalLink, FileText, Copy, ChevronDown,
} from 'lucide-react'

interface PremiumAppData {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  category: string
  platform: string
  features: string | null
  downloadUrl: string | null
  instructions: string | null
  stockCodes: string | null
  stock: number
  sold: number
  isActive: boolean
  isFeatured: boolean
  sortOrder: number
  createdAt: string
  _count?: { orders: number }
}

const categories = [
  { id: 'general', label: 'ทั่วไป', icon: Package, color: 'text-zinc-400' },
  { id: 'streaming', label: 'ดูหนัง/ซีรีส์', icon: Video, color: 'text-rose-400' },
  { id: 'productivity', label: 'เพิ่มประสิทธิภาพ', icon: Sparkles, color: 'text-blue-400' },
  { id: 'vpn', label: 'VPN & ความปลอดภัย', icon: Shield, color: 'text-emerald-400' },
  { id: 'game', label: 'เกม', icon: Gamepad2, color: 'text-violet-400' },
  { id: 'social', label: 'โซเชียล', icon: Globe, color: 'text-cyan-400' },
  { id: 'music', label: 'เพลง', icon: Music, color: 'text-pink-400' },
  { id: 'education', label: 'การศึกษา', icon: BookOpen, color: 'text-amber-400' },
]

const platforms = [
  { id: 'all', label: 'ทุกแพลตฟอร์ม' },
  { id: 'ios', label: 'iOS' },
  { id: 'android', label: 'Android' },
  { id: 'windows', label: 'Windows' },
  { id: 'mac', label: 'macOS' },
]

const defaultForm = {
  name: '',
  description: '',
  price: 0,
  imageUrl: '',
  category: 'general',
  platform: 'all',
  features: '',
  downloadUrl: '',
  instructions: '',
  stockCodes: '',
  isActive: true,
  isFeatured: false,
  sortOrder: 0,
}

export default function AdminPremiumAppsPage() {
  const [apps, setApps] = useState<PremiumAppData[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [form, setForm] = useState(defaultForm)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { fetchApps() }, [])

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(t)
    }
  }, [toast])

  async function fetchApps() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/premium-apps')
      const data = await res.json()
      if (data.success) setApps(data.apps)
    } catch { } finally { setLoading(false) }
  }

  function resetForm() {
    setForm({ ...defaultForm })
    setEditingId(null)
    setShowForm(false)
  }

  function startEdit(app: PremiumAppData) {
    setForm({
      name: app.name,
      description: app.description,
      price: app.price,
      imageUrl: app.imageUrl,
      category: app.category,
      platform: app.platform,
      features: app.features ? (typeof app.features === 'string' ? app.features : JSON.stringify(app.features)) : '',
      downloadUrl: app.downloadUrl || '',
      instructions: app.instructions || '',
      stockCodes: app.stockCodes || '',
      isActive: app.isActive,
      isFeatured: app.isFeatured,
      sortOrder: app.sortOrder,
    })
    setEditingId(app.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit() {
    if (!form.name.trim()) { setToast({ type: 'error', message: 'กรุณาระบุชื่อแอพ' }); return }
    if (!form.imageUrl.trim()) { setToast({ type: 'error', message: 'กรุณาใส่รูปภาพแอพ' }); return }
    if (form.price < 0) { setToast({ type: 'error', message: 'ราคาต้องไม่ต่ำกว่า 0' }); return }

    setSaving(true)
    try {
      const method = editingId ? 'PUT' : 'POST'
      const body = editingId ? { id: editingId, ...form } : form
      const res = await fetch('/api/admin/premium-apps', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.success) {
        setToast({ type: 'success', message: editingId ? 'อัพเดตแอพสำเร็จ' : 'เพิ่มแอพสำเร็จ' })
        resetForm()
        fetchApps()
      } else {
        setToast({ type: 'error', message: data.error || 'เกิดข้อผิดพลาด' })
      }
    } catch {
      setToast({ type: 'error', message: 'เกิดข้อผิดพลาด' })
    } finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm('ลบแอพนี้? (รวมถึงข้อมูลการสั่งซื้อทั้งหมด)')) return
    setDeleting(id)
    try {
      const res = await fetch('/api/admin/premium-apps', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const data = await res.json()
      if (data.success) {
        setToast({ type: 'success', message: 'ลบแอพสำเร็จ' })
        fetchApps()
      }
    } catch { } finally { setDeleting(null) }
  }

  async function handleToggleActive(app: PremiumAppData) {
    await fetch('/api/admin/premium-apps', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: app.id, isActive: !app.isActive }),
    })
    fetchApps()
  }

  async function handleToggleFeatured(app: PremiumAppData) {
    await fetch('/api/admin/premium-apps', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: app.id, isFeatured: !app.isFeatured }),
    })
    fetchApps()
  }

  async function handleMove(idx: number, dir: 'up' | 'down') {
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= apps.length) return
    const currentOrder = apps[idx].sortOrder
    const swapOrder = apps[swapIdx].sortOrder
    await Promise.all([
      fetch('/api/admin/premium-apps', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: apps[idx].id, sortOrder: swapOrder }) }),
      fetch('/api/admin/premium-apps', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: apps[swapIdx].id, sortOrder: currentOrder }) }),
    ])
    fetchApps()
  }

  // Image upload
  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  async function processFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setToast({ type: 'error', message: 'กรุณาเลือกไฟล์รูปภาพ' })
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setToast({ type: 'error', message: 'ไฟล์ใหญ่เกิน 10MB' })
      return
    }
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
          setForm(prev => ({ ...prev, imageUrl: data.url }))
          setToast({ type: 'success', message: 'อัพโหลดรูปสำเร็จ' })
        } else {
          setToast({ type: 'error', message: 'อัพโหลดไม่สำเร็จ' })
        }
      } catch {
        setToast({ type: 'error', message: 'เกิดข้อผิดพลาดในการอัพโหลด' })
      } finally { setUploading(false) }
    }
    reader.readAsDataURL(file)
  }

  // Filter
  const filtered = apps.filter(app => {
    if (filterCategory !== 'all' && app.category !== filterCategory) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return app.name.toLowerCase().includes(q) || app.description.toLowerCase().includes(q)
    }
    return true
  })

  const activeCount = apps.filter(a => a.isActive).length
  const featuredCount = apps.filter(a => a.isFeatured).length
  const totalRevenue = apps.reduce((sum, a) => sum + (a.sold * a.price), 0)

  const getCatInfo = (id: string) => categories.find(c => c.id === id) || categories[0]

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[9999] flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-2xl animate-slide-in-right ${
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
            <div className="w-9 h-9 bg-gradient-to-br from-violet-500/20 to-pink-500/20 border border-violet-500/20 rounded-xl flex items-center justify-center">
              <Package className="w-4.5 h-4.5 text-violet-400" />
            </div>
            ขายของ
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1 ml-[46px]">จัดการสินค้าที่จำหน่ายบนเว็บไซต์</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-400 hover:to-pink-400 text-white shadow-lg shadow-violet-500/20 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          เพิ่มแอพใหม่
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="px-4 py-3 rounded-xl bg-zinc-900/50 border border-white/5">
          <p className="text-[10px] text-zinc-500 uppercase font-bold">ทั้งหมด</p>
          <p className="text-xl font-black text-white mt-0.5">{apps.length}</p>
        </div>
        <div className="px-4 py-3 rounded-xl bg-zinc-900/50 border border-white/5">
          <p className="text-[10px] text-emerald-500 uppercase font-bold">เปิดขาย</p>
          <p className="text-xl font-black text-emerald-400 mt-0.5">{activeCount}</p>
        </div>
        <div className="px-4 py-3 rounded-xl bg-zinc-900/50 border border-white/5">
          <p className="text-[10px] text-amber-500 uppercase font-bold">แนะนำ</p>
          <p className="text-xl font-black text-amber-400 mt-0.5">{featuredCount}</p>
        </div>
        <div className="px-4 py-3 rounded-xl bg-zinc-900/50 border border-white/5">
          <p className="text-[10px] text-violet-500 uppercase font-bold">รายได้รวม</p>
          <p className="text-xl font-black text-violet-400 mt-0.5">{totalRevenue.toLocaleString()} ฿</p>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-6 rounded-2xl border border-white/[0.06] bg-white/[0.01] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-zinc-900/30">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              {editingId ? <Edit3 className="w-4 h-4 text-amber-400" /> : <Plus className="w-4 h-4 text-violet-400" />}
              {editingId ? 'แก้ไขแอพ' : 'เพิ่มแอพใหม่'}
            </h3>
            <button onClick={resetForm} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Row 1: Name + Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-400 mb-1.5 block">ชื่อแอพ *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="เช่น Netflix Premium, Spotify Premium..."
                  className="w-full px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-600 outline-none focus:border-violet-500/30 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 mb-1.5 block">ราคา (บาท) *</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={e => setForm(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                  min={0}
                  step={1}
                  className="w-full px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-violet-500/30 transition-colors"
                />
              </div>
            </div>

            {/* Row 2: Category + Platform */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-400 mb-1.5 block">หมวดหมู่</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {categories.map(cat => {
                    const CatIcon = cat.icon
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setForm(p => ({ ...p, category: cat.id }))}
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-[10px] font-bold transition-all ${
                          form.category === cat.id
                            ? `bg-violet-500/10 border-violet-500/30 ${cat.color}`
                            : 'bg-zinc-900/50 border-white/5 text-zinc-600 hover:text-zinc-400 hover:border-white/10'
                        }`}
                      >
                        <CatIcon className="w-4 h-4" />
                        <span className="truncate w-full text-center">{cat.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 mb-1.5 block">แพลตฟอร์ม</label>
                <div className="flex flex-wrap gap-1.5">
                  {platforms.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setForm(prev => ({ ...prev, platform: p.id }))}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                        form.platform === p.id
                          ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                          : 'bg-zinc-900/50 border-white/5 text-zinc-600 hover:text-zinc-400 hover:border-white/10'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-bold text-zinc-400 mb-1.5 block">รายละเอียด</label>
              <textarea
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                rows={3}
                placeholder="อธิบายแอพ... สิทธิ์ที่ได้รับ... ระยะเวลา..."
                className="w-full px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-600 outline-none focus:border-violet-500/30 transition-colors resize-none"
              />
            </div>

            {/* Features */}
            <div>
              <label className="text-xs font-bold text-zinc-400 mb-1.5 block">จุดเด่น (คั่นด้วย Enter หรือ , )</label>
              <textarea
                value={form.features}
                onChange={e => setForm(p => ({ ...p, features: e.target.value }))}
                rows={2}
                placeholder="เช่น: ดูหนังไม่จำกัด&#10;4K Ultra HD&#10;ไม่มีโฆษณา"
                className="w-full px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-600 outline-none focus:border-violet-500/30 transition-colors resize-none"
              />
            </div>

            {/* Image upload */}
            <div>
              <label className="text-xs font-bold text-zinc-400 mb-1.5 block">รูปภาพแอพ *</label>
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Upload area */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); e.stopPropagation() }}
                  onDrop={e => { e.preventDefault(); e.stopPropagation(); const file = e.dataTransfer.files[0]; if (file) processFile(file) }}
                  className="flex-1 flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-white/10 hover:border-violet-500/30 rounded-xl cursor-pointer transition-all bg-zinc-900/30 hover:bg-zinc-900/50"
                >
                  {uploading ? (
                    <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-zinc-600" />
                      <p className="text-[11px] text-zinc-500 text-center">คลิกเลือก หรือ ลากไฟล์มาวาง<br /><span className="text-zinc-600">PNG, JPG, WEBP (ไม่เกิน 10MB)</span></p>
                    </>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

                {/* Preview + URL input */}
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={form.imageUrl}
                    onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))}
                    placeholder="หรือวาง URL รูปภาพ..."
                    className="w-full px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-600 outline-none focus:border-violet-500/30 transition-colors"
                  />
                  {form.imageUrl && (
                    <div className="relative w-full h-28 rounded-xl overflow-hidden border border-white/10 bg-zinc-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={form.imageUrl} alt="Preview" className="w-full h-full object-contain p-2" />
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

            {/* Download URL */}
            <div>
              <label className="text-xs font-bold text-zinc-400 mb-1.5 block">ลิงก์ดาวน์โหลด / ข้อมูลหลังซื้อ (ถ้ามี)</label>
              <input
                type="text"
                value={form.downloadUrl}
                onChange={e => setForm(p => ({ ...p, downloadUrl: e.target.value }))}
                placeholder="URL หรือข้อมูลที่ส่งให้ผู้ซื้อ (optional)..."
                className="w-full px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-600 outline-none focus:border-violet-500/30 transition-colors"
              />
            </div>

            {/* Stock Codes */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-zinc-400">สต็อกรหัส/ลิงก์ (1 บรรทัด = 1 ชิ้น)</label>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                  form.stockCodes.split('\n').filter(l => l.trim()).length > 0
                    ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                    : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                }`}>
                  สต็อก: {form.stockCodes.split('\n').filter(l => l.trim()).length} ชิ้น
                </span>
              </div>
              <textarea
                value={form.stockCodes}
                onChange={e => setForm(p => ({ ...p, stockCodes: e.target.value }))}
                rows={5}
                placeholder={"ใส่รหัส/ลิงก์ทีละบรรทัด เช่น:\nabc123-def456\nhttps://example.com/code1\nhttps://example.com/code2\n\nจำนวนบรรทัด = จำนวนสต็อก\nซื้อ 1 ครั้ง = ดึงบรรทัดบนสุดส่งให้ผู้ซื้อ"}
                className="w-full px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-600 outline-none focus:border-violet-500/30 transition-colors resize-none font-mono leading-relaxed"
              />
              <p className="text-[10px] text-zinc-600 mt-1">* ผู้ซื้อจะได้รับรหัส/ลิงก์บรรทัดบนสุดเสมอ แล้วระบบจะลบออกอัตโนมัติ</p>
            </div>

            {/* Instructions */}
            <div>
              <label className="text-xs font-bold text-zinc-400 mb-1.5 block">วิธีติดตั้ง / ข้อมูลเพิ่มเติม (แสดงหลังซื้อ)</label>
              <textarea
                value={form.instructions}
                onChange={e => setForm(p => ({ ...p, instructions: e.target.value }))}
                rows={3}
                placeholder="คำแนะนำในการติดตั้ง หรือวิธีใช้แอพ..."
                className="w-full px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-600 outline-none focus:border-violet-500/30 transition-colors resize-none"
              />
            </div>

            {/* Toggles */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))}
                className="flex items-center gap-2"
              >
                {form.isActive ? <ToggleRight className="w-8 h-8 text-emerald-400" /> : <ToggleLeft className="w-8 h-8 text-zinc-600" />}
                <span className={`text-sm font-medium ${form.isActive ? 'text-emerald-400' : 'text-zinc-500'}`}>เปิดขาย</span>
              </button>
              <button
                onClick={() => setForm(p => ({ ...p, isFeatured: !p.isFeatured }))}
                className="flex items-center gap-2"
              >
                {form.isFeatured ? <ToggleRight className="w-8 h-8 text-amber-400" /> : <ToggleLeft className="w-8 h-8 text-zinc-600" />}
                <span className={`text-sm font-medium ${form.isFeatured ? 'text-amber-400' : 'text-zinc-500'}`}>แนะนำ (Featured)</span>
              </button>
            </div>

            {/* Submit */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-400 hover:to-pink-400 text-white shadow-lg shadow-violet-500/20 transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingId ? 'อัพเดต' : 'เพิ่มแอพ'}
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

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ค้นหาแอพ..."
            className="w-full pl-9 pr-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-600 outline-none focus:border-violet-500/30 transition-colors"
          />
        </div>
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-sm text-zinc-400 outline-none focus:border-violet-500/30 transition-colors"
        >
          <option value="all">ทุกหมวดหมู่</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.label}</option>
          ))}
        </select>
      </div>

      {/* App List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 text-sm">
            {apps.length === 0 ? 'ยังไม่มีสินค้า กดเพิ่มสินค้าใหม่เลย!' : 'ไม่พบสินค้าที่ค้นหา'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app, idx) => {
            const catInfo = getCatInfo(app.category)
            const CatIcon = catInfo.icon
            return (
              <div
                key={app.id}
                className={`rounded-2xl border overflow-hidden transition-all ${
                  app.isActive ? 'border-white/[0.06] bg-white/[0.01]' : 'border-white/[0.03] bg-zinc-950/50 opacity-60'
                }`}
              >
                <div className="flex flex-col sm:flex-row gap-4 p-4">
                  {/* Image */}
                  <div className="relative w-full sm:w-24 h-32 sm:h-24 rounded-xl overflow-hidden bg-zinc-900 border border-white/5 shrink-0">
                    {app.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={app.imageUrl} alt={app.name} className="w-full h-full object-contain p-2" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-zinc-700" />
                      </div>
                    )}
                    {app.isFeatured && (
                      <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-white truncate">{app.name}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className={`flex items-center gap-1 text-[10px] font-bold ${catInfo.color}`}>
                            <CatIcon className="w-3 h-3" />
                            {catInfo.label}
                          </span>
                          <span className="text-[10px] text-zinc-600">|</span>
                          <span className="text-[10px] text-zinc-500">
                            {platforms.find(p => p.id === app.platform)?.label || app.platform}
                          </span>
                          {app.stock !== undefined && (
                            <>
                              <span className="text-[10px] text-zinc-600">|</span>
                              <span className={`text-[10px] font-bold ${app.stock > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                สต็อก: {app.stock}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-black text-violet-400">{app.price.toLocaleString()} ฿</p>
                        <p className="text-[10px] text-zinc-500">ขายแล้ว {app.sold} ชิ้น</p>
                      </div>
                    </div>

                    {app.description && (
                      <p className="text-xs text-zinc-500 mt-2 line-clamp-2">{app.description}</p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                      <button
                        onClick={() => startEdit(app)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
                      >
                        <Edit3 className="w-3 h-3" /> แก้ไข
                      </button>
                      <button
                        onClick={() => handleToggleActive(app)}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                          app.isActive
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-zinc-900 border-white/5 text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {app.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {app.isActive ? 'เปิดขาย' : 'ปิดขาย'}
                      </button>
                      <button
                        onClick={() => handleToggleFeatured(app)}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                          app.isFeatured
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                            : 'bg-zinc-900 border-white/5 text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        <Star className={`w-3 h-3 ${app.isFeatured ? 'fill-amber-400' : ''}`} />
                        {app.isFeatured ? 'แนะนำ' : 'ไม่แนะนำ'}
                      </button>
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => handleMove(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg bg-zinc-900 border border-white/5 text-zinc-500 hover:text-white disabled:opacity-20 transition-all"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleMove(idx, 'down')}
                          disabled={idx === filtered.length - 1}
                          className="p-1.5 rounded-lg bg-zinc-900 border border-white/5 text-zinc-500 hover:text-white disabled:opacity-20 transition-all"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleDelete(app.id)}
                        disabled={deleting === app.id}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-rose-500/5 border border-rose-500/10 text-rose-400/60 hover:text-rose-400 hover:bg-rose-500/10 transition-all ml-auto"
                      >
                        {deleting === app.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                        ลบ
                      </button>
                    </div>
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
