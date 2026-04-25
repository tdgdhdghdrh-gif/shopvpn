'use client'

import { useState, useEffect } from 'react'
import { X, Bell } from 'lucide-react'

interface TopBarSettings {
  topBarEnabled?: boolean
  topBarText?: string | null
  topBarBgColor?: string
  topBarTextColor?: string
  topBarLink?: string | null
  topBarDismissible?: boolean
}

export default function TopNotificationBar() {
  const [settings, setSettings] = useState<TopBarSettings | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('topbar-dismissed')) {
      setDismissed(true)
    }
    fetch('/api/settings/public')
      .then(r => r.json())
      .then(d => { if (d.settings) setSettings(d.settings) })
      .catch(() => {})
  }, [])

  if (!settings?.topBarEnabled || !settings.topBarText || dismissed) return null

  const bg = settings.topBarBgColor || '#ef4444'
  const color = settings.topBarTextColor || '#ffffff'
  const link = settings.topBarLink
  const dismissible = settings.topBarDismissible ?? true

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setDismissed(true)
    if (dismissible) localStorage.setItem('topbar-dismissed', '1')
  }

  const content = (
    <div className="flex items-center justify-center gap-2 px-4 py-2 text-center relative">
      <Bell className="w-3.5 h-3.5 shrink-0 opacity-80" style={{ color }} />
      <span className="text-xs sm:text-sm font-medium" style={{ color }}>{settings.topBarText}</span>
      {dismissible && (
        <button onClick={handleDismiss} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-white/10 transition-colors opacity-70 hover:opacity-100">
          <X className="w-3.5 h-3.5" style={{ color }} />
        </button>
      )}
    </div>
  )

  return (
    <div className="w-full relative z-50" style={{ backgroundColor: bg }}>
      {link ? (
        <a href={link} className="block hover:opacity-90 transition-opacity">
          {content}
        </a>
      ) : (
        content
      )}
    </div>
  )
}
