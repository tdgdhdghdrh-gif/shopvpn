import { MetadataRoute } from 'next'
import { headers } from 'next/headers'

async function getSiteUrlForRobots(): Promise<string> {
  try {
    const h = await headers()
    const host = h.get('host') || h.get('x-forwarded-host') || ''
    const proto = h.get('x-forwarded-proto') || 'https'
    if (host) return `${proto}://${host}`
  } catch {}
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000'
}

export default async function robots(): Promise<MetadataRoute.Robots> {
  const SITE_URL = await getSiteUrlForRobots()
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/profile/',
          '/reseller/',
          '/api/',
          '/topup/',
          '/vpn/',
          '/tickets/',
          '/report-slow/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/',
          '/profile/',
          '/reseller/',
          '/api/',
          '/topup/',
          '/vpn/',
          '/tickets/',
          '/report-slow/',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
