'use client'

import { useState, useEffect } from 'react'
import {
  Ticket, Plus, Trash2, Eye, EyeOff, Search, Loader2,
  CheckCircle2, AlertCircle, Save, Copy, ToggleLeft, ToggleRight,
  Calendar, Users, TrendingUp, Tag, Percent, DollarSign, Clock, Edit3
} from 'lucide-react'

interface CouponItem {
  id: string; code: string; name: string; description: string | null
  type: string; value: number; minPurchase: number; maxDiscount: number | null
  usageLimit: number | null; usageCount: number; perUserLimit: number
  isActive: boolean; expiresAt: string | null
  createdAt: string; _count: { redemptions: number }
}

interface Stats {
  totalCoupons: number; activeCoupons: number
  totalRedemptions: number; totalDiscount: number
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponItem[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    code: '', name: '', description: '', type: 'fixed', value: '',
    minPurchase: '0', maxDiscount: '', usageLimit: '', perUserLimit: '1', expiresAt: '',
  })

  useEffect(() => { fetchCoupons() }, [])
  useEffect(() => {
    if (message.text) { const t = setTimeout(() => setMessage({ type: '', text: '' }), 3000); return () => clearTimeout(t) }
  }, [message])

  async function fetchCoupons() {
    try {
      const res = await fetch('/api/admin/coupons')
      const data = await res.json()
      setCoupons(data.coupons || [])
      setStats(data.stats || null)
    } catch {} finally { setLoading(false) }
  }

  function resetForm() {
    setForm({ code: '', name: '', description: '', type: 'fixed', value: '', minPurchase: '0', maxDiscount: '', usageLimit: '', perUserLimit: '1', expiresAt: '' })
    setEditingId(null)
    setShowForm(false)
  }

  function editCoupon(c: CouponItem) {
    setForm({
      code: c.code, name: c.name, description: c.description || '', type: c.type,
      value: c.value.toString(), minPurchase: c.minPurchase.toString(),
      maxDiscount: c.maxDiscount?.toString() || '', usageLimit: c.usageLimit?.toString() || '',
      perUserLimit: c.perUserLimit.toString(),
      expiresAt: c.expiresAt ? new Date(c.expiresAt).toISOString().slice(0, 16) : '',
    })
    setEditingId(c.id)
    setShowForm(true)
  }

  async function saveCoupon() {
    if (!form.code || !form.name || !form.value) {
      setMessage({ type: 'error', text: 'กรอกข้อมูลให้ครบ (รหัส, ชื่อ, มูลค่า)' })
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/coupons', {
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
        setMessage({ type: 'success', text: editingId ? 'แก้ไขคูปองเรียบร้อย' : 'สร้างคูปองเรียบร้อย' })
        resetForm()
        fetchCoupons()
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาด' })
    } finally { setSaving(false) }
  }

  async function toggleCoupon(id: string) {
    await fetch('/api/admin/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle', id }),
    })
    fetchCoupons()
  }

  async function deleteCoupon(id: string) {
    if (!confirm('ลบคูปองนี้?')) return
    await fetch('/api/admin/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id }),
    })
    setMessage({ type: 'success', text: 'ลบคูปองเรียบร้อย' })
    fetchCoupons()
  }

  function generateCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)]
    setForm(f => ({ ...f, code }))
  }

  const filtered = coupons.filter(c =>
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
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
            <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center border border-amber-500/20">
              <Ticket className="w-4 h-4 text-amber-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">จัดการคูปอง</h2>
          </div>
          <p className="text-zinc-500 text-xs sm:text-sm font-medium">สร้างและจัดการคูปองส่วนลดสำหรับผู้ใช้</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true) }}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 border border-amber-500/30 rounded-xl text-sm font-bold text-white hover:bg-amber-500 transition-all active:scale-95">
          <Plus className="w-4 h-4" /> สร้างคูปอง
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'คูปองทั้งหมด', value: stats.totalCoupons, icon: Ticket, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
            { label: 'เปิดใช้งาน', value: stats.activeCoupons, icon: Eye, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
            { label: 'ใช้คูปองแล้ว', value: stats.totalRedemptions, icon: Users, color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
            { label: 'ส่วนลดรวม', value: `${stats.totalDiscount.toLocaleString()}฿`, icon: TrendingUp, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
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
          <h3 className="text-sm font-bold text-white">{editingId ? 'แก้ไขคูปอง' : 'สร้างคูปองใหม่'}</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">รหัสคูปอง *</label>
              <div className="flex gap-2 mt-1">
                <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="WELCOME50" disabled={!!editingId}
                  className="flex-1 bg-black border border-white/10 rounded-lg px-3 py-2.5 text-sm font-bold text-white tracking-widest placeholder:text-zinc-700 disabled:opacity-50" />
                {!editingId && (
                  <button onClick={generateCode} className="px-3 py-2.5 bg-zinc-800 border border-white/10 rounded-lg text-xs font-bold text-zinc-400 hover:text-white transition-all shrink-0">
                    สุ่ม
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">ชื่อคูปอง *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="ส่วนลดต้อนรับสมาชิกใหม่"
                className="w-full mt-1 bg-black border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-700" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">รายละเอียด</label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="รายละเอียดคูปอง (ไม่บังคับ)"
                className="w-full mt-1 bg-black border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-700" />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">ประเภท *</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full mt-1 bg-black border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white">
                <option value="fixed">จำนวนเงินคงที่ (฿)</option>
                <option value="percent">เปอร์เซ็นต์ (%)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">มูลค่า ({form.type === 'fixed' ? '฿' : '%'}) *</label>
              <input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                placeholder="50" min="0"
                className="w-full mt-1 bg-black border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-700" />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">จำกัดจำนวนครั้งทั้งหมด</label>
              <input type="number" value={form.usageLimit} onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))}
                placeholder="ไม่จำกัด" min="0"
                className="w-full mt-1 bg-black border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-700" />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">จำกัดต่อผู้ใช้</label>
              <input type="number" value={form.perUserLimit} onChange={e => setForm(f => ({ ...f, perUserLimit: e.target.value }))}
                placeholder="1" min="1"
                className="w-full mt-1 bg-black border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-700" />
            </div>
            {form.type === 'percent' && (
              <div>
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">ส่วนลดสูงสุด (฿)</label>
                <input type="number" value={form.maxDiscount} onChange={e => setForm(f => ({ ...f, maxDiscount: e.target.value }))}
                  placeholder="ไม่จำกัด" min="0"
                  className="w-full mt-1 bg-black border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-700" />
              </div>
            )}
            <div>
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">วันหมดอายุ</label>
              <input type="datetime-local" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                className="w-full mt-1 bg-black border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white" />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={saveCoupon} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 border border-emerald-500/30 rounded-xl text-sm font-bold text-white hover:bg-emerald-500 transition-all disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editingId ? 'บันทึกการแก้ไข' : 'สร้างคูปอง'}
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
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาคูปอง..."
          className="w-full bg-zinc-900/50 border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:border-amber-500/50 transition-all" />
      </div>

      {/* Coupon List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-zinc-600 text-sm">ไม่มีคูปอง</div>
        ) : filtered.map(c => (
          <div key={c.id} className={`flex items-center gap-3 sm:gap-4 p-4 sm:p-5 bg-zinc-900/50 border rounded-xl transition-all ${
            c.isActive ? 'border-white/5' : 'border-red-500/10 opacity-60'
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
              c.type === 'fixed' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-violet-400 bg-violet-500/10 border-violet-500/20'
            }`}>
              {c.type === 'fixed' ? <DollarSign className="w-5 h-5" /> : <Percent className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm text-white">{c.name}</span>
                <span className="px-1.5 py-0.5 bg-zinc-800 border border-white/5 rounded text-[9px] font-bold text-zinc-400 tracking-widest">{c.code}</span>
                {!c.isActive && (
                  <span className="px-1.5 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-[9px] font-bold text-red-400">ปิด</span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-[10px] text-zinc-600 font-medium flex-wrap">
                <span>{c.type === 'fixed' ? `${c.value}฿` : `${c.value}%`}</span>
                <span>ใช้แล้ว {c.usageCount}{c.usageLimit ? `/${c.usageLimit}` : ''} ครั้ง</span>
                {c.expiresAt && <span>หมด {new Date(c.expiresAt).toLocaleDateString('th-TH')}</span>}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => editCoupon(c)} className="p-2 text-zinc-600 hover:text-white transition-all">
                <Edit3 className="w-4 h-4" />
              </button>
              <button onClick={() => toggleCoupon(c.id)} className="p-2 transition-all">
                {c.isActive ? <ToggleRight className="w-6 h-6 text-emerald-400" /> : <ToggleLeft className="w-6 h-6 text-zinc-600" />}
              </button>
              <button onClick={() => deleteCoupon(c.id)} className="p-2 text-zinc-700 hover:text-red-400 transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
