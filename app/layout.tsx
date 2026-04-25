import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/server-utils";
import ChunkErrorHandler from "@/components/ChunkErrorHandler";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { SettingsProvider } from "@/components/SettingsProvider";
import DynamicBackground from "@/components/DynamicBackground";
import WebEffectsBridge from "@/components/WebEffectsBridge";
import GlobalClickEffect from "@/components/GlobalClickEffect";
import ImpersonateBanner from "@/components/ImpersonateBanner";
import SiteUpdateOverlay from "@/components/SiteUpdateOverlay";
import SiteMusicPlayer from "@/components/SiteMusicPlayer";
import FloatingButton from "@/components/FloatingButton";
import Preloader from "@/components/Preloader";
import MarqueeBar from "@/components/MarqueeBar";
import CountdownTimer from "@/components/CountdownTimer";
import TopNotificationBar from "@/components/TopNotificationBar";
import BackToTop from "@/components/BackToTop";
import CustomCursor from "@/components/CustomCursor";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const DEFAULT_DESCRIPTION = 'บริการ VPN ความเร็วสูง เน็ตแรง เสถียร ไม่หลุดง่าย เล่นเกมลื่น ปิงต่ำ ไม่ดีเลย์ ดู YouTube Netflix 4K ไม่กระตุก รองรับ AIS TRUE DTAC ทดลองใช้ฟรี'

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

// Helper: ดึง settings จาก DB
async function getSettings() {
  try {
    const settings = await prisma.settings.findFirst({
      select: { siteName: true, siteLogo: true, appLogo: true, customCss: true, customJs: true },
    })
    return settings
  } catch {
    return null
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const [siteUrl, settings] = await Promise.all([getSiteUrl(), getSettings()])

  const siteName = settings?.siteName || ''
  const appLogo = settings?.appLogo || ''
  const defaultTitle = siteName
    ? `${siteName} - บริการ VPN ความเร็วสูง`
    : 'บริการ VPN ความเร็วสูง เน็ตแรง เสถียร เล่นเกมลื่น'

  const iconUrl = appLogo || '/icon-192x192.png'
  const iconUrl512 = appLogo || '/icon-512x512.png'

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: defaultTitle,
      template: '%s',
    },
    description: DEFAULT_DESCRIPTION,
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
    authors: [{ name: siteName, url: siteUrl }],
    creator: siteName,
    publisher: siteName,
    category: 'technology',
    classification: 'VPN Service',
    referrer: 'origin-when-cross-origin',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    alternates: {
      canonical: siteUrl,
      languages: {
        'th-TH': siteUrl,
      },
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: siteName || 'VPN',
    },
    other: {
      'mobile-web-app-capable': 'yes',
      'google': 'notranslate',
    },
    openGraph: {
      title: defaultTitle,
      description: 'บริการ VPN ความเร็วสูง เน็ตแรง เสถียร เล่นเกมลื่น ปิงต่ำ ดู Netflix YouTube 4K ไม่กระตุก รองรับ AIS TRUE DTAC ทดลองใช้ฟรี',
      url: siteUrl,
      siteName: siteName,
      locale: 'th_TH',
      type: 'website',
      images: [
        {
          url: iconUrl512,
          width: 512,
          height: 512,
          alt: defaultTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: defaultTitle,
      description: 'เน็ตแรง เสถียร เล่นเกมลื่น ปิงต่ำ ดู Netflix YouTube ไม่กระตุก รองรับ AIS TRUE DTAC ทดลองใช้ฟรี',
      images: [iconUrl512],
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
    icons: {
      icon: [
        { url: iconUrl, sizes: '192x192', type: 'image/png' },
        { url: iconUrl512, sizes: '512x512', type: 'image/png' },
      ],
      apple: [
        { url: appLogo || '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],
    },
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const layoutSettings = await getSettings()
  return (
    <html lang="th" className="dark" style={{ backgroundColor: 'var(--theme-bg, #000000)' }}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ color: 'var(--theme-text, #ffffff)', backgroundColor: 'var(--theme-bg, #000000)' }}
      >
        {/* Custom CSS Injection */}
        {layoutSettings?.customCss && (
          <style dangerouslySetInnerHTML={{ __html: layoutSettings.customCss }} />
        )}
        {/* Custom JS Injection */}
        {layoutSettings?.customJs && (
          <script defer dangerouslySetInnerHTML={{ __html: layoutSettings.customJs }} />
        )}
        <Preloader />
        <CustomCursor />
        <SettingsProvider>
          <TopNotificationBar />
          <MarqueeBar />
          <CountdownTimer />
          <ChunkErrorHandler />
          <ServiceWorkerRegister />
          <DynamicBackground />
          <WebEffectsBridge />
          <GlobalClickEffect />
          <ImpersonateBanner />
          <SiteUpdateOverlay />
          <SiteMusicPlayer />
          <FloatingButton />
          <div className="overflow-x-hidden relative z-10">
            {children}
          </div>
          <BackToTop />
        </SettingsProvider>
      </body>
    </html>
  );
}
