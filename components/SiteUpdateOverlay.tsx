'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { X } from 'lucide-react'

interface SiteUpdateData {
  id: string
  title: string
  htmlContent: string
  isEnabled: boolean
  showToUsers: boolean
  showToAdmin: boolean
}

export default function SiteUpdateOverlay() {
  const pathname = usePathname()
  const [update, setUpdate] = useState<SiteUpdateData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    fetch('/api/admin/site-update')
      .then((res) => res.json())
      .then((data) => {
        if (data.update) setUpdate(data.update)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [pathname])

  if (loading || !update || !update.isEnabled || dismissed) return null

  const isAdminPage = pathname?.startsWith('/admin')

  if (isAdminPage && !update.showToAdmin) return null
  if (!isAdminPage && !update.showToUsers) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999,
        overflow: 'auto',
        background: '#000',
      }}
    >
      {/* Admin preview close button */}
      {isAdminPage && update.showToAdmin && (
        <button
          onClick={() => setDismissed(true)}
          style={{
            position: 'fixed',
            top: 16,
            right: 16,
            zIndex: 100000,
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.7)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="ปิดตัวอย่าง"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      <iframe
        srcDoc={update.htmlContent}
        title="Site Update"
        sandbox="allow-scripts allow-same-origin"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
        }}
      />
    </div>
  )
}
