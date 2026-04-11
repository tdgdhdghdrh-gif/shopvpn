import type { Metadata } from 'next'
import { getSiteUrl } from '@/lib/server-utils'

export async function generateMetadata(): Promise<Metadata> {
  const SITE_URL = await getSiteUrl()
  return {
    title: 'บทความ & ความรู้ VPN | เทคนิค วิธีใช้ รีวิว',
    description: 'บทความความรู้เกี่ยวกับ VPN วิธีแก้เน็ตช้า เล่นเกมปิงสูง รีวิวแอป V2Box v2rayNG คู่มือตั้งค่า VPN เทคนิคทำเน็ตแรง รองรับ AIS TRUE DTAC',
    alternates: {
      canonical: `${SITE_URL}/blog`,
    },
    openGraph: {
      title: 'บทความ & ความรู้ VPN',
      description: 'บทความความรู้เกี่ยวกับ VPN วิธีแก้เน็ตช้า เทคนิคเล่นเกมลื่น รีวิวแอป คู่มือตั้งค่า',
      url: `${SITE_URL}/blog`,
      siteName: '',
      locale: 'th_TH',
      type: 'website',
    },
  }
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children
}
