'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Smartphone, Plus, Trash2, Search, Loader2,
  CheckCircle2, AlertCircle, Save, ToggleLeft, ToggleRight,
  Calendar, Edit3, Upload, Copy, Clock, Wifi, X
} from 'lucide-react'

interface V2BoxItem {
  id: string; name: string; code: string; description: string | null
  logoUrl: string | null; carrier: string | null; expiryDate: string
  isActive: boolean; sortOrder: number; createdAt: string
}

interface Stats {
  totalCodes: number; activeCodes: number; expiredCodes: number
}

const CARRIERS = ['AIS', 'TRUE', 'DTAC', 'NT', 'PENGUIN', 'TOT', 'อื่นๆ']

export default function AdminV2BoxCodesPage() {
  const [codes, setCodes] = useState<V2BoxItem[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    name: '', code: '', description: '', logoUrl: '', carrier: '', expiryDate: '', sortOrder: '0',
  })

  useEffect(() => { fetchCodes() }, [])
  useEffect(() => {
    if (message.text) { const t = setTimeout(() => setMessage({ type: '', text: '' }), 3000); return () => clearTimeout(t) }
  }, [message])

  async function fetchCodes() {
    try {
      const res = await fetch('/api/admin/v2box-codes')
      const data = await res.json()
      setCodes(data.codes || [])
      setStats(data.stats || null)
    } catch {} finally { setLoading(false) }
  }

  function resetForm() {
    setForm({ name: '', code: '', description: '', logoUrl: '', carrier: '', expiryDate: '', sortOrder: '0' })
    setEditingId(null)
    setShowForm(false)
  }

  function editCode(c: V2BoxItem) {
    setForm({
      name: c.name, code: c.code, description: c.description || '',
      logoUrl: c.logoUrl || '', carrier: c.carrier || '',
      expiryDate: new Date(c.expiryDate).toISOString().slice(0, 16),
      sortOrder: c.sortOrder.toString(),
    })
    setEditingId(c.id)
    setShowForm(true)
  }

  async function saveCode() {
    if (!form.name || !form.code || !form.expiryDate) {
      setMessage({ type: 'error', text: 'กรอกข้อมูลให้ครบ (ชื่อ, โค้ด, วันหมดอายุ)' })
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/v2box-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: editingId ? 'update' : 'create',
          id: editingId,
          ...form,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: editingId ? 'แก้ไขโค้ดเรียบร้อย' : 'สร้างโค้ดเรียบร้อย' })
        resetForm()
        fetchCodes()
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาด' })
    } finally { setSaving(false) }
  }

  async function toggleCode(id: string) {
    await fetch('/api/admin/v2box-codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle', id }),
    })
    fetchCodes()
  }

  async function deleteCode(id: string) {
    if (!confirm('ลบโค้ดนี้?')) return
    await fetch('/api/admin/v2box-codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id }),
    })
    setMessage({ type: 'success', text: 'ลบโค้ดเรียบร้อย' })
    fetchCodes()
  }

  async function deleteExpired() {
    if (!confirm('ลบโค้ดที่หมดอายุทั้งหมด?')) return
    const res = await fetch('/api/admin/v2box-codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'deleteExpired' }),
    })
    const data = await res.json()
    if (data.success) {
      setMessage({ type: 'success', text: `ลบโค้ดหมดอายุ ${data.deletedCount} รายการ` })
      fetchCodes()
    }
  }

  async function copyCode(code: string) {
    await navigator.clipboard.writeText(code)
    setMessage({ type: 'success', text: 'คัดลอกโค้ดแล้ว' })
  }

  async function uploadLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingLogo(true)
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
        if (data.url) {
          setForm(f => ({ ...f, logoUrl: data.url }))
          setMessage({ type: 'success', text: 'อัพโหลดโลโก้เรียบร้อย' })
        } else {
          setMessage({ type: 'error', text: 'อัพโหลดไม่สำเร็จ' })
        }
        setUploadingLogo(false)
      }
      reader.readAsDataURL(file)
    } catch {
      setMessage({ type: 'error', text: 'อัพโหลดไม่สำเร็จ' })
      setUploadingLogo(false)
    }
  }

  const isExpired = (date: string) => new Date(date) <= new Date()

  const filtered = codes.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.carrier || '').toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">กำลังโหลด...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-28 sm:pb-12">
      {/* Toast */}
      {message.text && (
        <div className={`fixed bottom-20 sm:bottom-8 right-4 sm:right-8 left-4 sm:left-auto z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl ${
          message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span className="font-semibold text-xs sm:text-sm">{message.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-cyan-500/10 rounded-lg flex items-center justify-center border border-cyan-500/20">
              <Smartphone className="w-4 h-4 text-cyan-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">แจกโค้ด V2Box</h2>
          </div>
          <p className="text-zinc-500 text-xs sm:text-sm font-medium">จัดการโค้ดเน็ต V2Box สำหรับแจกให้ผู้ใช้</p>
        </div>
        <div className="flex items-center gap-2">
          {stats && stats.expiredCodes > 0 && (
            <button onClick={deleteExpired}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-600/20 border border-red-500/30 rounded-xl text-xs font-bold text-red-400 hover:bg-red-600/30 transition-all active:scale-95">
              <Trash2 className="w-3.5 h-3.5" /> ลบหมดอายุ ({stats.expiredCodes})
            </button>
          )}
          <button onClick={() => { resetForm(); setShowForm(true) }}
            className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 border border-cyan-500/30 rounded-xl text-sm font-bold text-white hover:bg-cyan-500 transition-all active:scale-95">
            <Plus className="w-4 h-4" /> เพิ่มโค้ด
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'โค้ดทั้งหมด', value: stats.totalCodes, icon: Smartphone, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
            { label: 'ใช้งานได้', value: stats.activeCodes, icon: Wifi, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
            { label: 'หมดอายุ', value: stats.expiredCodes, icon: Clock, color: 'text-red-400 bg-red-500/10 border-red-500/20' },
          ].map(s => (
            <div key={s.label} className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-medium">{s.label}</p>
                <p className="text-sm sm:text-base font-bold text-white">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 sm:p-6 space-y-4">
          <h3 className="text-sm font-bold text-white">{editingId ? 'แก้ไขโค้ด' : 'เพิ่มโค้ดใหม่'}</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">ชื่อโค้ด *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="AIS เน็ตแรง 100GB"
                className="w-full mt-1 bg-black border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-700" />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">ค่าย</label>
              <select value={form.carrier} onChange={e => setForm(f => ({ ...f, carrier: e.target.value }))}
                className="w-full mt-1 bg-black border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white">
                <option value="">-- เลือกค่าย --</option>
                {CARRIERS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">โค้ด V2Box (vless link / subscription URL) *</label>
              <textarea value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                placeholder="vless://... หรือ https://subscription-url..."
                rows={3}
                className="w-full mt-1 bg-black border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-700 font-mono text-xs" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">รายละเอียด</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="รายละเอียดโค้ด เช่น ความเร็ว, ปริมาณ, วิธีใช้งาน..."
                rows={2}
                className="w-full mt-1 bg-black border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-700" />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">โลโก้ค่าย</label>
              <div className="flex items-center gap-2 mt-1">
                <input value={form.logoUrl} onChange={e => setForm(f => ({ ...f, logoUrl: e.target.value }))}
                  placeholder="URL รูปโลโก้ หรืออัพโหลด →"
                  className="flex-1 bg-black border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-700" />
                <input type="file" ref={fileInputRef} accept="image/*" onChange={uploadLogo} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} disabled={uploadingLogo}
                  className="px-3 py-2.5 bg-zinc-800 border border-white/10 rounded-lg text-xs font-bold text-zinc-400 hover:text-white transition-all shrink-0 disabled:opacity-50">
                  {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                </button>
                {form.logoUrl && (
                  <img src={form.logoUrl} alt="logo" className="w-10 h-10 rounded-lg object-cover border border-white/10" />
                )}
              </div>
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">วันหมดอายุ *</label>
              <input type="datetime-local" value={form.expiryDate} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))}
                className="w-full mt-1 bg-black border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white" />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">ลำดับแสดงผล</label>
              <input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))}
                placeholder="0" min="0"
                className="w-full mt-1 bg-black border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-700" />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={saveCode} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 border border-emerald-500/30 rounded-xl text-sm font-bold text-white hover:bg-emerald-500 transition-all disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editingId ? 'บันทึกการแก้ไข' : 'เพิ่มโค้ด'}
            </button>
            <button onClick={resetForm}
              className="px-5 py-2.5 bg-zinc-800 border border-white/10 rounded-xl text-sm font-bold text-zinc-400 hover:text-white transition-all">
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาโค้ด V2Box..."
          className="w-full bg-zinc-900/50 border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:border-cyan-500/50 transition-all" />
      </div>

      {/* Code List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-zinc-600 text-sm">ไม่มีโค้ด V2Box</div>
        ) : filtered.map(c => {
          const expired = isExpired(c.expiryDate)
          return (
            <div key={c.id} className={`flex items-center gap-3 sm:gap-4 p-4 sm:p-5 bg-zinc-900/50 border rounded-xl transition-all ${
              expired ? 'border-red-500/20 opacity-50' : c.isActive ? 'border-white/5' : 'border-yellow-500/10 opacity-60'
            }`}>
              {/* Logo */}
              <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 bg-zinc-800 shrink-0 overflow-hidden">
                {c.logoUrl ? (
                  <img src={c.logoUrl} alt={c.carrier || c.name} className="w-full h-full object-cover" />
                ) : (
                  <Smartphone className="w-5 h-5 text-cyan-400" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-white truncate">{c.name}</span>
                  {c.carrier && (
                    <span className="px-1.5 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded text-[9px] font-bold text-cyan-400">{c.carrier}</span>
                  )}
                  {expired && (
                    <span className="px-1.5 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-[9px] font-bold text-red-400">หมดอายุ</span>
                  )}
                  {!c.isActive && !expired && (
                    <span className="px-1.5 py-0.5 bg-yellow-500/10 border border-yellow-500/20 rounded text-[9px] font-bold text-yellow-400">ปิด</span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-zinc-600 font-medium flex-wrap">
                  <span className="truncate max-w-[200px] font-mono">{c.code.substring(0, 50)}{c.code.length > 50 ? '...' : ''}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> หมด {new Date(c.expiryDate).toLocaleDateString('th-TH')}</span>
                </div>
                {c.description && (
                  <p className="text-[10px] text-zinc-600 mt-0.5 truncate">{c.description}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => copyCode(c.code)} className="p-2 text-zinc-600 hover:text-cyan-400 transition-all" title="คัดลอกโค้ด">
                  <Copy className="w-4 h-4" />
                </button>
                <button onClick={() => editCode(c)} className="p-2 text-zinc-600 hover:text-white transition-all">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button onClick={() => toggleCode(c.id)} className="p-2 transition-all">
                  {c.isActive ? <ToggleRight className="w-6 h-6 text-emerald-400" /> : <ToggleLeft className="w-6 h-6 text-zinc-600" />}
                </button>
                <button onClick={() => deleteCode(c.id)} className="p-2 text-zinc-700 hover:text-red-400 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
