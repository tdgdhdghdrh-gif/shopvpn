import type { Metadata } from 'next'
import { getSiteUrl } from '@/lib/server-utils'

export async function generateMetadata(): Promise<Metadata> {
  const SITE_URL = await getSiteUrl()
  return {
    title: 'สมัครสมาชิก | เริ่มใช้ VPN ความเร็วสูงวันนี้',
    description: 'สมัครสมาชิกฟรี! เริ่มใช้งาน VPN ความเร็วสูง เน็ตแรง เสถียร รองรับ AIS TRUE DTAC เล่นเกมลื่น ดู Netflix YouTube ไม่กระตุก',
    alternates: {
      canonical: `${SITE_URL}/register`,
    },
    openGraph: {
      title: 'สมัครสมาชิก | เริ่มใช้ VPN วันนี้',
      description: 'สมัครสมาชิกฟรี! เริ่มใช้ VPN ความเร็วสูง เน็ตแรง เสถียร',
      url: `${SITE_URL}/register`,
      siteName: '',
      locale: 'th_TH',
      type: 'website',
    },
  }
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children
}
