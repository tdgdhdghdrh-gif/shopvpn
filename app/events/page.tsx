'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import {
  Calendar, Clock, Loader2, Sparkles, ArrowLeft,
  ChevronRight, Image as ImageIcon
} from 'lucide-react'

interface SiteEvent {
  id: string
  title: string
  description: string | null
  imageUrl: string | null
  startDate: string | null
  endDate: string | null
  isActive: boolean
  createdAt: string
}

export default function EventsPage() {
  const [events, setEvents] = useState<SiteEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetchEvents()
    fetch('/api/user/me')
      .then(r => r.json())
      .then(d => { if (d.user) setUser(d.user) })
      .catch(() => {})
  }, [])

  async function fetchEvents() {
    try {
      const res = await fetch('/api/site-events')
      const data = await res.json()
      if (data.success) setEvents(data.events)
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setLoading(false)
    }
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleDateString('th-TH', {
      day: 'numeric', month: 'long', year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-transparent text-white font-sans">
      <Navbar user={user} isAdmin={user?.isAdmin || user?.isSuperAdmin} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-[11px] font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            กิจกรรม & โปรโมชั่น
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white mb-3">
            กิจกรรม
          </h1>
          <p className="text-sm sm:text-base text-zinc-500 max-w-xl mx-auto">
            ร่วมสนุกกับกิจกรรมและลุ้นรางวัลมากมาย
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
            <p className="text-xs text-zinc-600 font-medium">กำลังโหลดกิจกรรม...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && events.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <Calendar className="w-10 h-10 text-zinc-700" />
            </div>
            <p className="text-sm text-zinc-500 font-medium">ยังไม่มีกิจกรรมในขณะนี้</p>
            <p className="text-xs text-zinc-600">ติดตามกิจกรรมใหม่เร็วๆ นี้</p>
          </div>
        )}

        {/* Events Grid */}
        {!loading && events.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {events.map((event) => (
              <div
                key={event.id}
                className="group relative rounded-2xl overflow-hidden border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] transition-all"
              >
                {/* Image */}
                <div className="relative aspect-[16/9] bg-zinc-900 overflow-hidden">
                  {event.imageUrl ? (
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-zinc-700" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-base font-bold text-white mb-2 group-hover:text-pink-400 transition-colors">
                    {event.title}
                  </h3>
                  {event.description && (
                    <p className="text-xs text-zinc-500 line-clamp-3 mb-3 leading-relaxed">
                      {event.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-500">
                    {event.startDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-pink-400" />
                        {formatDate(event.startDate)}
                      </span>
                    )}
                    {event.endDate && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-pink-400" />
                        ถึง {formatDate(event.endDate)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back to home */}
        <div className="mt-10 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-xl text-sm font-bold text-zinc-400 hover:text-white transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            กลับหน้าแรก
          </Link>
        </div>
      </div>
    </div>
  )
}
