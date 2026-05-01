'use client'

import { useState } from 'react'

export default function ServerImageDisplay({ imageUrl, alt, className }: { imageUrl: string | null | undefined, alt: string, className?: string }) {
  const [error, setError] = useState(false)

  if (!imageUrl || error) {
    return null
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageUrl}
      alt={alt}
      className={className || 'w-full h-auto block'}
      onError={() => setError(true)}
    />
  )
}
