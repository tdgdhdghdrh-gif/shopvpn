'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface Appearance {
  themeMode: string
  seasonalTheme: string | null
  moodColor: string | null
  customPrimaryColor: string | null
  customBgColor: string | null
  enableParticles: boolean
  particleType: string | null
  enableConfetti: boolean
}

interface AppearanceContextType {
  appearance: Appearance | null
  loading: boolean
}

const defaultAppearance: Appearance = {
  themeMode: 'dark',
  seasonalTheme: null,
  moodColor: null,
  customPrimaryColor: null,
  customBgColor: null,
  enableParticles: false,
  particleType: null,
  enableConfetti: false,
}

const AppearanceContext = createContext<AppearanceContextType>({
  appearance: defaultAppearance,
  loading: true,
})

export function useSiteAppearance() {
  return useContext(AppearanceContext)
}

export function SiteAppearanceProvider({ children }: { children: ReactNode }) {
  const [appearance, setAppearance] = useState<Appearance | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/site-appearance')
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setAppearance(d.appearance)
        }
      })
      .catch(() => {
        // Use default on error
        setAppearance(defaultAppearance)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <AppearanceContext.Provider value={{ appearance: appearance || defaultAppearance, loading }}>
      {children}
    </AppearanceContext.Provider>
  )
}
