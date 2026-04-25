'use client'

import { useState, useEffect } from 'react'

interface PreloaderSettings {
  preloaderEnabled?: boolean
  preloaderLogo?: string | null
  preloaderBgColor?: string
  preloaderText?: string | null
  preloaderAnimation?: string
  preloaderDuration?: number
  preloaderSkippable?: boolean
  siteName?: string
  siteLogo?: string | null
}

export default function Preloader() {
  const [settings, setSettings] = useState<PreloaderSettings | null>(null)
  const [visible, setVisible] = useState(true)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    // Check if already seen in this session
    if (sessionStorage.getItem('preloader-seen')) {
      setVisible(false)
      return
    }
    fetch('/api/settings/public')
      .then(r => r.json())
      .then(d => {
        if (d.settings?.preloaderEnabled) {
          setSettings(d.settings)
          const dur = d.settings.preloaderDuration || 2000
          const timer = setTimeout(() => {
            setFading(true)
            setTimeout(() => {
              setVisible(false)
              sessionStorage.setItem('preloader-seen', '1')
            }, 600)
          }, dur)
          return () => clearTimeout(timer)
        } else {
          setVisible(false)
        }
      })
      .catch(() => setVisible(false))
  }, [])

  if (!visible || !settings?.preloaderEnabled) return null

  const bg = settings.preloaderBgColor || '#000000'
  const logo = settings.preloaderLogo || settings.siteLogo || null
  const text = settings.preloaderText || settings.siteName || ''
  const anim = settings.preloaderAnimation || 'spin'
  const skippable = settings.preloaderSkippable ?? true

  const animClass =
    anim === 'pulse' ? 'animate-pulse' :
    anim === 'bounce' ? 'animate-bounce' :
    anim === 'none' ? '' : 'animate-spin'

  const handleSkip = () => {
    if (!skippable) return
    setFading(true)
    setTimeout(() => {
      setVisible(false)
      sessionStorage.setItem('preloader-seen', '1')
    }, 600)
  }

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-600 ${fading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      style={{ backgroundColor: bg }}
      onClick={handleSkip}
    >
      {logo ? (
        <img src={logo} alt="logo" className={`w-20 h-20 sm:w-24 sm:h-24 object-contain mb-6 ${animClass}`} style={{ animationDuration: anim === 'spin' ? '1.5s' : undefined }} />
      ) : (
        <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-6 ${animClass}`} style={{ animationDuration: anim === 'spin' ? '1.5s' : undefined }}>
          <span className="text-3xl font-black text-white">V</span>
        </div>
      )}
      {text && <p className="text-white/80 text-sm font-medium tracking-wide">{text}</p>}
      {skippable && (
        <p className="absolute bottom-8 text-white/30 text-[10px] uppercase tracking-widest">แตะเพื่อข้าม</p>
      )}

      <style jsx>{`
        .duration-600 { transition-duration: 600ms; }
      `}</style>
    </div>
  )
}
