'use client'

import { useState, useEffect } from 'react'

interface MarqueeSettings {
  marqueeEnabled?: boolean
  marqueeText?: string | null
  marqueeBgColor?: string
  marqueeTextColor?: string
  marqueeSpeed?: number
  marqueeLink?: string | null
}

export default function MarqueeBar() {
  const [settings, setSettings] = useState<MarqueeSettings | null>(null)

  useEffect(() => {
    fetch('/api/settings/public')
      .then(r => r.json())
      .then(d => { if (d.settings) setSettings(d.settings) })
      .catch(() => {})
  }, [])

  if (!settings?.marqueeEnabled || !settings.marqueeText) return null

  const bg = settings.marqueeBgColor || '#06b6e4'
  const color = settings.marqueeTextColor || '#ffffff'
  const speed = settings.marqueeSpeed || 20
  const link = settings.marqueeLink

  const content = (
    <div className="whitespace-nowrap flex items-center gap-8 py-2 px-4" style={{ color }}>
      <span className="text-xs sm:text-sm font-semibold tracking-wide">{settings.marqueeText}</span>
      <span className="opacity-50">•</span>
      <span className="text-xs sm:text-sm font-semibold tracking-wide">{settings.marqueeText}</span>
      <span className="opacity-50">•</span>
      <span className="text-xs sm:text-sm font-semibold tracking-wide">{settings.marqueeText}</span>
      <span className="opacity-50">•</span>
      <span className="text-xs sm:text-sm font-semibold tracking-wide">{settings.marqueeText}</span>
      <span className="opacity-50">•</span>
    </div>
  )

  return (
    <div className="w-full overflow-hidden relative z-40" style={{ backgroundColor: bg }}>
      {link ? (
        <a href={link} className="block">
          <div className="animate-marquee hover:opacity-90 transition-opacity" style={{ animationDuration: `${speed}s` }}>
            {content}
          </div>
        </a>
      ) : (
        <div className="animate-marquee" style={{ animationDuration: `${speed}s` }}>
          {content}
        </div>
      )}
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee linear infinite;
          width: max-content;
        }
      `}</style>
    </div>
  )
}
