import { MetadataRoute } from 'next'

const SITE_URL = 'https://simonvpn.darkx.shop'

export default function robots(): MetadataRoute.Robots {
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
