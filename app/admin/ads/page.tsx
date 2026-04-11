'use client'

import { useState, useEffect } from 'react'
import {
  Megaphone, Loader2, CheckCircle2, AlertCircle, Eye, Clock, XCircle,
  Trash2, Search, ToggleLeft, ToggleRight, User as UserIcon,
  Tag, CalendarDays, Phone, Filter, ThumbsUp, ThumbsDown,
  TrendingUp, DollarSign, AlertTriangle, X, Send
} from 'lucide-react'

interface Ad {
  id: string
  title: string
  description: string
  image: string | null
  contactInfo: string
  category: string
  price: number
  days: number
  status: string
  rejectReason: string | null
  startDate: string | null
  endDate: string | null
  views: number
  isActive: boolean
  createdAt: string
  user?: { id: string; name: string; email: string; avatar: string | null }
}

interface Stats {
  total: number
  pending: number
  approved: number
  rejected: number
  expired: number
}

const categories: Record<string, { name: string; color: string }> = {
  general: { name: 'ทั่วไป', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  service: { name: 'บริการ', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  product: { name: 'สินค้า', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  other: { name: 'อื่นๆ', color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20' },
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'รอตรวจ', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: <Clock className="w-3 h-3" /> },
  approved: { label: 'อนุมัติแล้ว', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: <CheckCircle2 className="w-3 h-3" /> },
  rejected: { label: 'ถูกปฏิเสธ', color: 'text-red-400 bg-red-500/10 border-red-500/20', icon: <XCircle className="w-3 h-3" /> },
  expired: { label: 'หมดอายุ', color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20', icon: <Clock className="w-3 h-3" /> },
}

export default function AdminAdsPage() {
  const [ads, setAds] = useState<Ad[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Reject modal
  const [rejectModal, setRejectModal] = useState<Ad | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejecting, setRejecting] = useState(false)

  // Detail modal
  const [detailAd, setDetailAd] = useState<Ad | null>(null)

  useEffect(() => { fetchAds() }, [])
  useEffect(() => {
    if (message.text) {
      const t = setTimeout(() => setMessage({ type: '', text: '' }), 4000)
      return () => clearTimeout(t)
    }
  }, [message])

  async function fetchAds() {
    try {
      const res = await fetch('/api/admin/ads')
      const data = await res.json()
      if (data.ads) setAds(data.ads)
      if (data.stats) setStats(data.stats)
    } catch {
      setMessage({ type: 'error', text: 'ไม่สามารถโหลดข้อมูลโฆษณาได้' })
    } finally { setLoading(false) }
  }

  async function handleApprove(ad: Ad) {
    if (!confirm(`อนุมัติโฆษณา "${ad.title}" ?`)) return
    setActionLoading(ad.id)
    try {
      const res = await fetch('/api/admin/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ad.id, action: 'approve' })
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: data.message })
        fetchAds()
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาด' })
    } finally { setActionLoading(null) }
  }

  async function handleReject() {
    if (!rejectModal) return
    if (!rejectReason.trim()) {
      setMessage({ type: 'error', text: 'กรุณาระบุเหตุผลที่ปฏิเสธ' })
      return
    }
    setRejecting(true)
    try {
      const res = await fetch('/api/admin/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: rejectModal.id, action: 'reject', rejectReason: rejectReason.trim() })
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: data.message })
        setRejectModal(null)
        setRejectReason('')
        fetchAds()
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาด' })
    } finally { setRejecting(false) }
  }

  async function handleDelete(ad: Ad) {
    if (!confirm(`ลบโฆษณา "${ad.title}" ? (ลบถาวร)`)) return
    setActionLoading(ad.id)
    try {
      const res = await fetch('/api/admin/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ad.id, action: 'delete' })
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: data.message })
        fetchAds()
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาด' })
    } finally { setActionLoading(null) }
  }

  function getDaysLeft(endDate: string) {
    const diff = new Date(endDate).getTime() - Date.now()
    return Math.max(0, Math.ceil(diff / 86400000))
  }

  function getCat(id: string) {
    return categories[id] || categories.general
  }

  // Filter and search
  const filteredAds = ads.filter(ad => {
    if (filterStatus !== 'all' && ad.status !== filterStatus) return false
    if (search) {
      const s = search.toLowerCase()
      return (
        ad.title.toLowerCase().includes(s) ||
        ad.description.toLowerCase().includes(s) ||
        ad.user?.name.toLowerCase().includes(s) ||
        ad.user?.email.toLowerCase().includes(s) ||
        ad.contactInfo.toLowerCase().includes(s)
      )
    }
    return true
  })

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
        <p className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-widest">กำลังโหลดข้อมูลโฆษณา...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-8">
      {/* Toast */}
      {message.text && (
        <div className={`fixed bottom-20 sm:bottom-8 right-4 sm:right-8 left-4 sm:left-auto z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl ${
          message.type === 'success'
            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
            : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span className="font-semibold text-xs sm:text-sm">{message.text}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center border border-orange-500/20">
              <Megaphone className="w-4 h-4 text-orange-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">จัดการโฆษณา</h2>
          </div>
          <p className="text-zinc-500 text-xs sm:text-sm font-medium">อนุมัติ / ปฏิเสธ / ลบ โฆษณาจากผู้ใช้</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: 'ทั้งหมด', value: stats.total, icon: Megaphone, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
            { label: 'รอตรวจ', value: stats.pending, icon: Clock, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
            { label: 'อนุมัติแล้ว', value: stats.approved, icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
            { label: 'ถูกปฏิเสธ', value: stats.rejected, icon: XCircle, color: 'text-red-400 bg-red-500/10 border-red-500/20' },
            { label: 'หมดอายุ', value: stats.expired, icon: AlertTriangle, color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20' },
          ].map((s, i) => (
            <div key={i} className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-zinc-500 font-medium truncate">{s.label}</p>
                <p className="text-lg font-black text-white">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาหัวข้อ, ผู้ใช้, ช่องทางติดต่อ..."
            className="w-full bg-zinc-900/50 border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:border-orange-500/50 transition-all font-medium"
          />
        </div>
        <div className="flex gap-1.5 bg-zinc-900/50 border border-white/5 rounded-xl p-1">
          {[
            { id: 'all', label: 'ทั้งหมด' },
            { id: 'pending', label: 'รอตรวจ' },
            { id: 'approved', label: 'อนุมัติ' },
            { id: 'rejected', label: 'ปฏิเสธ' },
            { id: 'expired', label: 'หมดอายุ' },
          ].map(f => (
            <button key={f.id} onClick={() => setFilterStatus(f.id)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                filterStatus === f.id
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ads List */}
      {filteredAds.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900/30 rounded-2xl border border-white/5">
          <Megaphone className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-sm text-zinc-500 font-medium">
            {search || filterStatus !== 'all' ? 'ไม่พบโฆษณาที่ตรงกับเงื่อนไข' : 'ยังไม่มีโฆษณาในระบบ'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAds.map(ad => {
            const st = statusConfig[ad.status] || statusConfig.pending
            const cat = getCat(ad.category)
            const isLoading = actionLoading === ad.id
            return (
              <div key={ad.id} className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all">
                <div className="flex flex-col sm:flex-row">
                  {/* Image */}
                  {ad.image && (
                    <div className="sm:w-48 h-36 sm:h-auto shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={ad.image} alt={ad.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 p-4 sm:p-5 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-sm text-white">{ad.title}</h3>
                          <span className={`shrink-0 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${cat.color}`}>
                            {cat.name}
                          </span>
                          <span className={`shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${st.color}`}>
                            {st.icon} {st.label}
                          </span>
                          {ad.status === 'approved' && (
                            <span className={`shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                              ad.isActive
                                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                                : 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20'
                            }`}>
                              {ad.isActive ? <ToggleRight className="w-3 h-3" /> : <ToggleLeft className="w-3 h-3" />}
                              {ad.isActive ? 'เปิด' : 'ปิด'}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{ad.description}</p>
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px]">
                      {/* User */}
                      <div className="flex items-center gap-1.5">
                        {ad.user?.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={ad.user.avatar} alt="" className="w-4 h-4 rounded-full object-cover" />
                        ) : (
                          <UserIcon className="w-3.5 h-3.5 text-zinc-600" />
                        )}
                        <span className="text-zinc-400 font-medium">{ad.user?.name || 'Unknown'}</span>
                        <span className="text-zinc-600">{ad.user?.email}</span>
                      </div>
                      {/* Contact */}
                      <div className="flex items-center gap-1 text-orange-400">
                        <Phone className="w-3 h-3" />
                        <span className="font-medium">{ad.contactInfo}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-zinc-500">
                      <span><DollarSign className="w-3 h-3 inline" /> {ad.price} บาท ({ad.days} วัน)</span>
                      <span><Eye className="w-3 h-3 inline" /> {ad.views} views</span>
                      <span><CalendarDays className="w-3 h-3 inline" /> {new Date(ad.createdAt).toLocaleDateString('th-TH')}</span>
                      {ad.status === 'approved' && ad.endDate && (
                        <span className="text-emerald-400">เหลือ {getDaysLeft(ad.endDate)} วัน</span>
                      )}
                    </div>

                    {ad.rejectReason && (
                      <div className="bg-red-500/5 border border-red-500/15 rounded-xl px-3 py-2">
                        <p className="text-[11px] text-red-400 font-medium">เหตุผลที่ปฏิเสธ: {ad.rejectReason}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t border-white/5">
                      {ad.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(ad)}
                            disabled={isLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[11px] font-bold text-emerald-400 hover:bg-emerald-500/20 transition-all disabled:opacity-40"
                          >
                            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ThumbsUp className="w-3.5 h-3.5" />}
                            อนุมัติ
                          </button>
                          <button
                            onClick={() => { setRejectModal(ad); setRejectReason('') }}
                            disabled={isLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-[11px] font-bold text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-40"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                            ปฏิเสธ (คืนเงิน)
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setDetailAd(ad)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[11px] font-bold text-blue-400 hover:bg-blue-500/20 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        ดูรายละเอียด
                      </button>
                      <button
                        onClick={() => handleDelete(ad)}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-[11px] font-bold text-red-400 hover:bg-red-500/20 transition-all ml-auto disabled:opacity-40"
                      >
                        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
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

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setRejectModal(null)}>
          <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <ThumbsDown className="w-4 h-4 text-red-400" />
                ปฏิเสธโฆษณา
              </h3>
              <button onClick={() => setRejectModal(null)} className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-zinc-800/50 border border-white/5 rounded-xl p-3 space-y-1">
                <p className="text-xs font-bold text-white">{rejectModal.title}</p>
                <p className="text-[11px] text-zinc-500">โดย {rejectModal.user?.name} &bull; {rejectModal.price} บาท</p>
              </div>
              <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-3">
                <p className="text-[11px] text-amber-400 font-medium">เงิน {rejectModal.price} บาท จะถูกคืนให้ผู้ใช้อัตโนมัติ</p>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 mb-1.5 block">เหตุผลที่ปฏิเสธ *</label>
                <textarea
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  rows={3}
                  placeholder="กรุณาระบุเหตุผลที่ปฏิเสธ..."
                  className="w-full bg-zinc-800/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-red-500/50 focus:outline-none resize-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setRejectModal(null)}
                  className="flex-1 py-2.5 bg-zinc-800 border border-white/5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-all"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleReject}
                  disabled={rejecting || !rejectReason.trim()}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                >
                  {rejecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsDown className="w-4 h-4" />}
                  {rejecting ? 'กำลังปฏิเสธ...' : 'ปฏิเสธ & คืนเงิน'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailAd && (
        <div className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setDetailAd(null)}>
          <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">รายละเอียดโฆษณา</h3>
              <button onClick={() => setDetailAd(null)} className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {detailAd.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={detailAd.image} alt={detailAd.title} className="w-full h-48 object-cover rounded-xl" />
              )}
              <div>
                <h4 className="font-bold text-base text-white">{detailAd.title}</h4>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {(() => { const st = statusConfig[detailAd.status] || statusConfig.pending; return (
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${st.color}`}>{st.icon} {st.label}</span>
                  )})()}
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${getCat(detailAd.category).color}`}>{getCat(detailAd.category).name}</span>
                </div>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap">{detailAd.description}</p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-zinc-800/50 border border-white/5 rounded-xl p-3">
                  <p className="text-zinc-500 text-[10px] font-medium">ผู้ลงโฆษณา</p>
                  <p className="text-white font-bold mt-0.5">{detailAd.user?.name}</p>
                  <p className="text-zinc-500 text-[10px]">{detailAd.user?.email}</p>
                </div>
                <div className="bg-zinc-800/50 border border-white/5 rounded-xl p-3">
                  <p className="text-zinc-500 text-[10px] font-medium">ช่องทางติดต่อ</p>
                  <p className="text-orange-400 font-bold mt-0.5">{detailAd.contactInfo}</p>
                </div>
                <div className="bg-zinc-800/50 border border-white/5 rounded-xl p-3">
                  <p className="text-zinc-500 text-[10px] font-medium">ราคา / ระยะเวลา</p>
                  <p className="text-white font-bold mt-0.5">{detailAd.price} บาท / {detailAd.days} วัน</p>
                </div>
                <div className="bg-zinc-800/50 border border-white/5 rounded-xl p-3">
                  <p className="text-zinc-500 text-[10px] font-medium">Views / สถานะ</p>
                  <p className="text-white font-bold mt-0.5">{detailAd.views} views {detailAd.isActive ? '(เปิด)' : '(ปิด)'}</p>
                </div>
                <div className="bg-zinc-800/50 border border-white/5 rounded-xl p-3">
                  <p className="text-zinc-500 text-[10px] font-medium">วันที่สร้าง</p>
                  <p className="text-white font-bold mt-0.5">{new Date(detailAd.createdAt).toLocaleDateString('th-TH')}</p>
                </div>
                {detailAd.endDate && (
                  <div className="bg-zinc-800/50 border border-white/5 rounded-xl p-3">
                    <p className="text-zinc-500 text-[10px] font-medium">หมดอายุ</p>
                    <p className="text-white font-bold mt-0.5">{new Date(detailAd.endDate).toLocaleDateString('th-TH')} (เหลือ {getDaysLeft(detailAd.endDate)} วัน)</p>
                  </div>
                )}
              </div>
              {detailAd.rejectReason && (
                <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-3">
                  <p className="text-[11px] text-red-400 font-medium">เหตุผลที่ปฏิเสธ: {detailAd.rejectReason}</p>
                </div>
              )}

              {/* Quick actions */}
              {detailAd.status === 'pending' && (
                <div className="flex gap-2 pt-2 border-t border-white/5">
                  <button
                    onClick={() => { handleApprove(detailAd); setDetailAd(null) }}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    อนุมัติ
                  </button>
                  <button
                    onClick={() => { setDetailAd(null); setRejectModal(detailAd); setRejectReason('') }}
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    ปฏิเสธ
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
