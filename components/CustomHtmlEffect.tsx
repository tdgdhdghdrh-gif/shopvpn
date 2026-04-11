'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  html: string
}

export default function CustomHtmlEffect({ html }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [key, setKey] = useState(0)

  // Re-mount when html changes by bumping key
  useEffect(() => {
    setKey(k => k + 1)
  }, [html])

  useEffect(() => {
    const container = containerRef.current
    if (!container || !html) return

    // Insert HTML content
    container.innerHTML = html

    // Execute script tags (innerHTML doesn't execute scripts)
    const scripts = container.querySelectorAll('script')
    const createdScripts: HTMLScriptElement[] = []
    scripts.forEach((oldScript) => {
      const newScript = document.createElement('script')
      if (oldScript.src) {
        newScript.src = oldScript.src
      } else {
        newScript.textContent = oldScript.textContent
      }
      Array.from(oldScript.attributes).forEach((attr) => {
        if (attr.name !== 'src') {
          newScript.setAttribute(attr.name, attr.value)
        }
      })
      oldScript.replaceWith(newScript)
      createdScripts.push(newScript)
    })

    return () => {
      // Cleanup
      createdScripts.forEach(s => s.remove())
      if (container) container.innerHTML = ''
    }
  }, [key, html])

  if (!html) return null

  return (
    <div
      key={key}
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 1,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    />
  )
}
