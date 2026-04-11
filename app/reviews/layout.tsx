import type { Metadata } from 'next'
import { getSiteUrl } from '@/lib/server-utils'

export async function generateMetadata(): Promise<Metadata> {
  const SITE_URL = await getSiteUrl()
  return {
    title: 'รีวิวจากผู้ใช้งานจริง | เน็ต VPN ความเร็วสูง',
    description: 'รีวิวจากผู้ใช้งานจริง เน็ตแรง เสถียร เล่นเกมลื่น ดู YouTube Netflix ไม่กระตุก ปิงต่ำ ไม่ดีเลย์ รองรับ AIS TRUE DTAC อ่านรีวิวก่อนตัดสินใจ',
    alternates: {
      canonical: `${SITE_URL}/reviews`,
    },
    openGraph: {
      title: 'รีวิวจากผู้ใช้งานจริง',
      description: 'อ่านรีวิวจริงจากผู้ใช้งาน เน็ตแรง เสถียร เล่นเกมลื่น ดูหนังไม่กระตุก',
      url: `${SITE_URL}/reviews`,
      siteName: '',
      locale: 'th_TH',
      type: 'website',
    },
  }
}

export default function ReviewsLayout({ children }: { children: React.ReactNode }) {
  return children
}
