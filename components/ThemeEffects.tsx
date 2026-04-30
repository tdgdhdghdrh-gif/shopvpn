'use client'

import { useSiteAppearance } from './SiteAppearanceProvider'
import { useEffect } from 'react'

const moodColorMap: Record<string, { primary: string; bg: string }> = {
  chill: { primary: '#3b82f6', bg: '#0f172a' },
  energy: { primary: '#f97316', bg: '#1a0f00' },
  luxury: { primary: '#eab308', bg: '#1a1500' },
  night: { primary: '#8b5cf6', bg: '#0f0518' },
  ocean: { primary: '#06b6d4', bg: '#001020' },
  forest: { primary: '#22c55e', bg: '#0a1a0a' },
  sunset: { primary: '#f43f5e', bg: '#2d1b4e' },
}

export default function ThemeEffects() {
  const { appearance } = useSiteAppearance()

  // Apply mood colors as CSS variables
  useEffect(() => {
    if (!appearance?.moodColor) {
      document.documentElement.style.removeProperty('--mood-primary')
      document.documentElement.style.removeProperty('--mood-bg')
      return
    }

    const mood = moodColorMap[appearance.moodColor]
    if (mood) {
      document.documentElement.style.setProperty('--mood-primary', mood.primary)
      document.documentElement.style.setProperty('--mood-bg', mood.bg)
    }
  }, [appearance?.moodColor])

  // Apply seasonal theme class
  useEffect(() => {
    document.body.classList.remove(
      'season-songkran', 'season-halloween', 'season-christmas',
      'season-chinese-new-year', 'season-valentine', 'season-loy-krathong', 'season-new-year'
    )
    if (appearance?.seasonalTheme) {
      document.body.classList.add(`season-${appearance.seasonalTheme}`)
    }
  }, [appearance?.seasonalTheme])

  // Theme mode (dark/light/system)
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark', 'light')

    if (appearance?.themeMode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.add(prefersDark ? 'dark' : 'light')
    } else if (appearance?.themeMode === 'light') {
      root.classList.add('light')
    } else {
      root.classList.add('dark')
    }
  }, [appearance?.themeMode])

  return null
}
