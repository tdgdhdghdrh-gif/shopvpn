'use client'

import { useEffect } from 'react'

export default function GlobalError() {
  useEffect(() => {
    // Auto reload immediately on any error
    window.location.reload()
  }, [])

  return null
}
