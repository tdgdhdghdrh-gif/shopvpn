import type { Metadata } from 'next'
import { getSiteUrl } from '@/lib/server-utils'

export async function generateMetadata(): Promise<Metadata> {
  const SITE_URL = await getSiteUrl()
  return {
    title: 'ติดต่อแอดมิน | ซัพพอร์ต 24/7',
    description: 'ติดต่อทีมแอดมิน ซัพพอร์ตตลอด 24 ชั่วโมง ช่วยเหลือตั้งค่า แก้ปัญหา สอบถามข้อมูล VPN ความเร็วสูง',
    alternates: {
      canonical: `${SITE_URL}/contacts`,
    },
    openGraph: {
      title: 'ติดต่อแอดมิน | ซัพพอร์ต 24/7',
      description: 'ติดต่อทีมซัพพอร์ตตลอด 24 ชั่วโมง',
      url: `${SITE_URL}/contacts`,
      siteName: '',
      locale: 'th_TH',
      type: 'website',
    },
  }
}

export default function ContactsLayout({ children }: { children: React.ReactNode }) {
  return children
}
