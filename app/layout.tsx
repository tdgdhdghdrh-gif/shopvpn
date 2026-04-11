import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ChunkErrorHandler from "@/components/ChunkErrorHandler";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { SettingsProvider } from "@/components/SettingsProvider";
import DynamicBackground from "@/components/DynamicBackground";
import WebEffectsBridge from "@/components/WebEffectsBridge";
import GlobalClickEffect from "@/components/GlobalClickEffect";
import ImpersonateBanner from "@/components/ImpersonateBanner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = 'https://simonvpn.darkx.shop'
const SITE_NAME = ''
const SITE_DESCRIPTION = 'บริการ VPN ความเร็วสูง เน็ตแรง เสถียร ไม่หลุดง่าย เล่นเกมลื่น ปิงต่ำ ไม่ดีเลย์ ดู YouTube Netflix 4K ไม่กระตุก รองรับ AIS TRUE DTAC ทดลองใช้ฟรี'

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'บริการ VPN ความเร็วสูง เน็ตแรง เสถียร เล่นเกมลื่น',
    template: '%s',
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'VPN', 'เน็ต VPN', 'VPN ไทย', 'VPN ราคาถูก',
    'เน็ตแรง', 'เน็ตเสถียร', 'VPN เล่นเกม', 'VPN ดูหนัง', 'VPN Netflix',
    'VPN YouTube', 'VPN AIS', 'VPN TRUE', 'VPN DTAC', 'X2BOX', 'VLESS',
    'VPN ความเร็วสูง', 'VPN ปิงต่ำ', 'VPN เกม ROV', 'VPN เกม PUBG',
    'ทดลองใช้ VPN ฟรี', 'VPN ไม่จำกัด', 'VPN รายเดือน',
    'VPN v2rayNG', 'VPN V2Box', 'VPN iOS', 'VPN Android',
    'เน็ตบ้านแรง', 'เน็ตมือถือแรง', 'VPN ไม่หลุด', 'VPN เสถียร',
    'ซื้อ VPN', 'VPN ราคาถูก 50 บาท', 'VPN 100 บาท',
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  manifest: '/manifest.json',
  category: 'technology',
  classification: 'VPN Service',
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      'th-TH': SITE_URL,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'VPN',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'google': 'notranslate',
  },
  openGraph: {
    title: 'บริการ VPN ความเร็วสูง เน็ตแรง เสถียร',
    description: 'บริการ VPN ความเร็วสูง เน็ตแรง เสถียร เล่นเกมลื่น ปิงต่ำ ดู Netflix YouTube 4K ไม่กระตุก รองรับ AIS TRUE DTAC ทดลองใช้ฟรี',
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'th_TH',
    type: 'website',
    images: [
      {
        url: '/icon-512x512.png',
        width: 512,
        height: 512,
        alt: 'บริการ VPN ความเร็วสูง',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'บริการ VPN ความเร็วสูง',
    description: 'เน็ตแรง เสถียร เล่นเกมลื่น ปิงต่ำ ดู Netflix YouTube ไม่กระตุก รองรับ AIS TRUE DTAC ทดลองใช้ฟรี',
    images: ['/icon-512x512.png'],
    creator: '',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // เพิ่ม Google Search Console verification code ที่นี่
    // google: 'your-google-verification-code',
  },
  icons: {
    icon: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="dark" style={{ backgroundColor: 'var(--theme-bg, #000000)' }}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ color: 'var(--theme-text, #ffffff)', backgroundColor: 'var(--theme-bg, #000000)' }}
      >
        <SettingsProvider>
          <ChunkErrorHandler />
          <ServiceWorkerRegister />
          <DynamicBackground />
          <WebEffectsBridge />
          <GlobalClickEffect />
          <ImpersonateBanner />
          <div className="overflow-x-hidden relative z-10">
            {children}
          </div>
        </SettingsProvider>
      </body>
    </html>
  );
}
