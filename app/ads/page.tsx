'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Megaphone, Plus, Send, Loader2, CheckCircle2, AlertCircle,
  Eye, Clock, XCircle, Upload, Trash2, Edit3, X,
  Phone, Tag, Image as ImageIcon, FileText, ChevronDown,
  ToggleLeft, ToggleRight, CalendarDays, Coins, MessageCircle,
  User as UserIcon, ExternalLink
} from 'lucide-react'
import Navbar from '@/components/Navbar'

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
  user?: { name: string; avatar: string | null }
}

const PRICE_PER_DAY = 3
const categories = [
  { id: 'general', name: 'ทั่วไป', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { id: 'service', name: 'บริการ', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { id: 'product', name: 'สินค้า', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { id: 'other', name: 'อื่นๆ', color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20' },
]

const statusMap: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'รอตรวจ', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: <Clock className="w-3 h-3" /> },
  approved: { label: 'อนุมัติแล้ว', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: <CheckCircle2 className="w-3 h-3" /> },
  rejected: { label: 'ถูกปฏิเสธ', color: 'text-red-400 bg-red-500/10 border-red-500/20', icon: <XCircle className="w-3 h-3" /> },
  expired: { label: 'หมดอายุ', color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20', icon: <Clock className="w-3 h-3" /> },
}

export default function AdsPage() {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Tabs
  const [tab, setTab] = useState<'browse' | 'create' | 'my'>('browse')

  // Public ads
  const [publicAds, setPublicAds] = useState<Ad[]>([])
  const [loadingAds, setLoadingAds] = useState(true)

  // My ads
  const [myAds, setMyAds] = useState<Ad[]>([])
  const [loadingMyAds, setLoadingMyAds] = useState(false)

  // Create form
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')
  const [contactInfo, setContactInfo] = useState('')
  const [category, setCategory] = useState('general')
  const [days, setDays] = useState(7)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const imageRef = useRef<HTMLInputElement>(null)

  // Edit modal
  const [editAd, setEditAd] = useState<Ad | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editImage, setEditImage] = useState('')
  const [editContact, setEditContact] = useState('')
  const [editCategory, setEditCategory] = useState('general')
  const [editSubmitting, setEditSubmitting] = useState(false)

  useEffect(() => {
    fetch('/api/user/me').then(r => r.json()).then(d => {
      if (d.user) {
        setUser(d.user)
        setIsAdmin(d.user.isAdmin || d.user.isSuperAdmin)
      }
    }).catch(() => {}).finally(() => setLoading(false))
    fetchPublicAds()
  }, [])

  useEffect(() => {
    if (message.text) {
      const t = setTimeout(() => setMessage({ type: '', text: '' }), 4000)
      return () => clearTimeout(t)
    }
  }, [message])

  useEffect(() => {
    if (tab === 'my' && user) fetchMyAds()
  }, [tab, user])

  async function fetchPublicAds() {
    setLoadingAds(true)
    try {
      const res = await fetch('/api/ads')
      const data = await res.json()
      if (data.ads) setPublicAds(data.ads)
    } catch {} finally { setLoadingAds(false) }
  }

  async function fetchMyAds() {
    setLoadingMyAds(true)
    try {
      const res = await fetch('/api/ads?mine=1')
      const data = await res.json()
      if (data.ads) setMyAds(data.ads)
    } catch {} finally { setLoadingMyAds(false) }
  }

  async function handleUpload(file: File) {
    setUploadingImage(true)
    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = e.target?.result as string
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64, type: 'ad' })
          })
          const data = await res.json()
          if (data.success && data.url) {
            if (editAd) setEditImage(data.url)
            else setImage(data.url)
            setMessage({ type: 'success', text: 'อัพโหลดรูปสำเร็จ' })
          } else {
            setMessage({ type: 'error', text: data.error || 'อัพโหลดล้มเหลว' })
          }
        } catch { setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการอัพโหลด' }) }
        finally { setUploadingImage(false) }
      }
      reader.readAsDataURL(file)
    } catch { setUploadingImage(false) }
  }

  async function handleCreate() {
    if (!user) { setMessage({ type: 'error', text: 'กรุณาเข้าสู่ระบบก่อน' }); return }
    if (!title.trim()) { setMessage({ type: 'error', text: 'กรุณากรอกหัวข้อโฆษณา' }); return }
    if (!description.trim()) { setMessage({ type: 'error', text: 'กรุณากรอกรายละเอียด' }); return }
    if (!contactInfo.trim()) { setMessage({ type: 'error', text: 'กรุณากรอกช่องทางติดต่อ' }); return }

    setSubmitting(true)
    try {
      const res = await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, image, contactInfo, category, days })
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: data.message })
        setTitle(''); setDescription(''); setImage(''); setContactInfo(''); setCategory('general'); setDays(7)
        setTab('my')
        fetchMyAds()
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch { setMessage({ type: 'error', text: 'เกิดข้อผิดพลาด' }) }
    finally { setSubmitting(false) }
  }

  async function handleToggle(ad: Ad) {
    try {
      const res = await fetch('/api/ads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ad.id, isActive: !ad.isActive })
      })
      const data = await res.json()
      if (data.success) {
        setMyAds(prev => prev.map(a => a.id === ad.id ? { ...a, isActive: !a.isActive } : a))
        setMessage({ type: 'success', text: ad.isActive ? 'ปิดโฆษณาแล้ว' : 'เปิดโฆษณาแล้ว' })
      }
    } catch { setMessage({ type: 'error', text: 'เกิดข้อผิดพลาด' }) }
  }

  async function handleDelete(id: string) {
    if (!confirm('ยืนยันการลบโฆษณา?')) return
    try {
      const res = await fetch(`/api/ads?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setMyAds(prev => prev.filter(a => a.id !== id))
        setMessage({ type: 'success', text: 'ลบโฆษณาแล้ว' })
      }
    } catch { setMessage({ type: 'error', text: 'เกิดข้อผิดพลาด' }) }
  }

  function openEdit(ad: Ad) {
    setEditAd(ad); setEditTitle(ad.title); setEditDesc(ad.description)
    setEditImage(ad.image || ''); setEditContact(ad.contactInfo); setEditCategory(ad.category)
  }

  async function handleEdit() {
    if (!editAd) return
    setEditSubmitting(true)
    try {
      const res = await fetch('/api/ads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editAd.id, title: editTitle, description: editDesc,
          image: editImage, contactInfo: editContact, category: editCategory
        })
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: data.message })
        setEditAd(null)
        fetchMyAds()
      } else { setMessage({ type: 'error', text: data.error }) }
    } catch { setMessage({ type: 'error', text: 'เกิดข้อผิดพลาด' }) }
    finally { setEditSubmitting(false) }
  }

  function getDaysLeft(endDate: string) {
    const diff = new Date(endDate).getTime() - Date.now()
    return Math.max(0, Math.ceil(diff / 86400000))
  }

  function getCat(id: string) {
    return categories.find(c => c.id === id) || categories[0]
  }

  return (
    <div className="min-h-screen bg-transparent text-white">
      <Navbar user={user} isAdmin={isAdmin} />

      {/* Toast */}
      {message.text && (
        <div className={`fixed top-20 left-4 right-4 sm:left-auto sm:right-8 sm:max-w-sm z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl ${
          message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
          : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span className="font-semibold text-xs sm:text-sm">{message.text}</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center mx-auto">
            <Megaphone className="w-7 h-7 text-orange-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">ลงโฆษณา</h1>
          <p className="text-xs sm:text-sm text-zinc-500 font-medium">ฝากลงโฆษณาบนเว็บไซต์ วันละ {PRICE_PER_DAY} บาท (1-30 วัน)</p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-2xl bg-zinc-900/50 border border-white/5 p-1 gap-1">
          {[
            { id: 'browse' as const, label: 'โฆษณาทั้งหมด', icon: <Eye className="w-4 h-4" /> },
            { id: 'create' as const, label: 'ฝากลงโฆษณา', icon: <Plus className="w-4 h-4" /> },
            { id: 'my' as const, label: 'โฆษณาของฉัน', icon: <UserIcon className="w-4 h-4" /> },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                tab === t.id ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'text-zinc-500 hover:text-zinc-300'
              }`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* TAB: Browse public ads */}
        {tab === 'browse' && (
          <div className="space-y-4">
            {loadingAds ? (
              <div className="flex flex-col items-center py-20 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
                <span className="text-xs text-zinc-500">กำลังโหลดโฆษณา...</span>
              </div>
            ) : publicAds.length === 0 ? (
              <div className="text-center py-20 bg-zinc-900/30 rounded-2xl border border-white/5">
                <Megaphone className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                <p className="text-sm text-zinc-500 font-medium">ยังไม่มีโฆษณาขณะนี้</p>
                <p className="text-[11px] text-zinc-600 mt-1">เป็นคนแรกที่ลงโฆษณาเลย!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {publicAds.map(ad => (
                  <div key={ad.id} className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all">
                    {ad.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={ad.image} alt={ad.title} className="w-full h-40 object-cover" />
                    )}
                    <div className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-sm text-white leading-tight">{ad.title}</h3>
                        <span className={`shrink-0 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${getCat(ad.category).color}`}>
                          {getCat(ad.category).name}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">{ad.description}</p>
                      <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                        <div className="flex items-center gap-1.5">
                          {ad.user?.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={ad.user.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center">
                              <UserIcon className="w-3 h-3 text-zinc-500" />
                            </div>
                          )}
                          <span className="text-[11px] text-zinc-500 font-medium">{ad.user?.name}</span>
                        </div>
                        <div className="ml-auto flex items-center gap-1.5 text-[11px] text-zinc-600">
                          <Eye className="w-3 h-3" /> {ad.views}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-orange-400" />
                        <span className="text-xs text-orange-400 font-medium">{ad.contactInfo}</span>
                      </div>
                      {ad.endDate && (
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-600">
                          <CalendarDays className="w-3 h-3" />
                          เหลืออีก {getDaysLeft(ad.endDate)} วัน
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: Create ad */}
        {tab === 'create' && (
          <div className="space-y-4">
            {!user ? (
              <div className="text-center py-16 bg-zinc-900/30 rounded-2xl border border-white/5">
                <UserIcon className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                <p className="text-sm text-zinc-400 font-medium">กรุณาเข้าสู่ระบบเพื่อลงโฆษณา</p>
              </div>
            ) : (
              <>
                {/* Price info */}
                <div className="bg-orange-500/5 border border-orange-500/15 rounded-2xl p-4 flex items-center gap-3">
                  <Coins className="w-8 h-8 text-orange-400 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-orange-400">ค่าลงโฆษณา {PRICE_PER_DAY} บาท/วัน</p>
                    <p className="text-[11px] text-zinc-500">เลือก 1-30 วัน &bull; หักจากยอดเงินคงเหลือ &bull; รอแอดมินอนุมัติ</p>
                  </div>
                </div>

                {/* Form */}
                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 space-y-4">
                  {/* Title */}
                  <div>
                    <label className="text-xs font-bold text-zinc-400 mb-1.5 block">หัวข้อโฆษณา *</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} maxLength={100}
                      placeholder="เช่น รับเติม VPN ราคาถูก" className="w-full bg-zinc-800/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-orange-500/50 focus:outline-none" />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-xs font-bold text-zinc-400 mb-1.5 block">รายละเอียด *</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} maxLength={1000}
                      placeholder="อธิบายรายละเอียดโฆษณาของคุณ..." className="w-full bg-zinc-800/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-orange-500/50 focus:outline-none resize-none" />
                    <span className="text-[10px] text-zinc-600 mt-1 block text-right">{description.length}/1000</span>
                  </div>

                  {/* Image */}
                  <div>
                    <label className="text-xs font-bold text-zinc-400 mb-1.5 block">รูปภาพประกอบ</label>
                    {image ? (
                      <div className="relative w-full h-36 rounded-xl overflow-hidden border border-white/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={image} alt="" className="w-full h-full object-cover" />
                        <button onClick={() => setImage('')} className="absolute top-2 right-2 w-7 h-7 bg-red-500/80 rounded-lg flex items-center justify-center">
                          <Trash2 className="w-3.5 h-3.5 text-white" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input type="text" value={image} onChange={e => setImage(e.target.value)} placeholder="วาง URL รูป หรืออัพโหลด..."
                          className="flex-1 bg-zinc-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-orange-500/50 focus:outline-none" />
                        <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
                        <button onClick={() => imageRef.current?.click()} disabled={uploadingImage}
                          className="px-4 py-2.5 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-400 text-sm font-bold shrink-0 disabled:opacity-40">
                          {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Contact */}
                  <div>
                    <label className="text-xs font-bold text-zinc-400 mb-1.5 block">ช่องทางติดต่อ *</label>
                    <input type="text" value={contactInfo} onChange={e => setContactInfo(e.target.value)} maxLength={200}
                      placeholder="เช่น Line: @myshop, FB: MyPage, Tel: 08x-xxx-xxxx" className="w-full bg-zinc-800/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-orange-500/50 focus:outline-none" />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="text-xs font-bold text-zinc-400 mb-1.5 block">หมวดหมู่</label>
                    <div className="grid grid-cols-4 gap-2">
                      {categories.map(c => (
                        <button key={c.id} onClick={() => setCategory(c.id)}
                          className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                            category === c.id ? c.color : 'bg-zinc-800/50 border-white/5 text-zinc-500'
                          }`}>{c.name}</button>
                      ))}
                    </div>
                  </div>

                  {/* Days */}
                  <div>
                    <label className="text-xs font-bold text-zinc-400 mb-1.5 block">จำนวนวัน (1-30)</label>
                    <div className="flex items-center gap-4">
                      <input type="range" min="1" max="30" value={days} onChange={e => setDays(Number(e.target.value))}
                        className="flex-1 h-2 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-orange-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-orange-400" />
                      <span className="text-lg font-black text-white tabular-nums w-10 text-center">{days}</span>
                      <span className="text-xs text-zinc-500">วัน</span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {[1, 3, 7, 14, 30].map(d => (
                        <button key={d} onClick={() => setDays(d)}
                          className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                            days === d ? 'bg-orange-500/20 border-orange-500/40 text-orange-400' : 'bg-zinc-800/50 border-white/5 text-zinc-500'
                          }`}>{d} วัน</button>
                      ))}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="bg-zinc-800/50 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                    <span className="text-sm text-zinc-400 font-medium">ราคารวม</span>
                    <span className="text-xl font-black text-orange-400">{PRICE_PER_DAY * days} <span className="text-sm font-medium text-zinc-500">บาท</span></span>
                  </div>

                  {/* Submit */}
                  <button onClick={handleCreate} disabled={submitting}
                    className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 rounded-xl text-sm font-bold text-white transition-all active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {submitting ? 'กำลังส่ง...' : `ลงโฆษณา (หัก ${PRICE_PER_DAY * days} บาท)`}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB: My ads */}
        {tab === 'my' && (
          <div className="space-y-4">
            {!user ? (
              <div className="text-center py-16 bg-zinc-900/30 rounded-2xl border border-white/5">
                <UserIcon className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                <p className="text-sm text-zinc-400 font-medium">กรุณาเข้าสู่ระบบเพื่อดูโฆษณาของคุณ</p>
              </div>
            ) : loadingMyAds ? (
              <div className="flex flex-col items-center py-20 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
              </div>
            ) : myAds.length === 0 ? (
              <div className="text-center py-16 bg-zinc-900/30 rounded-2xl border border-white/5">
                <FileText className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                <p className="text-sm text-zinc-500 font-medium">คุณยังไม่มีโฆษณา</p>
                <button onClick={() => setTab('create')} className="mt-3 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-xl text-xs font-bold text-orange-400">
                  <Plus className="w-3.5 h-3.5 inline mr-1" />ลงโฆษณาตอนนี้
                </button>
              </div>
            ) : (
              myAds.map(ad => {
                const st = statusMap[ad.status] || statusMap.pending
                return (
                  <div key={ad.id} className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
                    {ad.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={ad.image} alt="" className="w-full h-32 object-cover" />
                    )}
                    <div className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-bold text-sm text-white truncate">{ad.title}</h3>
                          <p className="text-[11px] text-zinc-500 mt-0.5">{new Date(ad.createdAt).toLocaleDateString('th-TH')} &bull; {ad.days} วัน &bull; {ad.price} บาท</p>
                        </div>
                        <span className={`shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border ${st.color}`}>
                          {st.icon} {st.label}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-400 line-clamp-2">{ad.description}</p>

                      {ad.rejectReason && (
                        <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-3">
                          <p className="text-[11px] text-red-400 font-medium">เหตุผลที่ปฏิเสธ: {ad.rejectReason}</p>
                        </div>
                      )}

                      {ad.status === 'approved' && ad.endDate && (
                        <div className="flex items-center gap-3 text-[11px]">
                          <span className="text-zinc-500"><Eye className="w-3 h-3 inline mr-1" />{ad.views} views</span>
                          <span className="text-zinc-500"><CalendarDays className="w-3 h-3 inline mr-1" />เหลือ {getDaysLeft(ad.endDate)} วัน</span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2 border-t border-white/5">
                        {/* Toggle */}
                        {ad.status === 'approved' && (
                          <button onClick={() => handleToggle(ad)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                              ad.isActive ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-zinc-800 border-white/5 text-zinc-500'
                            }`}>
                            {ad.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                            {ad.isActive ? 'เปิดอยู่' : 'ปิดอยู่'}
                          </button>
                        )}
                        {/* Edit — pending/rejected only */}
                        {(ad.status === 'pending' || ad.status === 'rejected') && (
                          <button onClick={() => openEdit(ad)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[11px] font-bold text-blue-400">
                            <Edit3 className="w-3.5 h-3.5" /> แก้ไข
                          </button>
                        )}
                        {/* Delete */}
                        <button onClick={() => handleDelete(ad.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-[11px] font-bold text-red-400 ml-auto">
                          <Trash2 className="w-3.5 h-3.5" /> ลบ
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editAd && (
        <div className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEditAd(null)}>
          <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">แก้ไขโฆษณา</h3>
              <button onClick={() => setEditAd(null)} className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-400 mb-1 block">หัวข้อ</label>
                <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full bg-zinc-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-orange-500/50 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 mb-1 block">รายละเอียด</label>
                <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={3} className="w-full bg-zinc-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-orange-500/50 focus:outline-none resize-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 mb-1 block">รูปภาพ</label>
                <input type="text" value={editImage} onChange={e => setEditImage(e.target.value)} placeholder="URL รูปภาพ" className="w-full bg-zinc-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-orange-500/50 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 mb-1 block">ช่องทางติดต่อ</label>
                <input type="text" value={editContact} onChange={e => setEditContact(e.target.value)} className="w-full bg-zinc-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-orange-500/50 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 mb-1 block">หมวดหมู่</label>
                <div className="grid grid-cols-4 gap-2">
                  {categories.map(c => (
                    <button key={c.id} onClick={() => setEditCategory(c.id)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${editCategory === c.id ? c.color : 'bg-zinc-800/50 border-white/5 text-zinc-500'}`}>{c.name}</button>
                  ))}
                </div>
              </div>
              <button onClick={handleEdit} disabled={editSubmitting}
                className="w-full py-3 bg-orange-600 hover:bg-orange-500 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-40">
                {editSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {editSubmitting ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
