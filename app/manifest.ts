import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  let siteName = ''
  let siteDescription = 'บริการ VPN ความเร็วสูง'
  let appLogo = ''

  try {
    const settings = await prisma.settings.findFirst({
      select: { siteName: true, appLogo: true },
    })
    if (settings?.siteName) siteName = settings.siteName
    if (settings?.appLogo) appLogo = settings.appLogo
  } catch {}

  const icons: MetadataRoute.Manifest['icons'] = []

  if (appLogo) {
    // ใช้โลโก้จาก DB (appLogo)
    icons.push(
      { src: appLogo, sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: appLogo, sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    )
  } else {
    // fallback ใช้ไฟล์ static เดิม
    icons.push(
      { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
      { src: '/icon-384x384.png', sizes: '384x384', type: 'image/png', purpose: 'any' },
      { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    )
  }

  return {
    name: siteName ? `${siteName} - ${siteDescription}` : siteDescription,
    short_name: siteName || 'VPN',
    description: siteDescription,
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    orientation: 'portrait-primary',
    scope: '/',
    icons,
    categories: ['utilities', 'productivity'],
    lang: 'th',
    dir: 'ltr',
  }
}
