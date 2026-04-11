import type { Metadata } from 'next'

const SITE_URL = 'https://simonvpn.darkx.shop'

export const metadata: Metadata = {
  title: 'ทดลองใช้ VPN ฟรี | ทดสอบก่อนซื้อ',
  description: 'ทดลองใช้ VPN ฟรี ทดสอบความเร็ว ความเสถียร ก่อนตัดสินใจซื้อ VLESS ฟรีไม่มีค่าใช้จ่าย รองรับ AIS TRUE DTAC',
  alternates: {
    canonical: `${SITE_URL}/public-vless`,
  },
  openGraph: {
    title: 'ทดลองใช้ VPN ฟรี | ทดสอบก่อนซื้อ',
    description: 'ทดลองใช้ VPN ฟรี ทดสอบความเร็วก่อนซื้อ VLESS ฟรีไม่มีค่าใช้จ่าย',
    url: `${SITE_URL}/public-vless`,
    siteName: '',
    locale: 'th_TH',
    type: 'website',
  },
}

export default function PublicVlessLayout({ children }: { children: React.ReactNode }) {
  return children
}
