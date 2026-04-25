'use client'

import { useState, useEffect } from 'react'
import { ArrowUp, ChevronUp } from 'lucide-react'

interface BackToTopSettings {
  backToTopEnabled?: boolean
  backToTopStyle?: string
  backToTopColor?: string
  backToTopPosition?: string
}

export default function BackToTop() {
  const [settings, setSettings] = useState<BackToTopSettings | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    fetch('/api/settings/public')
      .then(r => r.json())
      .then(d => { if (d.settings) setSettings(d.settings) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!settings?.backToTopEnabled || !visible) return null

  const style = settings.backToTopStyle || 'circle'
  const color = settings.backToTopColor || '#06b6e4'
  const pos = settings.backToTopPosition || 'bottom-right'
  const isLeft = pos === 'bottom-left'

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const baseClasses = `fixed z-40 flex items-center justify-center shadow-lg hover:shadow-xl transition-all active:scale-95 hover:-translate-y-0.5`
  const posClasses = isLeft ? 'left-4 bottom-20' : 'right-4 bottom-20'

  if (style === 'pill') {
    return (
      <button
        onClick={handleClick}
        className={`${baseClasses} ${posClasses} gap-1.5 px-4 py-2.5 rounded-full text-white text-xs font-bold`}
        style={{ backgroundColor: color }}
      >
        <ArrowUp className="w-3.5 h-3.5" />
        ขึ้นบน
      </button>
    )
  }

  if (style === 'arrow') {
    return (
      <button
        onClick={handleClick}
        className={`${baseClasses} ${posClasses} w-10 h-10 rounded-xl bg-zinc-900/80 backdrop-blur-sm border border-white/10 hover:border-white/20`}
        style={{ color }}
      >
        <ChevronUp className="w-5 h-5" />
      </button>
    )
  }

  // circle (default)
  return (
    <button
      onClick={handleClick}
      className={`${baseClasses} ${posClasses} w-12 h-12 rounded-full text-white`}
      style={{ backgroundColor: color }}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  )
}
