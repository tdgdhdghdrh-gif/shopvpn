import type { Metadata } from 'next'

const SITE_URL = 'https://simonvpn.darkx.shop'

export const metadata: Metadata = {
  title: 'ประกาศและข่าวสาร',
  description: 'ข่าวสารและประกาศล่าสุด อัพเดทเซิร์ฟเวอร์ใหม่ โปรโมชั่น กิจกรรม และการปรับปรุงระบบ VPN',
  alternates: {
    canonical: `${SITE_URL}/announcements`,
  },
  openGraph: {
    title: 'ประกาศและข่าวสาร',
    description: 'ข่าวสารและประกาศล่าสุด อัพเดทเซิร์ฟเวอร์ โปรโมชั่น',
    url: `${SITE_URL}/announcements`,
    siteName: '',
    locale: 'th_TH',
    type: 'website',
  },
}

export default function AnnouncementsLayout({ children }: { children: React.ReactNode }) {
  return children
}
