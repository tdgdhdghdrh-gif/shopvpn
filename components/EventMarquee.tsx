'use client'

import { useState, useEffect } from 'react'
import { Megaphone, Clock, Percent } from 'lucide-react'

interface ActiveEvent {
  id: string
  name: string
  description: string | null
  marqueeText: string
  discountPercent: number
  minimumDays: number
  endDate: string
}

function getTimeLeft(endDate: string) {
  const diff = new Date(endDate).getTime() - Date.now()
  if (diff <= 0) return null
  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (d > 0) return `${d} วัน ${h} ชม.`
  if (h > 0) return `${h} ชม. ${m} นาที`
  return `${m} นาที`
}

export default function EventMarquee() {
  const [event, setEvent] = useState<ActiveEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState<string | null>(null)

  useEffect(() => {
    async function fetchActiveEvent() {
      try {
        const res = await fetch('/api/events/active')
        const data = await res.json()
        if (data.success && data.event) {
          setEvent(data.event)
          setTimeLeft(getTimeLeft(data.event.endDate))
        }
      } catch (error) {
        console.error('Fetch event error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActiveEvent()
    const interval = setInterval(fetchActiveEvent, 60000)
    return () => clearInterval(interval)
  }, [])

  // Countdown timer
  useEffect(() => {
    if (!event) return
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(event.endDate))
    }, 60000)
    return () => clearInterval(timer)
  }, [event])

  if (loading || !event) return null

  const displayText = event.marqueeText
    .replace('{percent}', event.discountPercent.toString())
    .replace('{minimumDays}', event.minimumDays.toString())

  return (
    <div className="relative overflow-hidden border-b border-white/[0.04]">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-rose-500/[0.07] via-amber-500/[0.05] to-rose-500/[0.07] animate-gradient-shift" style={{ backgroundSize: '200% 100%' }} />
      {/* Top shine line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose-500/30 to-transparent" />

      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-16 bg-gradient-to-r from-[#030303] to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-16 bg-gradient-to-l from-[#030303] to-transparent z-10" />
      
      <div className="flex items-center py-2.5 px-2 sm:px-4 gap-2">
        {/* Left icon */}
        <div className="shrink-0 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
          <Megaphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" />
        </div>
        
        {/* Marquee area */}
        <div className="overflow-hidden flex-1 min-w-0">
          <div className="whitespace-nowrap event-marquee-scroll">
            {[0, 1, 2].map((i) => (
              <span key={i} className="inline-flex items-center text-sm">
                <span className="font-medium text-zinc-200">{displayText}</span>
                <span className="mx-6 sm:mx-10 text-rose-500/40">|</span>
              </span>
            ))}
          </div>
        </div>
        
        {/* Right badges */}
        <div className="shrink-0 z-20 flex items-center gap-1.5">
          {/* Discount badge */}
          <div className="hidden sm:flex items-center gap-1 text-[10px] font-bold bg-rose-500/15 text-rose-400 px-2.5 py-1 rounded-lg border border-rose-500/20">
            <Percent className="w-3 h-3" />
            -{event.discountPercent}%
          </div>
          {/* Countdown badge */}
          {timeLeft && (
            <div className="flex items-center gap-1 text-[10px] font-medium bg-amber-500/10 text-amber-400 px-2 py-1 rounded-lg border border-amber-500/15">
              <Clock className="w-3 h-3" />
              <span className="hidden sm:inline">เหลือ </span>{timeLeft}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes event-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .event-marquee-scroll {
          animation: event-marquee 18s linear infinite;
        }
      `}</style>
    </div>
  )
}
