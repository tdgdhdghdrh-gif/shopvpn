'use client'

import { useState, useEffect } from 'react'

interface CursorSettings {
  customCursorEnabled?: boolean
  customCursorStyle?: string
  customCursorColor?: string
}

export default function CustomCursor() {
  const [settings, setSettings] = useState<CursorSettings | null>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [trails, setTrails] = useState<{ id: number; x: number; y: number }[]>([])

  // 1. Fetch settings
  useEffect(() => {
    fetch('/api/settings/public')
      .then(r => r.json())
      .then(d => { if (d.settings) setSettings(d.settings) })
      .catch(() => {})
  }, [])

  const enabled = settings?.customCursorEnabled ?? false
  const style = settings?.customCursorStyle || 'glow'
  const color = settings?.customCursorColor || '#06b6e4'

  // 2. Mouse move listener
  useEffect(() => {
    if (!enabled) return
    const onMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY })
      if (style === 'trail') {
        setTrails(prev => [...prev.slice(-8), { id: Date.now(), x: e.clientX, y: e.clientY }])
      }
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [enabled, style])

  // 3. Hide default cursor
  useEffect(() => {
    if (!enabled) return
    document.body.style.cursor = 'none'
    const links = document.querySelectorAll('a, button, [role="button"]')
    links.forEach(el => ((el as HTMLElement).style.cursor = 'none'))
    return () => {
      document.body.style.cursor = ''
      const links = document.querySelectorAll('a, button, [role="button"]')
      links.forEach(el => ((el as HTMLElement).style.cursor = ''))
    }
  }, [enabled])

  // Early return must be AFTER all hooks
  if (!enabled) return null

  if (style === 'dot') {
    return (
      <div
        className="fixed z-[9998] pointer-events-none w-2.5 h-2.5 rounded-full -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
        style={{ left: pos.x, top: pos.y, backgroundColor: color }}
      />
    )
  }

  if (style === 'trail') {
    return (
      <>
        {trails.map((t, i) => (
          <div
            key={t.id}
            className="fixed z-[9998] pointer-events-none w-2 h-2 rounded-full -translate-x-1/2 -translate-y-1/2"
            style={{
              left: t.x, top: t.y,
              backgroundColor: color,
              opacity: (i + 1) / trails.length * 0.6,
            }}
          />
        ))}
        <div
          className="fixed z-[9999] pointer-events-none w-3 h-3 rounded-full border-2 -translate-x-1/2 -translate-y-1/2"
          style={{ left: pos.x, top: pos.y, borderColor: color }}
        />
      </>
    )
  }

  // glow (default)
  return (
    <>
      <div
        className="fixed z-[9998] pointer-events-none w-8 h-8 rounded-full -translate-x-1/2 -translate-y-1/2 blur-md opacity-40 transition-all duration-100"
        style={{ left: pos.x, top: pos.y, backgroundColor: color }}
      />
      <div
        className="fixed z-[9999] pointer-events-none w-3 h-3 rounded-full border-2 -translate-x-1/2 -translate-y-1/2"
        style={{ left: pos.x, top: pos.y, borderColor: color, backgroundColor: `${color}40` }}
      />
    </>
  )
}
