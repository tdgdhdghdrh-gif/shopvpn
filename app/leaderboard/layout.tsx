import type { Metadata } from 'next'
import { getSiteUrl } from '@/lib/server-utils'

export async function generateMetadata(): Promise<Metadata> {
  const SITE_URL = await getSiteUrl()
  return {
    title: 'อันดับผู้ใช้งาน | Leaderboard',
    description: 'อันดับผู้ใช้งานที่เติมเงินมากที่สุด ใช้งานมากที่สุด ดูสถิติและอันดับผู้ใช้ VPN',
    alternates: {
      canonical: `${SITE_URL}/leaderboard`,
    },
    openGraph: {
      title: 'อันดับผู้ใช้งาน | Leaderboard',
      description: 'อันดับผู้ใช้งานที่ใช้งานมากที่สุด',
      url: `${SITE_URL}/leaderboard`,
      siteName: '',
      locale: 'th_TH',
      type: 'website',
    },
  }
}

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  return children
}
