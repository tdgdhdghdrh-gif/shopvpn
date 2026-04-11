'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, ChevronRight, ChevronLeft } from 'lucide-react'

interface PopupData {
  id: string
  title: string
  imageUrl: string
  linkUrl: string | null
}

const COOLDOWN_KEY = 'promo_popup_closed_at'
const COOLDOWN_MS = 30 * 60 * 1000 // 30 นาที

export default function PromoPopup() {
  const [popups, setPopups] = useState<PopupData[]>([])
  const [current, setCurrent] = useState(0)
  const [visible, setVisible] = useState(false)
  const [closing, setClosing] = useState(false)
  const [slideDir, setSlideDir] = useState<'left' | 'right' | null>(null)

  useEffect(() => {
    // เช็ค cooldown 30 นาที
    try {
      const closedAt = localStorage.getItem(COOLDOWN_KEY)
      if (closedAt) {
        const elapsed = Date.now() - parseInt(closedAt)
        if (elapsed < COOLDOWN_MS) return // ยังไม่ครบ 30 นาที ไม่แสดง
      }
    } catch {}

    // ดึง popups จาก API
    fetch('/api/popups')
      .then(r => r.json())
      .then(d => {
        if (d.success && d.popups?.length > 0) {
          setPopups(d.popups)
          setVisible(true)
          // ล็อค scroll ตอนแสดง popup
          document.body.style.overflow = 'hidden'
        }
      })
      .catch(() => {})
  }, [])

  const handleClose = useCallback(() => {
    setClosing(true)
    setTimeout(() => {
      setVisible(false)
      setClosing(false)
      document.body.style.overflow = ''
      // บันทึก timestamp ที่ปิด
      try {
        localStorage.setItem(COOLDOWN_KEY, Date.now().toString())
      } catch {}
    }, 300)
  }, [])

  function handleNext() {
    if (current < popups.length - 1) {
      setSlideDir('left')
      setTimeout(() => {
        setCurrent(prev => prev + 1)
        setSlideDir(null)
      }, 200)
    } else {
      handleClose()
    }
  }

  function handlePrev() {
    if (current > 0) {
      setSlideDir('right')
      setTimeout(() => {
        setCurrent(prev => prev - 1)
        setSlideDir(null)
      }, 200)
    }
  }

  function handleImageClick() {
    const popup = popups[current]
    if (popup?.linkUrl) {
      const isExternal = popup.linkUrl.startsWith('http')
      if (isExternal) {
        window.open(popup.linkUrl, '_blank', 'noopener,noreferrer')
      } else {
        window.location.href = popup.linkUrl
      }
      handleClose()
    }
  }

  // Swipe support
  useEffect(() => {
    if (!visible || popups.length <= 1) return

    let startX = 0
    let startY = 0
    const threshold = 50

    function onTouchStart(e: TouchEvent) {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
    }
    function onTouchEnd(e: TouchEvent) {
      const dx = e.changedTouches[0].clientX - startX
      const dy = e.changedTouches[0].clientY - startY
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > threshold) {
        if (dx < 0) handleNext()
        else handlePrev()
      }
    }
    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchend', onTouchEnd)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, popups.length, current])

  // ESC key to close
  useEffect(() => {
    if (!visible) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose()
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === 'ArrowLeft') handlePrev()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, current, handleClose])

  if (!visible || popups.length === 0) return null

  const popup = popups[current]
  const isLast = current >= popups.length - 1
  const isFirst = current === 0
  const hasLink = !!popup.linkUrl
  const hasMultiple = popups.length > 1

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-opacity duration-300 ${
        closing ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={handleClose}
      />

      {/* Popup Content */}
      <div
        className={`relative w-full max-w-lg transition-all duration-300 ${
          closing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute -top-2 -right-2 z-20 w-8 h-8 bg-black/90 border border-white/20 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all shadow-2xl backdrop-blur-sm"
          aria-label="ปิด"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Image Container - responsive, no forced crop */}
        <div
          className={`rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black/50 backdrop-blur-sm ${hasLink ? 'cursor-pointer' : ''}`}
          onClick={hasLink ? handleImageClick : undefined}
        >
          <div
            className={`relative transition-all duration-200 ${
              slideDir === 'left' ? 'translate-x-[-8px] opacity-80' :
              slideDir === 'right' ? 'translate-x-[8px] opacity-80' : ''
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={popup.imageUrl}
              alt={popup.title}
              className="w-full h-auto max-h-[75vh] object-contain"
              style={{ display: 'block' }}
            />
          </div>

          {/* Link indicator overlay */}
          {hasLink && (
            <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-black/70 backdrop-blur-sm rounded-lg text-[10px] text-white/70 font-medium flex items-center gap-1.5 pointer-events-none">
              <ChevronRight className="w-3 h-3 text-pink-400" />
              แตะเพื่อเปิดลิงก์
            </div>
          )}
        </div>

        {/* Navigation arrows for multi-popup */}
        {hasMultiple && !isFirst && (
          <button
            onClick={handlePrev}
            className="absolute left-[-16px] top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-black/80 border border-white/15 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-zinc-800 transition-all shadow-lg backdrop-blur-sm"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        {hasMultiple && !isLast && (
          <button
            onClick={handleNext}
            className="absolute right-[-16px] top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-black/80 border border-white/15 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-zinc-800 transition-all shadow-lg backdrop-blur-sm"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Bottom Controls */}
        <div className="flex items-center justify-between mt-3 px-1">
          {/* Dots indicator */}
          {hasMultiple ? (
            <div className="flex items-center gap-1.5">
              {popups.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === current
                      ? 'w-6 h-2 bg-white shadow-sm shadow-white/30'
                      : 'w-2 h-2 bg-white/25 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>
          ) : (
            <div />
          )}

          {/* Counter + Close */}
          <div className="flex items-center gap-2">
            {hasMultiple && (
              <span className="text-[11px] text-zinc-500 font-medium tabular-nums">
                {current + 1}/{popups.length}
              </span>
            )}
            <button
              onClick={handleClose}
              className="px-3 py-1.5 text-zinc-500 hover:text-white text-xs font-medium transition-all rounded-lg hover:bg-white/5"
            >
              ปิด
            </button>
            {hasMultiple && (
              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-4 py-2 bg-white text-black rounded-xl text-xs font-bold hover:bg-zinc-200 transition-all active:scale-95"
              >
                {isLast ? 'ปิด' : 'ถัดไป'}
                {!isLast && <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
