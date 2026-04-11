'use client'

import { useState, useEffect } from 'react'
import {
  Megaphone, Pin, Clock, Loader2, Zap, Wrench, Gift,
  AlertTriangle, ChevronRight, Bell, Sparkles,
} from 'lucide-react'
import Navbar from '@/components/Navbar'

interface Announcement {
  id: string
  title: string
  content: string
  category: string
  priority: string
  isPinned: boolean
  createdAt: string
}

const CATEGORIES = [
  { value: 'general', label: 'ทั่วไป', icon: Megaphone, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', gradient: 'from-blue-500/20 to-transparent' },
  { value: 'update', label: 'อัพเดท', icon: Zap, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', gradient: 'from-emerald-500/20 to-transparent' },
  { value: 'maintenance', label: 'ปิดปรับปรุง', icon: Wrench, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', gradient: 'from-amber-500/20 to-transparent' },
  { value: 'promo', label: 'โปรโมชั่น', icon: Gift, color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20', gradient: 'from-pink-500/20 to-transparent' },
  { value: 'urgent', label: 'ด่วน', icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', gradient: 'from-red-500/20 to-transparent' },
]

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCategory, setFilterCategory] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    fetchUser()
    fetchAnnouncements()
  }, [])

  useEffect(() => {
    fetchAnnouncements()
  }, [filterCategory])

  async function fetchUser() {
    try {
      const res = await fetch('/api/user/me')
      const data = await res.json()
      if (data.user) {
        setUser(data.user)
        setIsAdmin(data.user.isAdmin || data.user.isSuperAdmin)
      }
    } catch {}
  }

  async function fetchAnnouncements() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterCategory !== 'all') params.set('category', filterCategory)
      params.set('limit', '50')
      const res = await fetch(`/api/announcements?${params}`)
      const data = await res.json()
      if (data.success) setAnnouncements(data.announcements)
    } catch {} finally {
      setLoading(false)
    }
  }

  const getCat = (cat: string) => CATEGORIES.find(c => c.value === cat) || CATEGORIES[0]

  function formatDate(d: string) {
    const date = new Date(d)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const mins = Math.floor(diff / 60000)
    const hrs = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (mins < 1) return 'เมื่อสักครู่'
    if (mins < 60) return `${mins} นาทีที่แล้ว`
    if (hrs < 24) return `${hrs} ชั่วโมงที่แล้ว`
    if (days < 7) return `${days} วันที่แล้ว`
    return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })
  }

  return (
    <div className="min-h-dvh bg-transparent">
      <Navbar user={user} isAdmin={isAdmin} />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20 mb-4">
            <Megaphone className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            ประกาศข่าวสาร
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">ข่าวสาร อัพเดท และโปรโมชั่นล่าสุด</p>
        </div>

        {/* Category Filter */}
        <div className="flex gap-1.5 overflow-x-auto pb-3 mb-6 scrollbar-hide">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all shrink-0 ${
              filterCategory === 'all' ? 'bg-white/10 text-white border border-white/20' : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
            }`}
          >
            ทั้งหมด
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setFilterCategory(cat.value)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all shrink-0 border ${
                filterCategory === cat.value ? `${cat.bg} ${cat.color}` : 'text-zinc-500 hover:text-zinc-300 border-transparent'
              }`}
            >
              <cat.icon className="w-3 h-3" />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Announcements */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center mx-auto mb-4">
              <Megaphone className="w-10 h-10 text-zinc-700" />
            </div>
            <p className="text-zinc-500 text-sm">ยังไม่มีประกาศ</p>
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map(a => {
              const cat = getCat(a.category)
              const CatIcon = cat.icon
              const isExpanded = expandedId === a.id
              const isLong = a.content.length > 150

              return (
                <div
                  key={a.id}
                  onClick={() => isLong && setExpandedId(isExpanded ? null : a.id)}
                  className={`relative bg-zinc-900/60 border rounded-2xl overflow-hidden transition-all ${
                    a.isPinned ? 'border-amber-500/20' : a.priority === 'urgent' ? 'border-red-500/20' : 'border-white/5'
                  } ${isLong ? 'cursor-pointer hover:border-white/10' : ''}`}
                >
                  {/* Subtle gradient accent */}
                  <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${cat.gradient}`} />

                  <div className="p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl border flex items-center justify-center shrink-0 ${cat.bg} ${cat.color}`}>
                        <CatIcon className="w-5 h-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          {a.isPinned && (
                            <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-md text-amber-400 text-[9px] font-bold">
                              <Pin className="w-2.5 h-2.5" /> ปักหมุด
                            </span>
                          )}
                          <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold border ${cat.bg} ${cat.color}`}>
                            {cat.label}
                          </span>
                          {a.priority === 'urgent' && (
                            <span className="px-1.5 py-0.5 bg-red-500/10 border border-red-500/20 rounded-md text-red-400 text-[9px] font-bold animate-pulse">
                              ด่วนมาก
                            </span>
                          )}
                          {a.priority === 'high' && (
                            <span className="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-md text-amber-400 text-[9px] font-bold">
                              สำคัญ
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm sm:text-base font-bold text-white leading-tight">{a.title}</h3>
                        <p className={`text-xs sm:text-sm text-zinc-400 mt-1.5 whitespace-pre-wrap leading-relaxed ${
                          !isExpanded && isLong ? 'line-clamp-3' : ''
                        }`}>
                          {a.content}
                        </p>

                        {isLong && !isExpanded && (
                          <span className="text-[11px] text-blue-400 font-medium mt-1 inline-block">อ่านเพิ่มเติม...</span>
                        )}

                        <div className="flex items-center gap-2 mt-2 text-[10px] text-zinc-600">
                          <Clock className="w-3 h-3" />
                          {formatDate(a.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
