'use client'

import { useEffect, useState } from 'react'
import { MessageCircle, Phone, Headphones, ShoppingCart, HelpCircle, ExternalLink } from 'lucide-react'

interface FloatingBtnSettings {
  floatingButtonEnabled: boolean
  floatingButtonIcon: string | null
  floatingButtonUrl: string | null
  floatingButtonColor: string | null
  floatingButtonPosition: string | null
  floatingButtonText: string | null
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  MessageCircle,
  Phone,
  Headphones,
  ShoppingCart,
  HelpCircle,
  ExternalLink,
  MessageCircleIcon: MessageCircle,
}

export default function FloatingButton() {
  const [settings, setSettings] = useState<FloatingBtnSettings | null>(null)

  useEffect(() => {
    fetch('/api/settings/public')
      .then(res => res.json())
      .then(data => {
        if (data.settings) setSettings(data.settings)
      })
      .catch(() => {})
  }, [])

  if (!settings?.floatingButtonEnabled || !settings?.floatingButtonUrl) return null

  const Icon = settings.floatingButtonIcon
    ? iconMap[settings.floatingButtonIcon] || MessageCircle
    : MessageCircle

  const color = settings.floatingButtonColor || '#06b6e4'
  const position = settings.floatingButtonPosition || 'bottom-right'
  const text = settings.floatingButtonText || 'ติดต่อเรา'

  const posClass = position === 'bottom-left' ? 'left-4 bottom-4' : 'right-4 bottom-4'

  return (
    <div className={`fixed z-50 ${posClass}`}>
      <a
        href={settings.floatingButtonUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-3"
        style={{ '--btn-color': color } as React.CSSProperties}
      >
        {/* Label */}
        {text && (
          <span className="bg-zinc-900/90 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-xl shadow-lg border border-white/10 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-200 pointer-events-none whitespace-nowrap">
            {text}
          </span>
        )}

        {/* Button */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all active:scale-95 relative"
          style={{ backgroundColor: color }}
        >
          <div className="absolute inset-0 rounded-2xl opacity-30" style={{ backgroundColor: color, filter: 'blur(12px)' }} />
          <Icon className="w-6 h-6 text-white relative z-10" />
        </div>
      </a>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        div[style*="--btn-color"] > a > div:last-child {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
