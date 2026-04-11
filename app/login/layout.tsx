import type { Metadata } from 'next'

const SITE_URL = 'https://simonvpn.darkx.shop'

export const metadata: Metadata = {
  title: 'เข้าสู่ระบบ | บริการ VPN ความเร็วสูง',
  description: 'เข้าสู่ระบบเพื่อใช้งาน VPN ความเร็วสูง เชื่อมต่อเซิร์ฟเวอร์ เติมเงิน จัดการบัญชี เล่นเกมลื่น ดูหนังไม่กระตุก',
  alternates: {
    canonical: `${SITE_URL}/login`,
  },
  openGraph: {
    title: 'เข้าสู่ระบบ | บริการ VPN ความเร็วสูง',
    description: 'เข้าสู่ระบบเพื่อใช้งาน VPN ความเร็วสูง เชื่อมต่อเซิร์ฟเวอร์ เล่นเกมลื่น ดูหนังไม่กระตุก',
    url: `${SITE_URL}/login`,
    siteName: '',
    locale: 'th_TH',
    type: 'website',
  },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
