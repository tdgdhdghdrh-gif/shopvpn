'use client'

import { useEffect, useState, useRef, useCallback } from 'react'

interface FloatingMessage {
  id: number
  text: string
  top: number
  duration: number
}

export default function FloatingTextEffect() {
  const [messages, setMessages] = useState<FloatingMessage[]>([])
  const [settings, setSettings] = useState<any>(null)
  const [enabled, setEnabled] = useState(false)
  const messagePoolRef = useRef<string[]>([])
  const idCounterRef = useRef(0)

  useEffect(() => {
    fetch('/api/floating-texts')
      .then(r => r.json())
      .then(d => {
        if (d.success && d.settings?.enabled) {
          setSettings(d.settings)
          setEnabled(true)
          messagePoolRef.current = d.messages || []
        }
      })
      .catch(() => {})
  }, [])

  const createMessage = useCallback(() => {
    if (messagePoolRef.current.length === 0 || !settings) return

    const text = messagePoolRef.current[Math.floor(Math.random() * messagePoolRef.current.length)]
    const id = idCounterRef.current++

    // Position based on settings
    let minTop = 0
    let maxTop = 90
    if (settings.position === 'top-half') {
      maxTop = 45
    } else if (settings.position === 'bottom-half') {
      minTop = 45
    }

    const top = minTop + Math.random() * (maxTop - minTop)
    const duration = settings.minDuration + Math.random() * (settings.maxDuration - settings.minDuration)

    const newMsg: FloatingMessage = { id, text, top, duration }
    setMessages(prev => [...prev, newMsg])

    // Remove after animation
    setTimeout(() => {
      setMessages(prev => prev.filter(m => m.id !== id))
    }, duration * 1000)
  }, [settings])

  useEffect(() => {
    if (!enabled || !settings) return

    const interval = setInterval(createMessage, settings.interval)
    // Create first one immediately
    createMessage()

    return () => clearInterval(interval)
  }, [enabled, settings, createMessage])

  if (!enabled || !settings) return null

  return (
    <div className="fixed inset-0 z-[90] pointer-events-none overflow-hidden">
      {messages.map(msg => (
        <div
          key={msg.id}
          className="absolute whitespace-nowrap font-bold"
          style={{
            top: `${msg.top}vh`,
            left: '-100%',
            fontSize: settings.fontSize,
            color: settings.textColor,
            textShadow: `0 0 10px ${settings.glowColor}`,
            animation: `floatingMove ${msg.duration}s linear forwards`,
          }}
        >
          {msg.text}
        </div>
      ))}

      <style jsx global>{`
        @keyframes floatingMove {
          from {
            transform: translateX(0);
            left: -100%;
          }
          to {
            transform: translateX(calc(100vw + 100%));
            left: 0;
          }
        }
      `}</style>
    </div>
  )
}
