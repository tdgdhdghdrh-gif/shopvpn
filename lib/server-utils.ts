import 'server-only'
import { headers } from 'next/headers'

// Helper: ดึง SITE_URL จาก request headers (server-side only)
export async function getSiteUrl(): Promise<string> {
  try {
    const h = await headers()
    const host = h.get('host') || h.get('x-forwarded-host') || ''
    const proto = h.get('x-forwarded-proto') || 'https'
    if (host) return `${proto}://${host}`
  } catch {}
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000'
}
