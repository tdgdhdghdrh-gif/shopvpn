'use client'

import { useEffect, useState } from 'react'
import { 
  Link2, Plus, Trash2, Copy, Check, X, Eye, EyeOff, 
  Gift, Users, Percent, ExternalLink, RefreshCw, Search,
  ToggleLeft, ToggleRight, Edit3, Clock, UserMinus, Calendar,
  Hash, ChevronDown, ChevronUp, AlertTriangle
} from 'lucide-react'

interface PromoLink {
  id: string
  code: string
  name: string
  description: string | null
  discountPercent: number
  isActive: boolean
  usageCount: number
  maxUsage: number | null
  expiresAt: string | null
  createdAt: string
  _count: { activations: number }
}

interface ActivationUser {
  id: string
  userId: string
  activatedAt: string
  user: {
    id: string
    name: string
    email: string
    avatar: string | null
    createdAt: string
  }
}

export default function AdminPromoLinksPage() {
  const [promos, setPromos] = useState<PromoLink[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Form state
  const [formName, setFormName] = useState('')
  const [formCode, setFormCode] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formDiscount, setFormDiscount] = useState(50)
  const [formMaxUsage, setFormMaxUsage] = useState('')
  const [formExpiresAt, setFormExpiresAt] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')

  // Activations modal state
  const [showActivations, setShowActivations] = useState<string | null>(null) // promoId
  const [activationsPromo, setActivationsPromo] = useState<PromoLink | null>(null)
  const [activations, setActivations] = useState<ActivationUser[]>([])
  const [activationsLoading, setActivationsLoading] = useState(false)
  const [deletingActivationId, setDeletingActivationId] = useState<string | null>(null)

  useEffect(() => {
    fetchPromos()
  }, [])

  async function fetchPromos() {
    try {
      const res = await fetch('/api/admin/promo-links')
      const data = await res.json()
      if (data.success) {
        setPromos(data.data)
      }
    } catch (err) {
      console.error('Error fetching promos:', err)
    } finally {
      setLoading(false)
    }
  }

  async function createPromo(e: React.FormEvent) {
    e.preventDefault()
    setFormLoading(true)
    setFormError('')

    try {
      const res = await fetch('/api/admin/promo-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          code: formCode,
          description: formDescription || undefined,
          discountPercent: formDiscount,
          maxUsage: formMaxUsage ? parseInt(formMaxUsage) : null,
          expiresAt: formExpiresAt || null,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setShowCreate(false)
        setFormName('')
        setFormCode('')
        setFormDescription('')
        setFormDiscount(50)
        setFormMaxUsage('')
        setFormExpiresAt('')
        fetchPromos()
      } else {
        setFormError(data.error || 'เกิดข้อผิดพลาด')
      }
    } catch (err) {
      setFormError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้')
    } finally {
      setFormLoading(false)
    }
  }

  async function toggleActive(promo: PromoLink) {
    try {
      const res = await fetch('/api/admin/promo-links', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: promo.id, isActive: !promo.isActive }),
      })
      const data = await res.json()
      if (data.success) {
        fetchPromos()
      }
    } catch (err) {
      console.error('Error toggling promo:', err)
    }
  }

  async function deletePromo(id: string) {
    if (!confirm('ต้องการลบลิงก์โปรนี้?')) return
    try {
      const res = await fetch(`/api/admin/promo-links?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        fetchPromos()
      }
    } catch (err) {
      console.error('Error deleting promo:', err)
    }
  }

  function copyLink(code: string, id: string) {
    const url = `${window.location.origin}/promo/${code}`
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  function generateCode() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormCode(result)
  }

  // Activations functions
  async function openActivations(promo: PromoLink) {
    setShowActivations(promo.id)
    setActivationsPromo(promo)
    setActivationsLoading(true)
    setActivations([])

    try {
      const res = await fetch(`/api/admin/promo-links?promoId=${promo.id}`)
      const data = await res.json()
      if (data.success) {
        setActivations(data.data)
      }
    } catch (err) {
      console.error('Error fetching activations:', err)
    } finally {
      setActivationsLoading(false)
    }
  }

  async function deleteActivation(activationId: string) {
    if (!confirm('ต้องการลบคนรับโปรนี้? ส่วนลดของผู้ใช้จะถูกยกเลิกด้วย')) return
    setDeletingActivationId(activationId)

    try {
      const res = await fetch(`/api/admin/promo-links?activationId=${activationId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setActivations(prev => prev.filter(a => a.id !== activationId))
        // Refresh promos to update count
        fetchPromos()
      }
    } catch (err) {
      console.error('Error deleting activation:', err)
    } finally {
      setDeletingActivationId(null)
    }
  }

  function getPromoStatus(promo: PromoLink): { label: string; color: string; expired?: boolean; full?: boolean } {
    if (!promo.isActive) return { label: 'ปิดอยู่', color: 'zinc' }
    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) return { label: 'หมดอายุ', color: 'red', expired: true }
    if (promo.maxUsage !== null && promo.usageCount >= promo.maxUsage) return { label: 'เต็มแล้ว', color: 'amber', full: true }
    return { label: 'ใช้งาน', color: 'emerald' }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-purple-500/10 rounded-full" />
          <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-xs font-bold text-zinc-600 tracking-widest uppercase animate-pulse">กำลังโหลด...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Activations Modal */}
      {showActivations && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowActivations(null)}>
          <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  รายชื่อคนรับโปร
                </h3>
                {activationsPromo && (
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    {activationsPromo.name} - ลด {activationsPromo.discountPercent}%
                    {activationsPromo.maxUsage !== null && (
                      <span className="ml-2 text-amber-400/80">
                        ({activationsPromo._count.activations}/{activationsPromo.maxUsage} คน)
                      </span>
                    )}
                  </p>
                )}
              </div>
              <button onClick={() => setShowActivations(null)} className="p-2 bg-white/5 rounded-xl text-zinc-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5">
              {activationsLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-zinc-500 font-bold">กำลังโหลด...</p>
                </div>
              ) : activations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Users className="w-10 h-10 text-zinc-700" />
                  <p className="text-sm text-zinc-500 font-bold">ยังไม่มีคนรับโปรนี้</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {activations.map((activation) => (
                    <div key={activation.id} className="flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-xl p-3 hover:border-white/10 transition-all group">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/5 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {activation.user.avatar ? (
                            <img src={activation.user.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-zinc-400">{activation.user.name.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        {/* Info */}
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">{activation.user.name}</p>
                          <p className="text-[10px] text-zinc-500 truncate">{activation.user.email}</p>
                        </div>
                      </div>
                      {/* Date & Action */}
                      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                        <span className="text-[10px] text-zinc-600 hidden sm:inline">
                          {new Date(activation.activatedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <button
                          onClick={() => deleteActivation(activation.id)}
                          disabled={deletingActivationId === activation.id}
                          className="p-2 bg-white/5 border border-white/5 rounded-lg text-zinc-500 hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/5 transition-all active:scale-95 disabled:opacity-50"
                          title="ลบคนรับโปร (ยกเลิกส่วนลด)"
                        >
                          {deletingActivationId === activation.id ? (
                            <div className="w-3.5 h-3.5 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                          ) : (
                            <UserMinus className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/5 text-center">
              <p className="text-[10px] text-zinc-600">
                ทั้งหมด {activations.length} คน
                {activationsPromo?.maxUsage !== null && activationsPromo?.maxUsage !== undefined && (
                  <span> / จำกัด {activationsPromo.maxUsage} คน</span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Link2 className="w-6 h-6 text-purple-400" />
            ลิงก์ลดราคา
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">สร้างลิงก์ส่วนลดพิเศษสำหรับแจกในกลุ่ม</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setLoading(true); fetchPromos() }}
            className="p-2.5 bg-zinc-900 border border-white/5 rounded-xl text-zinc-400 hover:text-white hover:border-white/10 transition-all active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl text-xs font-bold text-white transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">สร้างลิงก์ใหม่</span>
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="bg-zinc-900/50 border border-purple-500/10 rounded-2xl p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Gift className="w-4 h-4 text-purple-400" />
              สร้างลิงก์โปรใหม่
            </h3>
            <button onClick={() => setShowCreate(false)} className="text-zinc-500 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {formError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-400 font-bold">
              {formError}
            </div>
          )}

          <form onSubmit={createPromo} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">ชื่อโปร</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="เช่น ส่วนลดกลุ่ม VIP"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">รหัสลิงก์ (ภาษาอังกฤษ)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                  placeholder="เช่น vip-group"
                  required
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={generateCode}
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-zinc-400 hover:text-white hover:border-white/20 transition-all whitespace-nowrap"
                >
                  สุ่มรหัส
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">เปอร์เซ็นต์ส่วนลด</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  value={formDiscount}
                  onChange={(e) => setFormDiscount(parseInt(e.target.value))}
                  min={1}
                  max={99}
                  className="flex-1 accent-purple-500"
                />
                <div className="flex items-center gap-1 bg-purple-500/10 border border-purple-500/20 rounded-lg px-3 py-2 min-w-[60px] justify-center">
                  <span className="text-sm font-black text-purple-400">{formDiscount}</span>
                  <span className="text-xs text-purple-400/60">%</span>
                </div>
              </div>
              <p className="text-[10px] text-zinc-600">
                ราคาปกติ 2 ฿/วัน &rarr; ราคาโปร {Math.max(0.5, Math.round(2 * (100 - formDiscount) / 100 * 100) / 100)} ฿/วัน
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">รายละเอียด (ไม่บังคับ)</label>
              <input
                type="text"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="เช่น สำหรับสมาชิกกลุ่ม LINE เท่านั้น"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                <Hash className="w-3 h-3" />
                จำกัดจำนวนคนรับ (ไม่บังคับ)
              </label>
              <input
                type="number"
                value={formMaxUsage}
                onChange={(e) => setFormMaxUsage(e.target.value)}
                placeholder="เช่น 100 (เว้นว่าง = ไม่จำกัด)"
                min={1}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 transition-colors"
              />
              <p className="text-[10px] text-zinc-600">เว้นว่างไว้ = ไม่จำกัดจำนวน</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                วันหมดอายุ (ไม่บังคับ)
              </label>
              <input
                type="datetime-local"
                value={formExpiresAt}
                onChange={(e) => setFormExpiresAt(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 transition-colors [color-scheme:dark]"
              />
              <p className="text-[10px] text-zinc-600">เว้นว่างไว้ = ไม่มีวันหมดอายุ</p>
            </div>

            <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-all"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={formLoading}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 rounded-xl text-xs font-bold text-white transition-all active:scale-95"
              >
                {formLoading ? 'กำลังสร้าง...' : 'สร้างลิงก์'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-3 sm:p-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Link2 className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <p className="text-lg font-black text-white">{promos.length}</p>
            <p className="text-[10px] text-zinc-500 font-bold">ลิงก์ทั้งหมด</p>
          </div>
        </div>
        <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-3 sm:p-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Eye className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-lg font-black text-white">{promos.filter(p => p.isActive && getPromoStatus(p).color === 'emerald').length}</p>
            <p className="text-[10px] text-zinc-500 font-bold">ใช้งานอยู่</p>
          </div>
        </div>
        <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-3 sm:p-4 flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <p className="text-lg font-black text-white">{promos.reduce((sum, p) => sum + p._count.activations, 0)}</p>
            <p className="text-[10px] text-zinc-500 font-bold">คนรับโปรทั้งหมด</p>
          </div>
        </div>
      </div>

      {/* Promo Links List */}
      {promos.length === 0 ? (
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-12 text-center space-y-3">
          <Gift className="w-12 h-12 text-zinc-700 mx-auto" />
          <p className="text-sm text-zinc-500 font-bold">ยังไม่มีลิงก์โปร</p>
          <p className="text-xs text-zinc-600">กดปุ่ม &quot;สร้างลิงก์ใหม่&quot; เพื่อเริ่มต้น</p>
        </div>
      ) : (
        <div className="space-y-3">
          {promos.map((promo) => {
            const status = getPromoStatus(promo)
            const statusColors: Record<string, string> = {
              emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
              zinc: 'bg-zinc-800 text-zinc-500 border-white/5',
              red: 'bg-red-500/10 text-red-400 border-red-500/20',
              amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            }

            return (
              <div key={promo.id} className={`bg-zinc-900/50 border rounded-2xl p-4 sm:p-5 transition-all ${status.color === 'emerald' ? 'border-white/5 hover:border-purple-500/20' : 'border-white/5 opacity-70'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-white truncate">{promo.name}</h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${statusColors[status.color]}`}>
                        {status.color === 'red' && <AlertTriangle className="w-3 h-3" />}
                        {status.label}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded-lg text-[10px] font-bold text-purple-400">
                        <Percent className="w-3 h-3" />
                        ลด {promo.discountPercent}%
                      </span>
                    </div>

                    {promo.description && (
                      <p className="text-xs text-zinc-500">{promo.description}</p>
                    )}

                    {/* Link preview */}
                    <div className="flex items-center gap-2 bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2 w-fit max-w-full">
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
                      <code className="text-[11px] text-blue-400 font-mono truncate">
                        /promo/{promo.code}
                      </code>
                    </div>

                    {/* Stats & Limits */}
                    <div className="flex items-center gap-3 sm:gap-4 text-[10px] text-zinc-600 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {promo._count.activations} คนรับแล้ว
                        {promo.maxUsage !== null && (
                          <span className="text-amber-400/70">/ {promo.maxUsage} คน</span>
                        )}
                      </span>
                      {promo.expiresAt && (
                        <span className={`flex items-center gap-1 ${new Date(promo.expiresAt) < new Date() ? 'text-red-400/70' : 'text-cyan-400/70'}`}>
                          <Clock className="w-3 h-3" />
                          {new Date(promo.expiresAt) < new Date() ? 'หมดอายุ' : 'หมดอายุ'} {new Date(promo.expiresAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                      <span>
                        สร้างเมื่อ {new Date(promo.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    {/* Usage bar (if maxUsage is set) */}
                    {promo.maxUsage !== null && (
                      <div className="max-w-xs">
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              promo._count.activations >= promo.maxUsage 
                                ? 'bg-amber-500' 
                                : 'bg-gradient-to-r from-purple-500 to-blue-500'
                            }`}
                            style={{ width: `${Math.min(100, (promo._count.activations / promo.maxUsage) * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* View Activations */}
                    <button
                      onClick={() => openActivations(promo)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-blue-500/5 border border-blue-500/10 rounded-xl text-[10px] font-bold text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/20 transition-all active:scale-95"
                      title="ดูรายชื่อคนรับโปร"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{promo._count.activations} คน</span>
                    </button>

                    <button
                      onClick={() => copyLink(promo.code, promo.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold transition-all active:scale-95 ${
                        copiedId === promo.id 
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                          : 'bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
                      }`}
                    >
                      {copiedId === promo.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">{copiedId === promo.id ? 'คัดลอกแล้ว' : 'คัดลอกลิงก์'}</span>
                    </button>

                    <button
                      onClick={() => toggleActive(promo)}
                      className="p-2 bg-white/5 border border-white/10 rounded-xl text-zinc-400 hover:text-white hover:border-white/20 transition-all active:scale-95"
                      title={promo.isActive ? 'ปิดลิงก์' : 'เปิดลิงก์'}
                    >
                      {promo.isActive ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => deletePromo(promo.id)}
                      className="p-2 bg-white/5 border border-white/10 rounded-xl text-zinc-400 hover:text-red-400 hover:border-red-500/20 transition-all active:scale-95"
                      title="ลบลิงก์"
                    >
                      <Trash2 className="w-4 h-4" />
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
