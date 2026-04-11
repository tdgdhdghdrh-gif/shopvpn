'use client'

import { useState, useEffect } from 'react'
import {
  Bell, CheckCircle2, AlertCircle, Loader2, Trash2, CheckCheck,
  CreditCard, Gift, Shield, Ticket, Star, Trophy, Megaphone, Zap,
  Clock, Eye, EyeOff, Package, Filter
} from 'lucide-react'
import Navbar from '@/components/Navbar'

interface NotificationItem {
  id: string; type: string; title: string; message: string
  icon: string | null; linkUrl: string | null; isRead: boolean; createdAt: string
}

const iconMap: Record<string, any> = {
  CreditCard, Gift, Shield, Ticket, Star, Trophy, Megaphone, Zap, Package, Bell,
}

const typeColors: Record<string, string> = {
  system: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  topup: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  vpn: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  gift: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
  coupon: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  reward: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  promo: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
}

export default function NotificationsPage() {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetch('/api/user/me').then(r => r.json()).then(d => {
      if (d.user) { setUser(d.user); setIsAdmin(d.user.isAdmin || d.user.isSuperAdmin) }
    }).catch(() => {})
  }, [])

  useEffect(() => { fetchNotifications() }, [page, filter])

  useEffect(() => {
    if (message.text) {
      const t = setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      return () => clearTimeout(t)
    }
  }, [message])

  async function fetchNotifications() {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' })
      if (filter === 'unread') params.set('unread', 'true')
      const res = await fetch(`/api/notifications?${params}`)
      const data = await res.json()
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 1)
    } catch {} finally { setLoading(false) }
  }

  async function markAsRead(id: string) {
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'read', id }),
    })
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  async function markAllRead() {
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'read_all' }),
    })
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnreadCount(0)
    setMessage({ type: 'success', text: 'อ่านทั้งหมดแล้ว' })
  }

  async function deleteNotification(id: string) {
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id }),
    })
    setNotifications(prev => prev.filter(n => n.id !== id))
    setTotal(prev => prev - 1)
  }

  async function deleteAllRead() {
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_all_read' }),
    })
    setNotifications(prev => prev.filter(n => !n.isRead))
    setMessage({ type: 'success', text: 'ลบที่อ่านแล้วทั้งหมด' })
    fetchNotifications()
  }

  function getTimeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'เมื่อสักครู่'
    if (mins < 60) return `${mins} นาทีที่แล้ว`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days} วันที่แล้ว`
    return new Date(date).toLocaleDateString('th-TH')
  }

  return (
    <div className="min-h-screen bg-transparent text-white">
      <Navbar user={user} isAdmin={isAdmin} />

      {message.text && (
        <div className={`fixed top-20 right-4 left-4 sm:left-auto sm:w-96 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl ${
          message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span className="font-semibold text-xs sm:text-sm">{message.text}</span>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-blue-500/30 rounded-2xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-blue-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-black text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">แจ้งเตือน</h1>
              <p className="text-zinc-500 text-xs">{total} รายการ &bull; {unreadCount} ยังไม่อ่าน</p>
            </div>
          </div>

          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="flex items-center gap-1.5 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[11px] font-bold text-blue-400 hover:bg-blue-500/20 transition-all">
                <CheckCheck className="w-3.5 h-3.5" /> อ่านทั้งหมด
              </button>
            )}
            <button onClick={deleteAllRead} className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 border border-white/5 rounded-lg text-[11px] font-bold text-zinc-400 hover:bg-zinc-700 transition-all">
              <Trash2 className="w-3.5 h-3.5" /> ลบที่อ่านแล้ว
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="flex bg-zinc-900/50 border border-white/5 rounded-xl p-1 gap-1">
          {(['all', 'unread'] as const).map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(1) }}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                filter === f ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-zinc-500 hover:text-white border border-transparent'
              }`}>
              {f === 'all' ? <Bell className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              {f === 'all' ? 'ทั้งหมด' : 'ยังไม่อ่าน'}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-600" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <Bell className="w-12 h-12 text-zinc-800 mx-auto" />
            <p className="text-zinc-600 text-sm font-medium">ไม่มีแจ้งเตือน</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => {
              const IconComp = iconMap[n.icon || ''] || Bell
              const colorClass = typeColors[n.type] || typeColors.system
              return (
                <div key={n.id}
                  className={`group flex items-start gap-3 p-4 rounded-xl border transition-all ${
                    n.isRead ? 'bg-zinc-900/30 border-white/[0.02]' : 'bg-zinc-900/60 border-blue-500/10 hover:border-blue-500/20'
                  }`}
                  onClick={() => !n.isRead && markAsRead(n.id)}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${colorClass}`}>
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold tracking-tight ${n.isRead ? 'text-zinc-500' : 'text-white'}`}>{n.title}</span>
                      {!n.isRead && <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                    </div>
                    <p className={`text-xs mt-0.5 ${n.isRead ? 'text-zinc-700' : 'text-zinc-400'}`}>{n.message}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] text-zinc-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {getTimeAgo(n.createdAt)}
                      </span>
                      {n.linkUrl && (
                        <a href={n.linkUrl} className="text-[10px] text-blue-500 hover:text-blue-400 font-bold" onClick={e => e.stopPropagation()}>ดูเพิ่มเติม →</a>
                      )}
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); deleteNotification(n.id) }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-700 hover:text-red-400 transition-all shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 bg-zinc-800 border border-white/5 rounded-lg text-xs font-bold text-zinc-400 disabled:opacity-30 hover:bg-zinc-700 transition-all">
              ก่อนหน้า
            </button>
            <span className="text-xs text-zinc-500 font-medium">{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1.5 bg-zinc-800 border border-white/5 rounded-lg text-xs font-bold text-zinc-400 disabled:opacity-30 hover:bg-zinc-700 transition-all">
              ถัดไป
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
