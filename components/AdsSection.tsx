'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Megaphone, Eye, Phone, ChevronLeft, ChevronRight,
  Tag, User as UserIcon, CalendarDays, ExternalLink,
} from 'lucide-react'

interface Ad {
  id: string
  title: string
  description: string
  image: string | null
  contactInfo: string
  category: string
  views: number
  endDate: string | null
  user?: { name: string; avatar: string | null }
}

const categories: Record<string, { name: string; color: string }> = {
  general: { name: 'ทั่วไป', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  service: { name: 'บริการ', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  product: { name: 'สินค้า', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  other: { name: 'อื่นๆ', color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20' },
}

function getDaysLeft(endDate: string) {
  const diff = new Date(endDate).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / 86400000))
}

export default function AdsSection() {
  const [ads, setAds] = useState<Ad[]>([])
  const [current, setCurrent] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/ads')
      .then(r => r.json())
      .then(d => {
        if (d.ads?.length > 0) {
          setAds(d.ads)
        }
      })
      .catch(() => {})
  }, [])

  const next = useCallback(() => {
    setCurrent(prev => (prev + 1) % ads.length)
  }, [ads.length])

  const prev = useCallback(() => {
    setCurrent(prev => (prev - 1 + ads.length) % ads.length)
  }, [ads.length])

  // Auto-play
  useEffect(() => {
    if (ads.length <= 1 || isHovered) return
    const interval = setInterval(next, 6000)
    return () => clearInterval(interval)
  }, [ads.length, isHovered, next])

  function handleTouchStart(e: React.TouchEvent) {
    setTouchStart(e.touches[0].clientX)
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStart === null) return
    const diff = touchStart - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0) next()
      else prev()
    }
    setTouchStart(null)
  }

  if (ads.length === 0) return null

  const ad = ads[current]
  const cat = categories[ad.category] || categories.general

  return (
    <div className="mb-5">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-gradient-to-b from-orange-400 to-amber-500" />
          <h2 className="text-sm font-bold text-white">โฆษณา</h2>
          <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-white/5 text-[10px] text-zinc-500 font-medium">
            {ads.length} รายการ
          </span>
        </div>
        <Link
          href="/ads"
          className="flex items-center gap-1 text-[11px] text-orange-400 font-medium hover:text-orange-300 transition-colors"
        >
          ดูทั้งหมด <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* Ads Carousel */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative"
      >
        <div className="relative rounded-2xl overflow-hidden border border-white/[0.06] bg-zinc-900/80 group">
          {ads.map((a, i) => (
            <div
              key={a.id}
              className="transition-all duration-500 ease-in-out"
              style={{
                opacity: i === current ? 1 : 0,
                position: i === current ? 'relative' : 'absolute',
                top: 0,
                left: 0,
                right: 0,
                pointerEvents: i === current ? 'auto' : 'none',
              }}
            >
              {/* Image */}
              {a.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={a.image}
                  alt={a.title}
                  className="w-full h-40 sm:h-48 object-cover"
                  loading={i === 0 ? 'eager' : 'lazy'}
                />
              )}

              {/* Content */}
              <div className="p-4 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-sm text-white leading-tight line-clamp-1">{a.title}</h3>
                  <span className={`shrink-0 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${cat.color}`}>
                    {cat.name}
                  </span>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">{a.description}</p>

                <div className="flex items-center gap-2 pt-1.5 border-t border-white/5">
                  <div className="flex items-center gap-1.5">
                    {a.user?.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.user.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center">
                        <UserIcon className="w-3 h-3 text-zinc-500" />
                      </div>
                    )}
                    <span className="text-[11px] text-zinc-500 font-medium">{a.user?.name}</span>
                  </div>
                  <div className="ml-auto flex items-center gap-3 text-[11px] text-zinc-600">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {a.views}</span>
                    {a.endDate && (
                      <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {getDaysLeft(a.endDate)} วัน</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-xs text-orange-400 font-medium">{a.contactInfo}</span>
                </div>
              </div>
            </div>
          ))}

          {/* Navigation Arrows */}
          {ads.length > 1 && (
            <>
              <button
                onClick={(e) => { e.preventDefault(); prev() }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100 z-10"
                aria-label="Previous ad"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.preventDefault(); next() }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100 z-10"
                aria-label="Next ad"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Dots */}
        {ads.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {ads.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`transition-all duration-300 rounded-full ${
                  i === current
                    ? 'w-6 h-1.5 bg-orange-400'
                    : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'
                }`}
                aria-label={`Go to ad ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
