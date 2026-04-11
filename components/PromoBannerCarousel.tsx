'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Banner {
  id: string
  title: string
  imageUrl: string
  linkUrl: string | null
  aspectRatio?: string
  overlayTitle?: string | null
  overlaySubtitle?: string | null
  buttonText?: string | null
  buttonLink?: string | null
}

function getAspectCss(ratio?: string): string {
  const map: Record<string, string> = {
    '16:9': '16/9',
    '3:2': '3/2',
    '4:3': '4/3',
    '21:9': '21/9',
    '1:1': '1/1',
  }
  return map[ratio || '16:9'] || '16/9'
}

function SmartLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  const isExternal = href.startsWith('http')
  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    )
  }
  return <Link href={href} className={className}>{children}</Link>
}

export default function PromoBannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [current, setCurrent] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/banners')
      .then(r => r.json())
      .then(d => {
        if (d.success && d.banners?.length > 0) {
          setBanners(d.banners)
        }
      })
      .catch(() => {})
  }, [])

  // Auto-play carousel
  const next = useCallback(() => {
    setCurrent(prev => (prev + 1) % banners.length)
  }, [banners.length])

  const prev = useCallback(() => {
    setCurrent(prev => (prev - 1 + banners.length) % banners.length)
  }, [banners.length])

  useEffect(() => {
    if (banners.length <= 1 || isHovered) return
    const interval = setInterval(next, 5000)
    return () => clearInterval(interval)
  }, [banners.length, isHovered, next])

  // Touch/swipe support
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

  if (banners.length === 0) return null

  const banner = banners[current]
  const hasOverlay = banner.overlayTitle || banner.overlaySubtitle || banner.buttonText

  // Determine CTA link: buttonLink > linkUrl
  const ctaLink = banner.buttonLink || banner.linkUrl || null

  return (
    <div
      className="mb-5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 group">
        {/* Banner Image */}
        <div style={{ aspectRatio: getAspectCss(banner.aspectRatio), transition: 'aspect-ratio 0.5s ease' }} className="relative">
          {banners.map((b, i) => {
            const bHasOverlay = b.overlayTitle || b.overlaySubtitle || b.buttonText
            const bCtaLink = b.buttonLink || b.linkUrl || null

            return (
              <div
                key={b.id}
                className="absolute inset-0 transition-opacity duration-700 ease-in-out"
                style={{ opacity: i === current ? 1 : 0, pointerEvents: i === current ? 'auto' : 'none' }}
              >
                {/* Image — if no overlay, wrap entire image with linkUrl */}
                {!bHasOverlay && b.linkUrl ? (
                  <SmartLink href={b.linkUrl} className="block w-full h-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={b.imageUrl}
                      alt={b.title}
                      className="w-full h-full object-cover"
                      loading={i === 0 ? 'eager' : 'lazy'}
                    />
                  </SmartLink>
                ) : (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={b.imageUrl}
                      alt={b.title}
                      className="w-full h-full object-cover"
                      loading={i === 0 ? 'eager' : 'lazy'}
                    />
                  </>
                )}

                {/* Overlay gradient + content */}
                {bHasOverlay && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none">
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 pb-10 sm:pb-12 pointer-events-auto">
                      {b.overlayTitle && (
                        <h3 className="text-lg sm:text-2xl md:text-3xl font-black text-white drop-shadow-lg leading-tight mb-1 sm:mb-2">
                          {b.overlayTitle}
                        </h3>
                      )}
                      {b.overlaySubtitle && (
                        <p className="text-xs sm:text-sm md:text-base text-white/80 drop-shadow-md mb-3 sm:mb-4 line-clamp-2 max-w-lg">
                          {b.overlaySubtitle}
                        </p>
                      )}
                      {b.buttonText && bCtaLink && (
                        <SmartLink
                          href={bCtaLink}
                          className="inline-flex items-center gap-1.5 px-5 py-2 sm:px-6 sm:py-2.5 bg-blue-500 hover:bg-blue-400 text-white rounded-full text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95"
                        >
                          {b.buttonText}
                        </SmartLink>
                      )}
                      {b.buttonText && !bCtaLink && (
                        <span className="inline-flex items-center gap-1.5 px-5 py-2 sm:px-6 sm:py-2.5 bg-blue-500 text-white rounded-full text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/30">
                          {b.buttonText}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {/* Bottom gradient for dots/counter visibility (always show when multiple banners) */}
          {banners.length > 1 && !hasOverlay && (
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
          )}
        </div>

        {/* Navigation Arrows */}
        {banners.length > 1 && (
          <>
            <button
              onClick={(e) => { e.preventDefault(); prev() }}
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-black/40 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100 z-10"
              aria-label="Previous banner"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); next() }}
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-black/40 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100 z-10"
              aria-label="Next banner"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </>
        )}

        {/* Bottom bar: Dots + Slide Counter */}
        {banners.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center z-10 px-4">
            {/* Dots */}
            <div className="flex items-center gap-1.5">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`transition-all duration-300 rounded-full ${
                    i === current
                      ? 'w-6 h-1.5 bg-blue-400'
                      : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/60'
                  }`}
                  aria-label={`Go to banner ${i + 1}`}
                />
              ))}
            </div>

            {/* Slide Counter */}
            <div className="absolute right-4 bottom-0 text-xs sm:text-sm font-bold text-white/70 tabular-nums">
              {current + 1} / {banners.length}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
