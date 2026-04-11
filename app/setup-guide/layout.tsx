import type { Metadata } from 'next'

const SITE_URL = 'https://simonvpn.darkx.shop'

export const metadata: Metadata = {
  title: 'วิธีตั้งค่า VPN | คู่มือใช้งาน - ง่ายใน 3 ขั้นตอน',
  description: 'คู่มือตั้งค่า VPN แบบละเอียด รองรับ iOS Android Windows macOS ใช้งานง่ายใน 3 ขั้นตอน ตั้งค่า APN AIS TRUE DTAC พร้อมแอพ V2Box v2rayNG',
  alternates: {
    canonical: `${SITE_URL}/setup-guide`,
  },
  openGraph: {
    title: 'วิธีตั้งค่า VPN | คู่มือใช้งาน',
    description: 'คู่มือตั้งค่า VPN แบบละเอียด ใช้งานง่ายใน 3 ขั้นตอน รองรับทุกอุปกรณ์',
    url: `${SITE_URL}/setup-guide`,
    siteName: '',
    locale: 'th_TH',
    type: 'article',
  },
}

export default function SetupGuideLayout({ children }: { children: React.ReactNode }) {
  return children
}
