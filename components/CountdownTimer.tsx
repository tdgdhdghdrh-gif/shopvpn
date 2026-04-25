'use client'

import { useState, useEffect } from 'react'

interface CountdownSettings {
  countdownEnabled?: boolean
  countdownTitle?: string | null
  countdownEndDate?: string | null
  countdownStyle?: string
  countdownBgColor?: string | null
  countdownTextColor?: string | null
  countdownExpiredText?: string
}

function pad(n: number) { return n < 10 ? `0${n}` : `${n}` }

export default function CountdownTimer() {
  const [settings, setSettings] = useState<CountdownSettings | null>(null)
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 })
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    fetch('/api/settings/public')
      .then(r => r.json())
      .then(d => { if (d.settings?.countdownEnabled) setSettings(d.settings) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!settings?.countdownEndDate) return
    const end = new Date(settings.countdownEndDate).getTime()
    const tick = () => {
      const now = Date.now()
      const diff = end - now
      if (diff <= 0) { setExpired(true); setTimeLeft({ d: 0, h: 0, m: 0, s: 0 }); return }
      setTimeLeft({
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff / (1000 * 60 * 60)) % 24),
        m: Math.floor((diff / (1000 * 60)) % 60),
        s: Math.floor((diff / 1000) % 60),
      })
    }
    tick()
    const iv = setInterval(tick, 1000)
    return () => clearInterval(iv)
  }, [settings])

  if (!settings?.countdownEnabled || !settings.countdownEndDate) return null

  const style = settings.countdownStyle || 'boxed'
  const bg = settings.countdownBgColor || undefined
  const color = settings.countdownTextColor || undefined

  if (expired) {
    return (
      <div className="w-full py-3 text-center" style={{ backgroundColor: bg || '#000' }}>
        <span className="text-sm font-bold" style={{ color: color || '#fff' }}>{settings.countdownExpiredText || 'หมดเวลาแล้ว'}</span>
      </div>
    )
  }

  const units = [
    { val: timeLeft.d, label: 'วัน' },
    { val: timeLeft.h, label: 'ชม.' },
    { val: timeLeft.m, label: 'นาที' },
    { val: timeLeft.s, label: 'วินาที' },
  ]

  if (style === 'minimal') {
    return (
      <div className="w-full py-2 text-center" style={{ backgroundColor: bg || 'transparent' }}>
        {settings.countdownTitle && <p className="text-[11px] uppercase tracking-wider mb-1 opacity-60" style={{ color: color || '#fff' }}>{settings.countdownTitle}</p>}
        <div className="flex items-center justify-center gap-1 text-sm font-bold" style={{ color: color || '#fff' }}>
          {units.map((u, i) => (
            <span key={u.label}>{pad(u.val)}{u.label}{i < 3 ? ':' : ''}</span>
          ))}
        </div>
      </div>
    )
  }

  if (style === 'large') {
    return (
      <div className="w-full py-6 text-center" style={{ backgroundColor: bg || 'transparent' }}>
        {settings.countdownTitle && <p className="text-lg font-bold mb-4" style={{ color: color || '#fff' }}>{settings.countdownTitle}</p>}
        <div className="flex items-center justify-center gap-3 sm:gap-6">
          {units.map(u => (
            <div key={u.label} className="text-center">
              <div className="text-3xl sm:text-5xl font-black tabular-nums" style={{ color: color || '#fff' }}>{pad(u.val)}</div>
              <div className="text-[10px] sm:text-xs uppercase tracking-wider mt-1 opacity-50" style={{ color: color || '#fff' }}>{u.label}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // boxed (default)
  return (
    <div className="w-full py-3 px-4" style={{ backgroundColor: bg || 'transparent' }}>
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
        {settings.countdownTitle && (
          <span className="text-xs sm:text-sm font-semibold shrink-0" style={{ color: color || '#fff' }}>{settings.countdownTitle}</span>
        )}
        <div className="flex items-center gap-2">
          {units.map(u => (
            <div key={u.label} className="flex items-baseline gap-0.5">
              <span className="text-sm sm:text-base font-bold tabular-nums min-w-[1.5ch] text-center" style={{ color: color || '#fff' }}>{pad(u.val)}</span>
              <span className="text-[10px] opacity-60" style={{ color: color || '#fff' }}>{u.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
