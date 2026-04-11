'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Save, Loader2, RotateCcw, Eye, EyeOff, Activity } from 'lucide-react'

interface Prize {
  id: string
  label: string
  type: string
  value: number
  color: string
  probability: number
  isActive: boolean
  sortOrder: number
  _count: { spins: number }
}

interface Spin {
  id: string
  prizeLabel: string
  prizeType: string
  prizeValue: number
  createdAt: string
  user: { name: string; email: string }
}

const PRIZE_TYPES = [
  { value: 'credit', label: 'เครดิต (บาท)' },
  { value: 'vpn_days', label: 'VPN ฟรี (วัน)' },
  { value: 'discount', label: 'ส่วนลด (%)' },
  { value: 'nothing', label: 'ไม่ได้รางวัล' },
]

const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6', '#F97316', '#64748B']

export default function AdminLuckyWheelPage() {
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [recentSpins, setRecentSpins] = useState<Spin[]>([])
  const [stats, setStats] = useState({ totalSpins: 0, todaySpins: 0 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ label: '', type: 'credit', value: 5, color: '#3B82F6', probability: 10, sortOrder: 0 })

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    try {
      const res = await fetch('/api/admin/lucky-wheel')
      const data = await res.json()
      setPrizes(data.prizes || [])
      setRecentSpins(data.recentSpins || [])
      setStats(data.stats || { totalSpins: 0, todaySpins: 0 })
    } catch {} finally { setLoading(false) }
  }

  async function handleCreate() {
    if (!form.label) return alert('กรุณากรอกชื่อรางวัล')
    setSaving('create')
    try {
      const res = await fetch('/api/admin/lucky-wheel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (res.ok) {
        setShowForm(false)
        setForm({ label: '', type: 'credit', value: 5, color: '#3B82F6', probability: 10, sortOrder: 0 })
        fetchData()
      }
    } catch {} finally { setSaving(null) }
  }

  async function handleToggle(prize: Prize) {
    setSaving(prize.id)
    try {
      await fetch('/api/admin/lucky-wheel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', id: prize.id, isActive: !prize.isActive })
      })
      fetchData()
    } catch {} finally { setSaving(null) }
  }

  async function handleDelete(id: string) {
    if (!confirm('ลบรางวัลนี้?')) return
    setSaving(id)
    try {
      await fetch('/api/admin/lucky-wheel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id })
      })
      fetchData()
    } catch {} finally { setSaving(null) }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <RotateCcw className="w-6 h-6 text-yellow-400" />
            จัดการกงล้อนำโชค
          </h1>
          <p className="text-zinc-500 text-sm mt-1">ตั้งค่ารางวัลและน้ำหนักความน่าจะได้</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-black font-bold rounded-xl hover:bg-yellow-300 transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          เพิ่มรางวัล
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-zinc-500 text-xs uppercase font-medium">หมุนทั้งหมด</p>
          <p className="text-white text-2xl font-bold mt-1">{stats.totalSpins.toLocaleString()}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-zinc-500 text-xs uppercase font-medium">หมุนวันนี้</p>
          <p className="text-white text-2xl font-bold mt-1">{stats.todaySpins.toLocaleString()}</p>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <h3 className="text-white font-bold">เพิ่มรางวัลใหม่</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-zinc-400 text-xs mb-1 block">ชื่อรางวัล</label>
              <input
                type="text"
                value={form.label}
                onChange={e => setForm({ ...form, label: e.target.value })}
                placeholder="เช่น เครดิต 5 บาท"
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:ring-1 focus:ring-yellow-400 outline-none"
              />
            </div>
            <div>
              <label className="text-zinc-400 text-xs mb-1 block">ประเภท</label>
              <select
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:ring-1 focus:ring-yellow-400 outline-none"
              >
                {PRIZE_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-zinc-400 text-xs mb-1 block">มูลค่า</label>
              <input
                type="number"
                value={form.value}
                onChange={e => setForm({ ...form, value: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:ring-1 focus:ring-yellow-400 outline-none"
              />
            </div>
            <div>
              <label className="text-zinc-400 text-xs mb-1 block">น้ำหนัก (ยิ่งสูงยิ่งได้บ่อย)</label>
              <input
                type="number"
                value={form.probability}
                onChange={e => setForm({ ...form, probability: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:ring-1 focus:ring-yellow-400 outline-none"
              />
            </div>
            <div>
              <label className="text-zinc-400 text-xs mb-1 block">สี</label>
              <div className="flex gap-1.5 flex-wrap">
                {COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setForm({ ...form, color: c })}
                    className={`w-7 h-7 rounded-lg transition-all ${form.color === c ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="text-zinc-400 text-xs mb-1 block">ลำดับ</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={e => setForm({ ...form, sortOrder: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:ring-1 focus:ring-yellow-400 outline-none"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={saving === 'create'}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-300 transition-all text-sm"
            >
              {saving === 'create' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              บันทึก
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-zinc-800 text-zinc-400 rounded-lg text-sm hover:bg-zinc-700">
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {/* Prize List */}
      <div className="space-y-2">
        <h3 className="text-white font-bold text-sm">รางวัลทั้งหมด ({prizes.length})</h3>
        {prizes.length === 0 ? (
          <p className="text-zinc-500 text-sm py-8 text-center">ยังไม่มีรางวัล กดเพิ่มรางวัลด้านบน</p>
        ) : (
          prizes.map(prize => (
            <div key={prize.id} className={`flex items-center gap-3 p-3 bg-zinc-900 border rounded-xl ${prize.isActive ? 'border-zinc-800' : 'border-zinc-800/50 opacity-50'}`}>
              <div className="w-8 h-8 rounded-lg flex-shrink-0" style={{ backgroundColor: prize.color }} />
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{prize.label}</p>
                <p className="text-zinc-500 text-xs">
                  {PRIZE_TYPES.find(t => t.value === prize.type)?.label} • มูลค่า: {prize.value} • น้ำหนัก: {prize.probability} • หมุนได้: {prize._count.spins} ครั้ง
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => handleToggle(prize)}
                  disabled={saving === prize.id}
                  className={`p-1.5 rounded-lg transition-all ${prize.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}
                  title={prize.isActive ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                >
                  {prize.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleDelete(prize.id)}
                  disabled={saving === prize.id}
                  className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all"
                  title="ลบ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Recent Spins */}
      {recentSpins.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-white font-bold text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-yellow-400" />
            การหมุนล่าสุด
          </h3>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left text-zinc-500 text-xs font-medium px-4 py-2">ผู้ใช้</th>
                  <th className="text-left text-zinc-500 text-xs font-medium px-4 py-2">รางวัล</th>
                  <th className="text-left text-zinc-500 text-xs font-medium px-4 py-2">เวลา</th>
                </tr>
              </thead>
              <tbody>
                {recentSpins.map(spin => (
                  <tr key={spin.id} className="border-b border-zinc-800/50 last:border-0">
                    <td className="px-4 py-2 text-white">{spin.user.name}</td>
                    <td className="px-4 py-2 text-yellow-400">{spin.prizeLabel}</td>
                    <td className="px-4 py-2 text-zinc-500 text-xs">{new Date(spin.createdAt).toLocaleString('th-TH')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
