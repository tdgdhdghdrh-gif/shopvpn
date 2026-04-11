'use client'

import { useState, useEffect } from 'react'
import Onboarding from '@/components/Onboarding'

export default function OnboardingWrapper({ children }: { children: React.ReactNode }) {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkOnboarding()
  }, [])

  async function checkOnboarding() {
    try {
      const res = await fetch('/api/user/me')
      if (res.ok) {
        const data = await res.json()
        if (data.user?.showOnboarding) {
          setShowOnboarding(true)
        }
      }
    } catch (error) {
      console.error('Failed to check onboarding:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
  }

  if (loading) {
    return <>{children}</>
  }

  return (
    <>
      {children}
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
    </>
  )
}
