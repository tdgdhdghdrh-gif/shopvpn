'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

// Theme CSS variable definitions
const themeDefinitions: Record<string, Record<string, string>> = {
  // ====== Classic Themes ======
  cyber: {
    '--theme-bg': '#000000',
    '--theme-card': '#18181b',
    '--theme-card-hover': '#27272a',
    '--theme-accent': '#3b82f6',
    '--theme-accent-hover': '#2563eb',
    '--theme-accent-light': 'rgba(59,130,246,0.1)',
    '--theme-text': '#ffffff',
    '--theme-text-muted': '#a1a1aa',
    '--theme-text-dim': '#71717a',
    '--theme-border': '#27272a',
    '--theme-nav-bg': '#000000',
    '--theme-nav-border': '#27272a',
  },
  midnight: {
    '--theme-bg': '#0f172a',
    '--theme-card': '#1e293b',
    '--theme-card-hover': '#334155',
    '--theme-accent': '#6366f1',
    '--theme-accent-hover': '#4f46e5',
    '--theme-accent-light': 'rgba(99,102,241,0.1)',
    '--theme-text': '#e2e8f0',
    '--theme-text-muted': '#94a3b8',
    '--theme-text-dim': '#64748b',
    '--theme-border': '#334155',
    '--theme-nav-bg': '#0f172a',
    '--theme-nav-border': '#334155',
  },
  emerald: {
    '--theme-bg': '#022c22',
    '--theme-card': '#064e3b',
    '--theme-card-hover': '#065f46',
    '--theme-accent': '#10b981',
    '--theme-accent-hover': '#059669',
    '--theme-accent-light': 'rgba(16,185,129,0.1)',
    '--theme-text': '#d1fae5',
    '--theme-text-muted': '#6ee7b7',
    '--theme-text-dim': '#34d399',
    '--theme-border': '#065f46',
    '--theme-nav-bg': '#022c22',
    '--theme-nav-border': '#065f46',
  },
  rose: {
    '--theme-bg': '#1c1017',
    '--theme-card': '#2d1a24',
    '--theme-card-hover': '#3d1f2e',
    '--theme-accent': '#f43f5e',
    '--theme-accent-hover': '#e11d48',
    '--theme-accent-light': 'rgba(244,63,94,0.1)',
    '--theme-text': '#ffe4e6',
    '--theme-text-muted': '#fda4af',
    '--theme-text-dim': '#fb7185',
    '--theme-border': '#3d1f2e',
    '--theme-nav-bg': '#1c1017',
    '--theme-nav-border': '#3d1f2e',
  },
  amber: {
    '--theme-bg': '#1a1505',
    '--theme-card': '#292211',
    '--theme-card-hover': '#3d3419',
    '--theme-accent': '#f59e0b',
    '--theme-accent-hover': '#d97706',
    '--theme-accent-light': 'rgba(245,158,11,0.1)',
    '--theme-text': '#fef3c7',
    '--theme-text-muted': '#fcd34d',
    '--theme-text-dim': '#fbbf24',
    '--theme-border': '#3d3419',
    '--theme-nav-bg': '#1a1505',
    '--theme-nav-border': '#3d3419',
  },
  purple: {
    '--theme-bg': '#1a0f2e',
    '--theme-card': '#2e1065',
    '--theme-card-hover': '#3b1d70',
    '--theme-accent': '#a855f7',
    '--theme-accent-hover': '#9333ea',
    '--theme-accent-light': 'rgba(168,85,247,0.1)',
    '--theme-text': '#f3e8ff',
    '--theme-text-muted': '#d8b4fe',
    '--theme-text-dim': '#c084fc',
    '--theme-border': '#3b1d70',
    '--theme-nav-bg': '#1a0f2e',
    '--theme-nav-border': '#3b1d70',
  },
  // ====== Spectacular Themes ======
  neonTokyo: {
    '--theme-bg': '#0a0a0f',
    '--theme-card': '#12111a',
    '--theme-card-hover': '#1c1a29',
    '--theme-accent': '#ff2d95',
    '--theme-accent-hover': '#e6006e',
    '--theme-accent-light': 'rgba(255,45,149,0.12)',
    '--theme-text': '#f0e6ff',
    '--theme-text-muted': '#b49fdb',
    '--theme-text-dim': '#7c6a9e',
    '--theme-border': '#2a1f3d',
    '--theme-nav-bg': '#08080d',
    '--theme-nav-border': '#ff2d9520',
  },
  oceanAbyss: {
    '--theme-bg': '#020b18',
    '--theme-card': '#071a2e',
    '--theme-card-hover': '#0c2845',
    '--theme-accent': '#00d4ff',
    '--theme-accent-hover': '#00b8e6',
    '--theme-accent-light': 'rgba(0,212,255,0.1)',
    '--theme-text': '#e0f4ff',
    '--theme-text-muted': '#7ec8e3',
    '--theme-text-dim': '#4a9aba',
    '--theme-border': '#0d3355',
    '--theme-nav-bg': '#010814',
    '--theme-nav-border': '#00d4ff18',
  },
  inferno: {
    '--theme-bg': '#0f0503',
    '--theme-card': '#1f0c06',
    '--theme-card-hover': '#2e150b',
    '--theme-accent': '#ff5722',
    '--theme-accent-hover': '#f4511e',
    '--theme-accent-light': 'rgba(255,87,34,0.12)',
    '--theme-text': '#fff3e0',
    '--theme-text-muted': '#ffab91',
    '--theme-text-dim': '#bf6040',
    '--theme-border': '#3d1a0a',
    '--theme-nav-bg': '#0c0402',
    '--theme-nav-border': '#ff572218',
  },
  aurora: {
    '--theme-bg': '#040d15',
    '--theme-card': '#091a25',
    '--theme-card-hover': '#0f2938',
    '--theme-accent': '#00e5a0',
    '--theme-accent-hover': '#00cc8e',
    '--theme-accent-light': 'rgba(0,229,160,0.1)',
    '--theme-text': '#e0fff5',
    '--theme-text-muted': '#80dbb5',
    '--theme-text-dim': '#4db892',
    '--theme-border': '#0f3a2e',
    '--theme-nav-bg': '#030a10',
    '--theme-nav-border': '#00e5a018',
  },
  // ====== Light Themes ======
  cleanWhite: {
    '--theme-bg': '#f8fafc',
    '--theme-card': '#ffffff',
    '--theme-card-hover': '#f1f5f9',
    '--theme-accent': '#3b82f6',
    '--theme-accent-hover': '#2563eb',
    '--theme-accent-light': 'rgba(59,130,246,0.1)',
    '--theme-text': '#0f172a',
    '--theme-text-muted': '#475569',
    '--theme-text-dim': '#94a3b8',
    '--theme-border': '#e2e8f0',
    '--theme-nav-bg': '#ffffff',
    '--theme-nav-border': '#e2e8f0',
  },
  softGray: {
    '--theme-bg': '#f1f5f9',
    '--theme-card': '#e2e8f0',
    '--theme-card-hover': '#cbd5e1',
    '--theme-accent': '#6366f1',
    '--theme-accent-hover': '#4f46e5',
    '--theme-accent-light': 'rgba(99,102,241,0.1)',
    '--theme-text': '#1e293b',
    '--theme-text-muted': '#475569',
    '--theme-text-dim': '#94a3b8',
    '--theme-border': '#cbd5e1',
    '--theme-nav-bg': '#e2e8f0',
    '--theme-nav-border': '#cbd5e1',
  },
}

// Theme UI Config type (from admin Theme Editor)
interface ThemeUIConfig {
  borderRadius: number
  borderWidth: number
  cardOpacity: number
  backdropBlur: number
  accentColor: string
  useCustomAccent: boolean
  textBrightness: number
  colorIntensity: number
  navbarBlur: number
  navbarOpacity: number
  backgroundColor: string
  useCustomBg: boolean
}

const defaultThemeUIConfig: ThemeUIConfig = {
  borderRadius: 16,
  borderWidth: 1,
  cardOpacity: 100,
  backdropBlur: 0,
  accentColor: '#3b82f6',
  useCustomAccent: false,
  textBrightness: 100,
  colorIntensity: 100,
  navbarBlur: 12,
  navbarOpacity: 90,
  backgroundColor: '#000000',
  useCustomBg: false,
}

interface SiteSettings {
  siteName: string
  siteLogo: string
  appLogo: string
  backgroundImage: string
  backgroundOpacity: number
  theme: string
  webEffect: string
  webEffectCustomHtml: string
  themeConfig: ThemeUIConfig
  defaultHomePage: string
  menuClickEffect: string
}

interface SettingsContextType {
  settings: SiteSettings
  loading: boolean
  refetch: () => void
}

const defaultSettings: SiteSettings = {
  siteName: '',
  siteLogo: '',
  appLogo: '',
  backgroundImage: '',
  backgroundOpacity: 30,
  theme: 'cyber',
  webEffect: 'none',
  webEffectCustomHtml: '',
  themeConfig: defaultThemeUIConfig,
  defaultHomePage: '/',
  menuClickEffect: 'none',
}

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  loading: true,
  refetch: () => {},
})

export function useSettings() {
  return useContext(SettingsContext)
}

function applyTheme(themeId: string, uiConfig?: ThemeUIConfig) {
  const vars = themeDefinitions[themeId] || themeDefinitions.cyber
  const root = document.documentElement
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })
  // Set data-theme attribute for potential CSS selectors
  root.setAttribute('data-theme', themeId)

  // Light theme handling
  const isLight = ['cleanWhite', 'softGray'].includes(themeId)
  if (isLight) {
    root.classList.remove('dark')
    root.classList.add('light')
    root.style.setProperty('color-scheme', 'light')
    root.style.backgroundColor = vars['--theme-bg']
    document.body.style.backgroundColor = vars['--theme-bg']
    document.body.style.color = vars['--theme-text']
  } else {
    root.classList.remove('light')
    root.classList.add('dark')
    root.style.setProperty('color-scheme', 'dark')
    root.style.backgroundColor = vars['--theme-bg']
    document.body.style.backgroundColor = vars['--theme-bg']
    document.body.style.color = vars['--theme-text']
  }

  // Apply UI theme config as CSS custom properties
  const cfg = uiConfig || defaultThemeUIConfig
  root.style.setProperty('--ui-border-radius', `${cfg.borderRadius}px`)
  root.style.setProperty('--ui-border-width', `${cfg.borderWidth}px`)
  root.style.setProperty('--ui-card-opacity', `${cfg.cardOpacity / 100}`)
  root.style.setProperty('--ui-backdrop-blur', `${cfg.backdropBlur}px`)
  root.style.setProperty('--ui-text-brightness', `${cfg.textBrightness / 100}`)
  root.style.setProperty('--ui-color-intensity', `${cfg.colorIntensity / 100}`)
  root.style.setProperty('--ui-navbar-blur', `${cfg.navbarBlur}px`)
  root.style.setProperty('--ui-navbar-opacity', `${cfg.navbarOpacity / 100}`)

  // Custom accent color override
  if (cfg.useCustomAccent && cfg.accentColor) {
    root.style.setProperty('--theme-accent', cfg.accentColor)
    // Calculate hover (darken by 15%)
    const hex = cfg.accentColor
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    const dr = Math.round(r * 0.85), dg = Math.round(g * 0.85), db = Math.round(b * 0.85)
    root.style.setProperty('--theme-accent-hover', `#${dr.toString(16).padStart(2,'0')}${dg.toString(16).padStart(2,'0')}${db.toString(16).padStart(2,'0')}`)
    root.style.setProperty('--theme-accent-light', `rgba(${r},${g},${b},0.1)`)
  }

  // Custom background color override
  if (cfg.useCustomBg && cfg.backgroundColor) {
    root.style.setProperty('--theme-bg', cfg.backgroundColor)
    root.style.setProperty('--theme-nav-bg', cfg.backgroundColor)
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)

  async function fetchSettings() {
    try {
      const res = await fetch('/api/settings/public')
      const data = await res.json()
      if (data.settings) {
        const tc = data.settings.themeConfig
          ? { ...defaultThemeUIConfig, ...(data.settings.themeConfig as object) }
          : defaultThemeUIConfig
        const s: SiteSettings = {
          siteName: data.settings.siteName || defaultSettings.siteName,
          siteLogo: data.settings.siteLogo || defaultSettings.siteLogo,
          appLogo: data.settings.appLogo || defaultSettings.appLogo,
          backgroundImage: data.settings.backgroundImage || defaultSettings.backgroundImage,
          backgroundOpacity: data.settings.backgroundOpacity ?? defaultSettings.backgroundOpacity,
          theme: data.settings.theme || defaultSettings.theme,
          webEffect: data.settings.webEffect || defaultSettings.webEffect,
          webEffectCustomHtml: data.settings.webEffectCustomHtml || '',
          themeConfig: tc,
          defaultHomePage: data.settings.defaultHomePage || defaultSettings.defaultHomePage,
          menuClickEffect: data.settings.menuClickEffect || defaultSettings.menuClickEffect,
        }
        setSettings(s)
        applyTheme(s.theme, s.themeConfig)
      }
    } catch {
      // silently use defaults
      applyTheme(defaultSettings.theme, defaultThemeUIConfig)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Apply default theme immediately to prevent flash
    applyTheme(defaultSettings.theme, defaultThemeUIConfig)
    fetchSettings()
  }, [])

  // ซ่อน content จนกว่า settings จะโหลดเสร็จ ป้องกันการกระพริบชื่อ/โลโก้/พื้นหลังเดิม
  if (loading) {
    return (
      <SettingsContext.Provider value={{ settings, loading, refetch: fetchSettings }}>
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'var(--theme-bg, #000)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            width: 32,
            height: 32,
            border: '3px solid var(--theme-border, rgba(255,255,255,0.1))',
            borderTopColor: 'var(--theme-text-dim, rgba(255,255,255,0.5))',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </SettingsContext.Provider>
    )
  }

  return (
    <SettingsContext.Provider value={{ settings, loading, refetch: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}
