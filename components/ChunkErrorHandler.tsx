'use client'

import { useEffect } from 'react'

/**
 * Catches ChunkLoadError / dynamic import failures at the window level
 * and auto-reloads the page once so users get the latest build.
 *
 * Uses sessionStorage to prevent infinite reload loops.
 */
export default function ChunkErrorHandler() {
  useEffect(() => {
    const RELOAD_KEY = '__chunk_error_reload'

    function isChunkError(message: string): boolean {
      const patterns = [
        'Loading chunk',
        'ChunkLoadError',
        'Failed to load chunk',
        'Failed to fetch dynamically imported module',
        'error loading dynamically imported module',
      ]
      return patterns.some((p) => message.toLowerCase().includes(p.toLowerCase()))
    }

    function handleError(event: ErrorEvent) {
      if (isChunkError(event.message || '')) {
        tryReload()
      }
    }

    function handleRejection(event: PromiseRejectionEvent) {
      const message =
        event.reason?.message || event.reason?.toString() || ''
      if (isChunkError(message)) {
        tryReload()
      }
    }

    function tryReload() {
      const alreadyReloaded = sessionStorage.getItem(RELOAD_KEY)
      if (!alreadyReloaded) {
        sessionStorage.setItem(RELOAD_KEY, '1')
        window.location.reload()
      }
    }

    // Clear the flag on successful page load so future deploys can trigger a reload again
    sessionStorage.removeItem(RELOAD_KEY)

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleRejection)
    }
  }, [])

  return null
}
